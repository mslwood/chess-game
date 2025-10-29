import { runPerftSuite } from '../src/engine/perft';

const results = runPerftSuite();
let failed = false;
for (const { fixture, actual } of results) {
  const status = actual === fixture.nodes ? '✅' : '❌';
  console.log(`${status} ${fixture.name}: expected ${fixture.nodes}, got ${actual}`);
  if (actual !== fixture.nodes) {
    failed = true;
  }
}

if (failed) {
  process.exitCode = 1;
}
