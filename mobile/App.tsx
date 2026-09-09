import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import QuizScreen from './src/screens/QuizScreen';
import ResultScreen from './src/screens/ResultScreen';
import BookmarksScreen from './src/screens/BookmarksScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { initStorage } from './src/utils/storage';
import { useSyncBank } from './src/hooks/useSyncBank';

import ErrorBoundary from './src/components/ErrorBoundary';

import type { HistoryEntry } from './src/types';
// In production release builds, disable verbose console logs
if (!__DEV__) {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
}

// ---- Navigation type definitions ----

export type RootStackParamList = {
  Home: undefined;
  Quiz: { category?: string; countryCode?: string; sessionLimit?: number };
  Result: { history: HistoryEntry[]; score: number; total: number };
};

export type TabParamList = {
  HomeTab: undefined;
  Bookmarks: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// ---- Tab icons (emoji-based, no icon library needed) ----
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.65 }}>
      {emoji}
    </Text>
  );
}

// ---- Bottom tab navigator ----
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A3C5E',
          borderTopColor: '#0F2744',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: '#93C5FD',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔖" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

// ---- Root stack (wraps tabs + modal screens) ----
export default function App() {
  useEffect(() => {
    initStorage().catch(console.warn);
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            {/* Main tab container */}
            <Stack.Screen name="Home" component={TabNavigator} />

            {/* Full-screen quiz flow */}
            <Stack.Screen
              name="Quiz"
              component={QuizScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="Result"
              component={ResultScreen}
              options={{ animation: 'fade' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
