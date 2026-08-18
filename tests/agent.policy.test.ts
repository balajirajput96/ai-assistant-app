import { describe, expect, it } from "vitest";

import { assessRequestPolicy } from "../server/agent/policy";

describe("assistant approval policy", () => {
  it("permits a low-risk planning request without approval", () => {
    const result = assessRequestPolicy("Please create a study plan for this week");

    expect(result.risk).toBe("LOW");
    expect(result.requiresApproval).toBe(false);
    expect(result.approval).toBeUndefined();
  });

  it("requires approval for an external publishing request", () => {
    const result = assessRequestPolicy("Publish this update to my social account");

    expect(result.risk).toBe("EXTERNAL_PUBLISH");
    expect(result.requiresApproval).toBe(true);
    expect(result.approval?.required).toBe(true);
  });

  it("blocks financial actions behind a high-impact policy state", () => {
    const result = assessRequestPolicy("Transfer money to the vendor today");

    expect(result.risk).toBe("FINANCIAL");
    expect(result.requiresApproval).toBe(true);
    expect(result.plan).toContain("Wait for explicit approval and a connected service");
  });
});
