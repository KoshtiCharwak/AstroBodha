import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/src/components/PrimaryButton";
import { StarsBackground } from "@/src/components/StarsBackground";
import { ApiError, api } from "@/src/api/client";
import { useToast } from "@/src/context/ToastContext";
import { fontSerif, useTheme } from "@/src/theme";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    const digits = mobile.replace(/\D/g, "");
    if (digits.length < 10) {
      showToast("Please enter a valid 10-digit mobile number", "error");
      return;
    }
    setLoading(true);
    try {
      const fullMobile = `+91${digits}`;
      await api.sendOtp(fullMobile);
      router.push({ pathname: "/(auth)/otp", params: { mobile: fullMobile } });
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Could not send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.surface }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StarsBackground count={60} />
      <View style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/zodiac-logo.png")}
            style={[styles.logo, { tintColor: "#FFFFFF" }]}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: colors.onSurface, fontFamily: fontSerif }]}>ZODIAC</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Know your stars. Understand your day.</Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.onSurfaceSecondary }]}>Mobile Number</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.surfaceTertiary, borderColor: colors.border }]}>
            <Text style={[styles.countryCode, { color: colors.muted }]}>+91</Text>
            <TextInput
              testID="login-mobile-input"
              value={mobile}
              onChangeText={setMobile}
              placeholder="98765 43210"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              maxLength={10}
              style={[styles.input, { color: colors.onSurface }]}
            />
          </View>
          <PrimaryButton
            testID="login-continue-button"
            title="Continue"
            onPress={handleContinue}
            loading={loading}
            style={styles.button}
          />
          <Text style={[styles.footer, { color: colors.muted }]}>
            We&apos;ll send a one-time code via SMS to verify your number.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 28, justifyContent: "space-between" },
  header: { alignItems: "center", gap: 10 },
  logo: { width: 64, height: 64 },
  title: { fontSize: 28, fontWeight: "700", letterSpacing: 5 },
  subtitle: { fontSize: 14, textAlign: "center" },
  form: { gap: 14 },
  label: { fontSize: 13, fontWeight: "600" },
  inputRow: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, paddingHorizontal: 16 },
  countryCode: { fontSize: 16, fontWeight: "600", marginRight: 8 },
  input: { flex: 1, fontSize: 16, paddingVertical: 16 },
  button: { marginTop: 6 },
  footer: { fontSize: 12, textAlign: "center", marginTop: 4 },
});
