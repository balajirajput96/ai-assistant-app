# Atlas — Safe AI Assistant

Atlas is an Android-first AI assistant MVP built with Expo, React Native, TypeScript and a server-side AI provider abstraction. It supports careful chat, task state, local history, voice input/output, safe automation templates and a connector-permission dashboard.

## What is implemented

| Capability | Current behavior |
|---|---|
| Server-backed chat | Validates requests, uses a server-side model helper, and returns a typed task result. |
| Task safety | Requests are classified before model/tool work. External, destructive, public-posting and financial requests return an approval state rather than execute. |
| Local history | Chat and templates persist on-device and can be cleared in Settings. |
| Voice | User-triggered microphone capture can be transcribed; assistant responses can be read aloud. |
| Automations | Local, reviewable templates only—no background execution or third-party writes. |
| Connectors | A permission-first dashboard makes it clear that each service needs a distinct official OAuth/API flow. |

## Run locally

```bash
pnpm install
pnpm dev
```

Use the QR code produced by the Expo process to open the app on an Android device through Expo Go during development. Run validation with:

```bash
pnpm check
pnpm lint
pnpm test
```

## Security and privacy

Do not place provider keys, GitHub tokens, passwords or recovery codes in the mobile app or repository. The client uses local storage for non-sensitive history and the server owns privileged provider access. Read [Security Model](docs/security-model.md), [Privacy Model](docs/privacy-model.md), and [System Architecture](docs/system-architecture.md) before adding a connector.

## Release

See [Release Plan](docs/release-plan.md) and [Play Store Listing](docs/play-store-listing.md). Public store submission requires a user-owned Play Console account, final policy URL, support contact, Data safety answers and a reviewed Android App Bundle.

## License

No license is declared yet. Select a license deliberately before making the repository public or accepting external contributions.
