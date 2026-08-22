import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import type { TaskStatus } from "@/lib/orbit-domain";

export function OrbitMark({ size = 38 }: { size?: number }) {
  const colors = useColors();
  return (
    <View style={[styles.mark, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.tint }]}>
      <View style={[styles.markInner, { width: size * 0.42, height: size * 0.42, borderRadius: size / 2, backgroundColor: colors.background }]} />
    </View>
  );
}

export function SectionLabel({ children }: { children: string }) {
  const colors = useColors();
  return <Text style={[styles.sectionLabel, { color: colors.muted }]}>{children.toUpperCase()}</Text>;
}

export function StatusPill({ status }: { status: TaskStatus | "Manual" | "Backend required" | "Available" | "Unavailable" }) {
  const colors = useColors();
  const tone = status === "COMPLETED" || status === "Available"
    ? colors.success
    : status === "FAILED" || status === "CANCELLED" || status === "Unavailable"
      ? colors.error
      : status === "WAITING" || status === "BLOCKED" || status === "Backend required"
        ? colors.warning
        : colors.tint;
  return (
    <View style={[styles.pill, { backgroundColor: `${tone}1A` }]}>
      <View style={[styles.pillDot, { backgroundColor: tone }]} />
      <Text style={[styles.pillText, { color: tone }]}>{status}</Text>
    </View>
  );
}

export function OrbitButton({ label, icon, onPress, secondary = false, disabled = false }: {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: secondary ? colors.surface : colors.tint, borderColor: secondary ? colors.border : colors.tint },
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      {icon ? <MaterialIcons name={icon} size={18} color={secondary ? colors.text : colors.background} /> : null}
      <Text style={[styles.buttonText, { color: secondary ? colors.text : colors.background }]}>{label}</Text>
    </Pressable>
  );
}

export function FeatureCard({ icon, title, description, action, children }: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.featureTopline}>
        <View style={[styles.iconContainer, { backgroundColor: `${colors.tint}14` }]}>
          <MaterialIcons name={icon} size={20} color={colors.tint} />
        </View>
        <View style={styles.featureCopy}>
          <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.featureDescription, { color: colors.muted }]}>{description}</Text>
        </View>
        {action}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { alignItems: "center", justifyContent: "center" },
  markInner: { borderWidth: 4, borderColor: "transparent" },
  sectionLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1.1, marginBottom: 8 },
  pill: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 99 },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 11, fontWeight: "800" },
  button: { minHeight: 44, paddingHorizontal: 14, borderWidth: 1, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  buttonPressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
  buttonDisabled: { opacity: 0.48 },
  buttonText: { fontSize: 14, fontWeight: "800" },
  featureCard: { borderWidth: 1, borderRadius: 20, padding: 15, gap: 12 },
  featureTopline: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconContainer: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  featureCopy: { flex: 1, gap: 3 },
  featureTitle: { fontSize: 15, fontWeight: "800" },
  featureDescription: { fontSize: 13, lineHeight: 19 },
});
