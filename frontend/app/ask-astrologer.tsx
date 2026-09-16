import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, MessageCircle } from "lucide-react-native";

import { PrimaryButton } from "@/src/components/PrimaryButton";
import { StarsBackground } from "@/src/components/StarsBackground";
import { useTheme } from "@/src/theme";

export default function AskAstrologerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [notified, setNotified] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} testID="ask-astrologer-screen">
      <StarsBackground count={40} />
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16 }}>
        <Pressable testID="ask-astrologer-back-button" onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <ArrowLeft size={22} color={colors.onSurface} />
        </Pressable>
      </View>
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceSecondary, borderColor: colors.brandTertiary }]}>
          <MessageCircle size={40} color={colors.brandTertiary} />
        </View>
        <Text style={[styles.title, { color: colors.onSurface }]}>Ask Astrologer</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Ask Astrologer is coming soon. Soon you&apos;ll be able to chat 1:1 with a real astrologer for deeper
          personalized guidance.
        </Text>
        <PrimaryButton
          testID="ask-astrologer-notify-button"
          title={notified ? "You're on the list ✓" : "Notify Me When Ready"}
          onPress={() => setNotified(true)}
          disabled={notified}
          style={styles.notifyButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, marginTop: -60 },
  iconWrap: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", marginTop: 24 },
  subtitle: { fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 12 },
  notifyButton: { marginTop: 28, width: "100%" },
});
