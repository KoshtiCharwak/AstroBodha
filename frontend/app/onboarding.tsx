import { useEffect } from "react";
import { Image, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function OnboardingScreen() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/home"), 3000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <Pressable testID="onboarding-screen" style={styles.container} onPress={() => router.replace("/home")}>
      <Image source={require("../assets/images/how-it-works-bg.jpg")} style={styles.image} resizeMode="cover" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080816" },
  image: { flex: 1, width: "100%" },
});
