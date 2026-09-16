import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { useAuth } from "@/src/context/AuthContext";
import { fontSerif } from "@/src/theme";

const SPLASH_DURATION_MS = 3000;

export default function SplashScreen() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const scale = useSharedValue(1);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    scale.value = withTiming(1.08, { duration: SPLASH_DURATION_MS, easing: Easing.out(Easing.quad) });
    const timer = setTimeout(() => setMinTimeElapsed(true), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [scale]);

  useEffect(() => {
    if (minTimeElapsed && !isLoading && !hasNavigated) {
      setHasNavigated(true);
      router.replace(isAuthenticated ? "/home" : "/(auth)/login");
    }
  }, [minTimeElapsed, isLoading, isAuthenticated, hasNavigated, router]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.container} testID="splash-screen">
      <Animated.Image
        source={require("../assets/images/splash-bg.jpg")}
        style={[styles.background, animatedStyle]}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Image
          source={require("../assets/images/zodiac-logo.png")}
          style={[styles.logo, { tintColor: "#FFFFFF" }]}
          resizeMode="contain"
        />
        <Text style={[styles.title, { fontFamily: fontSerif }]}>ZODIAC</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080816", overflow: "hidden" },
  background: { position: "absolute", width: "100%", height: "100%" },
  overlay: { position: "absolute", width: "100%", height: "100%", backgroundColor: "rgba(8,8,22,0.35)" },
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  logo: { width: 96, height: 96 },
  title: { color: "#FFFFFF", fontSize: 30, fontWeight: "700", letterSpacing: 6 },
});
