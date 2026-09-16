import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Clock, Mail, MapPin, User as UserIcon } from "lucide-react-native";

import { DateTimeField } from "@/src/components/DateTimeField";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { ApiError, api } from "@/src/api/client";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import { useTheme } from "@/src/theme";

function parseTime(t: string | null | undefined): Date | null {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}
function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function displayTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [placeOfBirth, setPlaceOfBirth] = useState(user?.place_of_birth ?? "");
  const [timeOfBirth, setTimeOfBirth] = useState<Date | null>(parseTime(user?.time_of_birth));

  const mutation = useMutation({
    mutationFn: () =>
      api.updateMe({
        name: name.trim(),
        email: email.trim() || null,
        place_of_birth: placeOfBirth.trim(),
        time_of_birth: timeOfBirth ? formatTime(timeOfBirth) : null,
      }),
    onSuccess: (updated) => {
      updateUser(updated);
      showToast("Profile updated", "success");
      router.back();
    },
    onError: (e) => showToast(e instanceof ApiError ? e.message : "Could not update profile", "error"),
  });

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.surface }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Pressable testID="edit-profile-back-button" onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <ArrowLeft size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Edit Profile</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} keyboardShouldPersistTaps="handled">
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.onSurfaceSecondary }]}>Full Name</Text>
          <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.surfaceTertiary }]}>
            <UserIcon size={18} color={colors.muted} />
            <TextInput
              testID="edit-profile-name-input"
              value={name}
              onChangeText={setName}
              placeholderTextColor={colors.muted}
              style={[styles.inputRowText, { color: colors.onSurface }]}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.onSurfaceSecondary }]}>Email</Text>
          <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.surfaceTertiary }]}>
            <Mail size={18} color={colors.muted} />
            <TextInput
              testID="edit-profile-email-input"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={colors.muted}
              style={[styles.inputRowText, { color: colors.onSurface }]}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.onSurfaceSecondary }]}>Place of Birth</Text>
          <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.surfaceTertiary }]}>
            <MapPin size={18} color={colors.muted} />
            <TextInput
              testID="edit-profile-place-input"
              value={placeOfBirth}
              onChangeText={setPlaceOfBirth}
              placeholderTextColor={colors.muted}
              style={[styles.inputRowText, { color: colors.onSurface }]}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.onSurfaceSecondary }]}>Time of Birth</Text>
          <DateTimeField
            testID="edit-profile-time-button"
            icon={<Clock size={18} color={colors.muted} />}
            value={timeOfBirth}
            placeholder="Select time of birth"
            mode="time"
            displayValue={displayTime}
            onChange={setTimeOfBirth}
          />
        </View>

        <Text style={[styles.hint, { color: colors.muted }]}>
          Mobile number and date of birth cannot be changed since your zodiac profile is calculated from them.
        </Text>

        <PrimaryButton
          testID="edit-profile-save-button"
          title="Save Changes"
          onPress={() => mutation.mutate()}
          loading={mutation.isPending}
          style={styles.saveButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1 },
  iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  content: { padding: 20, gap: 16 },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: "600" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputRowText: { fontSize: 15, flex: 1 },
  hint: { fontSize: 12, lineHeight: 18 },
  saveButton: { marginTop: 8 },
});
