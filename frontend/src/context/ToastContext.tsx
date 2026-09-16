// Lightweight global toast, replaces Alert() everywhere in the app per
// design guidelines. Mounted once in app/_layout.tsx.
import { createContext, useCallback, useContext, useRef, useState, type PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CheckCircle2, Info, XCircle } from "lucide-react-native";

type ToastType = "success" | "error" | "info";
type ToastState = { id: number; message: string; type: ToastType } | null;

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastState>(null);
  const opacity = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const id = Date.now();
      setToast({ id, message, type });
      opacity.value = withTiming(1, { duration: 200 });
      timerRef.current = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 250 });
        setTimeout(() => setToast(null), 260);
      }, 2600);
    },
    [opacity],
  );

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const Icon = toast?.type === "success" ? CheckCircle2 : toast?.type === "error" ? XCircle : Info;
  const tint = toast?.type === "success" ? "#22C55E" : toast?.type === "error" ? "#F87171" : "#C084FC";

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <Animated.View
          testID="global-toast"
          pointerEvents="none"
          style={[styles.container, { bottom: insets.bottom + 24 }, animatedStyle]}
        >
          <View style={[styles.toast, { borderColor: tint }]}>
            <Icon size={18} color={tint} />
            <Text style={styles.text} numberOfLines={2}>
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#181438",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  text: {
    color: "#FFFFFF",
    fontSize: 14,
    flexShrink: 1,
  },
});
