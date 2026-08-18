# Automation Patterns

## Policy-first automation

The MVP separates **assistance** from **execution**. A model may draft, summarize, classify, propose a plan or create a local task automatically. It may not send, publish, delete, change credentials, run arbitrary code, make purchases or access a third-party service unless a connector is authorized and the policy permits the exact action.

| Risk class | Examples | Default behavior |
|---|---|---|
| Low | Summarize local text, draft content, classify a request | Run after normal request validation. |
| Medium | Create a local automation template, prepare a GitHub change plan | Display a reviewable preview and retain an audit event. |
| High | Write to a connected service, create a commit or external issue | Require explicit approval at action time. |
| Destructive | Delete data, revoke a connection, change critical settings | Require an explicit confirmation with a clear recovery note. |
| External publish / financial | Post publicly, send bulk messages, purchase or transfer funds | Not supported by the initial release. |

## Tool contract

Each tool adapter will declare an input schema, output schema, allowed operations, risk, timeout, retry limit, token/data requirements and user-facing confirmation summary. The policy layer validates the LLM-proposed call against this registry before execution. OWASP recommends scoped permissions and explicit authorization for sensitive operations; this contract implements that guidance. [1]

## Runtime decision

The mobile build is not a 24/7 automation host. Scheduled or event-driven work needs a server-side service and should only be added after a concrete trigger, destination, service API and user-controlled execution policy are identified. The MVP instead provides templates and an approval model, avoiding background behavior that would be opaque or unreliable on a mobile device.

## References

[1] [OWASP AI Agent Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html)

[2] [Google ADK Safety and Security](https://adk.dev/safety/)
