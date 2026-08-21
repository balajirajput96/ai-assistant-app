# Atlas Engineering Maintenance Runbook

## Purpose

This runbook preserves a reproducible, non-destructive continuation process for the Atlas repository. Each run starts from the persisted state in `ops/maintenance-state.json`, verifies real conditions, records evidence, and changes source only when a reproducible failure or approved maintenance update requires it.

## Safe run order

| Step | Operation | Success condition | Failure response |
|---|---|---|---|
| 1 | Inspect `git status`, branch, remotes and recent commits. | Working state is understood before edits. | Stop before destructive operations; preserve uncommitted work. |
| 2 | Install locked dependencies with `pnpm install`. | Installation completes without lockfile drift. | Record dependency/install error and diagnose only the affected package. |
| 3 | Run `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm build`, Android export and Expo diagnostics. | Every command succeeds. | Reproduce, patch narrowly, and rerun the failed check plus the full suite. |
| 4 | Inspect the latest GitHub validation workflow. | Latest workflow conclusion is `success`. | Inspect logs, reproduce locally, fix and push only validated changes. |
| 5 | Every scheduled run writes a machine-readable execution artifact; after that artifact is inspected, update `ops/maintenance-state.json` with the verified cycle, timestamp, result and next action. | Each cycle has durable non-secret evidence, and the persisted summary never claims an unverified run. | Leave the prior record intact and add only an explicit blocker. |
| 6 | Review the diff, commit the validated change, rebase against the public `main` branch, and push. | Clean history and successful remote CI. | Resolve conflicts without reset; preserve recoverability through commits. |

## Boundaries

The workflow must not delete repositories, revoke credentials, alter external data, publish public content, or bypass authentication. It must not automatically merge pull requests, rotate secrets, or enable unrequested third-party connectors. Dependency alerts may be investigated locally, but framework-major updates require a compatibility validation pass. The detailed authorization, preservation and credential-handling contract is maintained in [`ops/AUTOMATION_SCOPE.md`](AUTOMATION_SCOPE.md).

## Current validated baseline

The validated baseline includes the Express 5 named-splat storage route repair, successful local verification, a public GitHub repository, and passing `Validate Atlas` workflow runs. The app configuration has passed Expo diagnostics for the installed SDK.

## Schedule policy

Hourly deterministic maintenance runs through the repository-hosted **Atlas Maintenance** workflow. Its policy is bounded to 2,400 cycles from the persisted start and end timestamps in `ops/maintenance-state.json`; the workflow stops after the fixed horizon. A separate daily AI review remains disabled until the user selects its local time and timezone. Google Workspace checks remain disabled until the user selects one authorized account.
