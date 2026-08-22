import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { OrbitButton, SectionLabel, StatusPill } from "@/components/orbit-ui";
import { useColors } from "@/hooks/use-colors";
import { useOrbit } from "@/lib/orbit-store";

export default function AutomationsScreen() {
  const colors = useColors();
  const { automations, createAutomation, runAutomation } = useOrbit();
  return <ScreenContainer className="px-4">
    <FlatList
      data={automations}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={<View style={styles.header}><Text style={[styles.title, { color: colors.text }]}>Automations</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Build repeatable workflows now. Background schedules are explicitly gated until durable hosting is configured.</Text><View style={[styles.notice, { backgroundColor: `${colors.warning}12`, borderColor: `${colors.warning}3A` }]}><MaterialIcons name="schedule" size={18} color={colors.warning} /><Text style={[styles.noticeText, { color: colors.text }]}>Automatic schedules are not configured. Manual runs create tracked tasks without claiming background execution.</Text></View><SectionLabel>Workflow templates</SectionLabel></View>}
      renderItem={({ item }) => <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.cardHeader}><View style={[styles.cardIcon, { backgroundColor: `${colors.tint}14` }]}><MaterialIcons name="account-tree" size={20} color={colors.tint} /></View><View style={styles.cardCopy}><Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text><Text style={[styles.cardMeta, { color: colors.muted }]}>{item.executionCount} manual run{item.executionCount === 1 ? "" : "s"}</Text></View><StatusPill status={item.scheduleStatus} /></View><Text style={[styles.cardDescription, { color: colors.muted }]}>{item.summary}</Text><View style={styles.cardActions}><OrbitButton secondary label="Schedule info" icon="schedule" onPress={() => Alert.alert("Scheduling requires a backend", "A durable scheduler must be configured before Orbit can run this workflow without the app open. The current project avoids presenting a simulated schedule.")} /><OrbitButton label="Run now" icon="play-arrow" onPress={() => runAutomation(item.id)} /></View></View>}
      ListFooterComponent={<OrbitButton label="Create manual workflow" icon="add" onPress={createAutomation} secondary />}
    />
  </ScreenContainer>;
}

const styles = StyleSheet.create({ list: { paddingTop: 12, paddingBottom: 24, gap: 11 }, header: { gap: 8, marginBottom: 7 }, title: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 }, subtitle: { fontSize: 13, lineHeight: 19 }, notice: { flexDirection: "row", gap: 9, padding: 12, borderWidth: 1, borderRadius: 16, marginVertical: 7 }, noticeText: { flex: 1, fontSize: 12, lineHeight: 18 }, card: { borderWidth: 1, borderRadius: 20, padding: 14, gap: 12 }, cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 }, cardIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 13 }, cardCopy: { flex: 1, gap: 3 }, cardTitle: { fontSize: 14, fontWeight: "800" }, cardMeta: { fontSize: 11 }, cardDescription: { fontSize: 13, lineHeight: 19 }, cardActions: { flexDirection: "row", gap: 8 }, });
