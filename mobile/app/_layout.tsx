import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { initStorage } from '../src/utils/storage';
import ErrorBoundary from '../src/components/ErrorBoundary';

/**
 * Root layout for the entire Expo Router app.
 * Wraps everything in SafeAreaProvider and sets up the root Stack.
 * Initialises the AsyncStorage cache on first mount.
 */
export default function RootLayout() {
  useEffect(() => {
    // Warm the in-memory storage cache from AsyncStorage before
    // any screen reads question bank data synchronously.
    initStorage().catch(console.warn);
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="quiz"
            options={{ headerShown: false, animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="result"
            options={{ headerShown: false, animation: 'fade' }}
          />
        </Stack>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
