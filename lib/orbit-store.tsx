import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { createOrbitTask, type AutomationTemplate, type ChatMessage, type OrbitTask, type TaskKind, type TaskStatus } from "@/lib/orbit-domain";
import { DEFAULT_SENSITIVE_SCAN_CONFIG, normalizeSensitiveScanConfig, type SensitiveScanConfig } from "@/lib/orbit-sensitive-data";

export type { AutomationTemplate, ChatMessage, OrbitTask, TaskKind, TaskStatus } from "@/lib/orbit-domain";

type StoredOrbitData = {
  messages: ChatMessage[];
  tasks: OrbitTask[];
  automations: AutomationTemplate[];
  sensitiveScanConfig?: SensitiveScanConfig;
};

type OrbitContextValue = StoredOrbitData & {
  hydrated: boolean;
  createTaskFromPrompt: (prompt: string, kind: TaskKind, agentMode: boolean) => string;
  updateTaskStatus: (taskId: string, status: TaskStatus, output?: string) => void;
  resolveTaskResponse: (taskId: string, status: TaskStatus, text: string) => void;
  retryTask: (taskId: string) => void;
  createAutomation: () => void;
  runAutomation: (automationId: string) => void;
  sensitiveScanConfig: SensitiveScanConfig;
  setSensitiveScanConfig: (config: SensitiveScanConfig) => void;
  clearWorkspace: () => Promise<void>;
};

const STORAGE_KEY = "orbit-local-workspace-v1";

const starterMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "I’m Orbit. I can organize a request into a tracked task now; secure AI, file understanding, and voice services are shown with their current availability as they are configured.",
  createdAt: new Date().toISOString(),
};

const starterAutomation: AutomationTemplate = {
  id: "research-review",
  title: "Research review",
  summary: "Collect a question, organize its source requirements, and create a manual research task.",
  executionCount: 0,
  scheduleStatus: "Manual",
};

const OrbitContext = createContext<OrbitContextValue | undefined>(undefined);

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function OrbitProvider({ children }: PropsWithChildren) {
  const [messages, setMessages] = useState<ChatMessage[]>([starterMessage]);
  const [tasks, setTasks] = useState<OrbitTask[]>([]);
  const [automations, setAutomations] = useState<AutomationTemplate[]>([starterAutomation]);
  const [sensitiveScanConfig, setSensitiveScanConfig] = useState<SensitiveScanConfig>(DEFAULT_SENSITIVE_SCAN_CONFIG);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const stored = JSON.parse(raw) as StoredOrbitData;
        setMessages(stored.messages?.length ? stored.messages : [starterMessage]);
        setTasks(stored.tasks ?? []);
        setAutomations(stored.automations?.length ? stored.automations : [starterAutomation]);
        setSensitiveScanConfig(normalizeSensitiveScanConfig(stored.sensitiveScanConfig));
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, tasks, automations, sensitiveScanConfig } satisfies StoredOrbitData)).catch(() => undefined);
  }, [automations, hydrated, messages, sensitiveScanConfig, tasks]);

  const createTaskFromPrompt = useCallback((prompt: string, kind: TaskKind, agentMode: boolean) => {
    const now = new Date().toISOString();
    const id = makeId("task");
    const cleanPrompt = prompt.trim();
    const task = createOrbitTask({ id, prompt: cleanPrompt, kind, agentMode, now });
    setTasks((current) => [task, ...current]);
    setMessages((current) => [
      ...current,
      { id: makeId("user"), role: "user", text: cleanPrompt, createdAt: now, taskId: id },
      {
        id: makeId("orbit"),
        role: "assistant",
        taskId: id,
        createdAt: now,
        text: "I created a tracked request and am waiting for a secure service result. The task remains visible until a real response, error, cancellation, or retry is recorded.",
      },
    ]);
    return id;
  }, []);

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus, output?: string) => {
    const now = new Date().toISOString();
    setTasks((current) => current.map((task) => task.id === taskId
      ? {
          ...task,
          status,
          updatedAt: now,
          output: output ?? task.output,
          steps: task.steps.map((step, index) => ({ ...step, completed: status === "COMPLETED" ? true : index === 0 && status !== "CANCELLED" })),
        }
      : task));
  }, []);

  const resolveTaskResponse = useCallback((taskId: string, status: TaskStatus, text: string) => {
    updateTaskStatus(taskId, status, text);
    setMessages((current) => [
      ...current,
      { id: makeId("orbit"), role: "assistant", text, createdAt: new Date().toISOString(), taskId },
    ]);
  }, [updateTaskStatus]);

  const retryTask = useCallback((taskId: string) => {
    const now = new Date().toISOString();
    setTasks((current) => current.map((task) => task.id === taskId
      ? { ...task, status: "RETRYING", updatedAt: now, retryCount: task.retryCount + 1, error: undefined }
      : task));
  }, []);

  const createAutomation = useCallback(() => {
    setAutomations((current) => [
      {
        id: makeId("automation"),
        title: "New manual workflow",
        summary: "A safe manual workflow. Configure a durable backend before scheduling it automatically.",
        executionCount: 0,
        scheduleStatus: "Backend required",
      },
      ...current,
    ]);
  }, []);

  const runAutomation = useCallback((automationId: string) => {
    const automation = automations.find((item) => item.id === automationId);
    if (!automation) return;
    const id = createTaskFromPrompt(automation.title, "automation", true);
    const now = new Date().toISOString();
    setAutomations((current) => current.map((item) => item.id === automationId
      ? { ...item, executionCount: item.executionCount + 1, lastRun: now }
      : item));
    updateTaskStatus(id, "WAITING");
  }, [automations, createTaskFromPrompt, updateTaskStatus]);

  const clearWorkspace = useCallback(async () => {
    const cleared: StoredOrbitData = { messages: [starterMessage], tasks: [], automations: [starterAutomation], sensitiveScanConfig };
    setMessages(cleared.messages);
    setTasks(cleared.tasks);
    setAutomations(cleared.automations);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cleared));
  }, []);

  const value = useMemo<OrbitContextValue>(() => ({
    messages,
    tasks,
    automations,
    hydrated,
    createTaskFromPrompt,
    updateTaskStatus,
    resolveTaskResponse,
    retryTask,
    createAutomation,
    runAutomation,
    sensitiveScanConfig,
    setSensitiveScanConfig,
    clearWorkspace,
  }), [automations, clearWorkspace, createAutomation, createTaskFromPrompt, hydrated, messages, resolveTaskResponse, retryTask, runAutomation, sensitiveScanConfig, tasks, updateTaskStatus]);

  return <OrbitContext.Provider value={value}>{children}</OrbitContext.Provider>;
}

export function useOrbit() {
  const context = useContext(OrbitContext);
  if (!context) throw new Error("useOrbit must be used within OrbitProvider");
  return context;
}
