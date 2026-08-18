# Release Plan

## Build stages

| Stage | Outcome | Gate |
|---|---|---|
| MVP development | Chat, task state, local history, policy UI and documentation | TypeScript, lint and unit-test checks pass |
| Internal validation | Test common requests, offline/error behavior and consent flows | No placeholder actions or exposed secrets |
| Store preparation | Icon, screenshots, description, privacy policy and Data safety inventory | Permissions and data handling verified |
| Closed testing | Small tester group validates installed Android build | Issues triaged and release notes prepared |
| Production submission | User submits an Android App Bundle in Play Console | User owns Play developer account and confirms content |

## GitHub handoff

The codebase will be placed in a private GitHub repository with a README, `.gitignore`, documented setup steps, tests and a release checklist. API keys will never be committed. Automated merging and public publishing are not enabled by default.

## Required user-owned assets before store submission

The user must have a Play Console developer account, a final public privacy-policy URL, support contact details, a verified package name, store artwork/screenshots, Data safety answers based on the final deployed backend, and an Android App Bundle produced through the managed publish workflow. The agent can prepare these materials but cannot impersonate the user or submit/publish without confirmation.
