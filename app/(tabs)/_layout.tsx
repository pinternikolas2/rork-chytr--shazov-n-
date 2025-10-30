import { Tabs } from "expo-router";
import { Home, Activity, Swords, Brain, User, UtensilsCrossed } from "lucide-react-native";
import React from "react";
import { Colors } from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";

export default function TabLayout() {
  const { t } = useApp();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border.light,
          borderTopWidth: 0.5,
          elevation: 0,
          shadowColor: Colors.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.dashboard.title,
          tabBarIcon: ({ color, focused }) => (
            <Home 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          title: t.tracking.title,
          tabBarIcon: ({ color, focused }) => (
            <Activity 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: t.nutrition.title,
          tabBarIcon: ({ color, focused }) => (
            <UtensilsCrossed 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="fights"
        options={{
          title: t.fights.title,
          tabBarIcon: ({ color, focused }) => (
            <Swords 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: t.ai.title,
          tabBarIcon: ({ color, focused }) => (
            <Brain 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.settings.title,
          tabBarIcon: ({ color, focused }) => (
            <User 
              color={color} 
              size={focused ? 26 : 24} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}
