import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  testIDPrefix: string;
};

export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel,
  destructive,
  onConfirm,
  onCancel,
  testIDPrefix,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel} testID={`${testIDPrefix}-backdrop`}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.surfaceSecondary, paddingBottom: insets.bottom + 20 }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>
          <Pressable
            testID={`${testIDPrefix}-confirm-button`}
            onPress={onConfirm}
            style={[styles.button, { backgroundColor: destructive ? colors.error : colors.brandPrimary }]}
          >
            <Text style={styles.buttonText}>{confirmLabel}</Text>
          </Pressable>
          <Pressable testID={`${testIDPrefix}-cancel-button`} onPress={onCancel} style={styles.cancelButton}>
            <Text style={[styles.cancelText, { color: colors.muted }]}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 8 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "700" },
  message: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  button: { paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  buttonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  cancelButton: { paddingVertical: 12, alignItems: "center" },
  cancelText: { fontSize: 14, fontWeight: "600" },
});
