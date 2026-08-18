import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Alert, FlatList, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

import { StatusPill } from "@/components/assistant-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useAssistantStore, type AutomationTemplate } from "@/lib/assistant-store";

export default function AutomationsScreen() {
  const { automations, toggleAutomation, runAutomation } = useAssistantStore();
  const runTemplate = (item: AutomationTemplate) => {
    runAutomation(item.id);
    Alert.alert("Draft run recorded", `${item.name} is a local template. It did not contact another service or run in the background.`);
  };
  return (
    <ScreenContainer className="flex-1" containerClassName="bg-background">
      <View style={styles.header}>
        <Text style={styles.eyebrow}>ASSISTED BY DEFAULT</Text>
        <Text style={styles.title}>Automations</Text>
        <Text style={styles.copy}>Use low-risk templates to organize work. High-impact actions remain off until you connect and approve a specific service.</Text>
      </View>
      <FlatList
        data={automations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.iconWrap}><MaterialIcons name="bolt" size={20} color="#0E9F9A" /></View>
              <View style={styles.cardTitleWrap}><Text style={styles.name}>{item.name}</Text><StatusPill label={item.risk} tone={item.risk === "LOW" ? "success" : "warning"} /></View>
              <Switch value={item.enabled} onValueChange={() => toggleAutomation(item.id)} trackColor={{ false: "#CBD5E1", true: "#9AE2DB" }} thumbColor={item.enabled ? "#0E9F9A" : "#FFFFFF"} />
            </View>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.footer}>
              <Text style={styles.lastRun}>{item.lastRun ? `Reviewed ${new Date(item.lastRun).toLocaleDateString()}` : "Not run yet"}</Text>
              <TouchableOpacity style={styles.runButton} onPress={() => runTemplate(item)} activeOpacity={0.75}><Text style={styles.runText}>Run draft</Text><MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" /></TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={<View style={styles.note}><MaterialIcons name="shield" size={17} color="#087B68" /><Text style={styles.noteText}>No automation runs in the background or writes to a connected account in this build.</Text></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  eyebrow: { color: "#0E9F9A", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: "#14213D", fontSize: 30, fontWeight: "900", letterSpacing: -0.8, marginTop: 2 },
  copy: { color: "#64748B", fontSize: 14, lineHeight: 20, marginTop: 6 },
  list: { gap: 11, paddingHorizontal: 16, paddingBottom: 18 },
  card: { backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: 18, borderWidth: 1, gap: 12, padding: 15 },
  cardTop: { alignItems: "center", flexDirection: "row", gap: 10 },
  iconWrap: { alignItems: "center", backgroundColor: "#DDF6F1", borderRadius: 13, height: 38, justifyContent: "center", width: 38 },
  cardTitleWrap: { flex: 1, gap: 4 },
  name: { color: "#14213D", fontSize: 15, fontWeight: "800" },
  description: { color: "#64748B", fontSize: 13, lineHeight: 19 },
  footer: { alignItems: "center", borderTopColor: "#EEF2F7", borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingTop: 11 },
  lastRun: { color: "#94A3B8", fontSize: 11, fontWeight: "600" },
  runButton: { alignItems: "center", backgroundColor: "#14213D", borderRadius: 10, flexDirection: "row", gap: 5, paddingHorizontal: 11, paddingVertical: 9 },
  runText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  note: { alignItems: "flex-start", backgroundColor: "#EFFFFB", borderColor: "#C9EFE9", borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 8, padding: 13 },
  noteText: { color: "#35716B", flex: 1, fontSize: 12, lineHeight: 17 },
});
