// engine/timelineSchema.mjs
//
// This is THE contract. Every method function (crossingEvent, meetAndContinue,
// and any future method for any future paradigm-sibling topic like Boats &
// Streams or Races) must return an object shaped exactly like this. The
// renderer never knows which method produced a timeline — it only knows this
// shape. That decoupling is the entire point of the engine.
//
// Timeline
// --------
// {
//   duration: number,            // total simulation time, seconds
//   track: {
//     unit: 'm',
//     min: number,                // left edge of the visible coordinate space
//     max: number,                // right edge of the visible coordinate space
//   },
//   entities: Entity[],
//   events: Event[],
//   steps: Step[],
//   answer: { label: string, value: number, unit: string }  // what the
//          original question asked for, surfaced in the UI as the "reveal"
// }
//
// Entity
// ------
// {
//   id: string,
//   kind: 'train' | 'point' | 'station',
//   label: string,
//   length: number,               // metres. 0 for point objects (man/pole/driver)
//   color: string,                // semantic token, not a literal hex (theme picks it)
//   lane: number,                 // 0 or 1 — vertical track lane for non-overlapping render
//   // motion is ALWAYS constant-velocity (this topic never has acceleration),
//   // so two points fully determine the whole path:
//   motion: {
//     frontAt0: number,           // position of leading edge at t=0
//     velocity: number,           // signed, m/s. + = rendered moving right
//   },
// }
//
// Event
// -----
// {
//   t: number,                    // seconds, when it fires
//   type: 'crossStart' | 'crossEnd' | 'meet' | 'arrive',
//   label: string,
//   entityIds: string[],
// }
//
// Step
// ----
// Narration synced to the timeline, shown in a panel beside the player and
// highlighted as `t` passes. This is what keeps "what formula is this" in
// sync with "what's happening on screen" regardless of which problem loaded.
// {
//   t: number,
//   formula: string,              // e.g. "Relative speed = u + v (opposite directions)"
//   text: string,                 // human explanation with this problem's numbers substituted
// }
//
// Moment
// ------
// {
//   id: string,                 // e.g. 'WHY_DISTANCE_IS_LENGTHA_PLUS_LENGTHB'
//   t: number,                  // when this becomes relevant in the timeline
//   trigger: 'observation',     // reserved for future trigger types
//   observation: string,        // what the learner sees happening right now,
//                                // phrased as a noticed fact, not a formula
//                                // e.g. "The train's rear end is still behind the bridge."
//   reason: string,             // why that's true, in plain language
//                                // e.g. "Because only the front has reached the far edge so far."
//   therefore: string,          // the formula/conclusion this justifies, stated
//                                // as a consequence, not a definition
//                                // e.g. "Distance to cover = Train Length + Bridge Length."
//   relatedFormula: string,     // the compact symbolic form, e.g. "d = L_train + L_bridge"
// }

/** Runtime guard — cheap insurance against a method returning a malformed timeline. */
export function assertValidTimeline(tl) {
  const errs = [];
  if (typeof tl?.duration !== 'number' || tl.duration <= 0) errs.push('duration must be a positive number');
  if (!tl?.track || typeof tl.track.min !== 'number' || typeof tl.track.max !== 'number') errs.push('track.min/max required');
  if (!Array.isArray(tl?.entities) || tl.entities.length < 2) errs.push('entities[] needs at least 2 entries');
  tl?.entities?.forEach((e, i) => {
    if (!e.id) errs.push(`entities[${i}].id missing`);
    if (!['train', 'point', 'station'].includes(e.kind)) errs.push(`entities[${i}].kind invalid`);
    if (typeof e.length !== 'number' || e.length < 0) errs.push(`entities[${i}].length invalid`);
    if (!e.motion || typeof e.motion.frontAt0 !== 'number' || typeof e.motion.velocity !== 'number') {
      errs.push(`entities[${i}].motion invalid`);
    }
  });
  if (!Array.isArray(tl?.events)) errs.push('events[] required (can be empty — e.g. the stalemate case)');
  if (!Array.isArray(tl?.steps)) errs.push('steps[] required (can be empty)');
  if (!Array.isArray(tl?.moments)) {
    errs.push('moments[] required (can be empty)');
  } else if (tl.entities && tl.entities.length >= 2 && !tl.stalemate && tl.moments.length < 2) {
    errs.push('moments[] needs at least 2 entries for non-stalemate crossings with 2+ entities');
  }
  if (!Array.isArray(tl?.explanation) || tl.explanation.length === 0) errs.push('explanation[] required and must be non-empty');
  if (errs.length) throw new Error('Invalid timeline:\n' + errs.join('\n'));
  return true;
}

/** Position of an entity's leading edge at time t (pure function of its motion). */
export function frontAt(entity, t) {
  return entity.motion.frontAt0 + entity.motion.velocity * t;
}

/** Position of an entity's trailing edge at time t (accounts for travel direction). */
export function backAt(entity, t) {
  const dir = Math.sign(entity.motion.velocity) || 1;
  return frontAt(entity, t) - dir * entity.length;
}
