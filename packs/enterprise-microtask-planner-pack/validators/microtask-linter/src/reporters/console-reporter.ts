// Console reporter for microtask-linter

import type { LineCountResult } from '../analyzers/line-counter.ts';

export function reportToConsole(results: LineCountResult[], maxLines: number): void {
  let violations = 0;

  for (const r of results) {
    const icon = r.exceedsLimit ? '✗' : '✓';
    const status = r.exceedsLimit ? `FAIL (${r.breakdown.effective} effective lines > ${maxLines})` : `PASS (${r.breakdown.effective} effective lines)`;
    console.log(`${icon} ${r.filePath} — ${status}`);

    if (r.exceedsLimit) {
      violations++;
      console.log(`  Breakdown: ${r.breakdown.total} total | ${r.breakdown.effective} code | ${r.breakdown.comment} comments | ${r.breakdown.imports} imports | ${r.breakdown.blank} blank`);

      if (r.splitSuggestions.length > 0) {
        console.log(`\n  Suggested split (${r.splitSuggestions.length} units):`);
        for (const s of r.splitSuggestions) {
          console.log(`    ├── extract: ${s.name}()  [lines ${s.lineRange[0]}–${s.lineRange[1]}]  ~${s.estimatedLines} effective lines`);
        }
        console.log(`\n  Result: ${r.splitSuggestions.length} micro-tasks of ~${Math.ceil(r.breakdown.effective / r.splitSuggestions.length)} lines each`);
      }
    }
  }

  console.log('\n─────────────────────────────────────────────');
  console.log(`Validated: ${results.length} file(s)  |  Violations: ${violations}  |  Max: ${maxLines} lines`);

  if (violations === 0) {
    console.log('Status:    ALL PASSED ✓');
  } else {
    console.log('Status:    FAILED — split the tasks listed above before proceeding');
  }
}
