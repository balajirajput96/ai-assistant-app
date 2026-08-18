# Primary Security Research Notes

## Agent tool policy

OWASP's AI Agent Security Cheat Sheet recommends least-privilege tools, per-tool permission scoping, distinct tool sets for different trust levels, and explicit authorization for sensitive operations. This supports an allow-listed tool registry with a user-visible confirmation gate for publishing, deletion, external writes, and credential-affecting actions. [1]

Google's Agent Development Kit safety guidance identifies prompt injection, unclear instructions, unsafe actions, sensitive-data leakage and tool-mediated indirect injection as material risks. Its layered approach informs the MVP policy design: scoped identity, input/output screening, in-tool parameter checks, sandboxing where code execution exists, and logs/evaluations for traceability. [2]

## MCP authorization

The MCP authorization specification describes HTTP MCP authorization through OAuth 2.1. It requires discovery of resource and authorization-server metadata for supported protected servers and directs clients to use scope information from the resource challenge. The app will therefore only show a connector as connected after a valid consent-driven authorization flow, will retain the requested scopes for user review, and will not offer a universal “connect everything” capability. [3]

## References

[1] [OWASP, AI Agent Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html)

[2] [Google ADK, Safety and Security for AI Agents](https://adk.dev/safety/)

[3] [Model Context Protocol, Authorization Specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization)
