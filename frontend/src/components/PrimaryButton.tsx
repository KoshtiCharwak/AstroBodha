import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "purple" | "gold";
  testID?: string;
  style?: ViewStyle;
};

const GRADIENTS = {
  purple: ["#C084FC", "#9333EA", "#6B21A8"] as const,
  gold: ["#FBBF24", "#F59E0B", "#B45309"] as const,
};

export function PrimaryButton({ title, onPress, loading, disabled, variant = "purple", testID, style }: Props) {
  const textColor = variant === "gold" ? "#1F1300" : "#FFFFFF";
  const isDisabled = disabled || loading;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [styles.wrapper, style, pressed && !isDisabled && styles.pressed, isDisabled && styles.disabled]}
    >
      <LinearGradient colors={GRADIENTS[variant]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 16, overflow: "hidden" },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },
  gradient: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 52,
  },
  text: { fontSize: 16, fontWeight: "700" },
});
