import type { ChatMessage } from "@/lib/orbit-domain";

export type SensitiveDataKind = "Email" | "Phone number" | "API key" | "Custom rule";

export type SensitiveFinding = {
  kind: SensitiveDataKind;
  start: number;
  end: number;
};

export type SensitiveMessageSuggestion = {
  messageId: string;
  kinds: SensitiveDataKind[];
  occurrences: number;
};

export type SensitiveScanConfig = {
  enabledKinds: Record<SensitiveDataKind, boolean>;
  customRules: string[];
};

export const DEFAULT_SENSITIVE_SCAN_CONFIG: SensitiveScanConfig = {
  enabledKinds: { "Email": true, "Phone number": true, "API key": true, "Custom rule": true },
  customRules: [],
};

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_PATTERN = /(?<![\w])(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?){1,3}\d{3,4}(?![\w])/g;
const API_KEY_PATTERNS = [
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g,
  /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g,
  /\bAIza[0-9A-Za-z_-]{35}\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/g,
  /\bxox(?:b|p|a|r|s)-[0-9A-Za-z-]{10,}\b/g,
];

export function normalizeSensitiveScanConfig(config?: Partial<SensitiveScanConfig>): SensitiveScanConfig {
  const enabledKinds = { ...DEFAULT_SENSITIVE_SCAN_CONFIG.enabledKinds, ...config?.enabledKinds };
  const customRules = [...new Set((config?.customRules ?? []).map((rule) => rule.trim()).filter((rule) => rule.length >= 2 && rule.length <= 48))].slice(0, 12);
  return { enabledKinds, customRules };
}

function matches(pattern: RegExp, text: string, kind: SensitiveDataKind) {
  const findings: SensitiveFinding[] = [];
  for (const match of text.matchAll(pattern)) {
    const value = match[0] ?? "";
    const start = match.index ?? 0;
    if (kind === "Phone number") {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) continue;
    }
    findings.push({ kind, start, end: start + value.length });
  }
  return findings;
}

function literalMatches(value: string, text: string) {
  const findings: SensitiveFinding[] = [];
  const search = value.toLocaleLowerCase();
  const source = text.toLocaleLowerCase();
  let start = source.indexOf(search);
  while (start !== -1) {
    findings.push({ kind: "Custom rule", start, end: start + value.length });
    start = source.indexOf(search, start + value.length);
  }
  return findings;
}

export function detectSensitiveText(text: string, config?: Partial<SensitiveScanConfig>) {
  const normalized = normalizeSensitiveScanConfig(config);
  const findings = [
    ...(normalized.enabledKinds.Email ? matches(EMAIL_PATTERN, text, "Email") : []),
    ...(normalized.enabledKinds["Phone number"] ? matches(PHONE_PATTERN, text, "Phone number") : []),
    ...(normalized.enabledKinds["API key"] ? API_KEY_PATTERNS.flatMap((pattern) => matches(pattern, text, "API key")) : []),
    ...(normalized.enabledKinds["Custom rule"] ? normalized.customRules.flatMap((rule) => literalMatches(rule, text)) : []),
  ];
  return findings.filter((finding, index, all) => !all.some((other, otherIndex) => otherIndex < index && other.start === finding.start && other.end === finding.end && other.kind === finding.kind));
}

export function detectSensitiveMessages(messages: ChatMessage[], config?: Partial<SensitiveScanConfig>) {
  return messages.flatMap((message) => {
    const findings = detectSensitiveText(message.text, config);
    if (!findings.length) return [];
    const kinds = [...new Set(findings.map((finding) => finding.kind))];
    return [{ messageId: message.id, kinds, occurrences: findings.length } satisfies SensitiveMessageSuggestion];
  });
}
