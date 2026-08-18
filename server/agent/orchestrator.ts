import { invokeLLM, listLLMModels } from "../_core/llm";
import type { AssistantReply, AssistantTask } from "../../shared/assistant";
import { assessRequestPolicy } from "./policy";

type ChatTurn = { role: "user" | "assistant"; content: string };

function now() {
  return new Date().toISOString();
}

function makeTask(input: { risk: AssistantTask["risk"]; plan: string[]; state: AssistantTask["state"]; audit: string[]; approval?: AssistantTask["approval"] }): AssistantTask {
  const timestamp = now();
  return {
    id: crypto.randomUUID(),
    state: input.state,
    risk: input.risk,
    createdAt: timestamp,
    updatedAt: timestamp,
    plan: input.plan,
    audit: input.audit,
    approval: input.approval,
  };
}

async function chooseModel(): Promise<string | undefined> {
  const catalog = await listLLMModels();
  const ids = catalog.data.map((model) => model.id);
  return ids.find((id) => id === "gpt-5-mini") ?? ids.find((id) => id.startsWith("gpt-5")) ?? ids[0];
}

export async function runAssistant(input: { text: string; history: ChatTurn[] }): Promise<AssistantReply> {
  const policy = assessRequestPolicy(input.text);
  if (policy.requiresApproval) {
    const task = makeTask({
      state: "WAITING_FOR_APPROVAL",
      risk: policy.risk,
      plan: policy.plan,
      approval: policy.approval,
      audit: ["Request assessed", `Risk classified as ${policy.risk}`, "Execution blocked pending approval and a configured connector"],
    });
    return {
      task,
      message:
        "I can help prepare this safely, but this version will not execute an external, destructive, financial, or publishing action. Review the approval card and configure a specific connector before execution is considered.",
      provider: { available: false, notice: "Policy gate applied before any model or tool action." },
    };
  }

  const plannedTask = makeTask({
    state: "RUNNING",
    risk: policy.risk,
    plan: policy.plan,
    audit: ["Request assessed", "Risk classified as LOW", "Using server-side provider abstraction"],
  });

  try {
    const model = await chooseModel();
    const response = await invokeLLM({
      model,
      maxTokens: 900,
      messages: [
        {
          role: "system",
          content:
            "You are Atlas, a careful mobile AI assistant. Be helpful and concise. Never claim an external action has happened. If a request involves accounts, publishing, deletion, money, or credentials, say that explicit approval and a configured connector are required.",
        },
        ...input.history.slice(-8).map((turn) => ({ role: turn.role, content: turn.content })),
        { role: "user", content: input.text },
      ],
    });
    const rawContent = response.choices[0]?.message?.content;
    const message =
      (typeof rawContent === "string" ? rawContent.trim() : "") ||
      "I could not produce a response. Please try again.";
    return {
      task: { ...plannedTask, state: "SUCCEEDED", updatedAt: now(), audit: [...plannedTask.audit, "Model response returned"] },
      message,
      provider: { available: true, model },
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown provider error";
    return {
      task: { ...plannedTask, state: "FAILED", updatedAt: now(), audit: [...plannedTask.audit, "Model provider unavailable"] },
      message: "The AI provider is temporarily unavailable. Your draft was not sent anywhere. Please try again shortly.",
      provider: { available: false, notice: detail },
    };
  }
}
