import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { Lock } from "lucide-react-native";

import { useTheme } from "@/src/theme";

export function LockOverlay({ message = "Start Your Subscription" }: { message?: string }) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <BlurView testID="home-lock-overlay" intensity={40} tint="dark" style={StyleSheet.absoluteFillObject}>
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceSecondary, borderColor: colors.gold }]}>
          <Lock size={22} color={colors.gold} />
        </View>
        <Text style={styles.title}>Your free trial has ended</Text>
        <Pressable
          testID="home-start-subscription-button"
          onPress={() => router.push("/subscription")}
          style={({ pressed }) => [styles.button, { backgroundColor: colors.gold }, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>{message}</Text>
        </Pressable>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 20 },
  iconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
  title: { color: "#FFFFFF", fontSize: 15, fontWeight: "600", textAlign: "center" },
  button: { paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14 },
  pressed: { opacity: 0.85 },
  buttonText: { color: "#1F1300", fontWeight: "700", fontSize: 14 },
});
