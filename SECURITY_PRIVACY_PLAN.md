# Security and Privacy Plan

## Initial Commitments

Orbit will treat every third-party tool, attachment, URL, and model output as potentially untrusted. The app will validate inputs, keep credentials out of source and logs, visibly explain network-dependent features, and provide local data export and deletion controls.

| Area | Requirement | Initial Control |
| --- | --- | --- |
| Credentials | Do not embed provider keys in the app or repository. | Server-only secrets and device secure storage for user tokens. |
| Attachments | Avoid silent uploads or unclear retention. | File status and capability disclosure before processing. |
| Tool execution | Limit authority and document risk. | Explicit risk labels, permission states, and audit events. |
| Prompt injection | Treat files, web pages, and connector outputs as data. | Isolation of retrieved content from task instructions and visible source attribution. |
| User data | Support control and removal. | Local memory viewer, export, reset, and deletion controls. |
| Logging | Keep diagnostics useful without leaking secrets. | Redaction utilities and structured task errors. |
| Local export | Let users share their workspace without automatic cloud upload. | Explicit format confirmation, cache-local file creation, native share sheet, and a privacy notice embedded in each export. |
| Preview redaction | Let users prevent selected message content from leaving the device. | A per-message one-tap mask applies only to the in-memory preview/export payload, labels the redaction in the document, and leaves local chat history unchanged. |
| Redaction treatment | Let users control how removed text is represented without exposing it. | A bounded custom placeholder or non-reversible block mask is selected in the preview and carried into both final export formats. |
| Local sensitive-data scan | Help users identify common private values before sharing without sending content away. | Device-local pattern matching flags emails, phone numbers, and selected API-key formats by type and count only; it never stores, displays, or transmits matched values. |
| Configurable local scan | Give users control over sensitivity scanning without allowing unsafe pattern execution. | Category switches and persisted literal custom rules operate on device only; custom regular expressions are deliberately rejected to avoid unbounded user-supplied pattern evaluation. |
