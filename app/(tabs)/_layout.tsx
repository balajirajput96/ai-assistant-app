import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { OrbitProvider } from "@/lib/orbit-store";
import { useColors } from "@/hooks/use-colors";

const tabs = [
  { name: "index", title: "Orbit", icon: "auto-awesome" },
  { name: "tasks", title: "Tasks", icon: "checklist" },
  { name: "workspace", title: "Workspace", icon: "folder-open" },
  { name: "automations", title: "Flows", icon: "account-tree" },
  { name: "settings", title: "Settings", icon: "tune" },
] as const;

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  const tabBarHeight = 58 + bottomPadding;
  return <OrbitProvider><Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.tint, tabBarInactiveTintColor: colors.muted, tabBarButton: HapticTab, tabBarStyle: { height: tabBarHeight, paddingTop: 7, paddingBottom: bottomPadding, backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth }, tabBarLabelStyle: { fontSize: 10, fontWeight: "700" } }}>{tabs.map((tab) => <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title, tabBarIcon: ({ color }) => <MaterialIcons name={tab.icon} color={color} size={23} /> }} />)}</Tabs></OrbitProvider>;
}
