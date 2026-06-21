// engine/methods/meetAndContinue.mjs
//
// v2: now takes the values actually given in the exam question —
// afterMeetHoursA, afterMeetHoursB, plus one referenceSpeedBKmph used only
// to fix an absolute scale for the visualization (the ratio answer itself
// never depends on it). This makes the method properly editable: a learner
// can change either after-meet time or the reference speed and everything
// downstream (ratio, meeting time, distance, animation) recomputes
// consistently, because every relation is derived forward from these inputs
// rather than from a pre-resolved pair of speeds.

import { kmphToMs } from '../units.js';

export function meetAndContinue({ stationA, stationB, trainA, trainB, afterMeetHoursA, afterMeetHoursB, referenceSpeedBKmph }) {
  const ratio = Math.sqrt(afterMeetHoursB / afterMeetHoursA); // speedA : speedB
  const speedBKmph = referenceSpeedBKmph;
  const speedAKmph = speedBKmph * ratio;
  const speedA = kmphToMs(speedAKmph);
  const speedB = kmphToMs(speedBKmph);

  const meetT = Math.sqrt(afterMeetHoursA * afterMeetHoursB) * 3600; // seconds
  const distance = (speedA + speedB) * meetT;
  const arriveAT = meetT + afterMeetHoursA * 3600;
  const arriveBT = meetT + afterMeetHoursB * 3600;
  const duration = Math.max(arriveAT, arriveBT) * 1.03;

  const entities = [
    { id: 'A', kind: 'train', label: trainA.label, length: 0, color: 'entityA', lane: 0, motion: { frontAt0: 0, velocity: speedA } },
    { id: 'B', kind: 'train', label: trainB.label, length: 0, color: 'entityB', lane: 1, motion: { frontAt0: distance, velocity: -speedB } },
    { id: 'stationA', kind: 'station', label: stationA.label, length: 0, color: 'neutral', lane: 0, motion: { frontAt0: 0, velocity: 0 } },
    { id: 'stationB', kind: 'station', label: stationB.label, length: 0, color: 'neutral', lane: 1, motion: { frontAt0: distance, velocity: 0 } },
  ];

  const events = [
    { t: meetT, type: 'meet', label: `${trainA.label} and ${trainB.label} meet`, entityIds: ['A', 'B'] },
    { t: arriveAT, type: 'arrive', label: `${trainA.label} reaches ${stationB.label}`, entityIds: ['A'] },
    { t: arriveBT, type: 'arrive', label: `${trainB.label} reaches ${stationA.label}`, entityIds: ['B'] },
  ];

  const steps = [
    { t: 0, formula: 'Setup', text: `${trainA.label} and ${trainB.label} start ${(distance / 1000).toFixed(1)} km apart, heading toward each other.` },
    { t: meetT, formula: 'Meeting point', text: `They meet after ${(meetT / 3600).toFixed(2)} h.` },
    { t: Math.min(arriveAT, arriveBT), formula: 'First arrival', text: `One train completes its journey; the other is still travelling.` },
  ];

  const explanation = [
    `Step 1 — Classic identity: speed(A) : speed(B) = √(after-meeting time of B) : √(after-meeting time of A).`,
    `Step 2 — = √${afterMeetHoursB} : √${afterMeetHoursA} = ${Math.sqrt(afterMeetHoursB).toFixed(3)} : ${Math.sqrt(afterMeetHoursA).toFixed(3)}.`,
    `Step 3 — Ratio = ${ratio.toFixed(3)} : 1.`,
    `Step 4 — Meeting time = √(tA × tB) = √(${afterMeetHoursA} × ${afterMeetHoursB}) = ${(meetT / 3600).toFixed(2)} hours (only needed to animate the scenario at a real scale; the ratio answer itself never depends on the reference speed).`,
  ];

  const moments = [
    {
      id: 'WHY_RELATIVE_SPEED',
      t: 0,
      trigger: 'observation',
      observation: `${trainA.label} and ${trainB.label} are both moving toward each other.`,
      reason: `Because they are heading toward each other, the gap between them closes at the SUM of their speeds.`,
      therefore: `Relative speed = v_A + v_B.`,
      relatedFormula: `v_rel = v_A + v_B`,
    },
    {
      id: 'WHY_SQRT_RULE',
      t: meetT,
      trigger: 'observation',
      observation: `They have met. From here, each train retraces the exact distance the OTHER train had already covered before the meeting.`,
      reason: `Because they swap distances but travel at their own constant speeds, their speeds and remaining times form a reciprocal square relationship.`,
      therefore: `The ratio of their speeds is the square root of the inverse ratio of their remaining times.`,
      relatedFormula: `v_A / v_B = √(t_B / t_A)`,
    },
    {
      id: 'FINAL_RATIO',
      t: Math.min(arriveAT, arriveBT),
      trigger: 'observation',
      observation: `One train has arrived. The remaining times are ${afterMeetHoursA} h and ${afterMeetHoursB} h.`,
      reason: `Plugging these remaining times into the identity: √(${afterMeetHoursB} / ${afterMeetHoursA}).`,
      therefore: `The speed ratio is ${ratio.toFixed(3)} : 1.`,
      relatedFormula: `Ratio = ${ratio.toFixed(3)}`,
    }
  ];

  return {
    duration,
    track: { unit: 'm', min: -distance * 0.05, max: distance * 1.05 },
    entities,
    events,
    steps,
    moments,
    answer: { label: 'Speed ratio (A:B)', value: Number(ratio.toFixed(3)), unit: 'ratio' },
    explanation,
  };
}
