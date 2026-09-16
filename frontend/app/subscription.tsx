import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Check, Crown } from "lucide-react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PrimaryButton } from "@/src/components/PrimaryButton";
import { StarsBackground } from "@/src/components/StarsBackground";
import { api } from "@/src/api/client";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import { useTheme } from "@/src/theme";

const FEATURES = [
  "Daily personalized astrological predictions",
  "Love prediction",
  "Career prediction",
  "Finance prediction",
  "Wellbeing prediction",
  "Daily remedies & positive practices",
  "Daily challenges",
  "Continued access to personalized astrology content",
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { updateUser } = useAuth();
  const queryClient = useQueryClient();

  const { data } = useQuery({ queryKey: ["subscription-status"], queryFn: api.getSubscriptionStatus });

  const subscribeMutation = useMutation({
    mutationFn: api.subscribe,
    onSuccess: (updated) => {
      updateUser({ subscription_status: updated.status });
      queryClient.invalidateQueries({ queryKey: ["today-prediction"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
      showToast("Welcome to Zodiac Premium! 🎉", "success");
    },
    onError: () => showToast("Could not complete subscription. Try again.", "error"),
  });

  const isActive = data?.status === "active";

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} testID="subscription-screen">
      <StarsBackground count={40} />
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16 }}>
        <Pressable testID="subscription-back-button" onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <ArrowLeft size={22} color={colors.onSurface} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        <View style={[styles.crownWrap, { backgroundColor: colors.surfaceSecondary, borderColor: colors.gold }]}>
          <Crown size={36} color={colors.gold} />
        </View>
        <Text style={[styles.title, { color: colors.onSurface }]}>Zodiac Premium</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Free for 2 days, then just</Text>
        <Text style={[styles.price, { color: colors.gold }]}>
          ₹99<Text style={styles.priceSuffix}>/month</Text>
        </Text>

        <View style={[styles.featureList, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          {FEATURES.map((f) => (
            <View key={f} style={styles.featureRow}>
              <Check size={16} color={colors.gold} />
              <Text style={[styles.featureText, { color: colors.onSurfaceSecondary }]}>{f}</Text>
            </View>
          ))}
        </View>

        {isActive ? (
          <View style={[styles.activeBanner, { backgroundColor: colors.surfaceSecondary, borderColor: colors.success }]}>
            <Check size={18} color={colors.success} />
            <Text style={[styles.activeText, { color: colors.success }]}>You&apos;re subscribed to Zodiac Premium</Text>
          </View>
        ) : (
          <PrimaryButton
            testID="subscription-subscribe-button"
            title={data?.status === "trial" ? "Upgrade to Premium" : "Start Your Subscription"}
            onPress={() => subscribeMutation.mutate()}
            loading={subscribeMutation.isPending}
            variant="gold"
            style={styles.subscribeButton}
          />
        )}

        <Text style={[styles.disclaimer, { color: colors.muted }]}>
          Free for 2 days → ₹99/month afterward. Cancel anytime from My Account. Astrology guidance is for reflection
          and entertainment purposes only.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 24, alignItems: "center" },
  crownWrap: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, alignItems: "center", justifyContent: "center", marginTop: 8 },
  title: { fontSize: 26, fontWeight: "700", marginTop: 20 },
  subtitle: { fontSize: 14, marginTop: 6 },
  price: { fontSize: 40, fontWeight: "800", marginTop: 4 },
  priceSuffix: { fontSize: 16, fontWeight: "600" },
  featureList: { width: "100%", borderRadius: 20, borderWidth: 1, padding: 20, gap: 14, marginTop: 28 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureText: { fontSize: 14, flex: 1 },
  subscribeButton: { marginTop: 8, width: "100%" },
  activeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 28,
    width: "100%",
    justifyContent: "center",
  },
  activeText: { fontSize: 14, fontWeight: "700" },
  disclaimer: { fontSize: 11, textAlign: "center", marginTop: 20, lineHeight: 16 },
});
