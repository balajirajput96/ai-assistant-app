import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useState } from "react";
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { WebView } from "react-native-webview";

import { ScreenContainer } from "@/components/screen-container";
import { FeatureCard, OrbitButton, SectionLabel, StatusPill } from "@/components/orbit-ui";
import { useColors } from "@/hooks/use-colors";
import type { TaskStatus } from "@/lib/orbit-domain";
import { buildOrbitExportHtml, buildOrbitMarkdown, configureOrbitRedaction, filterOrbitExportPayload, redactOrbitExportPayload, shareOrbitWorkspace, type OrbitExportFormat, type OrbitExportPayload } from "@/lib/orbit-export";
import { scheduleOrbitTestNotification } from "@/lib/orbit-notifications";
import { detectSensitiveMessages, normalizeSensitiveScanConfig, type SensitiveDataKind } from "@/lib/orbit-sensitive-data";
import { useOrbit } from "@/lib/orbit-store";

type PreviewState = { format: OrbitExportFormat; payload: OrbitExportPayload };

const taskStatuses: TaskStatus[] = ["QUEUED", "PLANNING", "RUNNING", "WAITING", "RETRYING", "BLOCKED", "COMPLETED", "FAILED", "CANCELLED"];
const scanKinds: { key: SensitiveDataKind; icon: "alternate-email" | "phone" | "key" | "label" }[] = [
  { key: "Email", icon: "alternate-email" },
  { key: "Phone number", icon: "phone" },
  { key: "API key", icon: "key" },
  { key: "Custom rule", icon: "label" },
];

