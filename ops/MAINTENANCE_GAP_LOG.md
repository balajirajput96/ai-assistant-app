# Atlas Maintenance Gap Log

## Assessment method

This log records only gaps verified from the persisted state and GitHub workflow evidence. Each entry distinguishes a repairable repository concern from an intentional authorization boundary so that automated maintenance does not retry blocked actions as if they were build failures.

| ID | Classification | Evidence | Maintenance treatment |
| --- | --- | --- | --- |
| `state-record-freshness` | Repairable evidence gap | The persisted `executionNumber` was `2`, while the downloaded successful scheduled artifact recorded cycle `22`. | Validate the persisted state on every maintenance run; update its latest verified scheduled evidence only after an artifact is inspected. |
| `daily-ai-review-time` | User-dependent configuration | The review prompt exists, but no local review time or timezone has been selected. | Keep the review unscheduled; retain the blocker without retries. |
| `workspace-account-selection` | User-dependent authorization | Google Workspace CLI is installed, but multiple accounts exist and no active account was selected. | Keep the read-only check opt-in; do not query, select, or store an account automatically. |
| `unavailable-cli-tooling` | Environment capability gap | Gemini, Antigravity and Jules CLIs were not present in the validated environment. | Do not add them as workflow dependencies; assess an official installation only if the user explicitly requests that capability. |
| `dependabot-alert-access` | Limited authorization scope | Dependabot alert API access previously returned HTTP 403. | Use local dependency audit and review staged compatibility changes; do not attempt token escalation. |
| `github-runner-queue-delay` | External execution condition | Scheduled run `32547710685` started as a GitHub Actions queue entry after prior scheduled runs and current code validation had succeeded. | Leave the pending run intact, inspect its artifact only after completion, and do not create a duplicate retry while GitHub retains the queue entry. |

## Maintenance decision

The state-record freshness gap is suitable for a repository-only repair because it requires no new credential, connector, account selection or external side effect. The GitHub runner queue delay is an external condition, not an application defect; it remains observable and must not be converted into a destructive retry loop. All other entries remain explicit blockers or capability constraints and must not be bypassed by automation.
