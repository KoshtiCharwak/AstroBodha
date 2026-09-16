import { useCallback } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, DollarSign, Heart, Sparkles, Sun } from "lucide-react-native";

import { AppHeader } from "@/src/components/AppHeader";
import { BottomActionBar } from "@/src/components/BottomActionBar";
import { GlassCard } from "@/src/components/GlassCard";
import { LockOverlay } from "@/src/components/LockOverlay";
import { PredictionRow } from "@/src/components/PredictionRow";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { StarsBackground } from "@/src/components/StarsBackground";
import { StreakBadge } from "@/src/components/StreakBadge";
import { ZodiacHeroIllustration } from "@/src/components/ZodiacHeroIllustration";
import { api } from "@/src/api/client";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import { fontSerif, useTheme } from "@/src/theme";
import { formatDisplayDate, getZodiacSymbol } from "@/src/utils/zodiac";

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const predictionQuery = useQuery({ queryKey: ["today-prediction"], queryFn: api.getTodayPrediction });
  const notificationsQuery = useQuery({ queryKey: ["notifications-unread"], queryFn: api.getNotifications });

  const checkinMutation = useMutation({
    mutationFn: api.checkin,
    onSuccess: (result) => {
      queryClient.setQueryData(["today-prediction"], (old: any) =>
        old
          ? { ...old, streak_count: result.streak_count, prediction: { ...old.prediction, checked_in: true } }
          : old,
      );
      if (!result.already_checked_in) {
        showToast("Remedy marked complete! Streak updated. \ud83d\udd25", "success");
      }
    },
    onError: () => showToast("Could not update streak. Please try again.", "error"),
  });

  const onRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["today-prediction"] });
    queryClient.invalidateQueries({ queryKey: ["notifications-unread"] });
  }, [queryClient]);

  const data = predictionQuery.data;
  const isLocked = data?.locked;
  const prediction = data?.prediction;
  const unreadCount = notificationsQuery.data?.unread_count ?? 0;
  const zodiacSign = data?.zodiac_sign ?? user?.zodiac_sign;

  const goToDetail = (category: string, text: string) => {
    router.push({ pathname: "/prediction-detail", params: { category, text } });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} testID="home-screen">
      <AppHeader unreadCount={unreadCount} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={predictionQuery.isFetching} onRefresh={onRefresh} tintColor={colors.brandTertiary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <StarsBackground count={20} />
          <View style={styles.heroIllustrationWrap}>
            <ZodiacHeroIllustration />
          </View>
          <View style={styles.heroTextCol}>
            <Text testID="home-hero-greeting" style={[styles.greeting, { color: colors.brandTertiary }]}>
              Hello, {user?.name ?? "there"}
            </Text>
            <Text style={[styles.headline, { color: colors.onSurface, fontFamily: fontSerif }]}>
              It&apos;s a good day to align your stars
            </Text>
            <View testID="home-zodiac-sign-badge" style={styles.signRow}>
              <View style={[styles.signGlyph, { borderColor: colors.gold, backgroundColor: colors.surfaceSecondary }]}>
                <Text style={styles.signGlyphText}>{getZodiacSymbol(zodiacSign)}</Text>
              </View>
              <View>
                <Text style={[styles.signName, { color: colors.onSurface }]}>{zodiacSign}</Text>
                <Text style={[styles.signCaption, { color: colors.muted }]}>Current Position</Text>
              </View>
            </View>
          </View>
        </View>

        {predictionQuery.isLoading ? (
          <ActivityIndicator color={colors.brandTertiary} style={styles.loader} />
        ) : (
          <>
            {data?.subscription?.status === "trial" ? (
              <View style={[styles.trialPill, { backgroundColor: colors.surfaceTertiary, borderColor: colors.border }]}>
                <Text style={[styles.trialPillText, { color: colors.gold }]}>
                  {data.subscription.days_left_in_trial <= 1
                    ? "Last day of your free trial \u2728"
                    : `${Math.ceil(data.subscription.days_left_in_trial)} days left in your free trial`}
                </Text>
              </View>
            ) : null}

            <GlassCard style={styles.predictionCardWrap} testID="home-prediction-card">
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardHeaderIcon, { backgroundColor: colors.brandSecondary }]}>
                  <Sparkles size={16} color={colors.brandTertiary} />
                </View>
                <View>
                  <Text style={[styles.cardTitle, { color: colors.onSurface }]}>My Daily Zodiac Predictions</Text>
                  <Text style={[styles.cardDate, { color: colors.muted }]}>{formatDisplayDate()}</Text>
                </View>
              </View>

              {!isLocked && prediction ? (
                <View>
                  <PredictionRow
                    category="love"
                    label="Love"
                    text={prediction.love}
                    accentBg={colors.loveBg}
                    icon={<Heart size={20} color={colors.love} />}
                    onPress={() => goToDetail("love", prediction.love)}
                  />
                  <PredictionRow
                    category="career"
                    label="Career"
                    text={prediction.career}
                    accentBg={colors.careerBg}
                    icon={<Briefcase size={20} color={colors.career} />}
                    onPress={() => goToDetail("career", prediction.career)}
                  />
                  <PredictionRow
                    category="finance"
                    label="Finance"
                    text={prediction.finance}
                    accentBg={colors.financeBg}
                    icon={<DollarSign size={20} color={colors.finance} />}
                    onPress={() => goToDetail("finance", prediction.finance)}
                  />
                  <PredictionRow
                    category="wellbeing"
                    label="Wellbeing"
                    text={prediction.wellbeing}
                    accentBg={colors.wellbeingBg}
                    icon={<Sun size={20} color={colors.wellbeing} />}
                    onPress={() => goToDetail("wellbeing", prediction.wellbeing)}
                    isLast
                  />
                </View>
              ) : (
                <View style={styles.lockedPlaceholder}>
                  {[0, 1, 2, 3].map((i) => (
                    <View key={i} style={[styles.placeholderRow, { backgroundColor: colors.surfaceTertiary }]} />
                  ))}
                </View>
              )}
              {isLocked ? <LockOverlay /> : null}
            </GlassCard>

            <GlassCard style={styles.remedyCardWrap} testID="home-remedy-card">
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardHeaderIcon, { backgroundColor: colors.brandSecondary }]}>
                  <Sparkles size={16} color={colors.goldGlow} />
                </View>
                <Text style={[styles.cardTitle, { color: colors.onSurface }]}>
                  {!isLocked && prediction ? prediction.remedy_title : "Daily Task / Challenge"}
                </Text>
              </View>

              {!isLocked && prediction ? (
                <View style={styles.remedyList}>
                  {prediction.remedies.map((remedy: string, i: number) => (
                    <View key={i} style={styles.remedyItem}>
                      <View style={[styles.remedyDot, { backgroundColor: colors.gold }]} />
                      <Text style={[styles.remedyText, { color: colors.onSurfaceSecondary }]}>{remedy}</Text>
                    </View>
                  ))}
                  <PrimaryButton
                    testID="home-checkin-button"
                    title={prediction.checked_in ? "Completed Today \u2713" : "Mark as Done"}
                    onPress={() => checkinMutation.mutate()}
                    disabled={prediction.checked_in}
                    loading={checkinMutation.isPending}
                    variant="gold"
                    style={styles.checkinButton}
                  />
                </View>
              ) : (
                <View style={styles.lockedPlaceholder}>
                  <View style={[styles.placeholderRow, { backgroundColor: colors.surfaceTertiary }]} />
                  <View style={[styles.placeholderRow, { backgroundColor: colors.surfaceTertiary }]} />
                </View>
              )}
              {isLocked ? <LockOverlay message="Unlock Daily Remedies" /> : null}
            </GlassCard>

            <View style={styles.streakWrap}>
              <StreakBadge days={data?.streak_count ?? user?.streak_count ?? 0} />
            </View>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
      <BottomActionBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 12 },
  hero: { position: "relative", paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16, minHeight: 210 },
  heroIllustrationWrap: { position: "absolute", right: -30, top: 0, transform: [{ scale: 0.72 }] },
  heroTextCol: { maxWidth: "66%", gap: 6 },
  greeting: { fontSize: 16, fontWeight: "700" },
  headline: { fontSize: 24, fontWeight: "700", lineHeight: 31, marginTop: 2 },
  signRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16 },
  signGlyph: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  signGlyphText: { fontSize: 20, color: "#C084FC" },
  signName: { fontSize: 15, fontWeight: "700" },
  signCaption: { fontSize: 12, marginTop: 1 },
  loader: { marginTop: 60 },
  trialPill: { marginHorizontal: 20, marginBottom: 12, borderWidth: 1, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16 },
  trialPillText: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  predictionCardWrap: { marginHorizontal: 20, position: "relative" },
  remedyCardWrap: { marginHorizontal: 20, marginTop: 16, position: "relative" },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 6 },
  cardHeaderIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardDate: { fontSize: 12, marginTop: 2 },
  lockedPlaceholder: { gap: 12, marginTop: 10 },
  placeholderRow: { height: 44, borderRadius: 12 },
  remedyList: { gap: 14, marginTop: 6 },
  remedyItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  remedyDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  remedyText: { flex: 1, fontSize: 14, lineHeight: 20 },
  checkinButton: { marginTop: 8 },
  streakWrap: { marginHorizontal: 20, marginTop: 16 },
  bottomSpacer: { height: 16 },
});
