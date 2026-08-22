import { describe, expect, it } from "vitest";
import { createOrbitTask, isTerminalStatus, taskBlueprint } from "../lib/orbit-domain";

describe("Orbit task domain", () => {
  it("creates a transparent research plan with no completed steps", () => {
    const task = createOrbitTask({
      id: "task-123",
      prompt: "Research current Android release requirements",
      kind: "research",
      agentMode: true,
      now: "2026-08-20T00:00:00.000Z",
    });

    expect(task.status).toBe("PLANNING");
    expect(task.risk).toBe("Low");
    expect(task.steps).toHaveLength(3);
    expect(task.steps.every((step) => !step.completed)).toBe(true);
    expect(task.steps[1].label).toContain("cross-check");
  });

  it("uses an explicit automation plan and marks only terminal statuses as terminal", () => {
    expect(taskBlueprint("automation", true)[0].label).toContain("permissions");
    expect(isTerminalStatus("COMPLETED")).toBe(true);
    expect(isTerminalStatus("FAILED")).toBe(true);
    expect(isTerminalStatus("CANCELLED")).toBe(true);
    expect(isTerminalStatus("WAITING")).toBe(false);
    expect(isTerminalStatus("RETRYING")).toBe(false);
  });
});
