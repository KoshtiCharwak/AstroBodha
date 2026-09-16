import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Crown, ShoppingBag, Sparkles } from "lucide-react-native";

import { useTheme } from "@/src/theme";

export function BottomActionBar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom + 10, backgroundColor: colors.surfaceSecondary, borderTopColor: colors.border },
      ]}
    >
      <Pressable testID="bottom-nav-ask-astrologer" onPress={() => router.push("/ask-astrologer")} style={styles.sideItem} hitSlop={8}>
        <Sparkles size={22} color={colors.onSurfaceSecondary} />
        <Text style={[styles.label, { color: colors.onSurfaceSecondary }]}>Ask Astrologer</Text>
      </Pressable>

      <Pressable
        testID="bottom-nav-premium-cta"
        onPress={() => router.push("/subscription")}
        style={({ pressed }) => [styles.centerButtonWrapper, pressed && styles.centerPressed]}
        hitSlop={8}
      >
        <View style={[styles.centerButton, { backgroundColor: colors.gold, borderColor: colors.surface }]}>
          <Crown size={26} color="#1F1300" />
        </View>
      </Pressable>

      <Pressable testID="bottom-nav-shop" onPress={() => router.push("/shop")} style={styles.sideItem} hitSlop={8}>
        <ShoppingBag size={22} color={colors.onSurfaceSecondary} />
        <Text style={[styles.label, { color: colors.onSurfaceSecondary }]}>Shop</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  sideItem: { alignItems: "center", gap: 4, width: 84, paddingTop: 6 },
  label: { fontSize: 11, fontWeight: "600" },
  centerButtonWrapper: { alignItems: "center", marginTop: -30 },
  centerPressed: { transform: [{ scale: 0.95 }] },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    shadowColor: "#F59E0B",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
