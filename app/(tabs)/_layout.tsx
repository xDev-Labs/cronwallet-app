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
        name="index"
        options={{
          title: "Home",
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
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
      {/* Hide other existing screens from tabs */}
      <Tabs.Screen
        name="balance"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="payment-confirm"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="payment-initiate"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="payment-success"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="recipient"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="pay-anyone"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="qr-code"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="scan-qr"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="transaction-details"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
