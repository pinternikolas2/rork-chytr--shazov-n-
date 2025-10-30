import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { settings, isLoading } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inTabs = segments[0] === '(tabs)';
    const inAuth = segments[0] === 'language-selection' || segments[0] === 'onboarding' || segments[0] === 'profile-setup';

    if (!settings.hasCompletedOnboarding && !inAuth) {
      router.replace('/language-selection');
    } else if (settings.hasCompletedOnboarding && !inTabs && !inAuth) {
      router.replace('/(tabs)');
    }
  }, [isLoading, settings.hasCompletedOnboarding, segments, router]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="language-selection" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="tracking-detail" options={{ presentation: "modal" }} />
      <Stack.Screen name="add-meal" options={{ presentation: "modal" }} />
      <Stack.Screen name="subscription" options={{ presentation: "modal" }} />
      <Stack.Screen name="support" options={{ presentation: "modal" }} />
      <Stack.Screen name="privacy" options={{ presentation: "modal" }} />
      <Stack.Screen name="terms" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <AppProvider>
              <RootLayoutNav />
            </AppProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
