import "react-native-reanimated";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack, Redirect, usePathname, useRouter } from "expo-router";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { SubscriptionProvider, useSubscription } from "@/contexts/SubscriptionContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { isOnboardingComplete } from "@/utils/onboardingStorage";

const FREE_QUESTION_KEY = "beth_free_question_used";

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


function SubscriptionRedirect() {
  const { isSubscribed, loading } = useSubscription();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    const onOnboarding = pathname.startsWith("/onboarding");
    if (onOnboarding) return;
    const onPaywall = pathname === "/paywall";
    if (onPaywall) return;
    if (isSubscribed) return;

    let cancelled = false;
    isOnboardingComplete()
      .then((done) => {
        if (cancelled || !done) return;
        // Only redirect if the free question has already been used
        return AsyncStorage.getItem(FREE_QUESTION_KEY).then((freeUsed) => {
          if (cancelled) return;
          if (freeUsed === "true") {
            console.log("[SubscriptionRedirect] Free question used and not subscribed — redirecting to paywall");
            router.replace("/paywall");
          } else {
            console.log("[SubscriptionRedirect] Free question not yet used — allowing through");
          }
        });
      })
      .catch(() => {
        // On error, be permissive
        console.log("[SubscriptionRedirect] Error checking state — allowing through");
      });
    return () => { cancelled = true; };
  }, [isSubscribed, loading, pathname, router]);

  return null;
}

export default function RootLayout() {
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const pathname = usePathname();
  const networkState = useNetworkState();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    isOnboardingComplete().then((complete) => {
      setOnboardingComplete(complete);
    });
  }, [pathname]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
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

  if (onboardingComplete === null) {
    return null;
  }

  return (
    <SubscriptionProvider>
          <SubscriptionRedirect />
  <DevErrorBoundary>
      <StatusBar style="light" animated />
      <ThemeProvider value={CustomDarkTheme}>
        <SafeAreaProvider>
          <WidgetProvider>
            <GestureHandlerRootView>
              {onboardingComplete === false && pathname !== "/auth" && pathname !== "/paywall" && pathname !== "/auth-popup" && pathname !== "/auth-callback" && <Redirect href="/onboarding" />}

              <Stack>
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />

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
    </SubscriptionProvider>
  );
}
