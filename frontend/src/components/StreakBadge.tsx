import { StyleSheet, Text, View } from "react-native";
import { Flame } from "lucide-react-native";

import { useTheme } from "@/src/theme";

export function StreakBadge({ days }: { days: number }) {
  const { colors } = useTheme();
  return (
    <View
      testID="home-streak-badge"
      style={[styles.container, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.goldDark }]}>
        <Flame size={20} color={colors.goldGlow} fill={colors.goldGlow} />
      </View>
      <View>
        <Text style={[styles.title, { color: colors.muted }]}>Daily Streak</Text>
        <Text style={[styles.value, { color: colors.onSurface }]}>
          {days} {days === 1 ? "Day" : "Days"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 18, borderWidth: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  value: { fontSize: 18, fontWeight: "700", marginTop: 2 },
});
