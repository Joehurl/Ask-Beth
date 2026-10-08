import "react-native-reanimated";
import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Alert } from "react-native";
import { useNetworkState } from "expo-network";
import {
  DarkTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const DevErrorBoundary = __DEV__
  ? ErrorBoundary
  : ({ children }: { children: React.ReactNode }) => <>{children}</>;

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

const CustomDarkTheme: Theme = {
  ...DarkTheme,
  dark: true,
  colors: {
    primary: "#C9A84C",
    background: "#0A0A0F",
    card: "#13131A",
    text: "#F5F0E8",
    border: "#2A2A3A",
    notification: "#FF3B30",
  },
};

export default function RootLayout() {
  const networkState = useNetworkState();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  React.useEffect(() => {
    if (
      !networkState.isConnected &&
      networkState.isInternetReachable === false
    ) {
      Alert.alert(
        "You are offline",
        "You can keep using the app. Your changes will be saved locally."
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  return (
    <DevErrorBoundary>
      <StatusBar style="light" animated />
      <ThemeProvider value={CustomDarkTheme}>
        <SafeAreaProvider>
          <WidgetProvider>
            <GestureHandlerRootView>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="chat" options={{ headerShown: false }} />
                <Stack.Screen name="voice" options={{ headerShown: false }} />
                <Stack.Screen name="history" options={{ headerShown: false }} />
                <Stack.Screen name="settings" options={{ headerShown: false }} />
              </Stack>
              <SystemBars style="light" />
            </GestureHandlerRootView>
          </WidgetProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </DevErrorBoundary>
  );
}
