# AI Assistant — Mobile Interface Design

## Product intent

यह Android-first AI assistant सामान्य उपयोगकर्ता को chat, voice, task planning और सुरक्षित automation एक सरल flow में देता है। प्रारंभिक release में assistant केवल कम-जोखिम वाले internal काम स्वतः करेगा; किसी external, destructive, financial या public action के लिए स्पष्ट user approval आवश्यक होगा।

## Portrait-first interaction principles

डिज़ाइन 9:16 portrait screen और one-handed use के लिए बनाया गया है। मुख्य compose field नीचे thumb-reach zone में रहेगा, primary actions 44pt से छोटे नहीं होंगे, और प्रत्येक risky action को स्पष्ट permission sheet से अलग किया जाएगा। Visual language साफ, शांत और iOS/Android-native conventions के अनुकूल होगी: large titles, restrained elevation, readable type scale और system-friendly haptics.

## Screen list

| Screen | Primary content and functionality |
|---|---|
| Chat Home | Conversation timeline, assistant status, text composer, voice trigger, attachment action, and a visible execution summary for each task. |
| Task Detail | Plan steps, progress state, tool/action log, approval prompts, retry/cancel controls, and final output. |
| History | Searchable local conversation and task history with delete/export controls. |
| Automations | User-created low-risk templates, enabled/disabled state, risk level, required approval, and last-run status. |
| Connectors | A permission dashboard that lists only configured integrations, requested scopes, health state, and disconnect control; no hidden or blanket access. |
| Memory & Privacy | Local preferences, saved facts, retention choices, clear-all/export actions, and a short explanation of what is stored. |
| Settings | AI response preferences, accessibility, network/error information, and links to privacy, security, and release documents. |

## Key user flows

| User goal | Flow |
|---|---|
| Ask for help | Open Chat → type or dictate request → assistant proposes a concise plan → user reviews any requested high-impact action → assistant returns result. |
| Run an automation | Open Automations → select template → inspect risk and permission needs → approve if required → view Task Detail and outcome. |
| Review a connector | Open Connectors → select a connector → view scopes, trust warning, and health status → connect/revoke only with explicit user intent. |
| Protect privacy | Open Memory & Privacy → inspect stored preferences/history → delete individual items or clear local data → export a readable copy if desired. |

## Navigation and layout

The app will use four bottom tabs: **Chat**, **Tasks**, **Automations**, and **Settings**. Chat is the default entry point. Secondary areas, including History, Connectors and Memory, are accessible from Settings and contextual buttons rather than crowded into the tab bar. A persistent but unobtrusive status pill communicates whether the assistant is ready, working, waiting for approval, or offline.

## Brand system

| Token | Value | Intended use |
|---|---|---|
| Brand ink | `#14213D` | Primary text, navigation and confidence. |
| Signal teal | `#0E9F9A` | Primary actions, active states and assistant presence. |
| Soft mint | `#DDF6F1` | Low-emphasis assistant surfaces and safe-state backgrounds. |
| Warm highlight | `#FFB703` | Attention and approval-required indicators. |
| Alert coral | `#E85D5D` | Errors, destructive actions and safety warnings. |
| Cloud | `#F8FAFC` | Light-mode canvas. |
| Night | `#0B1220` | Dark-mode canvas. |

The icon will use an abstract teal compass-spark motif, conveying guided action rather than autonomous control. It will be simple at launcher size, avoid text, and fill a square canvas without rounded-corner artwork.

## Accessibility and trust cues

All interactive controls will have accessible labels, text will respect system scaling, color will never be the only risk indicator, and error states will describe a safe recovery action. Approval sheets will name the destination, data category, permission scope and reversibility of an action. The assistant will never imply that an action was completed unless it has a verified result.
