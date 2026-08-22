import type { ChatMessage, OrbitTask } from "@/lib/orbit-domain";
import type { TaskStatus } from "@/lib/orbit-domain";

export type OrbitExportPayload = {
  messages: ChatMessage[];
  tasks: OrbitTask[];
  createdAt?: string;
  filters?: OrbitExportFilters;
  redactedMessageIds?: string[];
  redactionOptions?: OrbitRedactionOptions;
};

export type RedactionTreatment = "placeholder" | "mask";

export type OrbitRedactionOptions = {
  treatment?: RedactionTreatment;
  placeholder?: string;
};

export type OrbitExportFilters = {
  startDate?: string;
  endDate?: string;
  statuses?: TaskStatus[];
};

const timestamp = (value: string) => new Date(value).toLocaleString();
const htmlEscape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
const markdownQuote = (value: string) => value.split("\n").map((line) => `> ${line}`).join("\n");
const DEFAULT_REDACTION_PLACEHOLDER = "[Redacted before export]";
const BLUR_STYLE_MASK = "████████████████";

function dateBoundary(value: string | undefined, endOfDay: boolean) {
  if (!value) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Use dates in YYYY-MM-DD format.");
  const parsed = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) throw new Error("Enter a valid calendar date in YYYY-MM-DD format.");
  return parsed.valueOf();
}

export function filterOrbitExportPayload(payload: OrbitExportPayload, filters: OrbitExportFilters = {}) {
  const start = dateBoundary(filters.startDate, false);
  const end = dateBoundary(filters.endDate, true);
  if (start && end && start > end) throw new Error("The start date must be on or before the end date.");
  const inWindow = (value: string) => {
    const point = new Date(value).valueOf();
    return (!start || point >= start) && (!end || point <= end);
  };
  const statuses = filters.statuses ?? [];
  return {
    messages: payload.messages.filter((message) => inWindow(message.createdAt)),
    tasks: payload.tasks.filter((task) => inWindow(task.createdAt) && (statuses.length === 0 || statuses.includes(task.status))),
    createdAt: payload.createdAt,
    filters,
  } satisfies OrbitExportPayload;
}

export function describeOrbitFilters(filters: OrbitExportFilters = {}) {
  const dateSummary = filters.startDate || filters.endDate ? `${filters.startDate ?? "Beginning"} to ${filters.endDate ?? "Today"}` : "All dates";
  const statusSummary = filters.statuses?.length ? filters.statuses.join(", ") : "All task statuses";
  return { dateSummary, statusSummary };
}

export function redactOrbitExportPayload(payload: OrbitExportPayload, messageIds: string[]) {
  const availableIds = new Set(payload.messages.map((message) => message.id));
  const redactedMessageIds = [...new Set(messageIds)].filter((id) => availableIds.has(id));
  return { ...payload, redactedMessageIds } satisfies OrbitExportPayload;
}

function normalizedRedactionOptions(options: OrbitRedactionOptions | undefined) {
  const treatment: RedactionTreatment = options?.treatment === "mask" ? "mask" : "placeholder";
  const placeholder = options?.placeholder?.trim().slice(0, 96) || DEFAULT_REDACTION_PLACEHOLDER;
  return { treatment, placeholder };
}

export function configureOrbitRedaction(payload: OrbitExportPayload, options: OrbitRedactionOptions) {
  return { ...payload, redactionOptions: normalizedRedactionOptions(options) } satisfies OrbitExportPayload;
}

function redactionState(messages: ChatMessage[], redactedMessageIds: string[] | undefined, options: OrbitRedactionOptions | undefined) {
  const ids = new Set(redactedMessageIds ?? []);
  const normalized = normalizedRedactionOptions(options);
  return { ids, count: messages.filter((message) => ids.has(message.id)).length, ...normalized, displayText: normalized.treatment === "mask" ? BLUR_STYLE_MASK : normalized.placeholder };
}

export function buildOrbitMarkdown({ messages, tasks, createdAt = new Date().toISOString(), filters, redactedMessageIds, redactionOptions }: OrbitExportPayload) {
  const selection = describeOrbitFilters(filters);
  const redaction = redactionState(messages, redactedMessageIds, redactionOptions);
  const lines = [
    "# Orbit Workspace Export",
    "",
    `Generated: ${timestamp(createdAt)}`,
    "",
    "> Privacy note: This file contains the local Orbit conversation history and task records selected for export. Share it only with people and services you trust.",
    "",
    "## Selection",
    "",
    `- **Date range:** ${selection.dateSummary}`,
    `- **Task statuses:** ${selection.statusSummary}`,
    `- **Messages redacted:** ${redaction.count}`,
    `- **Redaction treatment:** ${redaction.treatment === "mask" ? "Blur-style mask" : "Custom placeholder"}`,
    "",
    "## Conversation",
    "",
  ];
  if (messages.length === 0) lines.push("No conversation messages are stored locally.", "");
  for (const message of messages) {
    lines.push(`### ${message.role === "user" ? "You" : "Orbit"} — ${timestamp(message.createdAt)}`);
    if (message.taskId) lines.push(`Task reference: \`${message.taskId}\``);
    lines.push("", markdownQuote(redaction.ids.has(message.id) ? redaction.displayText : message.text), "");
  }
  lines.push("## Tasks", "");
  if (tasks.length === 0) lines.push("No tasks are stored locally.", "");
  for (const task of tasks) {
    lines.push(`### ${task.title}`, "", `- **Status:** ${task.status}`, `- **Type:** ${task.kind}`, `- **Risk:** ${task.risk}`, `- **Task ID:** \`${task.id}\``, `- **Created:** ${timestamp(task.createdAt)}`, `- **Updated:** ${timestamp(task.updatedAt)}`, `- **Retries:** ${task.retryCount}`, "", "#### Plan");
    for (const step of task.steps) lines.push(`- [${step.completed ? "x" : " "}] ${step.label}`);
    if (task.output) lines.push("", "#### Output", "", markdownQuote(task.output));
    if (task.error) lines.push("", "#### Error", "", markdownQuote(task.error));
    lines.push("");
  }
  return `${lines.join("\n").trim()}\n`;
}

