import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import type { ChatMessage } from "@/lib/assistant-store";

export async function exportConversationHistory(messages: ChatMessage[]) {
  if (!messages.length) return { ok: false, reason: "There is no local history to export yet." } as const;
  if (Platform.OS === "web") return { ok: false, reason: "History export is available in the installed Android build." } as const;
  if (!(await Sharing.isAvailableAsync())) return { ok: false, reason: "The device share sheet is unavailable." } as const;
  if (!FileSystem.cacheDirectory) return { ok: false, reason: "A temporary export folder is unavailable." } as const;

  const body = [
    "# Atlas local conversation export",
    `Exported: ${new Date().toISOString()}`,
    "",
    ...messages.flatMap((message) => [
      `## ${message.role === "assistant" ? "Atlas" : "You"} — ${message.createdAt}`,
      message.content,
      "",
    ]),
  ].join("\n");
  const uri = `${FileSystem.cacheDirectory}atlas-history-${Date.now()}.md`;
  await FileSystem.writeAsStringAsync(uri, body, { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(uri, { dialogTitle: "Export Atlas local history", mimeType: "text/markdown", UTI: "public.plain-text" });
  return { ok: true } as const;
}
