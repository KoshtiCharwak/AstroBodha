import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";

import { PrimaryButton } from "@/src/components/PrimaryButton";
import { StarsBackground } from "@/src/components/StarsBackground";
import { ApiError, api } from "@/src/api/client";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";
import { useTheme } from "@/src/theme";

export default function OtpScreen() {
  const { mobile } = useLocalSearchParams<{ mobile: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { login } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(30);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const handleResend = async () => {
    try {
      await api.sendOtp(mobile);
      setResendIn(30);
      showToast("OTP resent", "success");
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Could not resend OTP", "error");
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      showToast("Enter the 6-digit code", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await api.verifyOtp(mobile, code);
      if (res.is_new_user) {
        router.replace({ pathname: "/(auth)/signup", params: { signupToken: res.signup_token!, mobile } });
      } else {
        await login(res.token!, res.user);
        router.replace("/home");
      }
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Invalid OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.surface }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StarsBackground count={40} />
      <View style={{ paddingTop: insets.top + 16 }}>
        <Pressable testID="otp-back-button" onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <ArrowLeft size={22} color={colors.onSurface} />
        </Pressable>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.onSurface }]}>Enter OTP</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>We sent a 6-digit code to {mobile}</Text>

        <TextInput
          testID="otp-input"
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="------"
          placeholderTextColor={colors.muted}
          style={[
            styles.otpInput,
            { color: colors.onSurface, borderColor: colors.border, backgroundColor: colors.surfaceTertiary },
          ]}
        />

        <PrimaryButton
          testID="otp-verify-button"
          title="Verify & Continue"
          onPress={handleVerify}
          loading={loading}
          style={styles.button}
        />

        <Pressable testID="otp-resend-button" onPress={handleResend} disabled={resendIn > 0} style={styles.resend} hitSlop={8}>
          <Text style={[styles.resendText, { color: resendIn > 0 ? colors.muted : colors.brandTertiary }]}>
            {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend OTP"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginLeft: 16 },
  content: { flex: 1, paddingHorizontal: 28, paddingTop: 20, gap: 16 },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 14 },
  otpInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 18,
    fontSize: 24,
    letterSpacing: 12,
    textAlign: "center",
    marginTop: 12,
  },
  button: { marginTop: 8 },
  resend: { alignItems: "center", marginTop: 8 },
  resendText: { fontSize: 13, fontWeight: "600" },
});