export function buildOrbitExportHtml(payload: OrbitExportPayload) {
  const { messages, tasks, createdAt = new Date().toISOString(), filters, redactedMessageIds, redactionOptions } = payload;
  const selection = describeOrbitFilters(filters);
  const redaction = redactionState(messages, redactedMessageIds, redactionOptions);
  const messageBlocks = messages.length
    ? messages.map((message) => { const masked = redaction.ids.has(message.id); return `<section class="message"><h3>${message.role === "user" ? "You" : "Orbit"} <span>${htmlEscape(timestamp(message.createdAt))}</span></h3>${message.taskId ? `<p class="meta">Task reference: ${htmlEscape(message.taskId)}</p>` : ""}<p${masked && redaction.treatment === "mask" ? " class=\"redaction-mask\"" : ""}>${htmlEscape(masked ? redaction.displayText : message.text).replace(/\n/g, "<br>")}</p></section>`; }).join("")
    : "<p>No conversation messages are stored locally.</p>";
  const taskBlocks = tasks.length
    ? tasks.map((task) => `<section class="task"><h3>${htmlEscape(task.title)}</h3><dl><dt>Status</dt><dd>${htmlEscape(task.status)}</dd><dt>Type</dt><dd>${htmlEscape(task.kind)}</dd><dt>Risk</dt><dd>${htmlEscape(task.risk)}</dd><dt>Task ID</dt><dd>${htmlEscape(task.id)}</dd><dt>Updated</dt><dd>${htmlEscape(timestamp(task.updatedAt))}</dd></dl><h4>Plan</h4><ul>${task.steps.map((step) => `<li>${step.completed ? "☑" : "☐"} ${htmlEscape(step.label)}</li>`).join("")}</ul>${task.output ? `<h4>Output</h4><p>${htmlEscape(task.output).replace(/\n/g, "<br>")}</p>` : ""}${task.error ? `<h4>Error</h4><p>${htmlEscape(task.error).replace(/\n/g, "<br>")}</p>` : ""}</section>`).join("")
    : "<p>No tasks are stored locally.</p>";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>@page{margin:28px}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;font-size:12px;line-height:1.55}h1{font-size:24px;margin:0 0 2px;color:#1d4ed8}h2{font-size:17px;border-bottom:1px solid #dbe3ef;padding-bottom:5px;margin-top:26px}h3{font-size:13px;margin:0 0 6px}h3 span,.meta{color:#64748b;font-size:10px;font-weight:400}section{border:1px solid #e2e8f0;border-radius:10px;padding:12px;margin:10px 0;page-break-inside:avoid}p{margin:6px 0}dl{display:grid;grid-template-columns:90px 1fr;gap:3px 10px;margin:0}dt{font-weight:700;color:#475569}dd{margin:0}h4{font-size:11px;margin:13px 0 5px}ul{margin:0;padding-left:18px}.privacy{background:#eff6ff;border-left:3px solid #2563eb;padding:9px 11px;border-radius:4px;color:#1e3a8a}.selection{background:#f8fafc;border:1px solid #e2e8f0;padding:9px 11px;border-radius:6px}.selection p{margin:2px 0}.redaction-mask{letter-spacing:2px;color:#475569;font-weight:700}</style></head><body><h1>Orbit Workspace Export</h1><p class="meta">Generated: ${htmlEscape(timestamp(createdAt))}</p><p class="privacy">Privacy note: This file contains local Orbit conversation history and task records. Share it only with people and services you trust.</p><div class="selection"><strong>Selection</strong><p>Date range: ${htmlEscape(selection.dateSummary)}</p><p>Task statuses: ${htmlEscape(selection.statusSummary)}</p><p>Messages redacted: ${redaction.count}</p><p>Redaction treatment: ${redaction.treatment === "mask" ? "Blur-style mask" : "Custom placeholder"}</p></div><h2>Conversation</h2>${messageBlocks}<h2>Tasks</h2>${taskBlocks}</body></html>`;
}
