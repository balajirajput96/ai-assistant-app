import type { ApprovalRequest, RiskLevel } from "../../shared/assistant";

export type PolicyAssessment = {
  risk: RiskLevel;
  requiresApproval: boolean;
  approval?: ApprovalRequest;
  plan: string[];
};

const highImpactSignals = [
  "send ",
  "email",
  "publish",
  "post ",
  "upload",
  "delete",
  "remove",
  "revoke",
  "password",
  "payment",
  "buy ",
  "transfer",
  "github commit",
  "create issue",
];

const destructiveSignals = ["delete", "remove", "wipe", "erase", "revoke", "reset password"];
const financialSignals = ["payment", "pay ", "buy ", "purchase", "transfer", "bank", "wallet"];
const publishSignals = ["publish", "post ", "tweet", "send email", "send message", "upload"];

export function assessRequestPolicy(text: string): PolicyAssessment {
  const normalized = text.toLowerCase();
  const isFinancial = financialSignals.some((signal) => normalized.includes(signal));
  const isDestructive = destructiveSignals.some((signal) => normalized.includes(signal));
  const isPublishing = publishSignals.some((signal) => normalized.includes(signal));
  const isHighImpact = highImpactSignals.some((signal) => normalized.includes(signal));

  let risk: RiskLevel = "LOW";
  if (isFinancial) risk = "FINANCIAL";
  else if (isDestructive) risk = "DESTRUCTIVE";
  else if (isPublishing) risk = "EXTERNAL_PUBLISH";
  else if (isHighImpact) risk = "HIGH";

  if (risk === "LOW") {
    return {
      risk,
      requiresApproval: false,
      plan: ["Understand the request", "Draft a response or local plan", "Return a reviewable result"],
    };
  }

  const title =
    risk === "FINANCIAL"
      ? "Financial action blocked"
      : risk === "DESTRUCTIVE"
        ? "Destructive action blocked"
        : risk === "EXTERNAL_PUBLISH"
          ? "External publishing requires approval"
          : "External action requires approval";

  return {
    risk,
    requiresApproval: true,
    plan: ["Understand the request", "Prepare a non-executing draft", "Wait for explicit approval and a connected service"],
    approval: {
      id: crypto.randomUUID(),
      title,
      summary:
        "This request could affect an external account, public destination, money, or stored data. The MVP will prepare a draft only and will not execute the action.",
      risk,
      required: true,
    },
  };
}
