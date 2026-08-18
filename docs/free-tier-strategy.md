# Free-Tier Strategy

## Principle

The app will reduce cost and setup friction, but it will not claim that every AI feature or external service is free forever. Providers apply independent quotas, API terms and rate limits.

## MVP plan

The development version uses a secure server-side model helper. The production design supports a provider abstraction, so a future deployment can add an approved free-tier provider or user-owned key without changing the client contract. Any provider outage or quota failure is exposed as a retryable status rather than silently switching to an unknown service.

| Cost area | Strategy |
|---|---|
| AI inference | Short prompts, bounded history, concise outputs and a lower-cost default model. |
| Files and memory | Local-first data; upload only after a user initiates a file task. |
| Integrations | One official API/OAuth connection at a time; no scraping or undocumented endpoints. |
| Automation | User-triggered templates before scheduled/background processing. |

Gemini’s published free tier is limited to eligible models and quotas, and its rate-limit documentation identifies request, token and daily-limit dimensions. The app must handle quota errors gracefully. [1] [2]

## References

[1] [Gemini Developer API Pricing](https://ai.google.dev/gemini-api/docs/pricing)

[2] [Gemini API Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)
