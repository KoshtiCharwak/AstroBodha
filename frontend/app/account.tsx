import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bell,
  Calendar,
  ChevronRight,
  Clock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react-native";

import { ConfirmSheet } from "@/src/components/ConfirmSheet";
import { GlassCard } from "@/src/components/GlassCard";
import { api } from "@/src/api/client";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import { useTheme } from "@/src/theme";
import { cancelDailyReminder } from "@/src/utils/notifications";
import { getZodiacSymbol } from "@/src/utils/zodiac";

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const notifMutation = useMutation({
    mutationFn: (notif_prefs: Record<string, boolean>) => api.updateMe({ notif_prefs }),
    onSuccess: (updated) => updateUser(updated),
    onError: () => showToast("Could not update preferences", "error"),
  });

  const cancelSubMutation = useMutation({
    mutationFn: api.cancelSubscription,
    onSuccess: () => {
      updateUser({ subscription_status: "expired" });
      showToast("Subscription cancelled", "success");
      queryClient.invalidateQueries({ queryKey: ["today-prediction"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
      setShowCancelConfirm(false);
    },
    onError: () => showToast("Could not cancel subscription", "error"),
  });

  if (!user) return null;

  const togglePref = (key: "daily_reminder" | "streak_reminder" | "subscription_updates") => {
    const next = { ...user.notif_prefs, [key]: !user.notif_prefs[key] };
    if (key === "daily_reminder" && !next.daily_reminder) cancelDailyReminder();
    notifMutation.mutate(next);
  };

  const handleLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
    router.replace("/(auth)/login");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} testID="account-screen">
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Pressable testID="account-back-button" onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <ArrowLeft size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>My Account</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.profileHead}>
          <View style={[styles.avatar, { borderColor: colors.gold, backgroundColor: colors.surfaceSecondary }]}>
            <Text style={styles.avatarGlyph}>{getZodiacSymbol(user.zodiac_sign)}</Text>
          </View>
          <Text style={[styles.name, { color: colors.onSurface }]}>{user.name}</Text>
          <Text style={[styles.sign, { color: colors.muted }]}>{user.zodiac_sign}</Text>
        </View>

        <GlassCard style={styles.infoCard}>
          <InfoRow icon={<Phone size={16} color={colors.muted} />} label="Mobile" value={user.mobile} />
          <InfoRow icon={<Mail size={16} color={colors.muted} />} label="Email" value={user.email || "Not added"} />
          <InfoRow icon={<Calendar size={16} color={colors.muted} />} label="Date of Birth" value={user.dob} />
          <InfoRow icon={<MapPin size={16} color={colors.muted} />} label="Place of Birth" value={user.place_of_birth} />
          <InfoRow
            icon={<Clock size={16} color={colors.muted} />}
            label="Time of Birth"
            value={user.time_of_birth || "Not added"}
            last
          />
        </GlassCard>

        <Pressable
          testID="account-edit-profile-button"
          onPress={() => router.push("/edit-profile")}
          style={({ pressed }) => [
            styles.actionRow,
            { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.actionLabel, { color: colors.onSurface }]}>Edit Profile</Text>
          <ChevronRight size={18} color={colors.muted} />
        </Pressable>

        <Pressable
          testID="account-manage-subscription-button"
          onPress={() => router.push("/subscription")}
          style={({ pressed }) => [
            styles.actionRow,
            { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            pressed && styles.pressed,
          ]}
        >
          <View>
            <Text style={[styles.actionLabel, { color: colors.onSurface }]}>Subscription</Text>
            <Text style={[styles.actionSub, { color: colors.muted }]}>
              {user.subscription_status === "active"
                ? "Zodiac Premium — Active"
                : user.subscription_status === "trial"
                  ? "Free trial active"
                  : "Not subscribed"}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.muted} />
        </Pressable>

        <GlassCard style={styles.prefCard}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Notification Preferences</Text>
          <PrefToggle
            testID="account-notif-toggle-daily"
            icon={<Sparkles size={16} color={colors.muted} />}
            label="Daily prediction reminder"
            value={user.notif_prefs.daily_reminder}
            onToggle={() => togglePref("daily_reminder")}
          />
          <PrefToggle
            testID="account-notif-toggle-streak"
            icon={<Bell size={16} color={colors.muted} />}
            label="Streak reminders"
            value={user.notif_prefs.streak_reminder}
            onToggle={() => togglePref("streak_reminder")}
          />
          <PrefToggle
            testID="account-notif-toggle-subscription"
            icon={<ShieldCheck size={16} color={colors.muted} />}
            label="Subscription updates"
            value={user.notif_prefs.subscription_updates}
            onToggle={() => togglePref("subscription_updates")}
            last
          />
        </GlassCard>

        <Text style={[styles.privacyNote, { color: colors.muted }]}>
          Your birth details are used only to personalize your daily astrology guidance and are never shared with
          third parties.
        </Text>

        {user.subscription_status === "active" ? (
          <Pressable testID="account-cancel-subscription-button" onPress={() => setShowCancelConfirm(true)} style={styles.dangerRow}>
            <XCircle size={18} color={colors.error} />
            <Text style={[styles.dangerText, { color: colors.error }]}>Cancel Subscription</Text>
          </Pressable>
        ) : null}

        <Pressable testID="account-logout-button" onPress={() => setShowLogoutConfirm(true)} style={styles.dangerRow}>
          <LogOut size={18} color={colors.error} />
          <Text style={[styles.dangerText, { color: colors.error }]}>Logout</Text>
        </Pressable>
      </ScrollView>

      <ConfirmSheet
        visible={showLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout of Zodiac?"
        confirmLabel="Logout"
        destructive
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        testIDPrefix="logout-confirm"
      />
      <ConfirmSheet
        visible={showCancelConfirm}
        title="Cancel Subscription"
        message="You will lose access to premium daily predictions and remedies. You can resubscribe anytime."
        confirmLabel="Cancel Subscription"
        destructive
        onConfirm={() => cancelSubMutation.mutate()}
        onCancel={() => setShowCancelConfirm(false)}
        testIDPrefix="cancel-subscription-confirm"
      />
    </View>
  );
}

function InfoRow({ icon, label, value, last }: { icon: ReactNode; label: string; value: string; last?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.infoRow, !last && { borderBottomColor: colors.divider, borderBottomWidth: 1, paddingBottom: 14 }]}>
      {icon}
      <View style={styles.infoTextCol}>
        <Text style={[styles.infoLabel, { color: colors.muted }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.onSurface }]}>{value}</Text>
      </View>
    </View>
  );
}

