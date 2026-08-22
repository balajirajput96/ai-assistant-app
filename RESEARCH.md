# Orbit Research Record

## Product and Service Findings

Orbit will start with a **local-first client** and a server-side AI boundary. The project runtime exposes live model IDs for GPT-5, Claude 4, and Gemini 3 families, and each reported built-in web-search capability during the model catalog check on 2026-08-20. Model choice will be resolved server-side from the live catalog, rather than being fixed in the mobile binary.

The initial release will avoid falsely representing long-running automation or external integrations. The current session contains no enabled user-created connectors, and GitHub CLI authentication is not available. The integration manager will therefore present a clear unavailable state and document that any future connection must use authorization, a health check, explicit permissions, and revocation controls.

## Standards and Policy Findings

| Topic | Finding | Product / Release Decision |
| --- | --- | --- |
| Android target API | From 31 August 2026, new mobile apps and updates submitted to Google Play must target Android 16 / API 36 or higher. [1] | Validate the final Android build targets API 36 or later before release submission. |
| Data safety | Google Play requires published apps, including testing-track apps other than internal-only, to complete Data safety declarations; developers remain responsible for accurate declarations including third-party SDK handling. [2] | Keep a permission and third-party service inventory; provide privacy policy, data export, and data deletion materials. |
| Generative AI | Google Play requires AI content apps to comply with content restrictions and provide an in-app reporting or flagging path for offensive content. [3] [4] | Include a report-content action, responsible-use disclosure, and clear service limitation states. |
| MCP | MCP provides a standardized JSON-RPC framework for context, prompts, tools, capability negotiation, progress, cancellation, and errors. It requires informed user consent for data sharing and tool invocation. [5] | Use a connection card that states scopes, tool risk, consent status, and health. |
| MCP security | Official MCP security guidance highlights per-client consent, exact redirect URI validation, state validation, token-audience checks, SSRF defenses, and distrust of local MCP servers. [6] | Do not execute arbitrary local MCP commands; keep connectors disabled until verified and authorized. |
| GitHub integration | GitHub documents GitHub Apps as the preferred choice in most cases because they offer fine-grained repository access and short-lived credentials. [7] | Prefer a scoped GitHub App over broad personal credentials; use read-only access by default and request write permissions only for specific user-approved actions. |

## Product Decisions Informed by Research

Research is a first-class task type, not an invisible background feature. Each research result must show source links and distinguish **verified**, **inferred**, and **uncertain** material. Every external action remains unavailable until the required authorization and service health status are present. Automation cards can be created and tracked locally, but durable schedules and webhook execution are deliberately surfaced as requiring a configured backend rather than simulated.

## References

[1]: https://support.google.com/googleplay/android-developer/answer/11926878?hl=en "Target API level requirements for Google Play apps"
[2]: https://support.google.com/googleplay/android-developer/answer/10787469?hl=en "Provide information for Google Play's Data safety section"
[3]: https://support.google.com/googleplay/android-developer/answer/13985936?hl=en "AI-Generated Content"
[4]: https://support.google.com/googleplay/android-developer/answer/14094294?hl=en "Understanding Google Play's AI-Generated Content policy"
[5]: https://modelcontextprotocol.io/specification/2026-07-28 "Model Context Protocol Specification"
[6]: https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices "MCP Security Best Practices"
[7]: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps "Differences between GitHub Apps and OAuth apps"
