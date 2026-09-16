import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell, User } from "lucide-react-native";

import { fontSerif, useTheme } from "@/src/theme";

type Props = { unreadCount?: number };

export function AppHeader({ unreadCount = 0 }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View
      testID="app-header"
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: insets.top + 10 },
      ]}
    >
      <Pressable testID="header-profile-button" onPress={() => router.push("/account")} style={styles.iconButton} hitSlop={8}>
        <View style={[styles.avatarRing, { borderColor: colors.gold }]}>
          <User size={19} color={colors.onSurface} />
        </View>
      </Pressable>

      <Text style={[styles.logo, { color: colors.onSurface, fontFamily: fontSerif }]}>ZODIAC</Text>

      <Pressable
        testID="header-notifications-button"
        onPress={() => router.push("/notifications")}
        style={styles.iconButton}
        hitSlop={8}
      >
        <Bell size={24} color={colors.onSurface} />
        {unreadCount > 0 ? (
          <View testID="header-notifications-badge" style={[styles.badge, { backgroundColor: colors.gold }]} />
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  avatarRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { fontSize: 21, fontWeight: "700", letterSpacing: 3 },
  badge: { position: "absolute", top: 8, right: 8, width: 9, height: 9, borderRadius: 5 },
});
