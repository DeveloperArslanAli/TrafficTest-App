import { Redirect } from 'expo-router';

/**
 * Root index: redirect immediately to the main app tabs.
 * expo-router requires this file to exist at app/index.tsx.
 */
export default function Index() {
  return <Redirect href="/(tabs)/home" />;
}
