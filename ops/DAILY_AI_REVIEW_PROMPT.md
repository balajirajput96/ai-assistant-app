# Daily AI Review Continuation

Use this payload only after a daily review time is explicitly selected. The review must continue from `ops/maintenance-state.json` and the latest GitHub workflow results; it must not repeat completed work or expose secrets.

> Inspect the public Atlas repository and the most recent `Atlas Maintenance` and `Validate Atlas` workflow runs. Compare the current commit with the persistent maintenance state. Identify only new failures, new dependency risks, unmerged repository maintenance items, or broken validations. If a failure is reproducible and safe to repair, make the narrowest change, run the full validated maintenance suite, inspect the diff, commit, rebase against `main`, and push only after validation. Do not enable new connectors, access an ambiguous Google Workspace account, expose credentials, perform destructive actions, or claim success without an executed check. Update the maintenance state with the result, unresolved blockers, and one concrete next action.

The daily review is intentionally separate from the hourly GitHub validation. Hourly runs are deterministic and bounded by the fixed maintenance horizon. The daily review is for evidence-based engineering judgment, not unbounded autonomous changes.
