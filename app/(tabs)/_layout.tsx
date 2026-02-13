import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

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
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#A1A1AA',
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.85)',
          borderTopColor: 'rgba(0,0,0,0.06)',
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: '#F2F0F7',
        },
        headerTintColor: '#1C1C1E',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '오늘의 케어',
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
