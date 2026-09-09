import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSyncBank } from '../../src/hooks/useSyncBank';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.65 }}>
      {emoji}
    </Text>
  );
}

/**
 * Tab layout for the three main sections of the app.
 * useSyncBank() is called here so it runs once when the tabs mount.
 */
export default function TabLayout() {
  // Trigger bank sync whenever the tab bar mounts (app open / resume)
  useSyncBank();

  return (
    <Tabs
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
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔖" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
