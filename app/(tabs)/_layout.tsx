import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AssistantStoreProvider } from "@/lib/assistant-store";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

function TabNavigator() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.muted,
        tabBarButton: HapticTab,
        tabBarStyle: {
          height: 60 + bottomPadding,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Chat", tabBarIcon: ({ color }) => <IconSymbol size={24} name="message.fill" color={color} /> }} />
      <Tabs.Screen name="tasks" options={{ title: "Tasks", tabBarIcon: ({ color }) => <IconSymbol size={24} name="checklist" color={color} /> }} />
      <Tabs.Screen name="automations" options={{ title: "Automations", tabBarIcon: ({ color }) => <IconSymbol size={24} name="bolt.fill" color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color }) => <IconSymbol size={24} name="gearshape.fill" color={color} /> }} />
      <Tabs.Screen name="history" options={{ href: null }} />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <AssistantStoreProvider>
      <TabNavigator />
    </AssistantStoreProvider>
  );
}
