import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";

import { LoadingBubble, SpeakButton, StatusPill, TaskCard } from "@/components/assistant-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useAssistantStore, type ChatMessage } from "@/lib/assistant-store";
import { trpc } from "@/lib/trpc";
import { VoiceButton } from "@/components/voice-button";

const suggestions = ["Plan my week", "Summarize my notes", "Create a GitHub change brief"];

function timeLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export default function ChatScreen() {
  const router = useRouter();
  const { messages, addMessage, hydrated } = useAssistantStore();
  const [draft, setDraft] = useState("");
  const chatMutation = trpc.assistant.chat.useMutation();
  const history = useMemo(() => messages.map(({ role, content }) => ({ role, content })).slice(-8), [messages]);

  const sendMessage = async (raw?: string) => {
    const text = (raw ?? draft).trim();
    if (!text || chatMutation.isPending) return;
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text, createdAt: new Date().toISOString() };
    addMessage(userMessage);
    setDraft("");
    try {
      const reply = await chatMutation.mutateAsync({ text, history });
      addMessage({ id: crypto.randomUUID(), role: "assistant", content: reply.message, createdAt: new Date().toISOString(), task: reply.task });
    } catch {
      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I couldn’t reach the assistant service. Your message stayed in local history and was not sent to any external connector.",
        createdAt: new Date().toISOString(),
      });
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}>
        {!isUser ? <View style={styles.avatar}><MaterialIcons name="auto-awesome" size={16} color="#FFFFFF" /></View> : null}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>{item.content}</Text>
          {!isUser ? <SpeakButton text={item.content} /> : null}
          <Text style={[styles.messageTime, isUser ? styles.userTime : styles.assistantTime]}>{timeLabel(item.createdAt)}</Text>
          {item.task ? <View style={styles.taskWrap}><TaskCard task={item.task} onApprove={() => Alert.alert("Draft retained", "No external action was run. Configure a specific connector later to enable a reviewed action.")} /></View> : null}
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer className="flex-1" containerClassName="bg-background">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>YOUR WORKSPACE</Text>
            <Text style={styles.title}>Atlas</Text>
          </View>
          <TouchableOpacity style={styles.historyButton} onPress={() => router.push("/history")} accessibilityLabel="Open conversation history" activeOpacity={0.7}>
            <MaterialIcons name="history" size={21} color="#14213D" />
          </TouchableOpacity>
        </View>
        <View style={styles.statusRow}>
          <StatusPill label={chatMutation.isPending ? "WORKING" : "READY"} tone={chatMutation.isPending ? "warning" : "success"} />
          <Text style={styles.statusCopy}>External actions always require review.</Text>
        </View>

        {!hydrated ? <View style={styles.center}><LoadingBubble /></View> : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={messages.length ? styles.messageList : styles.emptyList}
            ListEmptyComponent={
              <View style={styles.welcome}>
                <View style={styles.welcomeMark}><MaterialIcons name="auto-awesome" size={29} color="#FFFFFF" /></View>
                <Text style={styles.welcomeTitle}>What can I help you move forward?</Text>
                <Text style={styles.welcomeCopy}>Ask for a plan, a summary, a draft, or a safe next step. Atlas will show task status and request approval before anything external.</Text>
                <View style={styles.suggestionGroup}>
                  {suggestions.map((item) => (
                    <TouchableOpacity key={item} style={styles.suggestion} onPress={() => sendMessage(item)} activeOpacity={0.75}>
                      <Text style={styles.suggestionText}>{item}</Text>
                      <MaterialIcons name="north-east" size={16} color="#0E9F9A" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            }
            ListFooterComponent={chatMutation.isPending ? <View style={styles.loadingWrap}><LoadingBubble /></View> : null}
          />
        )}

        <View style={styles.composerOuter}>
          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Message Atlas…"
              placeholderTextColor="#94A3B8"
              multiline
              maxLength={8000}
              style={styles.input}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage()}
              accessibilityLabel="Assistant message"
            />
            <VoiceButton onTranscript={(text) => setDraft((current) => (current ? `${current} ${text}` : text))} />
            <TouchableOpacity style={[styles.sendButton, (!draft.trim() || chatMutation.isPending) && styles.sendDisabled]} onPress={() => sendMessage()} disabled={!draft.trim() || chatMutation.isPending} accessibilityLabel="Send message" activeOpacity={0.8}>
              <MaterialIcons name="arrow-upward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.composerNote}>Keep sensitive passwords and recovery codes out of chat.</Text>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = {
  flex: { flex: 1 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12 },
  eyebrow: { color: "#0E9F9A", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: "#14213D", fontSize: 31, fontWeight: "900", letterSpacing: -0.8, marginTop: 1 },
  historyButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: 18, borderWidth: 1, height: 43, justifyContent: "center", width: 43 },
  statusRow: { alignItems: "center", flexDirection: "row", gap: 9, paddingHorizontal: 20, paddingTop: 9, paddingBottom: 12 },
  statusCopy: { color: "#64748B", flex: 1, fontSize: 12, fontWeight: "600" },
  center: { alignItems: "center", flex: 1, justifyContent: "center" },
  messageList: { gap: 14, paddingHorizontal: 16, paddingBottom: 16 },
  emptyList: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 20, paddingBottom: 22 },
  welcome: { alignItems: "center", paddingBottom: 25 },
  welcomeMark: { alignItems: "center", backgroundColor: "#0E9F9A", borderRadius: 27, height: 54, justifyContent: "center", marginBottom: 17, width: 54 },
  welcomeTitle: { color: "#14213D", fontSize: 24, fontWeight: "900", letterSpacing: -0.55, maxWidth: 320, textAlign: "center" },
  welcomeCopy: { color: "#64748B", fontSize: 14, lineHeight: 21, marginTop: 10, maxWidth: 340, textAlign: "center" },
  suggestionGroup: { gap: 9, marginTop: 24, width: "100%" },
  suggestion: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: 15, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 15, paddingVertical: 14 },
  suggestionText: { color: "#14213D", fontSize: 14, fontWeight: "700" },
  messageRow: { alignItems: "flex-end", flexDirection: "row", gap: 8 },
  userRow: { justifyContent: "flex-end" },
  assistantRow: { justifyContent: "flex-start" },
  avatar: { alignItems: "center", backgroundColor: "#0E9F9A", borderRadius: 14, height: 28, justifyContent: "center", width: 28 },
  messageBubble: { borderRadius: 18, maxWidth: "85%", paddingHorizontal: 14, paddingVertical: 11 },
  userBubble: { backgroundColor: "#14213D", borderBottomRightRadius: 5 },
  assistantBubble: { backgroundColor: "#FFFFFF", borderBottomLeftRadius: 5, borderColor: "#E2E8F0", borderWidth: 1 },
  messageText: { fontSize: 14, lineHeight: 21 },
  userText: { color: "#FFFFFF" },
  assistantText: { color: "#263650" },
  messageTime: { fontSize: 10, marginTop: 7 },
  userTime: { color: "#AFC1D9" },
  assistantTime: { color: "#94A3B8" },
  taskWrap: { marginTop: 12 },
  loadingWrap: { paddingBottom: 2 },
  composerOuter: { backgroundColor: "#F8FAFC", borderTopColor: "#E2E8F0", borderTopWidth: 1, paddingHorizontal: 16, paddingTop: 10 },
  composer: { alignItems: "flex-end", backgroundColor: "#FFFFFF", borderColor: "#CBD5E1", borderRadius: 19, borderWidth: 1, flexDirection: "row", gap: 5, minHeight: 54, paddingLeft: 13, paddingRight: 5, paddingVertical: 5 },
  input: { color: "#14213D", flex: 1, fontSize: 15, lineHeight: 20, maxHeight: 96, paddingVertical: 9 },
  sendButton: { alignItems: "center", backgroundColor: "#0E9F9A", borderRadius: 15, height: 42, justifyContent: "center", width: 42 },
  sendDisabled: { backgroundColor: "#B9C8D8" },
  composerNote: { color: "#94A3B8", fontSize: 10, lineHeight: 14, paddingBottom: 6, paddingTop: 6, textAlign: "center" },
} as const;
