import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { ACCENT, APP_BG_BASE, CARD_BORDER, TEXT_PRIMARY, TEXT_SECONDARY } from '@/src/data/colors';
import { ui } from '@/src/theme/ui';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={22} style={{ marginBottom: -3 }} {...props} />;
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
          marginHorizontal: 1,
        },
        tabBarBackground: () => null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="care"
        options={{
          title: '케어',
          tabBarIcon: ({ color }) => <TabBarIcon name="heartbeat" color={color} />,
        }}
      />
      <Tabs.Screen
        name="trip"
        options={{
          title: '트립',
          tabBarIcon: ({ color }) => <TabBarIcon name="map-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="product"
        options={{
          title: '제품',
          tabBarIcon: ({ color }) => <TabBarIcon name="shopping-bag" color={color} />,
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          title: '마이',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
