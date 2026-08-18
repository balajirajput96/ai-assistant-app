import { FlatList, Text, View } from "react-native";

import { EmptyState, TaskCard } from "@/components/assistant-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useAssistantStore } from "@/lib/assistant-store";

export default function TasksScreen() {
  const { messages } = useAssistantStore();
  const tasks = messages.filter((message) => message.task).map((message) => message.task!).reverse();
  return (
    <ScreenContainer className="flex-1" containerClassName="bg-background">
      <View style={styles.header}>
        <Text style={styles.eyebrow}>OBSERVABLE WORK</Text>
        <Text style={styles.title}>Tasks</Text>
        <Text style={styles.copy}>Every assistant response that involves planning or policy gets a traceable state.</Text>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(task) => task.id}
        renderItem={({ item }) => <TaskCard task={item} />}
        contentContainerStyle={tasks.length ? styles.list : styles.emptyList}
        ListEmptyComponent={<EmptyState icon="fact-check" title="No task activity yet" detail="Start a chat to see plans, safety checks, and completion states here." />}
      />
    </ScreenContainer>
  );
}

const styles = {
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  eyebrow: { color: "#0E9F9A", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: "#14213D", fontSize: 30, fontWeight: "900", letterSpacing: -0.8, marginTop: 2 },
  copy: { color: "#64748B", fontSize: 14, lineHeight: 20, marginTop: 6, maxWidth: 340 },
  list: { gap: 11, paddingHorizontal: 16, paddingBottom: 18 },
  emptyList: { flexGrow: 1, justifyContent: "center" },
} as const;
