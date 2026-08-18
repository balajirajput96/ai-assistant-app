import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Speech from "expo-speech";
import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import type { AssistantTask } from "@/shared/assistant";

export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "warning" | "danger" }) {
  return <Text style={[styles.pill, pillTones[tone]]}>{label}</Text>;
}

export function EmptyState({ icon, title, detail }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; detail: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}><MaterialIcons name={icon} size={25} color="#0E9F9A" /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDetail}>{detail}</Text>
    </View>
  );
}

export function TaskCard({ task, onApprove }: { task: AssistantTask; onApprove?: () => void }) {
  const isWaiting = task.state === "WAITING_FOR_APPROVAL";
  const tone = task.state === "SUCCEEDED" ? "success" : task.state === "FAILED" ? "danger" : isWaiting ? "warning" : "neutral";
  return (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{isWaiting ? "Approval needed" : "Task activity"}</Text>
        <StatusPill label={task.state.replaceAll("_", " ")} tone={tone} />
      </View>
      <Text style={styles.taskMeta}>Risk: {task.risk.replaceAll("_", " ")}</Text>
      <View style={styles.planList}>
        {task.plan.map((step, index) => <Text key={`${task.id}-${step}`} style={styles.planStep}>{index + 1}. {step}</Text>)}
      </View>
      {task.approval ? (
        <View style={styles.approvalBox}>
          <Text style={styles.approvalTitle}>{task.approval.title}</Text>
          <Text style={styles.approvalDetail}>{task.approval.summary}</Text>
          {onApprove ? (
            <TouchableOpacity style={styles.approvalButton} onPress={onApprove} activeOpacity={0.8}>
              <Text style={styles.approvalButtonText}>Keep as draft</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export function LoadingBubble() {
  return (
    <View style={styles.loadingBubble}>
      <ActivityIndicator color="#0E9F9A" size="small" />
      <Text style={styles.loadingText}>Atlas is thinking</Text>
    </View>
  );
}

export function SpeakButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);
  const toggleSpeech = async () => {
    const active = await Speech.isSpeakingAsync();
    if (active) {
      await Speech.stop();
      setSpeaking(false);
      return;
    }
    Speech.speak(text.slice(0, 2500), {
      rate: 0.94,
      onStart: () => setSpeaking(true),
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };
  return (
    <TouchableOpacity style={[styles.speakButton, speaking && styles.speakButtonActive]} onPress={toggleSpeech} accessibilityLabel={speaking ? "Stop spoken reply" : "Listen to reply"} activeOpacity={0.75}>
      <MaterialIcons name={speaking ? "stop" : "volume-up"} size={15} color={speaking ? "#FFFFFF" : "#0E9F9A"} />
      <Text style={[styles.speakText, speaking && styles.speakTextActive]}>{speaking ? "Stop" : "Listen"}</Text>
    </TouchableOpacity>
  );
}

const pillTones = {
  neutral: { color: "#46546B", backgroundColor: "#E8EDF5" },
  success: { color: "#087B68", backgroundColor: "#DDF6F1" },
  warning: { color: "#875B00", backgroundColor: "#FFF1C7" },
  danger: { color: "#A23535", backgroundColor: "#FDE1E1" },
} as const;

const styles = {
  pill: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, fontSize: 10, fontWeight: "800", letterSpacing: 0.4, overflow: "hidden" },
  empty: { alignItems: "center", paddingHorizontal: 30, paddingVertical: 46 },
  emptyIcon: { width: 52, height: 52, borderRadius: 26, justifyContent: "center", alignItems: "center", backgroundColor: "#DDF6F1", marginBottom: 14 },
  emptyTitle: { color: "#14213D", fontSize: 17, fontWeight: "800", textAlign: "center" },
  emptyDetail: { color: "#64748B", fontSize: 14, lineHeight: 20, marginTop: 7, textAlign: "center" },
  taskCard: { borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 18, backgroundColor: "#FFFFFF", padding: 15, gap: 9 },
  taskHeader: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between", gap: 12 },
  taskTitle: { color: "#14213D", flex: 1, fontSize: 15, fontWeight: "800" },
  taskMeta: { color: "#64748B", fontSize: 12, fontWeight: "700" },
  planList: { gap: 4 },
  planStep: { color: "#46546B", fontSize: 13, lineHeight: 18 },
  approvalBox: { backgroundColor: "#FFF9E9", borderColor: "#FDE7A7", borderRadius: 12, borderWidth: 1, gap: 7, marginTop: 3, padding: 12 },
  approvalTitle: { color: "#7A5500", fontSize: 13, fontWeight: "800" },
  approvalDetail: { color: "#725B26", fontSize: 12, lineHeight: 17 },
  approvalButton: { alignSelf: "flex-start", backgroundColor: "#FFB703", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, marginTop: 3 },
  approvalButtonText: { color: "#493500", fontSize: 12, fontWeight: "800" },
  loadingBubble: { alignSelf: "flex-start", alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 9, paddingHorizontal: 13, paddingVertical: 11 },
  loadingText: { color: "#46546B", fontSize: 13, fontWeight: "700" },
  speakButton: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#EFFCF9", borderColor: "#C9EFE9", borderRadius: 9, borderWidth: 1, flexDirection: "row", gap: 4, marginTop: 8, paddingHorizontal: 8, paddingVertical: 5 },
  speakButtonActive: { backgroundColor: "#0E9F9A", borderColor: "#0E9F9A" },
  speakText: { color: "#087B68", fontSize: 10, fontWeight: "800" },
  speakTextActive: { color: "#FFFFFF" },
} as const;
