import type { ReactNode } from "react";
import { StyleSheet, View, type ViewProps, type ViewStyle } from "react-native";

import { useTheme } from "@/src/theme";

type Props = ViewProps & { children?: ReactNode; style?: ViewStyle };

export function GlassCard({ style, children, ...rest }: Props) {
  const { colors } = useTheme();
  return (
    <View
      {...rest}
      style={[styles.card, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    overflow: "hidden",
  },
});
