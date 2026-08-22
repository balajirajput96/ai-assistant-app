# Orbit Continuation Automation

## Local Cycle Contract

`pnpm engineering:cycle` runs a deterministic, diagnostics-first continuation cycle. Each invocation loads the previous local state, captures non-secret Git metadata, executes lint, type checking, and tests, performs at most one dependency-only recovery attempt with `pnpm install --frozen-lockfile`, saves one immutable JSON record, refreshes `latest.json`, and rebuilds a compact TSV index.

The machine-readable local state lives in `automation/continuation/state/`. Its configured cap is 2,400 cycles. The command never pushes, deploys, rebases, reruns remote jobs, changes secrets, or edits a lockfile.

## GitHub Integration Boundary

The verified account-level continuation system is already maintained in the private `balajirajput96/autonomous-engineering-maintenance` repository. It schedules an hourly diagnostics-first GitHub workflow and stores authoritative runtime state on `maintenance-state`. The matching product repository `balajirajput96/ai-assistant-app` already has active CI and maintenance workflows.

Orbit therefore uses the local cycle as a reproducible companion rather than creating a second competing hourly scheduler. Any future GitHub publication must first compare current Orbit source with the matching product repository, then use a reviewable branch or pull request. Direct production deployment, force pushes, credential changes, and unreviewed repository mutations remain out of scope for the cycle.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm engineering:cycle` | Execute one bounded local continuation cycle. |
| `pnpm engineering:validate` | Verify state continuity and latest/summary consistency. |
| `pnpm lint && pnpm check && pnpm test` | Run the normal application quality gate. |
