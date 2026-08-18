# UX Analysis

## Design premise

An AI assistant should make the primary task—asking for help—immediate, while keeping actions, data access and automation legible. The app therefore leads with chat, not a control-heavy dashboard. Automation, connectors and memory appear as secondary surfaces only when the user needs them.

## Evidence-led UX decisions

Android's Compose architecture documentation recommends a unidirectional event/state flow. In the app, user actions such as send, approve, cancel, retry, delete and revoke are explicit events; task progress and assistant output are rendered from a single observable state. This supports consistency and testability in a multi-stage assistant interaction. [1]

A selected community discussion highlights concerns about accidental data exposure, opaque third-party sharing, retention and deletion. This is not universal evidence, but it supports providing an easily accessible privacy screen, showing the purpose of each permission, and letting users clear history or revoke a connection. [2]

| UX requirement | Product decision |
|---|---|
| Immediate entry | Chat opens first with a prominent composer and suggested safe tasks. |
| Automation trust | Every external/high-risk action shows destination, scope, payload summary and approval option. |
| Error recovery | A failure names the blocked capability and gives retry, edit, or cancel options. |
| Voice use | Voice is a user-triggered compose action; it does not imply always-on listening. |
| Accessibility | Controls have labels, state is not color-only, text respects scaling, and destructive actions require a confirmation step. |
| Cognitive load | Four primary tabs only: Chat, Tasks, Automations and Settings. |

## References

[1] [Android Developers, Compose UI Architecture](https://developer.android.com/develop/ui/compose/architecture)

[2] [Zapier Community discussion](https://community.zapier.com/general-discussion-13/if-you-could-build-your-own-ai-assistant-what-would-it-do-52372)
