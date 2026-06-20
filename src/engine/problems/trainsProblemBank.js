// engine/problems/trainsProblemBank.mjs
//
// Every entry here is JUST DATA: a methodId + params. No problem ever needs
// new rendering or simulation code -- confirming the engine actually
// generalizes across the topic instead of being secretly one simulation
// with a skin.

export const trainsProblemBank = [
  {
    id: 'tp-001',
    source: 'IndiaBIX General Q1',
    prompt: 'A train running at 60 km/hr crosses a pole in 9 seconds. What is the length of the train?',
    methodId: 'crossingEvent',
    params: {
      entityA: { label: 'Train', length: 150, speedKmph: 60, kind: 'train' },
      entityB: { label: 'Pole', length: 0, speedKmph: 0, kind: 'point' },
      sameDirection: true,
      solveFor: { field: 'lengthA', label: 'Length of train', unit: 'm' },
    },
  },
  {
    id: 'tp-002',
    source: 'IndiaBIX General Q2',
    prompt: 'A train 125 m long passes a man running at 5 km/hr in the same direction in 10 seconds. Find the speed of the train.',
    methodId: 'crossingEvent',
    params: {
      entityA: { label: 'Train', length: 125, speedKmph: 50, kind: 'train' },
      entityB: { label: 'Man', length: 0, speedKmph: 5, kind: 'point' },
      sameDirection: true,
      solveFor: { field: 'speedA', label: 'Speed of train', unit: 'km/hr' },
    },
  },
  {
    id: 'tp-003',
    source: 'IndiaBIX General Q3',
    prompt: 'A train 130 m long travelling at 45 km/hr crosses a bridge in 30 seconds. Find the length of the bridge.',
    methodId: 'crossingEvent',
    params: {
      entityA: { label: 'Train', length: 130, speedKmph: 45, kind: 'train' },
      entityB: { label: 'Bridge', length: 245, speedKmph: 0, kind: 'point' },
      sameDirection: true,
      solveFor: { field: 'lengthB', label: 'Length of bridge', unit: 'm' },
    },
  },
  {
    id: 'tp-007',
    source: 'IndiaBIX General Q7',
    prompt: 'Two trains of equal length run on parallel lines in the same direction at 46 km/hr and 36 km/hr. The faster train passes the slower one in 36 s. Find the length of each train.',
    methodId: 'crossingEvent',
    params: {
      entityA: { label: 'Faster train', length: 50, speedKmph: 46, kind: 'train' },
      entityB: { label: 'Slower train', length: 50, speedKmph: 36, kind: 'train' },
      sameDirection: true,
      solveFor: { field: 'lengthA', label: 'Length of each train', unit: 'm' },
    },
  },
  {
    id: 'tp-009',
    source: 'IndiaBIX General Q9 (variant)',
    prompt: 'Two trains moving in opposite directions at 60 km/hr and 90 km/hr, lengths 1.10 km and 0.9 km. Find the time for the slower train to cross the faster one.',
    methodId: 'crossingEvent',
    params: {
      entityA: { label: 'Slow train (60 km/hr)', length: 1100, speedKmph: 60, kind: 'train' },
      entityB: { label: 'Fast train (90 km/hr)', length: 900, speedKmph: 90, kind: 'train' },
      sameDirection: false,
      solveFor: { field: 'time', label: 'Crossing time', unit: 's' },
    },
  },
  {
    id: 'tp-022',
    source: 'IndiaBIX Discussion Q22',
    prompt: 'Two goods trains, each 500 m long, run in opposite directions at 45 km/hr and 30 km/hr. Find the time for the slower train to pass the driver of the faster one.',
    methodId: 'crossingEvent',
    params: {
      entityA: { label: 'Slower train (30 km/hr)', length: 500, speedKmph: 30, kind: 'train' },
      entityB: { label: 'Driver of faster train (45 km/hr)', length: 0, speedKmph: 45, kind: 'point' },
      sameDirection: false,
      solveFor: { field: 'time', label: 'Crossing time', unit: 's' },
    },
  },
  {
    id: 'tp-031',
    source: 'IndiaBIX General Q31 (Howrah-Patna)',
    prompt: 'Two trains, one Howrah to Patna and the other Patna to Howrah, start simultaneously. After meeting, they reach their destinations in 9 hours and 16 hours respectively. Find the ratio of their speeds.',
    methodId: 'meetAndContinue',
    params: {
      stationA: { label: 'Howrah' },
      stationB: { label: 'Patna' },
      trainA: { label: 'Howrah Express' },
      trainB: { label: 'Patna Express' },
      afterMeetHoursA: 9,
      afterMeetHoursB: 16,
      referenceSpeedBKmph: 60,
    },
  },
];
