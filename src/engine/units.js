// engine/units.mjs
// Single source of truth for unit handling. All internal physics math is done
// in SI base units (metres, seconds, m/s). Problems are authored in whatever
// unit is natural (km/hr is standard for this topic) and converted at the edge.

export const kmphToMs = (v) => (v * 5) / 18;
export const msToKmph = (v) => (v * 18) / 5;

// Convenience for problems authored with mixed units (e.g. boats & streams
// reuses this same engine later with km, this stays generic on purpose).
export const toMeters = (value, unit) => {
  switch (unit) {
    case 'm': return value;
    case 'km': return value * 1000;
    default: throw new Error(`Unknown length unit: ${unit}`);
  }
};
