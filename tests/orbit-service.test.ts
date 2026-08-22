import { describe, expect, it } from "vitest";
import { extractCitations, selectOrbitModel, systemPromptFor } from "../server/orbit-service";

describe("Orbit server service helpers", () => {
  it("uses a verified preferred model when it is present in the live catalog", () => {
    expect(selectOrbitModel(["other-model", "gemini-3-flash-preview", "gpt-5"])).toBe("gemini-3-flash-preview");
    expect(selectOrbitModel(["gpt-5-mini", "claude-haiku-4-5"])).toBe("gpt-5-mini");
  });

  it("deduplicates citations and gives research instructions that prohibit fabrication", () => {
    expect(extractCitations("Read https://example.com/a and https://example.com/a, then https://example.org/b.")).toEqual(["https://example.com/a", "https://example.org/b"]);
    expect(systemPromptFor("research")).toContain("Never fabricate citations");
  });
});
