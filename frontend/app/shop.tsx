import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, ShoppingBag } from "lucide-react-native";

import { useTheme } from "@/src/theme";

const PRODUCTS = [
  {
    id: "1",
    name: "Healing Crystals Set",
    image: "https://images.pexels.com/photos/4040611/pexels-photo-4040611.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    id: "2",
    name: "Gemstone Bracelet",
    image: "https://images.pexels.com/photos/11796909/pexels-photo-11796909.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    id: "3",
    name: "Tarot & Candle Ritual Kit",
    image: "https://images.pexels.com/photos/4790579/pexels-photo-4790579.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    id: "4",
    name: "Mystic Candle Set",
    image: "https://images.pexels.com/photos/36789977/pexels-photo-36789977.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
];

export default function ShopScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} testID="shop-screen">
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}>
        <Pressable testID="shop-back-button" onPress={() => router.back()} style={styles.iconButton} hitSlop={8}>
          <ArrowLeft size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>Zodiac Shop</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        <View style={[styles.banner, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <ShoppingBag size={24} color={colors.gold} />
          <Text style={[styles.bannerText, { color: colors.onSurfaceSecondary }]}>
            Curated gemstones & astro merchandise — launching soon.
          </Text>
        </View>

        <View style={styles.grid}>
          {PRODUCTS.map((p) => (
            <View key={p.id} style={[styles.card, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <Image source={{ uri: p.image }} style={styles.cardImage} />
              <View style={styles.ribbon}>
                <Text style={styles.ribbonText}>Coming Soon</Text>
              </View>
              <Text style={[styles.cardTitle, { color: colors.onSurface }]} numberOfLines={1}>
                {p.name}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1 },
  iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  content: { padding: 20, gap: 20 },
  banner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  bannerText: { flex: 1, fontSize: 13, lineHeight: 18 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14, justifyContent: "space-between" },
  card: { width: "47%", borderRadius: 16, borderWidth: 1, overflow: "hidden", paddingBottom: 10 },
  cardImage: { width: "100%", height: 110 },
  ribbon: { position: "absolute", top: 10, right: -28, backgroundColor: "#9333EA", paddingHorizontal: 30, paddingVertical: 4, transform: [{ rotate: "35deg" }] },
  ribbonText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
  cardTitle: { fontSize: 13, fontWeight: "600", marginTop: 8, marginHorizontal: 10 },
});
