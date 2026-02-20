# Hook: onInit — enterprise-microtask-planner-pack

Triggered when METHOD-ENTERPRISE-BUILDER-PLANNING enters **Phase 4: Micro-Task Decomposition**.

## Actions

1. Confirm `max_lines` threshold (default: 50 effective lines)
2. Confirm which languages are present in the project for the linter
3. Remind: "effective lines" = total lines − blank lines − comment-only lines − import/using lines
4. Add PDCA-T Check step to every micro-task: run `microtask-linter` before marking complete

## Reminder to agent

Every micro-task output must be validated before proceeding to the next:
```bash
node packs/enterprise-microtask-planner-pack/validators/microtask-linter/src/index.ts \
  --task=<path/to/file.ts> --max-lines=50
```
If the task exceeds 50 effective lines, the linter outputs split suggestions.
Act on the suggestions: split the task and re-validate each part.
