import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogBox } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/src/components/error-boundary";
import { AuthProvider } from "@/src/context/AuthContext";
import { ToastProvider } from "@/src/context/ToastContext";
import { queryClient } from "@/src/query-client";

// Disable logbox errors etc so that users can see the app
// and agent works as expected.
LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  // One app level ErrorBoundary; a render crash shows a reload screen
  // instead of a blank app.
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <KeyboardProvider>
            <AuthProvider>
              <ToastProvider>
                <StatusBar style="light" />
                <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="onboarding" />
                  <Stack.Screen name="home" />
                  <Stack.Screen name="account" options={{ animation: "slide_from_right" }} />
                  <Stack.Screen name="edit-profile" options={{ animation: "slide_from_right" }} />
                  <Stack.Screen name="notifications" options={{ animation: "slide_from_right" }} />
                  <Stack.Screen name="subscription" options={{ animation: "slide_from_bottom" }} />
                  <Stack.Screen name="ask-astrologer" options={{ animation: "slide_from_right" }} />
                  <Stack.Screen name="shop" options={{ animation: "slide_from_right" }} />
                  <Stack.Screen name="prediction-detail" options={{ animation: "slide_from_right" }} />
                </Stack>
              </ToastProvider>
            </AuthProvider>
          </KeyboardProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
