import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import { useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { FeatureCard, OrbitButton, SectionLabel, StatusPill } from "@/components/orbit-ui";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

export default function WorkspaceScreen() {
  const colors = useColors();
  const [selectedFile, setSelectedFile] = useState<{ name: string; size?: number; mimeType?: string; state: string; result?: string } | null>(null);
  const documentMutation = trpc.document.analyzeText.useMutation();
  const selectDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ["text/*", "application/json", "application/pdf"], copyToCacheDirectory: true });
      if (result.canceled) return;
      const asset = result.assets[0];
      const textCompatible = asset.mimeType?.startsWith("text/") || asset.mimeType === "application/json" || /\.(md|txt|csv|json)$/i.test(asset.name);
      if (!textCompatible) {
        setSelectedFile({ name: asset.name, size: asset.size, mimeType: asset.mimeType, state: "Selected — binary/PDF parsing requires a staged server upload" });
        return;
      }
      if ((asset.size ?? 0) > 100_000) {
        setSelectedFile({ name: asset.name, size: asset.size, mimeType: asset.mimeType, state: "Selected — text file exceeds the current 100 KB analysis limit" });
        return;
      }
      setSelectedFile({ name: asset.name, size: asset.size, mimeType: asset.mimeType, state: "Reading document text securely…" });
      const text = await new File(asset.uri).text();
      const response = await documentMutation.mutateAsync({ filename: asset.name, mimeType: asset.mimeType ?? "text/plain", text });
      setSelectedFile({ name: asset.name, size: asset.size, mimeType: asset.mimeType, state: response.status === "COMPLETED" ? "Analyzed by secure AI" : "Analysis blocked", result: response.text });
    } catch (error) {
      setSelectedFile({ name: "Document", state: "File selection or analysis failed", result: error instanceof Error ? error.message : "Unknown document error" });
    }
  };
  return <ScreenContainer className="px-4">
    <FlatList
      data={["document", "image", "privacy", "selected"]}
      keyExtractor={(item) => item}
      contentContainerStyle={styles.list}
      ListHeaderComponent={<View style={styles.header}><Text style={[styles.title, { color: colors.text }]}>Workspace</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Files and media are held here when a supported intake and processing path is available.</Text><SectionLabel>Capability status</SectionLabel></View>}
      renderItem={({ item }) => item === "document" ? <FeatureCard icon="description" title="Text document analysis" description="Select a small plain-text, Markdown, CSV, or JSON file. Orbit reads the selected local text and sends it to the secure AI service for analysis." action={<StatusPill status="Available" />}><OrbitButton label={documentMutation.isPending ? "Analyzing…" : "Select text document"} icon="upload-file" onPress={() => { void selectDocument(); }} disabled={documentMutation.isPending} /></FeatureCard> : item === "image" ? <FeatureCard icon="image" title="Image understanding" description="Image selection and secure upload are not configured yet; Orbit does not claim to understand images before that path exists." action={<StatusPill status="Unavailable" />} /> : item === "privacy" ? <FeatureCard icon="policy" title="Attachment privacy" description="Orbit shows the file state before analysis. Unsupported binary documents remain local and are never silently uploaded." /> : selectedFile ? <FeatureCard icon="article" title={selectedFile.name} description={selectedFile.state}><Text style={[styles.detail, { color: colors.muted }]}>{selectedFile.mimeType ?? "Unknown type"}{selectedFile.size ? ` • ${Math.ceil(selectedFile.size / 1024)} KB` : ""}</Text>{selectedFile.result ? <Text style={[styles.result, { color: colors.text }]}>{selectedFile.result}</Text> : null}</FeatureCard> : <View />}
      ListFooterComponent={<View style={styles.footer}><OrbitButton label="About supported files" icon="info-outline" secondary onPress={() => Alert.alert("Supported now", "Text, Markdown, CSV, and JSON can be analyzed up to 100 KB. PDF and binary document ingestion requires the planned staged server upload and is clearly shown as unavailable.")} /></View>}
    />
  </ScreenContainer>;
}

const styles = StyleSheet.create({ list: { paddingTop: 12, paddingBottom: 24, gap: 11 }, header: { gap: 8, marginBottom: 7 }, title: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 }, subtitle: { fontSize: 13, lineHeight: 19, marginBottom: 13 }, footer: { marginTop: 4 }, detail: { fontSize: 12 }, result: { fontSize: 13, lineHeight: 20 } });