function PrefToggle({
  testID,
  icon,
  label,
  value,
  onToggle,
  last,
}: {
  testID: string;
  icon: ReactNode;
  label: string;
  value: boolean;
  onToggle: () => void;
  last?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.prefRow, !last && { borderBottomColor: colors.divider, borderBottomWidth: 1, paddingBottom: 14 }]}>
      {icon}
      <Text style={[styles.prefLabel, { color: colors.onSurface }]}>{label}</Text>
      <Switch
        testID={testID}
        value={value}
        onValueChange={onToggle}
        trackColor={{ true: colors.brandPrimary, false: colors.border }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1 },
  iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  content: { padding: 20, gap: 16 },
  profileHead: { alignItems: "center", gap: 6, marginBottom: 4 },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  avatarGlyph: { fontSize: 32, color: "#C084FC" },
  name: { fontSize: 19, fontWeight: "700", marginTop: 8 },
  sign: { fontSize: 13 },
  infoCard: { gap: 14 },
  infoRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  infoTextCol: { flex: 1 },
  infoLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  infoValue: { fontSize: 15, marginTop: 3, fontWeight: "600" },
  actionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 18, borderRadius: 18, borderWidth: 1 },
  pressed: { opacity: 0.8 },
  actionLabel: { fontSize: 15, fontWeight: "700" },
  actionSub: { fontSize: 12, marginTop: 2 },
  prefCard: { gap: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  prefRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  prefLabel: { flex: 1, fontSize: 14, fontWeight: "600" },
  privacyNote: { fontSize: 12, lineHeight: 18, textAlign: "center", paddingHorizontal: 8 },
  dangerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14 },
  dangerText: { fontSize: 15, fontWeight: "700" },
});
