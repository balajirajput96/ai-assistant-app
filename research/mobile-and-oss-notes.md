# Mobile and Open-Source Architecture Notes

## Mobile interaction architecture

Android’s Jetpack Compose guidance describes unidirectional data flow: UI events flow to a state holder, which updates immutable state for rendering. This is well suited to an assistant because every request, task-state transition, approval, retry, error and cancellation can be represented as an explicit event and tested independently. The Expo MVP will use the same conceptual pattern in TypeScript: state is rendered from a single task store and mutations are event-driven. [1]

## Open-source pattern review

Microsoft Agent Framework is published under the MIT license and documents patterns including provider abstraction, middleware, workflow orchestration, checkpointing, streaming, human-in-the-loop controls and observability. The MVP will not copy its implementation because it targets Python and .NET; instead, it will independently implement a small TypeScript task model, a provider interface, a tool registry and an approval gate inspired by these general patterns. [2]

## Implementation decision

The mobile client will remain the interaction layer and will not hold provider credentials. Model and any future connector calls will be performed through the server API with validated inputs and auditable task state. The first release will not execute arbitrary external code, use unrestricted device control, or automatically authorize third-party services.

## References

[1] [Android Developers, Compose UI Architecture](https://developer.android.com/develop/ui/compose/architecture)

[2] [Microsoft Agent Framework repository](https://github.com/microsoft/agent-framework)
