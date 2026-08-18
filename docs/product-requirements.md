# Product Requirements

## Product definition

**Atlas** is a mobile AI assistant that helps users plan, draft, summarize and manage clearly bounded tasks. It is designed for assisted work first: low-risk internal tasks can complete immediately, while high-impact actions remain reviewable and approval-gated.

## Target user and launch scope

The initial user is an individual who wants a clear AI chat interface with task status, voice-ready input, local history, privacy controls and an understandable automation model. The Android-first MVP is implemented with Expo/React Native. Its primary capability is server-backed chat; it does not promise an unrestricted autonomous agent, unlimited free AI usage, or access to every website.

| Area | Version 1 requirement | Explicitly excluded from Version 1 |
|---|---|---|
| Chat | Server-side assistant response with request validation and error state | Background streaming or unrestricted autonomous loops |
| Tasks | Typed task states, plan, audit events, retry/cancel UI | Hidden background execution |
| Memory | Local history and preferences, deletion/export controls | Unbounded personal profiling |
| Automation | Draftable templates and risk labels | Financial, destructive, public-posting, or silent third-party execution |
| Voice | Explicit voice-ready UI and optional transcription integration | Always-on listening |
| Connectors | Permission dashboard and connection state model | “Connect every service” or blanket scopes |
| GitHub | Release workflow documentation and future connector design | Embedded personal access tokens or automatic merging |

## Success criteria

The user can open the app, send a request, understand the assistant's task state, see why an action needs approval, delete local history, and discover that no external action has silently occurred. Every visible button must have a completed user flow or be intentionally disabled with a clear reason.
