import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar, Clock, MapPin } from "lucide-react-native";

import { DateTimeField } from "@/src/components/DateTimeField";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { StarsBackground } from "@/src/components/StarsBackground";
import { ApiError, api } from "@/src/api/client";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import { useTheme } from "@/src/theme";

function formatDob(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function displayDob(d: Date): string {
  return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}
function displayTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function SignupScreen() {
  const { signupToken } = useLocalSearchParams<{ signupToken: string; mobile: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [timeOfBirth, setTimeOfBirth] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const maxDob = new Date();

  const handleSubmit = async () => {
    if (!name.trim()) return showToast("Please enter your name", "error");
    if (!dob) return showToast("Please select your date of birth", "error");
    if (!placeOfBirth.trim()) return showToast("Please enter your place of birth", "error");

    setLoading(true);
    try {
      const res = await api.signup({
        signup_token: signupToken,
        name: name.trim(),
        dob: formatDob(dob),
        place_of_birth: placeOfBirth.trim(),
        time_of_birth: timeOfBirth ? formatTime(timeOfBirth) : undefined,
        email: email.trim() || undefined,
      });
      await login(res.token, res.user);
      router.replace("/onboarding");
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Could not create account", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.surface }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StarsBackground count={30} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: colors.onSurface }]}>Tell us about you</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Your birth details help us personalize your daily astrology guidance.
        </Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.onSurfaceSecondary }]}>Full Name</Text>
          <TextInput
            testID="signup-name-input"
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.muted}
            style={[
              styles.input,
              { color: colors.onSurface, borderColor: colors.border, backgroundColor: colors.surfaceTertiary },
            ]}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.onSurfaceSecondary }]}>Date of Birth</Text>
          <DateTimeField
            testID="signup-dob-button"
            icon={<Calendar size={18} color={colors.muted} />}
            value={dob}
            placeholder="Select date of birth"
            mode="date"
            maximumDate={maxDob}
            displayValue={displayDob}
            onChange={setDob}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.onSurfaceSecondary }]}>Place of Birth</Text>
          <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.surfaceTertiary }]}>
            <MapPin size={18} color={colors.muted} />
            <TextInput
              testID="signup-place-input"
              value={placeOfBirth}
              onChangeText={setPlaceOfBirth}
              placeholder="City, Country"
              placeholderTextColor={colors.muted}
              style={[styles.inputRowText, { color: colors.onSurface }]}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.onSurfaceSecondary }]}>Time of Birth (optional)</Text>
          <DateTimeField
            testID="signup-time-button"
            icon={<Clock size={18} color={colors.muted} />}
            value={timeOfBirth}
            placeholder="Select time of birth"
            mode="time"
            displayValue={displayTime}
            onChange={setTimeOfBirth}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.onSurfaceSecondary }]}>Email (optional)</Text>
          <TextInput
            testID="signup-email-input"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[
              styles.input,
              { color: colors.onSurface, borderColor: colors.border, backgroundColor: colors.surfaceTertiary },
            ]}
          />
        </View>

        <PrimaryButton
          testID="signup-submit-button"
          title="Create My Zodiac Profile"
          onPress={handleSubmit}
          loading={loading}
          style={styles.button}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 28, gap: 16 },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: "600" },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15 },
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
  button: { marginTop: 12 },
});
