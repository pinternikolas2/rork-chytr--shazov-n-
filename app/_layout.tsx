import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { SubscriptionProvider, useSubscription } from "@/contexts/SubscriptionContext";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { settings, isLoading: appLoading } = useApp();
  const { hasSeenWelcome, isLoading: subLoading } = useSubscription();
  const segments = useSegments();
  const router = useRouter();

  const isLoading = appLoading || subLoading;

  useEffect(() => {
    if (isLoading) return;

    const currentSegment = segments[0];
    const inTabs = currentSegment === '(tabs)';
    const inAuth = currentSegment === 'profile-setup';
    const inWelcome = currentSegment === 'welcome';
    const inLanguage = currentSegment === 'language-selection';
    const inModal = currentSegment === 'add-meal' || currentSegment === 'subscription' || currentSegment === 'support' || currentSegment === 'privacy' || currentSegment === 'terms' || currentSegment === 'tracking-detail' || currentSegment === 'wellness';
    const isRoot = !currentSegment;

    console.log('[RootLayoutNav] Navigation check:', { 
      hasSeenWelcome, 
      hasCompletedOnboarding: settings.hasCompletedOnboarding, 
      currentSegment,
      isRoot,
      allSegments: segments 
    });

    if (!hasSeenWelcome && !inWelcome && !inLanguage && !inModal) {
      console.log('[RootLayoutNav] Redirecting to welcome - user has not seen welcome screen');
      router.replace('/welcome');
    } else if (hasSeenWelcome && !settings.hasCompletedOnboarding && !inAuth && !inWelcome && !inLanguage && !inModal) {
      console.log('[RootLayoutNav] Redirecting to profile-setup - onboarding not completed');
      router.replace('/profile-setup');
    } else if (hasSeenWelcome && settings.hasCompletedOnboarding && !inTabs && !inModal && !inAuth && !inWelcome && !inLanguage) {
      console.log('[RootLayoutNav] Redirecting to tabs - user is fully onboarded');
      router.replace('/(tabs)');
    }
  }, [isLoading, hasSeenWelcome, settings.hasCompletedOnboarding, segments, router]);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="language-selection" options={{ headerShown: false }} />
      <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="tracking-detail" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen 
        name="add-meal" 
        options={{ 
          presentation: "modal",
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="subscription" 
        options={{ 
          presentation: "modal",
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="support" 
        options={{ 
          presentation: "modal",
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="privacy" 
        options={{ 
          presentation: "modal",
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="terms" 
        options={{ 
          presentation: "modal",
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="wellness" 
        options={{ 
          presentation: "modal",
          headerShown: false
        }} 
      />
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
              <SubscriptionProvider>
                <RootLayoutNav />
              </SubscriptionProvider>
            </AppProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
