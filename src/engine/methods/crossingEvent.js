// engine/methods/crossingEvent.mjs
//
// Covers every "X crosses Y" question on the topic (pole, man, platform,
// bridge, other train, driver of other train). Same formula throughout:
//   relativeSpeed = sameDirection ? |speedA - speedB| : speedA + speedB
//   combinedLength = lengthA + lengthB
//   crossingTime = combinedLength / relativeSpeed
//
// v2 additions (per learner feedback):
//   - explicit "stalemate" handling when relativeSpeed === 0 (equal speed,
//     same direction) instead of dividing by zero
//   - `explanation: string[]` — a full IndiaBIX-style worked derivation,
//     always rebuilt forward from whatever values are currently set, so it
//     stays correct no matter how the caller varies entityA/entityB/sameDirection
//   - all numeric inputs (length, speed) are treated as free variables, since
//     this method is also driven by an editable-parameter UI now

import { kmphToMs, msToKmph } from '../units.js';

export function crossingEvent({ entityA, entityB, sameDirection }) {
  const speedA = kmphToMs(entityA.speedKmph);
  const speedB = kmphToMs(entityB.speedKmph);
  const lengthA = entityA.length;
  const lengthB = entityB.length;

  const relativeSpeed = sameDirection ? Math.abs(speedA - speedB) : speedA + speedB;
  const combinedLength = lengthA + lengthB;

  if (relativeSpeed === 0) {
    const duration = 12;
    return {
      stalemate: true,
      duration,
      track: { unit: 'm', min: -20, max: speedA * duration + Math.max(lengthA, lengthB) + 40 },
      entities: [
        { id: 'A', kind: entityA.kind ?? 'train', label: entityA.label, length: lengthA, color: 'entityA', lane: 0, motion: { frontAt0: 0, velocity: speedA } },
        { id: 'B', kind: entityB.kind ?? 'train', label: entityB.label, length: lengthB, color: 'entityB', lane: 1, motion: { frontAt0: Math.max(lengthA, lengthB) + 30, velocity: speedB } },
      ],
      events: [],
      steps: [{ t: 0, formula: 'Relative speed = 0', text: `${entityA.label} and ${entityB.label} move at identical speed in the same direction — the gap never changes, so they never cross.` }],
      answer: { label: 'Crossing time', value: 'never', unit: '' },
      explanation: [
        `Step 1 — Convert speeds to m/sec: both ${entityA.speedKmph} km/hr = ${speedA.toFixed(2)} m/sec.`,
        `Step 2 — Same direction, so relative speed = |${speedA.toFixed(2)} - ${speedB.toFixed(2)}| = 0 m/sec.`,
        `Relative speed is 0, so the gap between them is constant forever — they never cross. Vary a speed input to see a real crossing.`,
      ],
      moments: [{
        id: 'WHY_STALEMATE',
        t: 0,
        trigger: 'observation',
        observation: `${entityA.label} and ${entityB.label} move at identical speed in the same direction.`,
        reason: `The gap between them never changes.`,
        therefore: `They never cross.`,
        relatedFormula: `v_rel = 0`,
      }],
    };
  }

  const crossTime = combinedLength / relativeSpeed;
  const approachGap = Math.max(combinedLength * 1.2, 40);
  const leadInTime = approachGap / relativeSpeed;
  const duration = leadInTime * 2 + crossTime;

  const vA = speedA;
  const vB = sameDirection ? speedB : -speedB;

  let frontA0, frontB0;
  if (!sameDirection) {
    frontA0 = 0;
    frontB0 = relativeSpeed * leadInTime;
  } else {
    const aChases = speedA >= speedB;
    if (aChases) {
      frontB0 = 0;
      frontA0 = -lengthB - approachGap;
    } else {
      frontA0 = 0;
      frontB0 = -lengthA - approachGap;
    }
  }
  const crossStartT = leadInTime;
  const crossEndT = leadInTime + crossTime;

  const trackMin = Math.min(frontA0 - lengthA, frontB0 - lengthB) - 20;
  const trackMax = Math.max(frontA0 + vA * duration, frontB0 + vB * duration) + 20;

  const entities = [
    { id: 'A', kind: entityA.kind ?? 'train', label: entityA.label, length: lengthA, color: 'entityA', lane: 0, motion: { frontAt0: frontA0, velocity: vA } },
    { id: 'B', kind: entityB.kind ?? 'train', label: entityB.label, length: lengthB, color: 'entityB', lane: 1, motion: { frontAt0: frontB0, velocity: vB } },
  ];

  const events = [
    { t: crossStartT, type: 'crossStart', label: `Leading edges meet — crossing begins`, entityIds: ['A', 'B'] },
    { t: crossEndT, type: 'crossEnd', label: `${entityA.label} fully clears ${entityB.label} — crossing ends`, entityIds: ['A', 'B'] },
  ];

  const directionPhrase = sameDirection ? 'same direction' : 'opposite directions';
  const steps = [
    { t: 0, formula: 'Setup', text: `${entityA.label} (${entityA.speedKmph} km/hr, ${lengthA} m) and ${entityB.label} (${entityB.speedKmph} km/hr, ${lengthB} m) move in ${directionPhrase}.` },
    { t: 0, formula: 'Relative speed', text: `${relativeSpeed.toFixed(2)} m/sec (${msToKmph(relativeSpeed).toFixed(2)} km/hr).` },
    { t: crossStartT, formula: 'Crossing begins', text: `${combinedLength} m of relative distance remains to be covered.` },
    { t: crossEndT, formula: 'Crossing ends', text: `Crossing took ${crossTime.toFixed(2)} sec.` },
  ];

  const explanation = [
    `Step 1 — Convert speeds to m/sec (× 5/18): ${entityA.label} = ${entityA.speedKmph} × 5/18 = ${speedA.toFixed(2)} m/sec. ${entityB.speedKmph ? `${entityB.label} = ${entityB.speedKmph} × 5/18 = ${speedB.toFixed(2)} m/sec.` : `${entityB.label} is stationary (0 m/sec).`}`,
    sameDirection
      ? `Step 2 — Same direction, so relative speed = |${speedA.toFixed(2)} - ${speedB.toFixed(2)}| = ${relativeSpeed.toFixed(2)} m/sec.`
      : `Step 2 — Opposite directions, so relative speed = ${speedA.toFixed(2)} + ${speedB.toFixed(2)} = ${relativeSpeed.toFixed(2)} m/sec.`,
    `Step 3 — Distance to be covered = length(${entityA.label}) + length(${entityB.label}) = ${lengthA} + ${lengthB} = ${combinedLength} m.`,
    `Step 4 — Time = Distance ÷ Relative speed = ${combinedLength} ÷ ${relativeSpeed.toFixed(2)} = ${crossTime.toFixed(2)} sec.`,
  ];

  const moments = [];
  if (speedB > 0 && speedA > 0) {
    moments.push({
      id: 'WHY_RELATIVE_SPEED',
      t: 0,
      trigger: 'observation',
      observation: `${entityA.label} and ${entityB.label} are both moving — but the gap between them isn't closing at either train's own speed.`,
      reason: sameDirection
        ? `${entityB.label} is also moving forward, so ${entityA.label} only gains ground at the DIFFERENCE between their speeds.`
        : `${entityB.label} is moving toward ${entityA.label}, so the gap closes at the SUM of their speeds.`,
      therefore: `Relative speed = ${relativeSpeed.toFixed(2)} m/sec.`,
      relatedFormula: sameDirection ? "v_rel = |v_A - v_B|" : "v_rel = v_A + v_B",
    });

    if (!sameDirection) {
      moments.push({
        id: 'WHY_DIRECTION_CHANGES_RESULT',
        t: 0,
        trigger: 'observation',
        observation: `If they were going the same direction, the relative speed would only be ${Math.abs(speedA - speedB).toFixed(2)} m/sec.`,
        reason: `Because they are heading toward each other, their speeds combine instead of subtracting.`,
        therefore: `Direction determines whether speeds add or subtract.`,
        relatedFormula: `v_rel = v_A + v_B vs |v_A - v_B|`,
      });
    }
  } else if (speedB === 0 || speedA === 0) {
    const moving = speedB === 0 ? entityA : entityB;
    const stationary = speedB === 0 ? entityB : entityA;
    moments.push({
      id: 'WHY_RELATIVE_SPEED',
      t: 0,
      trigger: 'observation',
      observation: `${stationary.label} is stationary, so only ${moving.label} is moving.`,
      reason: `The gap between them closes entirely at ${moving.label}'s speed.`,
      therefore: `Relative speed = ${relativeSpeed.toFixed(2)} m/sec.`,
      relatedFormula: `v_rel = v_A`,
    });
  }

  moments.push({
    id: 'WHY_DISTANCE_IS_LENGTHA_PLUS_LENGTHB',
    t: crossStartT,
    trigger: 'observation',
    observation: `Crossing has started — but ${entityA.label}'s FRONT reaching ${entityB.label} doesn't mean the crossing is done.`,
    reason: `${entityA.label}'s REAR end hasn't reached ${entityB.label} yet — and if ${entityB.label} has any length of its own, that has to be cleared too.`,
    therefore: `Distance covered = length(${entityA.label}) + length(${entityB.label}) = ${combinedLength} m.`,
    relatedFormula: `d = L_A + L_B`,
  });

  moments.push({
    id: 'WHY_CROSSING_TIME',
    t: crossEndT,
    trigger: 'observation',
    observation: `${entityA.label} has now fully cleared ${entityB.label}.`,
    reason: `It took this long to cover ${combinedLength} m at ${relativeSpeed.toFixed(2)} m/sec relative speed.`,
    therefore: `Time = Distance / Relative speed = ${crossTime.toFixed(2)} sec.`,
    relatedFormula: `t = d / v_rel`,
  });

  return {
    duration,
    track: { unit: 'm', min: trackMin, max: trackMax },
    entities,
    events,
    steps,
    moments,
    answer: { label: 'Crossing time', value: Number(crossTime.toFixed(2)), unit: 's' },
    explanation,
  };
}
