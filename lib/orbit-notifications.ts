import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function scheduleOrbitTestNotification() {
  if (Platform.OS === "web") {
    return { ok: false, reason: "Notifications are available on Android and iOS builds, not this web preview." } as const;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("orbit-tasks", {
      name: "Orbit task updates",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 150],
      lightColor: "#2563EB",
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  const finalStatus = existing.status === "granted"
    ? existing.status
    : (await Notifications.requestPermissionsAsync()).status;
  if (finalStatus !== "granted") {
    return { ok: false, reason: "Notification permission was not granted." } as const;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Orbit reminder",
      body: "Local notifications are enabled for task updates.",
      data: { orbit: "test" },
    },
    trigger: Platform.OS === "android" ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3, channelId: "orbit-tasks" } : { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3 },
  });
  return { ok: true } as const;
}
