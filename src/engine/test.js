import { METHODS, assertValidTimeline, trainsProblemBank } from './index.js';

let errors = 0;

for (const prob of trainsProblemBank) {
  const method = METHODS[prob.methodId];
  if (!method) {
    console.error(`Method ${prob.methodId} not found for problem ${prob.id}`);
    errors++;
    continue;
  }

  try {
    const tl = method(prob.params);
    assertValidTimeline(tl);
    
    // Validate moment shapes
    for (const moment of tl.moments) {
      if (!moment.id || typeof moment.t !== 'number' || !moment.observation || !moment.reason || !moment.therefore || !moment.relatedFormula) {
        throw new Error(`Malformed moment: ${JSON.stringify(moment)}`);
      }
    }
    console.log(`PASS: ${prob.id} generated ${tl.moments.length} moments.`);
  } catch (e) {
    console.error(`FAIL: ${prob.id} threw an error: ${e.message}`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n${errors} problems failed validation.`);
  process.exit(1);
} else {
  console.log('\nAll tests passed!');
}
