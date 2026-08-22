import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { OrbitButton, SectionLabel, StatusPill } from "@/components/orbit-ui";
import { useColors } from "@/hooks/use-colors";
import { useOrbit } from "@/lib/orbit-store";
import { isTerminalStatus, type OrbitTask } from "@/lib/orbit-domain";

export default function TasksScreen() {
  const colors = useColors();
  const { tasks, retryTask, updateTaskStatus } = useOrbit();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => tasks.find((task) => task.id === selectedId), [selectedId, tasks]);

  return (
    <ScreenContainer className="px-4">
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<View style={styles.header}><Text style={[styles.title, { color: colors.text }]}>Tasks</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Every request remains visible until it is completed, cancelled, or needs your review.</Text><SectionLabel>Activity</SectionLabel></View>}
        ListEmptyComponent={<View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}><MaterialIcons name="hourglass-empty" size={26} color={colors.tint} /><Text style={[styles.emptyTitle, { color: colors.text }]}>No tasks yet</Text><Text style={[styles.emptyCopy, { color: colors.muted }]}>Send a message from Orbit and it will become a tracked task here.</Text></View>}
        renderItem={({ item }) => <TaskRow task={item} onPress={() => setSelectedId(item.id)} />}
      />

      <Modal animationType="slide" visible={Boolean(selected)} onRequestClose={() => setSelectedId(null)} presentationStyle="pageSheet">
        {selected ? <TaskDetail task={selected} onClose={() => setSelectedId(null)} onRetry={() => retryTask(selected.id)} onCancel={() => updateTaskStatus(selected.id, "CANCELLED")} onComplete={() => updateTaskStatus(selected.id, "COMPLETED", "Marked complete locally. Secure AI execution results will appear here when connected.")} /> : null}
      </Modal>
    </ScreenContainer>
  );
}

function TaskRow({ task, onPress }: { task: OrbitTask; onPress: () => void }) {
  const colors = useColors();
  const icon = task.kind === "research" ? "travel-explore" : task.kind === "automation" ? "bolt" : task.kind === "document" ? "description" : "auto-awesome";
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.taskRow, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}>
    <View style={[styles.taskGlyph, { backgroundColor: `${colors.tint}14` }]}><MaterialIcons name={icon} size={20} color={colors.tint} /></View>
    <View style={styles.rowCopy}><Text numberOfLines={2} style={[styles.rowTitle, { color: colors.text }]}>{task.title}</Text><Text style={[styles.rowMeta, { color: colors.muted }]}>{task.kind} • {new Date(task.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text></View>
    <View style={styles.rowStatus}><StatusPill status={task.status} /><MaterialIcons name="chevron-right" size={19} color={colors.muted} /></View>
  </Pressable>;
}

function TaskDetail({ task, onClose, onRetry, onCancel, onComplete }: { task: OrbitTask; onClose: () => void; onRetry: () => void; onCancel: () => void; onComplete: () => void }) {
  const colors = useColors();
  const terminal = isTerminalStatus(task.status);
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5">
    <View style={styles.detailHeader}><View><Text style={[styles.detailEyebrow, { color: colors.muted }]}>TRACKED TASK</Text><Text numberOfLines={2} style={[styles.detailTitle, { color: colors.text }]}>{task.title}</Text></View><Pressable accessibilityLabel="Close task detail" onPress={onClose} style={[styles.close, { backgroundColor: colors.surface }]}><MaterialIcons name="close" size={20} color={colors.text} /></Pressable></View>
    <View style={[styles.detailStatus, { borderColor: colors.border, backgroundColor: colors.surface }]}><StatusPill status={task.status} /><Text style={[styles.detailMeta, { color: colors.muted }]}>Risk: {task.risk} • Retries: {task.retryCount}</Text></View>
    <View style={styles.planBlock}><SectionLabel>Plan</SectionLabel>{task.steps.map((step, index) => <View key={step.label} style={styles.stepRow}><View style={[styles.stepIndicator, { borderColor: step.completed ? colors.success : colors.border, backgroundColor: step.completed ? colors.success : colors.background }]}>{step.completed ? <MaterialIcons name="check" size={13} color={colors.background} /> : <Text style={[styles.stepNumber, { color: colors.muted }]}>{index + 1}</Text>}</View><Text style={[styles.stepText, { color: colors.text }]}>{step.label}</Text></View>)}</View>
    <View style={[styles.transparency, { backgroundColor: `${colors.warning}12`, borderColor: `${colors.warning}42` }]}><MaterialIcons name="info-outline" size={19} color={colors.warning} /><Text style={[styles.transparencyText, { color: colors.text }]}>This local tracker does not invent tool calls or AI output. Secure AI execution will update this task only after a real result is returned.</Text></View>
    {task.output ? <View style={[styles.output, { backgroundColor: colors.surface, borderColor: colors.border }]}><SectionLabel>Latest output</SectionLabel><Text style={[styles.outputText, { color: colors.text }]}>{task.output}</Text></View> : null}
    <View style={styles.detailActions}>{!terminal ? <OrbitButton secondary label="Cancel" icon="close" onPress={onCancel} /> : null}{task.status !== "COMPLETED" ? <OrbitButton secondary label="Retry" icon="refresh" onPress={onRetry} /> : null}{!terminal ? <OrbitButton label="Mark complete" icon="check" onPress={onComplete} /> : null}</View>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  list: { paddingTop: 12, paddingBottom: 26, gap: 10 },
  header: { gap: 8, marginBottom: 7 },
  title: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  subtitle: { fontSize: 13, lineHeight: 19, marginBottom: 13 },
  empty: { alignItems: "center", gap: 8, padding: 26, borderWidth: 1, borderRadius: 20 },
  emptyTitle: { fontSize: 16, fontWeight: "800" },
  emptyCopy: { textAlign: "center", fontSize: 13, lineHeight: 19 },
  taskRow: { minHeight: 78, borderWidth: 1, borderRadius: 18, padding: 12, flexDirection: "row", alignItems: "center", gap: 11 },
  taskGlyph: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 13 },
  rowCopy: { flex: 1, gap: 4 },
  rowTitle: { fontSize: 14, fontWeight: "800", lineHeight: 19 },
  rowMeta: { fontSize: 11 },
  rowStatus: { alignItems: "flex-end", gap: 5 },
  pressed: { opacity: 0.72 },
  detailHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginTop: 5 },
  detailEyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginBottom: 6 },
  detailTitle: { fontSize: 24, lineHeight: 30, fontWeight: "900", maxWidth: 285 },
  close: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 14 },
  detailStatus: { marginTop: 20, borderWidth: 1, borderRadius: 17, padding: 13, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  detailMeta: { flex: 1, fontSize: 11, textAlign: "right" },
  planBlock: { gap: 12, marginTop: 24 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  stepIndicator: { width: 25, height: 25, borderWidth: 1, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  stepNumber: { fontSize: 11, fontWeight: "800" },
  stepText: { flex: 1, fontSize: 14, lineHeight: 20 },
  transparency: { marginTop: 22, borderWidth: 1, padding: 13, borderRadius: 16, flexDirection: "row", gap: 9 },
  transparencyText: { flex: 1, fontSize: 12, lineHeight: 18 },
  output: { marginTop: 16, borderWidth: 1, borderRadius: 16, padding: 13 },
  outputText: { fontSize: 13, lineHeight: 19 },
  detailActions: { marginTop: "auto", flexDirection: "row", gap: 8, paddingTop: 18 },
});
