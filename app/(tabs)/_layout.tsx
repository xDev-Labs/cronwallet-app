import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4A3DFF",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          height: 80,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="(stack)"
        options={{
          title: "Home",
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
