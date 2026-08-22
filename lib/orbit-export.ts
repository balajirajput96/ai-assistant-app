import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import { buildOrbitExportHtml, buildOrbitMarkdown, type OrbitExportPayload } from "@/lib/orbit-export-content";

export type { OrbitExportPayload } from "@/lib/orbit-export-content";
export { buildOrbitExportHtml, buildOrbitMarkdown, configureOrbitRedaction, describeOrbitFilters, filterOrbitExportPayload, redactOrbitExportPayload } from "@/lib/orbit-export-content";

export type OrbitExportFormat = "markdown" | "pdf";

const safeFilenameTimestamp = (value: string) => value.replace(/[:.]/g, "-").replace(/[^0-9T-]/g, "");

export async function shareOrbitWorkspace(format: OrbitExportFormat, payload: OrbitExportPayload) {
  if (Platform.OS === "web") throw new Error("Local file export and sharing require an Android or iOS build. The web preview does not have a supported local file handoff.");
  if (!(await Sharing.isAvailableAsync())) throw new Error("The system share sheet is unavailable on this device.");
  const createdAt = payload.createdAt ?? new Date().toISOString();
  const suffix = safeFilenameTimestamp(createdAt);
  if (format === "markdown") {
    const file = new File(Paths.cache, `orbit-workspace-${suffix}.md`);
    file.create({ intermediates: true, overwrite: true });
    file.write(buildOrbitMarkdown({ ...payload, createdAt }));
    await Sharing.shareAsync(file.uri, { dialogTitle: "Share Orbit workspace", mimeType: "text/markdown", UTI: "net.daringfireball.markdown" });
    return file.uri;
  }
  const pdf = await Print.printToFileAsync({ html: buildOrbitExportHtml({ ...payload, createdAt }), margins: { top: 28, bottom: 28, left: 28, right: 28 } });
  await Sharing.shareAsync(pdf.uri, { dialogTitle: "Share Orbit workspace PDF", mimeType: "application/pdf", UTI: ".pdf" });
  return pdf.uri;
}
