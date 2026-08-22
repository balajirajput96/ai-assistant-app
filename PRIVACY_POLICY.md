# Orbit Privacy Policy Draft

**Effective date:** Draft for pre-release review, 20 August 2026.

Orbit is a task-focused AI assistant. This draft describes the data behavior of the current application build and must be reviewed, completed with an operator contact and hosting details, and published at a public URL before any Google Play submission.

## Information Orbit Handles

| Data category | Why it is used | Where it is handled | Current retention behavior |
| --- | --- | --- | --- |
| Chat messages and task records | Display conversations, task plans, outputs, and retry state. | On the device by default. | Retained until the user clears local workspace data. |
| Selected text documents | Provide a user-requested summary or analysis. | Read locally and sent only when a compatible text file is actively selected for secure analysis. | The current application does not keep a cloud document library. |
| Voice recordings | Convert a recorded request into text after the user stops recording. | Temporarily encoded on the device and sent to the secure transcription route only for the requested transcription. | No persistent recording library is implemented in the current build. |
| AI prompts and outputs | Generate a requested response, research summary, or document analysis. | Secure server-side AI route. | Server-side retention policy requires operator completion before production release. |
| Notification permission | Send device-local task reminders. | Device operating system. | Permission may be changed in Android settings. |

## User Choices

Orbit shows clear availability information when a capability is not configured. The user can clear local conversation, task, and workflow data from **Settings → Local data controls**. The current build does not contain an active external connector. If GitHub or another third-party connection is added later, Orbit will disclose its scopes, risk level, and revocation action before authorization.

## Security Approach

Provider credentials are not embedded in the mobile client. AI operations are sent to a server-side boundary with input limits, structured task states, error redaction, and an explicit blocked state when a request cannot complete. Orbit treats attachments, web sources, and integration output as untrusted content rather than privileged instructions.

## Contact and Finalization Requirements

Before publishing, the operator must add a real privacy contact email and public policy URL, state the actual production server log-retention period, complete Google Play’s Data safety questionnaire, and re-audit any added SDKs or integrations. This draft is not a substitute for legal advice.
