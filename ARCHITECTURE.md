# Orbit Architecture

## Product Boundary

Orbit is an Android-first Expo mobile client backed by a secure TypeScript server. The first release follows a **local-first** model for conversation history and task presentation. Server features are reserved for capabilities that require protected credentials, model calls, file processing, or durable server-managed work.

## Layered Design

| Layer | Responsibility | Initial Implementation |
| --- | --- | --- |
| Mobile client | Chat, task visibility, local memory, file selection, voice controls, user privacy controls. | Expo Router, React Native, AsyncStorage, native permission APIs. |
| Task domain | A uniform record for chat, agent, research, document, and automation work. | Shared TypeScript types and local persistence. |
| Secure service | Model invocation, server-side validation, future authenticated integrations, and audited operations. | Existing TypeScript server and typed API routes. |
| Durable services | Schedules, long-running jobs, event triggers, and external sync. | Explicitly unavailable until a supported backend/hosting configuration is verified. |
| External integrations | GitHub and provider-connected tools. | Disabled-by-default connection manager with authorization and health-check states. |

## Core Task Model

Every user-visible operation is represented by a task with an ID, type, status, timestamps, steps, output, errors, retries, and audit events. Task statuses are `QUEUED`, `PLANNING`, `RUNNING`, `WAITING`, `RETRYING`, `BLOCKED`, `COMPLETED`, `FAILED`, and `CANCELLED`.

## Security Principles

Credentials remain server-side or in device secure storage. The client never receives provider secrets. All operation inputs are validated, task logs redact sensitive strings, external actions are scoped, and unavailable integration states are reported rather than simulated.
