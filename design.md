# Orbit AI Assistant — Mobile Interface Design

## Design Intent

Orbit is a calm, capable personal workbench for AI-assisted tasks. The interface prioritizes a conversation-first workflow while making autonomous work legible: users can always see what is running, why a capability is unavailable, and what data stays on device. The product is designed for **portrait 9:16 screens**, with one-handed primary actions positioned in the lower half of the display.

## Color and Visual System

| Role | Color | Purpose |
| --- | --- | --- |
| Orbit Ink | `#111827` | Primary text and dark navigation surfaces. |
| Orbit Blue | `#2563EB` | Primary action, active states, and task progress. |
| Orbit Sky | `#EAF2FF` | Soft informational backgrounds and empty states. |
| Signal Mint | `#16A394` | Completed tasks and secure/connected indicators. |
| Amber Signal | `#D97706` | Attention and capability-required states. |
| Cloud | `#F8FAFC` | Main light-mode canvas. |
| Slate Line | `#E2E8F0` | Hairline dividers and input borders. |

Typography follows native system fonts with a compact, high-legibility hierarchy. Surfaces use 16–24 px corner radii, restrained elevation, and no decorative gradients that compete with task information.

## Screen List

| Screen | Primary Content and Functionality |
| --- | --- |
| Home / Chat | Conversation timeline, message composer, attachment and microphone controls, agent-mode switch, quick actions, and active-task card. |
| Task Detail | Task status, plan, elapsed time, outputs, errors, retry history, permissions, and cancellation. |
| Research | Saved research threads, source cards, citations, confidence labels, and export actions. |
| Workspace | Uploaded files, document status, summaries, extracted text, and supported-format guidance. |
| Automations | User-created task templates, schedule status, execution history, and an explicit unavailable state where durable background execution is not configured. |
| Memory | Conversation preferences and saved memory items with view, export, and delete controls. |
| Integrations | Connection status, available tools, scopes, health states, risk levels, and plain-language setup guidance. |
| Settings & Privacy | AI capability status, data controls, notification preferences, voice settings, export/delete data, and privacy disclosure. |

## Key User Flows

| User Goal | Flow |
| --- | --- |
| Ask Orbit to work on a task | Home → type or dictate prompt → choose Agent mode if multi-step work is desired → Orbit creates a tracked task → Task Detail shows plan, status, and result. |
| Attach a file for analysis | Home → attachment control → choose a document or image → visible file chip with status → send → Workspace retains the item and chat presents the result or a capability limitation. |
| Run research | Quick action or typed prompt → Research task card → source list with verified/inferred/uncertain labels → cited synthesis → export or save to Memory. |
| Review automation availability | Automations → inspect template and execution history → configure a schedule if a supported backend is available; otherwise see a truthful explanation and a local reminder alternative. |
| Manage connected capabilities | Integrations → select service → review scopes and risk → connect only through authorized setup → health check → revoke access when desired. |
| Remove personal data | Settings & Privacy → Data Controls → review local items → export or permanently clear device data with an explicit confirmation. |

## Interaction Standards

Primary compose, voice, and attach controls remain within thumb reach above the bottom navigation. High-impact actions such as deleting memory, revoking access, or exporting data use a confirmation step. Every action produces immediate feedback: a press state, a task status transition, or a clear unavailable/error explanation. No icon-only control is left without an accessible label.
