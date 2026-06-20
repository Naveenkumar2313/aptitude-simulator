// src/engine/index.js
// Single import surface for the rest of the app.
import { crossingEvent } from './methods/crossingEvent.js';
import { meetAndContinue } from './methods/meetAndContinue.js';

export { crossingEvent, meetAndContinue };
export const METHODS = { crossingEvent, meetAndContinue };

export { assertValidTimeline, frontAt, backAt } from './timelineSchema.js';
export { kmphToMs, msToKmph, toMeters } from './units.js';
export { trainsProblemBank } from './problems/trainsProblemBank.js';
