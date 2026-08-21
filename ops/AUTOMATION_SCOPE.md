# Atlas Authorized Automation Scope

## Purpose

This document defines the boundary for durable Atlas engineering automation. It preserves reproducible **project evidence**—source, validated scripts, workflow records, redacted inventories, and machine-readable maintenance state—without collecting, displaying, committing, or replaying credentials.

> Automation may use an already authorized session only for the capability that session explicitly grants. It does not expand authorization, recover a secret, or substitute for user consent where an external service requires it.

## Authorization model

| Category | Permitted activity | Evidence retained | User action required |
| --- | --- | --- | --- |
| Repository maintenance | Install locked dependencies; run checks; build; export Android assets; inspect workflow outcomes; commit validated project changes. | Git commits, Actions logs and redacted execution artifacts. | No, while existing repository authority remains valid. |
| GitHub workflows | Run the bounded Atlas Maintenance workflow and push/PR validation. | Workflow run IDs, conclusions and generated records. | No, for the configured repository workflow. |
| Google Workspace CLI | Run a read-only health check only after an unambiguous active authorized account is selected. | A pass/fail result with no account identifier, quota value or file metadata. | Yes: select the account. |
| New external connector or CLI | Configure only through an approved provider flow, official installation source and least-privilege scope. | Connector/CLI name, purpose, approved scope and health result; never its secret. | Yes: approve the connection and complete any provider login. |
| Daily AI review | Prepare and run the review only at a user-selected local time. | Review timestamp, source state reference and non-sensitive result. | Yes: choose the time and timezone. |

## Credential and login boundary

Credentials, session cookies, API keys, recovery codes, passwords and OAuth refresh tokens are not project artifacts. They must not be copied into source code, Git history, Actions artifacts, terminal history, issue comments, logs, documentation, `.env` examples, or the mobile application bundle.

Where a provider supports a secure secret store, the secret stays in that store and is passed only to the smallest authorized runtime scope. Workflows must mask secret-bearing values, avoid shell tracing, and report only an outcome category such as `available`, `not configured`, `authorization required`, or `failed`. A failed or expired login is recorded as a blocker; it is not bypassed, reset, exported, or replaced automatically.

## Explicitly prohibited operations

The following are outside Atlas automation authority, even if a request describes them as risk-tolerant or pre-approved:

| Prohibited operation | Reason |
| --- | --- |
| Extracting API keys, passwords, tokens, cookies or connector secrets. | Secrets are not project data and must remain protected by their provider-controlled storage. |
| Bypassing login, MFA, authorization checks, account ownership controls or rate limits. | Automation must respect provider and account access controls. |
| Persisting raw terminal history or browser/login state to the public repository. | Command history and session state can contain sensitive material and are not reproducible source evidence. |
| Adding unverified CLI binaries, private credentials or unreviewed third-party integrations. | New tooling must use an official source and an approved, minimal scope. |
| External side effects without an explicit workflow purpose and authorization. | The maintenance workflow is limited to validation and evidence collection. |

## Preservation and recovery

Atlas preserves useful work through version-controlled source, `ops/maintenance-state.json`, the maintenance runbook, workflow definitions, GitHub execution artifacts, and a redacted historical inventory. The recovery order is: inspect the persisted state, inspect repository status and recent workflow evidence, rerun deterministic validation, then make a narrow validated repair when necessary.

Raw history is treated as potentially sensitive input. A history audit may retain only non-secret, reusable patterns such as command families, repository names, validation outcomes and documented scripts. It must omit command arguments and values that could contain identifiers, credentials, URLs with embedded authorization, or personal data.

## Current approved baseline

| Capability | Current status | Safe next action |
| --- | --- | --- |
| Atlas public repository and GitHub CLI | Authorized for repository maintenance. | Continue bounded validation and commit only verified project changes. |
| Atlas Maintenance workflow | Hourly and bounded to 2,400 cycles by repository policy. | Continue deterministic checks and retain execution records. |
| Google Workspace CLI | Installed; active account selection is pending. | Wait for the user to select one authorized account, then perform a read-only health check. |
| Gemini, Antigravity and Jules CLIs | Not installed in the validated environment. | Do not claim connectivity; use only after official installation and separate authorization. |
| Daily AI review | Prompt prepared; schedule is blocked on local time selection. | Wait for the user to provide a time and timezone. |

## CLI health-check contract

The maintenance script performs its normal deterministic validations on every run. The Google Workspace health check is intentionally **opt-in** through `ATLAS_GWS_HEALTH_CHECK=true`; it makes one read-only `drive about` request and discards the response. It reports only a non-sensitive status. Repository-hosted workflow runs set the switch to `false`, because a hosted runner must not receive a personal Workspace login or reusable credential. The check can be enabled only in a secure authorized environment after the user selects the active Workspace account.

## Change control

Any change to connector scope, a credential-bearing configuration, external data mutation, or daily review time requires a fresh confirmation at the provider or configuration boundary. This document itself is public and intentionally contains no secret values, account identities, or recovery material.
