import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Star } from "lucide-react-native";

import { ZODIAC_ORDER, ZODIAC_SYMBOLS } from "@/src/utils/zodiac";

const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 14;

export function ZodiacHeroIllustration() {
  const glyphPositions = useMemo(
    () =>
      ZODIAC_ORDER.map((sign, i) => {
        const angle = (i / ZODIAC_ORDER.length) * Math.PI * 2 - Math.PI / 2;
        const x = CENTER + RADIUS * Math.cos(angle) - 10;
        const y = CENTER + RADIUS * Math.sin(angle) - 10;
        return { sign, x, y };
      }),
    [],
  );

  return (
    <View style={styles.container} testID="zodiac-hero-illustration">
      <View style={[styles.ring, { width: SIZE, height: SIZE, borderRadius: SIZE / 2 }]} />
      <View style={[styles.ring, { width: SIZE - 44, height: SIZE - 44, borderRadius: (SIZE - 44) / 2 }]} />
      <LinearGradient colors={["#C084FC", "#9333EA", "#3B0764"]} style={styles.planet} />
      <Star size={14} color="#FBBF24" fill="#FBBF24" style={styles.starTop} />
      <Star size={10} color="#C084FC" fill="#C084FC" style={styles.starBottom} />
      {glyphPositions.map(({ sign, x, y }) => (
        <Text key={sign} style={[styles.glyph, { left: x, top: y }]}>
          {ZODIAC_SYMBOLS[sign]}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", borderWidth: 1, borderColor: "rgba(192,132,252,0.25)" },
  planet: {
    width: 72,
    height: 72,
    borderRadius: 36,
    shadowColor: "#9333EA",
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  starTop: { position: "absolute", top: 2, right: 18 },
  starBottom: { position: "absolute", bottom: 14, left: 6 },
  glyph: { position: "absolute", fontSize: 17, color: "#C4B5FD", width: 20, textAlign: "center" },
});
