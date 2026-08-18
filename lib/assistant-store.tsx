import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import type { AssistantTask } from "@/shared/assistant";

const STORAGE_KEY = "atlas.local.workspace.v1";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  task?: AssistantTask;
};

export type AutomationTemplate = {
  id: string;
  name: string;
  description: string;
  risk: "LOW" | "MEDIUM";
  enabled: boolean;
  lastRun?: string;
};

type WorkspaceSnapshot = {
  messages: ChatMessage[];
  automations: AutomationTemplate[];
};

type AssistantStore = WorkspaceSnapshot & {
  hydrated: boolean;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  toggleAutomation: (id: string) => void;
  runAutomation: (id: string) => void;
};

const initialAutomations: AutomationTemplate[] = [
  {
    id: "daily-plan",
    name: "Daily planning draft",
    description: "Turn your priorities into a simple, reviewable plan.",
    risk: "LOW",
    enabled: true,
  },
  {
    id: "meeting-summary",
    name: "Meeting summary",
    description: "Summarize notes you paste into chat before you share them.",
    risk: "LOW",
    enabled: false,
  },
  {
    id: "github-brief",
    name: "GitHub change brief",
    description: "Prepare a code-change brief for review; it never commits automatically.",
    risk: "MEDIUM",
    enabled: false,
  },
];

const AssistantStoreContext = createContext<AssistantStore | null>(null);

export function AssistantStoreProvider({ children }: PropsWithChildren) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [automations, setAutomations] = useState<AutomationTemplate[]>(initialAutomations);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const snapshot = JSON.parse(raw) as WorkspaceSnapshot;
        if (Array.isArray(snapshot.messages)) setMessages(snapshot.messages);
        if (Array.isArray(snapshot.automations)) setAutomations(snapshot.automations);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, automations })).catch(() => undefined);
  }, [automations, hydrated, messages]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((current) => [...current, message]);
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  const toggleAutomation = useCallback((id: string) => {
    setAutomations((current) =>
      current.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)),
    );
  }, []);

  const runAutomation = useCallback((id: string) => {
    setAutomations((current) =>
      current.map((item) => (item.id === id ? { ...item, lastRun: new Date().toISOString() } : item)),
    );
  }, []);

  const value = useMemo(
    () => ({ messages, automations, hydrated, addMessage, clearMessages, toggleAutomation, runAutomation }),
    [addMessage, automations, clearMessages, hydrated, messages, runAutomation, toggleAutomation],
  );

  return <AssistantStoreContext.Provider value={value}>{children}</AssistantStoreContext.Provider>;
}

export function useAssistantStore() {
  const value = useContext(AssistantStoreContext);
  if (!value) throw new Error("useAssistantStore must be used within AssistantStoreProvider");
  return value;
}
