export type TaskState =
  | "QUEUED"
  | "PLANNING"
  | "WAITING_FOR_APPROVAL"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "DESTRUCTIVE" | "EXTERNAL_PUBLISH" | "FINANCIAL";

export type ApprovalRequest = {
  id: string;
  title: string;
  summary: string;
  risk: RiskLevel;
  required: boolean;
};

export type AssistantTask = {
  id: string;
  state: TaskState;
  risk: RiskLevel;
  createdAt: string;
  updatedAt: string;
  plan: string[];
  audit: string[];
  approval?: ApprovalRequest;
};

export type AssistantReply = {
  task: AssistantTask;
  message: string;
  provider: {
    available: boolean;
    model?: string;
    notice?: string;
  };
};
