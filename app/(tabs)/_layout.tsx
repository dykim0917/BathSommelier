import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { ACCENT, APP_BG_BASE, CARD_BORDER, TEXT_PRIMARY, TEXT_SECONDARY } from '@/src/data/colors';
import { ui } from '@/src/theme/ui';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: TEXT_SECONDARY,
        tabBarStyle: ui.tabBarStyle,
        headerStyle: {
          backgroundColor: APP_BG_BASE,
          borderBottomColor: CARD_BORDER,
          borderBottomWidth: 1,
        },
        headerTintColor: TEXT_PRIMARY,
        headerTitleStyle: {
          fontWeight: '700',
          letterSpacing: 0.2,
        },
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 2,
        },
        tabBarBackground: () => null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="tint" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '기록',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calendar" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="cog" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
