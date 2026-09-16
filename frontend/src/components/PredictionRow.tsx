import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";

import { useTheme } from "@/src/theme";

type Props = {
  category: "love" | "career" | "finance" | "wellbeing";
  icon: ReactNode;
  label: string;
  text: string;
  accentBg: string;
  onPress: () => void;
  isLast?: boolean;
};

export function PredictionRow({ category, icon, label, text, accentBg, onPress, isLast }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={`home-prediction-row-${category}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && { borderBottomColor: colors.divider, borderBottomWidth: 1 },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: accentBg }]}>{icon}</View>
      <View style={styles.textCol}>
        <Text style={[styles.label, { color: colors.onSurface }]}>{label}</Text>
        <Text style={[styles.text, { color: colors.muted }]} numberOfLines={2}>
          {text}
        </Text>
      </View>
      <ChevronRight size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, gap: 12 },
  pressed: { opacity: 0.7 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  textCol: { flex: 1, gap: 2 },
  label: { fontSize: 15, fontWeight: "700" },
  text: { fontSize: 13, lineHeight: 18 },
});
