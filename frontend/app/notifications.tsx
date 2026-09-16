import { useEffect } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bell, Flame, Sparkles, User as UserIcon } from "lucide-react-native";
import type { ComponentType } from "react";

import { api } from "@/src/api/client";
import { useTheme } from "@/src/theme";
import { timeAgo } from "@/src/utils/zodiac";

const ICON_MAP: Record<string, ComponentType<{ size?: number; color?: string }>> = {
  daily_prediction: Sparkles,
  streak: Flame,
  subscription: Bell,
  account: UserIcon,
  reminder: Bell,
};

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["notifications"], queryFn: api.getNotifications });

  useEffect(() => {
    api
      .markNotificationsRead()
      .then(() => queryClient.invalidateQueries({ queryKey: ["notifications-unread"] }))
      .catch(() => {});
  }, [queryClient]);

  const notifications = data?.notifications ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} testID="notifications-screen">
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Pressable testID="notifications-back-button" onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <ArrowLeft size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Notifications</Text>
        <View style={styles.iconButton} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty} testID="notifications-empty-state">
              <Bell size={32} color={colors.muted} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>No notifications yet</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const Icon = ICON_MAP[item.type] ?? Bell;
          return (
            <View
              testID={`notification-item-${item.id}`}
              style={[
                styles.item,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                !item.read && { borderColor: colors.gold },
              ]}
            >
              <View style={[styles.itemIcon, { backgroundColor: colors.surfaceTertiary }]}>
                <Icon size={18} color={colors.gold} />
              </View>
              <View style={styles.itemBodyCol}>
                <Text style={[styles.itemTitle, { color: colors.onSurface }]}>{item.title}</Text>
                <Text style={[styles.itemBody, { color: colors.muted }]}>{item.body}</Text>
                <Text style={[styles.itemTime, { color: colors.muted }]}>{timeAgo(item.created_at)}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1 },
  iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  list: { padding: 20, gap: 12 },
  item: { flexDirection: "row", gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  itemIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  itemBodyCol: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: "700" },
  itemBody: { fontSize: 13, marginTop: 3, lineHeight: 18 },
  itemTime: { fontSize: 11, marginTop: 6 },
  empty: { alignItems: "center", gap: 12, marginTop: 80 },
  emptyText: { fontSize: 14 },
});