export default function SettingsScreen() {
  const colors = useColors();
  const { messages, tasks, clearWorkspace, sensitiveScanConfig, setSensitiveScanConfig } = useOrbit();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>([]);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [customRuleDraft, setCustomRuleDraft] = useState("");
  const [androidGuideAcknowledged, setAndroidGuideAcknowledged] = useState(false);

  const previewMarkdown = useMemo(() => preview?.format === "markdown" ? buildOrbitMarkdown(preview.payload) : "", [preview]);
  const previewHtml = useMemo(() => preview?.format === "pdf" ? buildOrbitExportHtml(preview.payload) : "", [preview]);
  const redactedCount = preview?.payload.redactedMessageIds?.length ?? 0;
  const redactionTreatment = preview?.payload.redactionOptions?.treatment ?? "placeholder";
  const redactionPlaceholder = preview?.payload.redactionOptions?.placeholder ?? "[Redacted before export]";
  const sensitiveSuggestions = useMemo(() => preview ? detectSensitiveMessages(preview.payload.messages, sensitiveScanConfig) : [], [preview, sensitiveScanConfig]);
  const unredactedSuggestions = sensitiveSuggestions.filter((suggestion) => !preview?.payload.redactedMessageIds?.includes(suggestion.messageId));
  const detectedKinds = [...new Set(sensitiveSuggestions.flatMap((suggestion) => suggestion.kinds))];
  const occurrenceCount = sensitiveSuggestions.reduce((sum, suggestion) => sum + suggestion.occurrences, 0);

  const confirmClear = () => Alert.alert("Clear local workspace?", "This will remove local conversations, tasks, and manual workflow templates from this device. It does not revoke any external connection because none is configured.", [{ text: "Cancel", style: "cancel" }, { text: "Clear local data", style: "destructive", onPress: () => { clearWorkspace().catch(() => Alert.alert("Could not clear workspace", "The local data operation did not finish. Please try again.")); } }]);

  const toggleStatus = (status: TaskStatus) => setSelectedStatuses((current) => current.includes(status) ? current.filter((item) => item !== status) : [...current, status]);
  const createFilteredPayload = () => filterOrbitExportPayload({ messages, tasks }, { startDate: startDate.trim() || undefined, endDate: endDate.trim() || undefined, statuses: selectedStatuses });

  const openPreview = (format: OrbitExportFormat) => {
    try {
      setAndroidGuideAcknowledged(false);
      setPreview({ format, payload: createFilteredPayload() });
    } catch (error) {
      Alert.alert("Check export filters", error instanceof Error ? error.message : "The export filter is not valid.");
    }
  };

  const sharePreview = async () => {
    if (!preview) return;
    try {
      await shareOrbitWorkspace(preview.format, preview.payload);
      setPreview(null);
    } catch (error) {
      Alert.alert("Export unavailable", error instanceof Error ? error.message : "Orbit could not create this export.");
    }
  };

  const toggleMessageRedaction = (messageId: string) => {
    setPreview((current) => {
      if (!current) return null;
      const ids = current.payload.redactedMessageIds ?? [];
      const nextIds = ids.includes(messageId) ? ids.filter((id) => id !== messageId) : [...ids, messageId];
      return { ...current, payload: redactOrbitExportPayload(current.payload, nextIds) };
    });
  };

  const updateRedactionTreatment = (treatment: "placeholder" | "mask") => setPreview((current) => current ? { ...current, payload: configureOrbitRedaction(current.payload, { ...current.payload.redactionOptions, treatment }) } : null);
  const updateRedactionPlaceholder = (placeholder: string) => setPreview((current) => current ? { ...current, payload: configureOrbitRedaction(current.payload, { ...current.payload.redactionOptions, placeholder }) } : null);

  const updateScanKind = (kind: SensitiveDataKind) => setSensitiveScanConfig(normalizeSensitiveScanConfig({ ...sensitiveScanConfig, enabledKinds: { ...sensitiveScanConfig.enabledKinds, [kind]: !sensitiveScanConfig.enabledKinds[kind] } }));
  const addCustomRule = () => {
    const next = normalizeSensitiveScanConfig({ ...sensitiveScanConfig, customRules: [...sensitiveScanConfig.customRules, customRuleDraft] });
    if (next.customRules.length === sensitiveScanConfig.customRules.length) {
      Alert.alert("Use a distinct custom rule", "Rules must contain 2–48 characters and are matched literally on this device.");
      return;
    }
    setSensitiveScanConfig(next);
    setCustomRuleDraft("");
  };
  const removeCustomRule = (rule: string) => setSensitiveScanConfig(normalizeSensitiveScanConfig({ ...sensitiveScanConfig, customRules: sensitiveScanConfig.customRules.filter((item) => item !== rule) }));

  const redactDetectedMessages = () => {
    setPreview((current) => {
      if (!current) return null;
      const suggestedIds = detectSensitiveMessages(current.payload.messages, sensitiveScanConfig).map((suggestion) => suggestion.messageId);
      return { ...current, payload: redactOrbitExportPayload(current.payload, [...(current.payload.redactedMessageIds ?? []), ...suggestedIds]) };
    });
  };

  const showAndroidGuide = () => {
    setAndroidGuideAcknowledged(true);
    Alert.alert("Android export checklist", "1. Tap Share Markdown or Share PDF.\n2. Select Files, Drive, Gmail, or another destination.\n3. Confirm the preview’s redactions are preserved in the received file.\n4. Return here and restore any message if needed.\n\nThis checklist records your review only; Orbit does not claim the device test completed automatically.");
  };

  const testNotification = async () => {
    try {
      const result = await scheduleOrbitTestNotification();
      Alert.alert(result.ok ? "Local reminder scheduled" : "Notification unavailable", result.ok ? "You should receive an Orbit reminder in a few seconds." : result.reason);
    } catch (error) {
      Alert.alert("Notification could not be scheduled", error instanceof Error ? error.message : "Please try again.");
    }
  };

  return <ScreenContainer className="px-4">
    <FlatList
      data={["privacy", "export", "integrations", "availability"]}
      keyExtractor={(item) => item}
      contentContainerStyle={styles.list}
      ListHeaderComponent={<View style={styles.header}><Text style={[styles.title, { color: colors.text }]}>Settings</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Control local data, understand capability status, and review external access before it is granted.</Text><View style={styles.stats}><View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.statValue, { color: colors.text }]}>{messages.length}</Text><Text style={[styles.statLabel, { color: colors.muted }]}>Messages</Text></View><View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.statValue, { color: colors.text }]}>{tasks.length}</Text><Text style={[styles.statLabel, { color: colors.muted }]}>Tasks</Text></View></View><SectionLabel>Privacy and connections</SectionLabel></View>}
      renderItem={({ item }) => {
        if (item === "privacy") return <FeatureCard icon="shield" title="Local data controls" description="Conversation history and task records are persisted locally on this device until you clear them."><OrbitButton label="Clear local workspace" icon="delete-outline" secondary onPress={confirmClear} /></FeatureCard>;
        if (item === "export") return <FeatureCard icon="ios-share" title="Export workspace" description="Choose a date window and task statuses, then preview the exact local Markdown or PDF content before sharing it."><View style={styles.filters}><Text style={[styles.filterLabel, { color: colors.text }]}>Date range</Text><View style={styles.dateRow}><TextInput accessibilityLabel="Export start date" value={startDate} onChangeText={setStartDate} placeholder="Start YYYY-MM-DD" placeholderTextColor={colors.muted} autoCapitalize="none" keyboardType="numbers-and-punctuation" style={[styles.dateInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]} /><TextInput accessibilityLabel="Export end date" value={endDate} onChangeText={setEndDate} placeholder="End YYYY-MM-DD" placeholderTextColor={colors.muted} autoCapitalize="none" keyboardType="numbers-and-punctuation" style={[styles.dateInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]} /></View><Text style={[styles.filterHint, { color: colors.muted }]}>Leave either date blank to include everything before or after the entered date.</Text><View style={styles.statusHeader}><Text style={[styles.filterLabel, { color: colors.text }]}>Task statuses</Text><Pressable accessibilityLabel="Include all task statuses" onPress={() => setSelectedStatuses([])}><Text style={[styles.resetText, { color: colors.tint }]}>All statuses</Text></Pressable></View><View style={styles.statusWrap}>{taskStatuses.map((status) => { const selected = selectedStatuses.includes(status); return <Pressable key={status} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={() => toggleStatus(status)} style={({ pressed }) => [styles.statusChip, { borderColor: selected ? colors.tint : colors.border, backgroundColor: selected ? `${colors.tint}16` : colors.background }, pressed && styles.pressed]}><Text style={[styles.statusText, { color: selected ? colors.tint : colors.muted }]}>{status}</Text></Pressable>; })}</View><Text style={[styles.filterHint, { color: colors.muted }]}>{selectedStatuses.length ? `${selectedStatuses.length} status filter${selectedStatuses.length === 1 ? "" : "s"} selected.` : "All task statuses are included."}</Text></View><View style={styles.exportActions}><OrbitButton label="Preview Markdown" icon="preview" secondary onPress={() => openPreview("markdown")} /><OrbitButton label="Preview PDF" icon="picture-as-pdf" onPress={() => openPreview("pdf")} /></View></FeatureCard>;
        if (item === "integrations") return <FeatureCard icon="hub" title="Integrations" description="No authorized connectors are available in this project session. Orbit will display scopes, risk level, health, and revocation controls before connecting a service." action={<StatusPill status="Unavailable" />} />;
        return <FeatureCard icon="smart-toy" title="AI capability status" description="Secure server-side chat, research, text-document analysis, and bounded voice transcription are configured. Image upload and external tools remain gated." action={<StatusPill status="Available" />} />;
      }}
      ListFooterComponent={<View style={styles.footer}><OrbitButton label="Send test reminder" icon="notifications-none" secondary onPress={() => { void testNotification(); }} /><Pressable onPress={() => Alert.alert("Content reporting", "Use the report action from a response if you encounter offensive AI-generated content. Reports are not sent to an external moderation service until that integration is configured.")} style={({ pressed }) => [styles.report, { borderColor: colors.border, backgroundColor: colors.surface }, pressed && styles.pressed]}><MaterialIcons name="flag" size={18} color={colors.muted} /><Text style={[styles.reportText, { color: colors.text }]}>Learn about content reporting</Text><MaterialIcons name="chevron-right" size={18} color={colors.muted} /></Pressable></View>}
    />

    <Modal visible={Boolean(preview)} animationType="slide" transparent onRequestClose={() => setPreview(null)}>
      <View style={styles.modalScrim}>
        <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}><View style={styles.modalTitleWrap}><Text style={[styles.modalTitle, { color: colors.text }]}>{preview?.format === "markdown" ? "Markdown preview" : "PDF preview"}</Text><Text style={[styles.modalMeta, { color: colors.muted }]}>{preview?.payload.messages.length ?? 0} messages · {preview?.payload.tasks.length ?? 0} tasks</Text></View><Pressable accessibilityLabel="Close export preview" onPress={() => setPreview(null)} style={({ pressed }) => [styles.closeButton, { backgroundColor: colors.surface }, pressed && styles.pressed]}><MaterialIcons name="close" size={21} color={colors.text} /></Pressable></View>
          <Text style={[styles.previewNote, { color: colors.muted }]}>This is the exact filtered content Orbit will use to create your {preview?.format === "markdown" ? "Markdown file" : "PDF"}.</Text>
          {preview?.payload.messages.length ? <View style={styles.redactionSection}>
            <View style={styles.redactionHeader}><Text style={[styles.filterLabel, { color: colors.text }]}>Sensitive messages</Text><Text style={[styles.redactionCount, { color: colors.muted }]}>{redactedCount} hidden</Text></View>
            <Text style={[styles.redactionHint, { color: colors.muted }]}>Detection runs locally. It reports categories and counts only; matched text never leaves this device.</Text>
            <View style={styles.scanKindWrap}>{scanKinds.map(({ key, icon }) => { const enabled = sensitiveScanConfig.enabledKinds[key]; return <Pressable key={key} accessibilityRole="checkbox" accessibilityState={{ checked: enabled }} onPress={() => updateScanKind(key)} style={({ pressed }) => [styles.scanKindChip, { backgroundColor: enabled ? `${colors.tint}14` : colors.surface, borderColor: enabled ? colors.tint : colors.border }, pressed && styles.pressed]}><MaterialIcons name={icon} size={14} color={enabled ? colors.tint : colors.muted} /><Text style={[styles.scanKindText, { color: enabled ? colors.tint : colors.muted }]}>{key}</Text></Pressable>; })}</View>
            <View style={styles.customRuleRow}><TextInput accessibilityLabel="Add local custom detection rule" value={customRuleDraft} onChangeText={setCustomRuleDraft} placeholder="Add literal custom rule" placeholderTextColor={colors.muted} maxLength={48} style={[styles.customRuleInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]} /><Pressable accessibilityLabel="Add custom detection rule" onPress={addCustomRule} style={({ pressed }) => [styles.customRuleAdd, { backgroundColor: colors.tint }, pressed && styles.pressed]}><MaterialIcons name="add" size={18} color="#FFFFFF" /></Pressable></View>
            {sensitiveScanConfig.customRules.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ruleScroll}>{sensitiveScanConfig.customRules.map((rule) => <Pressable key={rule} accessibilityLabel={`Remove custom rule ${rule}`} onPress={() => removeCustomRule(rule)} style={[styles.ruleChip, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text numberOfLines={1} style={[styles.ruleText, { color: colors.text }]}>{rule}</Text><MaterialIcons name="close" size={14} color={colors.muted} /></Pressable>)}</ScrollView> : <Text style={[styles.customRuleHint, { color: colors.muted }]}>Custom rules match literal terms only—regular expressions are not accepted.</Text>}
            {sensitiveSuggestions.length ? <View style={[styles.detectionCard, { backgroundColor: `${colors.warning}14`, borderColor: colors.warning }]}><View style={styles.detectionText}><Text style={[styles.detectionTitle, { color: colors.text }]}>Local scan found {sensitiveSuggestions.length} message{sensitiveSuggestions.length === 1 ? "" : "s"} with possible sensitive data</Text><Text style={[styles.detectionDetail, { color: colors.muted }]}>{detectedKinds.join(" · ")} · {occurrenceCount} possible value{occurrenceCount === 1 ? "" : "s"}. Matched content remains on this device.</Text></View><Pressable accessibilityLabel="Redact all detected sensitive messages" disabled={unredactedSuggestions.length === 0} onPress={redactDetectedMessages} style={({ pressed }) => [styles.detectionButton, { backgroundColor: unredactedSuggestions.length ? colors.warning : colors.surface }, pressed && styles.pressed, unredactedSuggestions.length === 0 && styles.disabled]}><MaterialIcons name={unredactedSuggestions.length ? "visibility-off" : "check"} size={16} color={unredactedSuggestions.length ? "#FFFFFF" : colors.muted} /><Text style={[styles.detectionButtonText, { color: unredactedSuggestions.length ? "#FFFFFF" : colors.muted }]}>{unredactedSuggestions.length ? `Redact ${unredactedSuggestions.length}` : "Reviewed"}</Text></Pressable></View> : <Text style={[styles.noDetection, { color: colors.success }]}>No enabled detection category matched this selection.</Text>}
            <View style={styles.treatmentRow}><Pressable accessibilityRole="radio" accessibilityState={{ selected: redactionTreatment === "placeholder" }} onPress={() => updateRedactionTreatment("placeholder")} style={({ pressed }) => [styles.treatmentOption, { backgroundColor: redactionTreatment === "placeholder" ? `${colors.tint}14` : colors.surface, borderColor: redactionTreatment === "placeholder" ? colors.tint : colors.border }, pressed && styles.pressed]}><MaterialIcons name="short-text" size={15} color={redactionTreatment === "placeholder" ? colors.tint : colors.muted} /><Text style={[styles.treatmentText, { color: redactionTreatment === "placeholder" ? colors.tint : colors.text }]}>Placeholder</Text></Pressable><Pressable accessibilityRole="radio" accessibilityState={{ selected: redactionTreatment === "mask" }} onPress={() => updateRedactionTreatment("mask")} style={({ pressed }) => [styles.treatmentOption, { backgroundColor: redactionTreatment === "mask" ? `${colors.tint}14` : colors.surface, borderColor: redactionTreatment === "mask" ? colors.tint : colors.border }, pressed && styles.pressed]}><MaterialIcons name="blur-on" size={15} color={redactionTreatment === "mask" ? colors.tint : colors.muted} /><Text style={[styles.treatmentText, { color: redactionTreatment === "mask" ? colors.tint : colors.text }]}>Blur-style mask</Text></Pressable></View>
            {redactionTreatment === "placeholder" ? <TextInput accessibilityLabel="Custom redaction placeholder" value={redactionPlaceholder} onChangeText={updateRedactionPlaceholder} placeholder="Custom hidden-text label" placeholderTextColor={colors.muted} maxLength={96} style={[styles.placeholderInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]} /> : <Text style={[styles.maskHint, { color: colors.muted }]}>Hidden text will appear as a non-reversible block mask: ████████████████</Text>}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.redactionScroll}>{preview.payload.messages.map((message, index) => { const hidden = preview.payload.redactedMessageIds?.includes(message.id) ?? false; return <Pressable key={message.id} accessibilityRole="checkbox" accessibilityState={{ checked: hidden }} accessibilityLabel={`${hidden ? "Restore" : "Redact"} message ${index + 1}`} onPress={() => toggleMessageRedaction(message.id)} style={({ pressed }) => [styles.redactionChip, { backgroundColor: hidden ? `${colors.error}14` : colors.surface, borderColor: hidden ? colors.error : colors.border }, pressed && styles.pressed]}><MaterialIcons name={hidden ? "visibility" : "visibility-off"} size={15} color={hidden ? colors.error : colors.muted} /><Text style={[styles.redactionChipText, { color: hidden ? colors.error : colors.text }]}>{hidden ? `Restore ${index + 1}` : `Redact ${index + 1}`}</Text></Pressable>; })}</ScrollView>
          </View> : null}
          <View style={[styles.previewFrame, { borderColor: colors.border, backgroundColor: colors.surface }]}>{preview?.format === "markdown" ? <ScrollView contentContainerStyle={styles.markdownScroll}><Text selectable style={[styles.markdownText, { color: colors.text }]}>{previewMarkdown}</Text></ScrollView> : <WebView originWhitelist={["*"]} source={{ html: previewHtml }} style={styles.pdfPreview} />}</View>
          <Pressable accessibilityLabel="Show Android export checklist" onPress={showAndroidGuide} style={({ pressed }) => [styles.androidGuide, { borderColor: androidGuideAcknowledged ? colors.success : colors.border, backgroundColor: androidGuideAcknowledged ? `${colors.success}12` : colors.surface }, pressed && styles.pressed]}><MaterialIcons name={androidGuideAcknowledged ? "check-circle" : "phone-android"} size={18} color={androidGuideAcknowledged ? colors.success : colors.muted} /><View style={styles.androidGuideText}><Text style={[styles.androidGuideTitle, { color: colors.text }]}>{androidGuideAcknowledged ? "Android checklist reviewed" : "Validate on Android"}</Text><Text style={[styles.androidGuideBody, { color: colors.muted }]}>Review the real share sheet and received file on a device; Orbit cannot complete this physical test automatically.</Text></View><MaterialIcons name="chevron-right" size={18} color={colors.muted} /></Pressable>
          <View style={styles.modalActions}><OrbitButton label="Back to filters" icon="arrow-back" secondary onPress={() => setPreview(null)} /><OrbitButton label={`Share ${preview?.format === "markdown" ? "Markdown" : "PDF"}`} icon="ios-share" onPress={() => { void sharePreview(); }} /></View>
        </View>
      </View>
    </Modal>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  list: { paddingTop: 12, paddingBottom: 24, gap: 11 }, header: { gap: 8, marginBottom: 7 }, title: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 }, subtitle: { fontSize: 13, lineHeight: 19 }, stats: { flexDirection: "row", gap: 9, marginVertical: 7 }, stat: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 13, gap: 3 }, statValue: { fontSize: 20, fontWeight: "900" }, statLabel: { fontSize: 11, fontWeight: "700" }, filters: { gap: 9 }, filterLabel: { fontSize: 12, fontWeight: "800" }, dateRow: { flexDirection: "row", gap: 8 }, dateInput: { flex: 1, height: 42, borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, fontSize: 12 }, filterHint: { fontSize: 11, lineHeight: 16 }, statusHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 }, resetText: { fontSize: 12, fontWeight: "800" }, statusWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 }, statusChip: { borderWidth: 1, minHeight: 31, paddingHorizontal: 9, justifyContent: "center", borderRadius: 10 }, statusText: { fontSize: 10, fontWeight: "800" }, exportActions: { flexDirection: "row", gap: 8 }, footer: { marginTop: 2, gap: 10 }, report: { minHeight: 52, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10 }, reportText: { flex: 1, fontSize: 13, fontWeight: "700" }, pressed: { opacity: 0.7 }, disabled: { opacity: 0.64 }, modalScrim: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15, 23, 42, 0.44)" }, modalSheet: { minHeight: "88%", maxHeight: "94%", borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingTop: 6, paddingHorizontal: 16, paddingBottom: 18, gap: 12 }, modalHeader: { minHeight: 62, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: StyleSheet.hairlineWidth }, modalTitleWrap: { flex: 1, gap: 2 }, modalTitle: { fontSize: 19, fontWeight: "900" }, modalMeta: { fontSize: 12 }, closeButton: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center" }, previewNote: { fontSize: 12, lineHeight: 17 }, redactionSection: { gap: 7 }, redactionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, redactionCount: { fontSize: 11, fontWeight: "700" }, redactionHint: { fontSize: 11, lineHeight: 15 }, scanKindWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 }, scanKindChip: { minHeight: 31, paddingHorizontal: 8, borderWidth: 1, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 4 }, scanKindText: { fontSize: 10, fontWeight: "800" }, customRuleRow: { flexDirection: "row", gap: 7 }, customRuleInput: { flex: 1, height: 38, borderWidth: 1, borderRadius: 11, paddingHorizontal: 10, fontSize: 12 }, customRuleAdd: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" }, ruleScroll: { gap: 6, paddingRight: 6 }, ruleChip: { maxWidth: 160, minHeight: 29, paddingHorizontal: 8, borderWidth: 1, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 4 }, ruleText: { fontSize: 10, fontWeight: "700" }, customRuleHint: { fontSize: 10, lineHeight: 14 }, detectionCard: { borderWidth: 1, borderRadius: 13, padding: 10, gap: 8 }, detectionText: { gap: 2 }, detectionTitle: { fontSize: 11, lineHeight: 15, fontWeight: "800" }, detectionDetail: { fontSize: 10, lineHeight: 14 }, detectionButton: { minHeight: 34, borderRadius: 10, paddingHorizontal: 10, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5 }, detectionButtonText: { fontSize: 11, fontWeight: "900" }, noDetection: { fontSize: 11, lineHeight: 15, fontWeight: "700" }, treatmentRow: { flexDirection: "row", gap: 7 }, treatmentOption: { flex: 1, minHeight: 36, borderWidth: 1, borderRadius: 11, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 7 }, treatmentText: { fontSize: 11, fontWeight: "800" }, placeholderInput: { height: 40, borderWidth: 1, borderRadius: 11, paddingHorizontal: 10, fontSize: 12 }, maskHint: { fontFamily: "monospace", fontSize: 11, lineHeight: 16 }, redactionScroll: { gap: 7, paddingRight: 6 }, redactionChip: { minHeight: 34, paddingHorizontal: 9, borderWidth: 1, borderRadius: 11, flexDirection: "row", alignItems: "center", gap: 5 }, redactionChipText: { fontSize: 11, fontWeight: "800" }, previewFrame: { flex: 1, minHeight: 230, borderWidth: 1, borderRadius: 16, overflow: "hidden" }, markdownScroll: { padding: 14 }, markdownText: { fontFamily: "monospace", fontSize: 11, lineHeight: 17 }, pdfPreview: { flex: 1, backgroundColor: "#FFFFFF" }, androidGuide: { minHeight: 58, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 9 }, androidGuideText: { flex: 1, gap: 1 }, androidGuideTitle: { fontSize: 12, fontWeight: "900" }, androidGuideBody: { fontSize: 10, lineHeight: 14 }, modalActions: { flexDirection: "row", gap: 8 },
});
