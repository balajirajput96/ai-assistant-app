# Free-Tier AI and API Analysis

## Reality of “free” integrations

No production assistant can safely promise unlimited free access to every website or AI provider. Each service has its own terms, authentication, rate limits, supported regions and charges. The MVP must use official APIs, present quota limits accurately and degrade gracefully when no provider is available.

## Recommended approach

| Option | Benefit | Constraint | MVP usage |
|---|---|---|---|
| Built-in server model | No user key in the app, server-side controls and a simpler first demo | Project usage is metered and not a public unlimited-free service | Default development integration. |
| Gemini Developer API free tier | Official free access to eligible models for small projects | Limited models and quotas; Google notes that free-tier content may be used to improve products | Future opt-in provider, with clear disclosure. |
| On-device/open models | Potential privacy and offline benefits | Device memory/performance, model license and quality constraints | Research-only until a suitable compatible model and UX are verified. |
| Third-party service APIs | Enables explicit task integrations | Separate OAuth/key, terms, scopes and rate limits for each service | Add one-by-one after user intent and provider verification. |

The Gemini documentation states that free access is limited to certain models and that rate limits are measured across requests, tokens and requests per day; it also documents `429 RESOURCE_EXHAUSTED` behavior. The provider layer must therefore convert quota failures into a clear retry/fallback state, not an app crash. [1] [2]

## Privacy decision

The app will not embed a Gemini API key in the mobile client. If a future build supports user-supplied credentials, it will use secure storage and an explicit terms/privacy notice. The first MVP will make provider status visible and will not claim zero cost or unlimited availability.

## References

[1] [Gemini Developer API Pricing](https://ai.google.dev/gemini-api/docs/pricing)

[2] [Gemini API Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)
