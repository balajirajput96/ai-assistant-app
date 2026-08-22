import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import { File } from "expo-file-system";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { useMemo, useState } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { OrbitMark, SectionLabel, StatusPill } from "@/components/orbit-ui";
import { useColors } from "@/hooks/use-colors";
import { useOrbit } from "@/lib/orbit-store";
import { trpc } from "@/lib/trpc";

const quickActions = [
  { label: "Research", prompt: "Research this topic with primary sources and citations.", icon: "travel-explore" as const },
  { label: "Plan work", prompt: "Create a safe execution plan for this task.", icon: "account-tree" as const },
  { label: "Review file", prompt: "Review an attached document and identify the important points.", icon: "description" as const },
];

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { messages, tasks, hydrated, createTaskFromPrompt, resolveTaskResponse } = useOrbit();
  const [draft, setDraft] = useState("");
  const [agentMode, setAgentMode] = useState(true);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const assistantMutation = trpc.assistant.respond.useMutation();
  const transcriptionMutation = trpc.voice.transcribe.useMutation();
  const activeTask = useMemo(() => tasks.find((task) => !["COMPLETED", "FAILED", "CANCELLED"].includes(task.status)), [tasks]);

  const submit = async () => {
    const text = draft.trim();
    if (!text) return;
    const mode = text.toLowerCase().includes("research") ? "research" : "chat";
    const taskId = createTaskFromPrompt(text, mode, agentMode);
    setDraft("");
    const response = await assistantMutation.mutateAsync({ prompt: text, mode, agentMode });
    resolveTaskResponse(taskId, response.status, response.text);
  };

  const toggleRecording = async () => {
    try {
      if (recorderState.isRecording) {
        await recorder.stop();
        if (!recorder.uri) throw new Error("No audio recording was available.");
        const file = new File(recorder.uri);
        if (file.size > 620_000) {
          Alert.alert("Recording is too large", "Keep the recording short and try again. Orbit currently sends a bounded secure transcription payload.");
          return;
        }
        const mimeType = file.type?.startsWith("audio/") ? file.type : "audio/m4a";
        const result = await transcriptionMutation.mutateAsync({ audioDataUrl: `data:${mimeType};base64,${await file.base64()}` });
        if (result.status === "COMPLETED") setDraft(result.text);
        else Alert.alert("Transcription unavailable", result.reason);
        return;
      }
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Microphone permission needed", "Orbit needs microphone access only while you record a request.");
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (error) {
      Alert.alert("Voice input could not start", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const readAloud = async (text: string) => {
    if (await Speech.isSpeakingAsync()) {
      await Speech.stop();
      return;
    }
    Speech.speak(text, { rate: 0.98, language: "en-US" });
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <View style={styles.headerRow}>
                <View style={styles.brandRow}>
                  <OrbitMark />
                  <View>
                    <Text style={[styles.brand, { color: colors.text }]}>Orbit</Text>
                    <Text style={[styles.brandSub, { color: colors.muted }]}>Local-first AI workspace</Text>
                  </View>
                </View>
                <Pressable accessibilityLabel="Open settings" onPress={() => router.push("./settings")} style={({ pressed }) => [styles.headerAction, { backgroundColor: colors.surface }, pressed && styles.pressed]}>
                  <MaterialIcons name="tune" size={20} color={colors.text} />
                </Pressable>
              </View>

              <View style={[styles.agentStrip, { backgroundColor: `${colors.tint}0F`, borderColor: `${colors.tint}33` }]}>
                <View style={styles.agentCopy}>
                  <Text style={[styles.agentTitle, { color: colors.text }]}>Agent mode</Text>
                  <Text style={[styles.agentDescription, { color: colors.muted }]}>{agentMode ? "Plan work as a tracked task" : "Keep this as a single request"}</Text>
                </View>
                <Pressable accessibilityRole="switch" accessibilityState={{ checked: agentMode }} onPress={() => setAgentMode((value) => !value)} style={[styles.switchTrack, { backgroundColor: agentMode ? colors.tint : colors.border }]}>
                  <View style={[styles.switchKnob, { transform: [{ translateX: agentMode ? 18 : 3 }], backgroundColor: colors.background }]} />
                </Pressable>
              </View>

              {activeTask ? (
                <Pressable onPress={() => router.push("./tasks")} style={({ pressed }) => [styles.taskCard, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}>
                  <View style={styles.taskCardTop}>
                    <View style={[styles.taskIcon, { backgroundColor: `${colors.tint}14` }]}><MaterialIcons name="bolt" size={19} color={colors.tint} /></View>
                    <View style={styles.taskCardCopy}>
                      <Text numberOfLines={1} style={[styles.taskTitle, { color: colors.text }]}>{activeTask.title}</Text>
                      <Text style={[styles.taskMeta, { color: colors.muted }]}>Task ID: {activeTask.id.slice(-8)}</Text>
                    </View>
                    <StatusPill status={activeTask.status} />
                  </View>
                  <Text style={[styles.taskHint, { color: colors.muted }]}>Tap to review plan, status, and available actions.</Text>
                </Pressable>
              ) : null}

              <View style={styles.quickSection}>
                <SectionLabel>Start with a task</SectionLabel>
                <View style={styles.quickActions}>
                  {quickActions.map((action) => (
                    <Pressable key={action.label} onPress={() => setDraft(action.prompt)} style={({ pressed }) => [styles.quickAction, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}>
                      <MaterialIcons name={action.icon} size={18} color={colors.tint} />
                      <Text style={[styles.quickText, { color: colors.text }]}>{action.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <SectionLabel>Conversation</SectionLabel>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.messageRow, item.role === "user" ? styles.userRow : styles.assistantRow]}>
              {item.role === "assistant" ? <OrbitMark size={28} /> : null}
              <View style={[styles.bubble, { backgroundColor: item.role === "user" ? colors.tint : colors.surface, borderColor: item.role === "user" ? colors.tint : colors.border }]}>
                <Text style={[styles.messageText, { color: item.role === "user" ? colors.background : colors.text }]}>{item.text}</Text>
                <View style={styles.messageFoot}>{item.taskId ? <Text style={[styles.messageTaskRef, { color: item.role === "user" ? `${colors.background}B8` : colors.muted }]}>Tracked task • {item.taskId.slice(-8)}</Text> : null}{item.role === "assistant" ? <Pressable accessibilityLabel="Read response aloud" onPress={() => { void readAloud(item.text); }} style={styles.speechButton}><MaterialIcons name="volume-up" size={15} color={colors.muted} /></Pressable> : null}</View>
              </View>
            </View>
          )}
          ListEmptyComponent={!hydrated ? <Text style={[styles.loadingText, { color: colors.muted }]}>Opening your workspace…</Text> : null}
        />

        <View style={[styles.composerShell, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <View style={[styles.composer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              accessibilityLabel="Message Orbit"
              multiline
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={() => { void submit(); }}
              placeholder="Ask Orbit to help…"
              placeholderTextColor={colors.muted}
              returnKeyType="send"
              style={[styles.input, { color: colors.text }]}
            />
            <View style={styles.composerActions}>
              <Pressable accessibilityLabel="Open workspace to attach a file" onPress={() => router.push("./workspace")} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
                <MaterialIcons name="attach-file" size={20} color={colors.muted} />
              </Pressable>
              <Pressable accessibilityLabel={recorderState.isRecording ? "Stop recording" : "Record a voice request"} onPress={() => { void toggleRecording(); }} style={({ pressed }) => [styles.iconButton, recorderState.isRecording && { backgroundColor: `${colors.error}18` }, pressed && styles.pressed]}>
                <MaterialIcons name={recorderState.isRecording ? "stop-circle" : "mic-none"} size={20} color={recorderState.isRecording ? colors.error : colors.muted} />
              </Pressable>
              <Pressable accessibilityLabel="Send message" onPress={() => { void submit(); }} disabled={!draft.trim() || assistantMutation.isPending} style={({ pressed }) => [styles.sendButton, { backgroundColor: draft.trim() ? colors.tint : colors.border }, pressed && draft.trim() && styles.pressed]}>
                <MaterialIcons name="arrow-upward" size={20} color={colors.background} />
              </Pressable>
            </View>
          </View>
          <Text style={[styles.availabilityText, { color: colors.muted }]}>{recorderState.isRecording ? "Recording locally. Tap the microphone again to transcribe." : "AI responses and research results appear only after a secure server result is returned."}</Text>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20, gap: 14 },
  headerBlock: { gap: 16, paddingBottom: 4 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brand: { fontSize: 23, lineHeight: 26, fontWeight: "900", letterSpacing: -0.4 },
  brandSub: { fontSize: 12, marginTop: 2 },
  headerAction: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 14 },
  agentStrip: { borderWidth: 1, borderRadius: 18, padding: 13, flexDirection: "row", alignItems: "center", gap: 12 },
  agentCopy: { flex: 1 },
  agentTitle: { fontSize: 14, fontWeight: "800" },
  agentDescription: { fontSize: 12, marginTop: 3, lineHeight: 16 },
  switchTrack: { width: 43, height: 27, borderRadius: 99, justifyContent: "center" },
  switchKnob: { width: 21, height: 21, borderRadius: 20 },
  taskCard: { borderWidth: 1, borderRadius: 19, padding: 14, gap: 11 },
  taskCardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  taskIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  taskCardCopy: { flex: 1, gap: 3 },
  taskTitle: { fontSize: 14, fontWeight: "800" },
  taskMeta: { fontSize: 11 },
  taskHint: { fontSize: 12, lineHeight: 17 },
  quickSection: { gap: 8 },
  quickActions: { flexDirection: "row", gap: 8 },
  quickAction: { flex: 1, minHeight: 80, borderWidth: 1, borderRadius: 16, padding: 10, justifyContent: "space-between" },
  quickText: { fontSize: 12, fontWeight: "800", lineHeight: 16 },
  messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  assistantRow: { paddingRight: 26 },
  userRow: { paddingLeft: 26, justifyContent: "flex-end" },
  bubble: { maxWidth: "86%", borderWidth: 1, paddingHorizontal: 13, paddingVertical: 11, borderRadius: 18, gap: 6 },
  messageText: { fontSize: 14, lineHeight: 20 },
  messageFoot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  messageTaskRef: { flex: 1, fontSize: 11, fontWeight: "700" },
  speechButton: { width: 22, height: 22, alignItems: "center", justifyContent: "center", borderRadius: 8 },
  loadingText: { fontSize: 13, textAlign: "center", paddingVertical: 22 },
  composerShell: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, borderTopWidth: StyleSheet.hairlineWidth },
  composer: { borderWidth: 1, borderRadius: 20, padding: 6, gap: 5 },
  input: { minHeight: 42, maxHeight: 100, paddingHorizontal: 8, paddingTop: 7, fontSize: 15, lineHeight: 20 },
  composerActions: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4 },
  iconButton: { width: 38, height: 35, alignItems: "center", justifyContent: "center", borderRadius: 11 },
  sendButton: { width: 35, height: 35, alignItems: "center", justifyContent: "center", borderRadius: 11 },
  availabilityText: { fontSize: 10.5, lineHeight: 15, textAlign: "center", marginTop: 7 },
  pressed: { opacity: 0.7 },
});
