import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAssistantStore } from "@/lib/assistant-store";
import { exportConversationHistory } from "@/lib/export-history";

const connectors = [
  { name: "GitHub", icon: "code", scope: "Not connected", detail: "Prepare code briefs and review planned changes after an explicit connection." },
  { name: "Google Workspace", icon: "folder", scope: "Not connected", detail: "Access only the files or scopes you authorize through an official sign-in flow." },
  { name: "Custom MCP", icon: "hub", scope: "Not connected", detail: "Review the provider, tool list, permissions and risk before connecting." },
] as const;

export default function SettingsScreen() {
  const { messages, clearMessages } = useAssistantStore();
  const clear = () => Alert.alert("Clear local history?", "This removes chat history stored on this device. It cannot undo a server-side external action because this build does not run them.", [{ text: "Cancel", style: "cancel" }, { text: "Clear history", style: "destructive", onPress: clearMessages }]);
  const exportHistory = async () => {
    try {
      const result = await exportConversationHistory(messages);
      if (!result.ok) Alert.alert("Export unavailable", result.reason);
    } catch {
      Alert.alert("Export unavailable", "Your local history could not be prepared for sharing. Please try again.");
    }
  };
  const connectionInfo = (name: string) => Alert.alert(`${name} connection`, "This mobile MVP deliberately does not use blanket access. Add an official OAuth or API connection later, inspect requested scopes, and approve only the service you need.");
  return (
    <ScreenContainer className="flex-1" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}><Text style={styles.eyebrow}>CONTROL CENTER</Text><Text style={styles.title}>Settings</Text><Text style={styles.copy}>Manage local data, connection permissions, and release-readiness.</Text></View>
        <Section title="Privacy & memory">
          <View style={styles.privacyCard}><View style={styles.privacyIcon}><MaterialIcons name="privacy-tip" size={21} color="#087B68" /></View><View style={styles.privacyText}><Text style={styles.privacyTitle}>Local-first history</Text><Text style={styles.privacyCopy}>{messages.length} messages are stored on this device for this workspace.</Text></View></View>
          <TouchableOpacity style={styles.exportButton} onPress={exportHistory} activeOpacity={0.75}><MaterialIcons name="ios-share" size={18} color="#087B68" /><Text style={styles.exportText}>Export local history</Text></TouchableOpacity>
          <TouchableOpacity style={styles.destructiveButton} onPress={clear} activeOpacity={0.75}><MaterialIcons name="delete-outline" size={18} color="#C14141" /><Text style={styles.destructiveText}>Clear local history</Text></TouchableOpacity>
        </Section>
        <Section title="Connectors">
          <Text style={styles.sectionCopy}>Only connect a service when you need a defined task. No universal access or hidden scope is used.</Text>
          {connectors.map((item) => <TouchableOpacity key={item.name} style={styles.connector} onPress={() => connectionInfo(item.name)} activeOpacity={0.75}><View style={styles.connectorIcon}><MaterialIcons name={item.icon} size={19} color="#0E9F9A" /></View><View style={styles.connectorText}><Text style={styles.connectorName}>{item.name}</Text><Text style={styles.connectorDetail}>{item.detail}</Text><Text style={styles.connectorScope}>{item.scope}</Text></View><MaterialIcons name="chevron-right" size={22} color="#94A3B8" /></TouchableOpacity>)}
        </Section>
        <Section title="Assistant safety">
          <View style={styles.safetyRow}><MaterialIcons name="verified-user" size={21} color="#0E9F9A" /><Text style={styles.safetyText}>External publishing, deletion, financial and credential-related actions are blocked until a specific tool and approval flow are configured.</Text></View>
          <View style={styles.safetyRow}><MaterialIcons name="mic-none" size={21} color="#0E9F9A" /><Text style={styles.safetyText}>Voice clips are recorded only when you tap the microphone and sent for transcription only after you stop recording.</Text></View>
        </Section>
      </ScrollView>
    </ScreenContainer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  content: { paddingBottom: 26 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  eyebrow: { color: "#0E9F9A", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: "#14213D", fontSize: 30, fontWeight: "900", letterSpacing: -0.8, marginTop: 2 },
  copy: { color: "#64748B", fontSize: 14, lineHeight: 20, marginTop: 6 },
  section: { gap: 10, paddingHorizontal: 16, paddingTop: 17 },
  sectionTitle: { color: "#14213D", fontSize: 15, fontWeight: "900", paddingHorizontal: 4 },
  sectionCopy: { color: "#64748B", fontSize: 12, lineHeight: 18, paddingHorizontal: 4 },
  privacyCard: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: 17, borderWidth: 1, flexDirection: "row", gap: 12, padding: 14 },
  privacyIcon: { alignItems: "center", backgroundColor: "#DDF6F1", borderRadius: 16, height: 40, justifyContent: "center", width: 40 },
  privacyText: { flex: 1 },
  privacyTitle: { color: "#14213D", fontSize: 14, fontWeight: "800" },
  privacyCopy: { color: "#64748B", fontSize: 12, lineHeight: 17, marginTop: 3 },
  destructiveButton: { alignItems: "center", backgroundColor: "#FFF5F5", borderColor: "#F8D7D7", borderRadius: 13, borderWidth: 1, flexDirection: "row", gap: 8, justifyContent: "center", padding: 13 },
  destructiveText: { color: "#C14141", fontSize: 13, fontWeight: "800" },
  exportButton: { alignItems: "center", backgroundColor: "#EFFCF9", borderColor: "#C9EFE9", borderRadius: 13, borderWidth: 1, flexDirection: "row", gap: 8, justifyContent: "center", padding: 13 },
  exportText: { color: "#087B68", fontSize: 13, fontWeight: "800" },
  connector: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 11, padding: 13 },
  connectorIcon: { alignItems: "center", backgroundColor: "#EFFCF9", borderRadius: 14, height: 38, justifyContent: "center", width: 38 },
  connectorText: { flex: 1 },
  connectorName: { color: "#14213D", fontSize: 14, fontWeight: "800" },
  connectorDetail: { color: "#64748B", fontSize: 11, lineHeight: 16, marginTop: 3 },
  connectorScope: { color: "#B06D00", fontSize: 11, fontWeight: "800", marginTop: 5 },
  safetyRow: { alignItems: "flex-start", backgroundColor: "#EFFCF9", borderColor: "#C9EFE9", borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 10, padding: 13 },
  safetyText: { color: "#35716B", flex: 1, fontSize: 12, lineHeight: 18 },
});
