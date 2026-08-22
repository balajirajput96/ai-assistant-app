export type TaskStatus = "QUEUED" | "PLANNING" | "RUNNING" | "WAITING" | "RETRYING" | "BLOCKED" | "COMPLETED" | "FAILED" | "CANCELLED";
export type TaskKind = "agent" | "research" | "document" | "automation" | "chat";

export type OrbitTask = {
  id: string;
  title: string;
  kind: TaskKind;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  retryCount: number;
  risk: "Low" | "Needs review";
  steps: Array<{ label: string; completed: boolean }>;
  output?: string;
  error?: string;
};

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  createdAt: string;
  taskId?: string;
};

export type AutomationTemplate = {
  id: string;
  title: string;
  summary: string;
  lastRun?: string;
  executionCount: number;
  scheduleStatus: "Manual" | "Backend required";
};

export function taskBlueprint(kind: TaskKind, agentMode: boolean) {
  if (kind === "research") {
    return [
      { label: "Clarify the research question", completed: false },
      { label: "Collect and cross-check sources", completed: false },
      { label: "Prepare a cited synthesis", completed: false },
    ];
  }
  if (kind === "document") {
    return [
      { label: "Confirm supported file and processing status", completed: false },
      { label: "Parse and organize document content", completed: false },
      { label: "Prepare an answer with source context", completed: false },
    ];
  }
  if (kind === "automation") {
    return [
      { label: "Review trigger and permissions", completed: false },
      { label: "Run the manual workflow", completed: false },
      { label: "Record results and next action", completed: false },
    ];
  }
  return agentMode
    ? [
        { label: "Understand the request", completed: false },
        { label: "Draft a safe execution plan", completed: false },
        { label: "Await secure AI and tool availability", completed: false },
      ]
    : [
        { label: "Queue the assistant response", completed: false },
        { label: "Await secure AI availability", completed: false },
      ];
}

export function createOrbitTask({ id, prompt, kind, agentMode, now }: { id: string; prompt: string; kind: TaskKind; agentMode: boolean; now: string }): OrbitTask {
  const title = prompt.trim();
  return {
    id,
    title: title.length > 72 ? `${title.slice(0, 69)}…` : title,
    kind,
    status: "PLANNING",
    createdAt: now,
    updatedAt: now,
    retryCount: 0,
    risk: kind === "automation" ? "Needs review" : "Low",
    steps: taskBlueprint(kind, agentMode),
  };
}

export function isTerminalStatus(status: TaskStatus) {
  return ["COMPLETED", "FAILED", "CANCELLED"].includes(status);
}
