import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

import { EmptyState } from "@/components/assistant-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useAssistantStore, type ChatMessage } from "@/lib/assistant-store";

export default function HistoryScreen() {
  const router = useRouter();
  const { messages, clearMessages } = useAssistantStore();
  const sections = [...messages].reverse();
  return (
    <ScreenContainer className="flex-1" containerClassName="bg-background">
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back" activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={21} color="#14213D" />
        </TouchableOpacity>
        <View style={styles.headerText}><Text style={styles.title}>History</Text><Text style={styles.copy}>Stored on this device</Text></View>
        {messages.length ? <TouchableOpacity onPress={clearMessages} activeOpacity={0.7}><Text style={styles.clear}>Clear</Text></TouchableOpacity> : <View style={styles.clearPlaceholder} />}
      </View>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HistoryRow item={item} />}
        contentContainerStyle={sections.length ? styles.list : styles.emptyList}
        ListEmptyComponent={<EmptyState icon="history" title="Your history is clear" detail="Messages are stored locally so you can review or delete them whenever you choose." />}
      />
    </ScreenContainer>
  );
}

function HistoryRow({ item }: { item: ChatMessage }) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, item.role === "assistant" ? styles.assistantDot : styles.userDot]}><MaterialIcons name={item.role === "assistant" ? "auto-awesome" : "person"} size={15} color="#FFFFFF" /></View>
      <View style={styles.rowText}><Text style={styles.role}>{item.role === "assistant" ? "Atlas" : "You"}</Text><Text numberOfLines={2} style={styles.preview}>{item.content}</Text></View>
    </View>
  );
}

const styles = {
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 15, paddingBottom: 14 },
  backButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: 16, borderWidth: 1, height: 40, justifyContent: "center", width: 40 },
  headerText: { flex: 1, marginLeft: 12 },
  title: { color: "#14213D", fontSize: 22, fontWeight: "900" },
  copy: { color: "#64748B", fontSize: 12, marginTop: 1 },
  clear: { color: "#C14141", fontSize: 14, fontWeight: "800", padding: 8 },
  clearPlaceholder: { width: 48 },
  list: { paddingHorizontal: 16, paddingBottom: 18 },
  emptyList: { flexGrow: 1, justifyContent: "center" },
  row: { alignItems: "flex-start", borderBottomColor: "#E8EDF5", borderBottomWidth: 1, flexDirection: "row", gap: 11, paddingVertical: 14 },
  dot: { alignItems: "center", borderRadius: 15, height: 30, justifyContent: "center", width: 30 },
  assistantDot: { backgroundColor: "#0E9F9A" },
  userDot: { backgroundColor: "#14213D" },
  rowText: { flex: 1 },
  role: { color: "#14213D", fontSize: 13, fontWeight: "800" },
  preview: { color: "#64748B", fontSize: 13, lineHeight: 18, marginTop: 3 },
} as const;
