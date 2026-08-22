import { describe, expect, it } from "vitest";

import { detectSensitiveMessages, detectSensitiveText, normalizeSensitiveScanConfig } from "../lib/orbit-sensitive-data";

describe("Orbit local sensitive-data detection", () => {
  it("labels email, phone, and supported API-key-like values without returning the matched value", () => {
    const apiKeyFixture = `ghp_${"A".repeat(30)}`;
    const findings = detectSensitiveText(`Reach ada@example.com or +1 (415) 555-0199. Key: ${apiKeyFixture}.`);
    expect(findings.map((finding) => finding.kind)).toEqual(expect.arrayContaining(["Email", "Phone number", "API key"]));
    expect(JSON.stringify(findings)).not.toContain("ada@example.com");
    expect(JSON.stringify(findings)).not.toContain(apiKeyFixture);
  });

  it("creates explainable suggestions only for messages that need a redaction decision", () => {
    const suggestions = detectSensitiveMessages([
      { id: "clean", role: "assistant", text: "No private values here.", createdAt: "2026-08-20T00:00:00.000Z" },
      { id: "sensitive", role: "user", text: "Email me at ada@example.com.", createdAt: "2026-08-20T00:01:00.000Z" },
    ]);
    expect(suggestions).toEqual([{ messageId: "sensitive", kinds: ["Email"], occurrences: 1 }]);
  });

  it("honors category toggles and bounded literal custom rules without evaluating user-supplied regex", () => {
    const config = normalizeSensitiveScanConfig({ enabledKinds: { "Email": false, "Phone number": false, "API key": false, "Custom rule": true }, customRules: ["project-aurora", "a", "012345678901234567890123456789012345678901234567890"] });
    expect(config.customRules).toEqual(["project-aurora"]);
    expect(detectSensitiveText("Email ada@example.com and label project-aurora.", config).map((finding) => finding.kind)).toEqual(["Custom rule"]);
  });
});
