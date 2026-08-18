# AI Assistant Architecture Analysis

## Scope and evidence standard

यह report official specifications, official mobile guidance और selected public open-source projects पर आधारित है। Public repositories को architecture और design patterns के लिए पढ़ा जाता है; proprietary code, unlicensed content या private data को copy अथवा ingest नहीं किया जाएगा.

## Recommended MVP architecture

The product should use a **mobile client → secure API → orchestration/policy layer → model and approved tools** design. The mobile client owns presentation, local drafts and explicit user interaction. The API owns model invocation, server-side secrets, request validation, task state, tool authorization and audit metadata. This separation prevents provider keys and connector tokens from being exposed in a distributed app build.

| Layer | Responsibility | MVP decision |
|---|---|---|
| Mobile client | Chat, task status, user approval, local history, preferences | Expo + TypeScript + React Native with event-driven UI state. |
| Application API | Input validation, model calls, structured output and errors | Type-safe server procedures with Zod validation. |
| Orchestrator | Intent routing, plan, tool selection, state machine, audit events | A small explicit state machine, not unbounded autonomous recursion. |
| Policy engine | Risk classification, allow-lists, user confirmation | Mandatory before a tool executes. |
| Tool adapters | Narrow integrations with schemas, timeouts, retry policy | Start with safe internal tools; add external tools per connector only after OAuth/API setup. |
| Data | Local conversation and preferences first; server persistence only when needed | Local storage by default, with privacy controls. |

## Agent execution model

The orchestrator will represent each task as `QUEUED`, `PLANNING`, `WAITING_FOR_APPROVAL`, `RUNNING`, `SUCCEEDED`, `FAILED`, or `CANCELLED`. Every requested tool action must include a tool name, typed input, risk level, permission requirement, timeout and result/error summary. This keeps automation observable and recoverable rather than treating an LLM response as proof that an external action succeeded.

Microsoft Agent Framework offers useful architecture evidence—provider abstraction, middleware, checkpointing, workflow patterns, human-in-the-loop and observability—but is a .NET/Python framework. The project will use original TypeScript code and only adopt compatible high-level patterns. [1]

## Security architecture

OWASP recommends least privilege, per-tool scoping, separate tool sets for trust levels and explicit authorization for sensitive operations. Google ADK similarly calls for clear identity, in-tool guardrails, validation, sandboxing where relevant, evaluation and tracing. The MVP therefore prohibits unrestricted shell, broad device access, silent publishing and credential-bearing client code. [2] [3]

## References

[1] [Microsoft Agent Framework](https://github.com/microsoft/agent-framework)

[2] [OWASP AI Agent Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html)

[3] [Google ADK Safety and Security](https://adk.dev/safety/)
