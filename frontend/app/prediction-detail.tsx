import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Briefcase, DollarSign, Heart, Sun } from "lucide-react-native";
import type { ComponentType } from "react";

import { GlassCard } from "@/src/components/GlassCard";
import { StarsBackground } from "@/src/components/StarsBackground";
import { useTheme } from "@/src/theme";

const CATEGORY_META: Record<string, { label: string; tip: string }> = {
  love: { label: "Love", tip: "Relationships flow best today with patience, honesty and small kind gestures." },
  career: { label: "Career", tip: "Steady, consistent effort at work tends to be noticed more than big gestures today." },
  finance: { label: "Finance", tip: "A calm, considered approach to money decisions serves you better than quick moves." },
  wellbeing: { label: "Wellbeing", tip: "Your energy responds well to rest, gentle movement and quiet reflection today." },
};

const ICON_MAP: Record<string, ComponentType<{ size?: number; color?: string }>> = {
  love: Heart,
  career: Briefcase,
  finance: DollarSign,
  wellbeing: Sun,
};

export default function PredictionDetailScreen() {
  const { category, text } = useLocalSearchParams<{ category: string; text: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const meta = CATEGORY_META[category] ?? { label: "Prediction", tip: "" };
  const Icon = ICON_MAP[category] ?? Sun;
  const accent = (colors as Record<string, string>)[category] ?? colors.brandTertiary;
  const accentBg = (colors as Record<string, string>)[`${category}Bg`] ?? colors.surfaceTertiary;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} testID="prediction-detail-screen">
      <StarsBackground count={30} />
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20 }}>
        <Pressable testID="prediction-detail-back-button" onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <ArrowLeft size={22} color={colors.onSurface} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <View style={[styles.iconCircle, { backgroundColor: accentBg }]}>
          <Icon size={32} color={accent} />
        </View>
        <Text style={[styles.title, { color: colors.onSurface }]}>{meta.label}</Text>
        <GlassCard style={styles.card}>
          <Text style={[styles.text, { color: colors.onSurfaceSecondary }]}>{text}</Text>
        </GlassCard>
        {meta.tip ? <Text style={[styles.tip, { color: colors.muted }]}>{meta.tip}</Text> : null}
        <Text style={[styles.disclaimer, { color: colors.muted }]}>
          For reflection and guidance only — not a guaranteed outcome.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 24, paddingTop: 12, alignItems: "center" },
  iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", marginTop: 16 },
  card: { marginTop: 20, width: "100%" },
  text: { fontSize: 16, lineHeight: 24 },
  tip: { fontSize: 13, lineHeight: 20, marginTop: 16, textAlign: "center" },
  disclaimer: { fontSize: 11, marginTop: 24, textAlign: "center" },
});
