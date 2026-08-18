# Security Model

## Threat-aware defaults

External web pages, files, model outputs and connector responses are treated as untrusted data. The model cannot grant itself permissions, change the policy engine, access secrets or make an external action appear completed without a verified adapter result.

## Controls

| Risk | Control |
|---|---|
| Prompt injection | Tool registry is allow-listed; external text cannot alter policy. |
| Over-broad scopes | Each connector displays only its own scopes and supports revocation. |
| Secret leakage | Secrets remain server-side or in platform-protected storage; logs exclude them. |
| Unintended external action | High-risk, destructive, financial and public actions are blocked or need explicit approval. |
| Provider failure | Typed task failure; no fabricated success message. |
| Unsafe code | No arbitrary shell or code-execution tool in the MVP. |

The model's initial policy classifier is intentionally conservative: high-impact keywords create an approval state rather than an external tool call. A production connector must add deterministic per-tool authorization, strict input validation, provider-specific scope checks and an audit trail.

OWASP specifically recommends least-privilege tools, per-tool scopes and explicit authorization for sensitive operations. [1]

## References

[1] [OWASP AI Agent Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html)
