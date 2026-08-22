import { describe, expect, it } from "vitest";
import { buildOrbitExportHtml, buildOrbitMarkdown, configureOrbitRedaction, filterOrbitExportPayload, redactOrbitExportPayload } from "../lib/orbit-export-content";

const payload = {
  createdAt: "2026-08-20T00:00:00.000Z",
  messages: [{ id: "m1", role: "user" as const, text: "Review <this> safely", createdAt: "2026-08-20T00:01:00.000Z", taskId: "task-1" }],
  tasks: [{ id: "task-1", title: "Review a document", kind: "document" as const, status: "COMPLETED" as const, createdAt: "2026-08-20T00:01:00.000Z", updatedAt: "2026-08-20T00:02:00.000Z", retryCount: 0, risk: "Low" as const, steps: [{ label: "Read source", completed: true }], output: "Done" }],
};

describe("Orbit workspace export", () => {
  it("includes both local conversation and task records in Markdown", () => {
    const markdown = buildOrbitMarkdown(payload);
    expect(markdown).toContain("# Orbit Workspace Export");
    expect(markdown).toContain("## Conversation");
    expect(markdown).toContain("Review <this> safely");
    expect(markdown).toContain("- [x] Read source");
    expect(markdown).toContain("Privacy note");
  });

  it("escapes user-controlled content when constructing PDF HTML", () => {
    const html = buildOrbitExportHtml(payload);
    expect(html).toContain("Review &lt;this&gt; safely");
    expect(html).not.toContain("Review <this> safely");
    expect(html).toContain("Orbit Workspace Export");
  });

  it("filters messages by date and tasks by both date and status", () => {
    const filtered = filterOrbitExportPayload({
      messages: [...payload.messages, { id: "old", role: "assistant", text: "Old", createdAt: "2026-07-01T00:00:00.000Z" }],
      tasks: [...payload.tasks, { ...payload.tasks[0], id: "blocked", status: "BLOCKED", createdAt: "2026-08-20T00:01:00.000Z" }],
    }, { startDate: "2026-08-20", endDate: "2026-08-20", statuses: ["COMPLETED"] });
    expect(filtered.messages).toHaveLength(1);
    expect(filtered.tasks).toHaveLength(1);
    expect(filtered.tasks[0]?.status).toBe("COMPLETED");
    expect(buildOrbitMarkdown(filtered)).toContain("Date range:** 2026-08-20 to 2026-08-20");
  });

  it("rejects an inverted date window", () => {
    expect(() => filterOrbitExportPayload(payload, { startDate: "2026-08-21", endDate: "2026-08-20" })).toThrow("start date");
  });

  it("redacts only selected preview messages without mutating local source history", () => {
    const redacted = redactOrbitExportPayload(payload, ["m1", "missing", "m1"]);
    expect(redacted.messages[0]?.text).toBe("Review <this> safely");
    expect(redacted.redactedMessageIds).toEqual(["m1"]);
    const markdown = buildOrbitMarkdown(redacted);
    const html = buildOrbitExportHtml(redacted);
    expect(markdown).not.toContain("Review <this> safely");
    expect(markdown).toContain("[Redacted before export]");
    expect(markdown).toContain("Messages redacted:** 1");
    expect(html).not.toContain("Review &lt;this&gt; safely");
    expect(html).toContain("[Redacted before export]");
  });

  it("uses a custom placeholder or non-reversible blur-style mask for redacted export content", () => {
    const redacted = redactOrbitExportPayload(payload, ["m1"]);
    const custom = configureOrbitRedaction(redacted, { treatment: "placeholder", placeholder: "[Private note removed]" });
    const blurMask = configureOrbitRedaction(redacted, { treatment: "mask" });
    expect(buildOrbitMarkdown(custom)).toContain("[Private note removed]");
    expect(buildOrbitExportHtml(custom)).toContain("Custom placeholder");
    expect(buildOrbitMarkdown(blurMask)).toContain("████████████████");
    expect(buildOrbitExportHtml(blurMask)).toContain("redaction-mask");
    expect(buildOrbitMarkdown(blurMask)).not.toContain("Review <this> safely");
  });
});
