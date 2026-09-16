import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

type Props = { count?: number };

export function StarsBackground({ count = 40 }: Props) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: `${Math.random() * 100}%` as const,
        top: `${Math.random() * 100}%` as const,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.6 + 0.3,
      })),
    [count],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" testID="stars-background">
      {stars.map((s, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            borderRadius: s.size,
            backgroundColor: "#FFFFFF",
            opacity: s.opacity,
          }}
        />
      ))}
    </View>
  );
}
