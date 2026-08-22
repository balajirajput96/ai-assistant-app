# GitHub and Automation Handoff

## Current Status

No authorized GitHub connector or authenticated GitHub CLI session was detected during implementation. Therefore, Orbit has **not** created, pushed, or modified a repository. The project intentionally does not present unverified GitHub functionality as connected.

## Recommended Repository Model

Use a GitHub App with fine-grained repository permissions and short-lived credentials, rather than a broad personal access token, unless the operating environment requires otherwise. [1] Start read-only and request write actions only after the user sees the target repository, scope, and impact.

## Proposed Automation Boundaries

| Automation | Trigger | Permission boundary | Status |
| --- | --- | --- | --- |
| Repository sync | User-approved connect and push. | Scoped GitHub App repository content permissions. | Blocked pending authorization. |
| CI quality checks | Pull request / main branch. | Read source and write check status only. | Needs repository. |
| Scheduled workflows | Durable backend scheduler. | Named task, account scope, audit log, cancellation. | Backend hosting required. |
| Store release operations | Explicit release approval. | Google Play Console release role, least privilege. | Console access required. |

## Required Next Steps

After a repository is created and access is authorized, add CI workflows for `pnpm check` and `pnpm test`, record repository details in `PROJECT_STATE.md`, and enable any automated delivery action only after a manual review of permissions and secret storage.

## Reference

[1]: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps "Differences between GitHub Apps and OAuth apps"
