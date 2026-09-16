// Shared date/time picker field: iOS renders a bottom-sheet spinner (matches
// the app's modal/bottom-sheet input pattern), Android uses the native
// dialog, and web (used for the browser preview only — target platforms are
// iOS/Android) falls back to a plain text field since
// @react-native-community/datetimepicker has no web implementation.
import { useState, type ReactNode } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/src/components/PrimaryButton";
import { useTheme } from "@/src/theme";

type Props = {
  testID: string;
  icon: ReactNode;
  value: Date | null;
  placeholder: string;
  mode: "date" | "time";
  maximumDate?: Date;
  displayValue: (d: Date) => string;
  onChange: (d: Date) => void;
};

function formatForInput(d: Date, mode: "date" | "time"): string {
  if (mode === "date") {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function parseInput(text: string, mode: "date" | "time"): Date | null {
  if (mode === "date") {
    const m = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const m = text.match(/^(\d{1,2}):(\d{1,2})$/);
  if (!m) return null;
  const d = new Date();
  d.setHours(Number(m[1]), Number(m[2]), 0, 0);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function DateTimeField({ testID, icon, value, placeholder, mode, maximumDate, displayValue, onChange }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState<Date>(value ?? new Date(mode === "date" ? 1995 : Date.now(), 0, 1));
  const [webText, setWebText] = useState(value ? formatForInput(value, mode) : "");

  const openPicker = () => {
    setDraft(value ?? draft);
    setVisible(true);
  };

  if (Platform.OS === "web") {
    return (
      <TextInput
        testID={testID}
        value={webText}
        onChangeText={(text) => {
          setWebText(text);
          const parsed = parseInput(text, mode);
          if (parsed) onChange(parsed);
        }}
        placeholder={mode === "date" ? "YYYY-MM-DD" : "HH:MM (24hr)"}
        placeholderTextColor={colors.muted}
        style={[
          styles.webInput,
          { borderColor: colors.border, backgroundColor: colors.surfaceTertiary, color: colors.onSurface },
        ]}
      />
    );
  }

  const trigger = (
    <Pressable
      testID={testID}
      onPress={openPicker}
      style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.surfaceTertiary }]}
    >
      {icon}
      <Text style={[styles.inputRowText, { color: value ? colors.onSurface : colors.muted }]}>
        {value ? displayValue(value) : placeholder}
      </Text>
    </Pressable>
  );

  if (Platform.OS === "ios") {
    return (
      <>
        {trigger}
        <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
          <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
            <Pressable
              style={[styles.sheet, { backgroundColor: colors.surfaceSecondary, paddingBottom: insets.bottom + 16 }]}
              onPress={(e) => e.stopPropagation()}
            >
              <DateTimePicker
                value={draft}
                mode={mode}
                maximumDate={maximumDate}
                display="spinner"
                textColor={colors.onSurface}
                onChange={(_, selected) => selected && setDraft(selected)}
              />
              <PrimaryButton
                testID={`${testID}-done`}
                title="Done"
                onPress={() => {
                  onChange(draft);
                  setVisible(false);
                }}
                style={styles.doneButton}
              />
            </Pressable>
          </Pressable>
        </Modal>
      </>
    );
  }

  return (
    <>
      {trigger}
      {visible ? (
        <DateTimePicker
          value={draft}
          mode={mode}
          maximumDate={maximumDate}
          display="default"
          onChange={(_, selected) => {
            setVisible(false);
            if (selected) onChange(selected);
          }}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputRowText: { fontSize: 15, flex: 1 },
  webInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, alignItems: "stretch" },
  doneButton: { marginTop: 8 },
});
