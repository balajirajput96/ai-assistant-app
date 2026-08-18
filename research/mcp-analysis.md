# MCP Analysis

## Product position

Model Context Protocol is useful for standardizing tool discovery and connected-service access, but it does not make every external tool safe. The app will treat each MCP server as a separate connection with a provider name, endpoint, capability inventory, requested scopes, health status and revoke option.

## Authorization implications

The MCP HTTP authorization specification is based on OAuth 2.1 and describes protected-resource and authorization-server discovery. Scope information supplied in an authorization challenge is important for requesting only what is needed. The MVP will not implement a universal “connect all” control; a user will initiate each connection and inspect scopes before consent. [1]

| MCP control | MVP requirement |
|---|---|
| Discovery | List only server-declared tools after a successful connection. |
| Consent | User initiates OAuth and sees requested scopes. |
| Invocation | Tool policy validates every invocation and requires approval by risk. |
| Secret handling | Access tokens remain server-side or in protected native storage, never in logs or chat. |
| Revocation | A visible disconnect control clears the local connection state and triggers provider-side revocation where available. |
| Trust boundary | Tool output is untrusted data and must not override app policy or developer instructions. |

## References

[1] [Model Context Protocol Authorization Specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization)

[2] [Model Context Protocol Security Best Practices](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices)
