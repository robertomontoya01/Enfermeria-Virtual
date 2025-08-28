import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#F06543",
        tabBarInactiveTintColor: "#313638",
        animation: "fade",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarLabel: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: "Agenda",
          tabBarLabel: "Agenda",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="registro"
        options={{
          title: "Registro",
          tabBarLabel: "Registro",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="medicinas"
        options={{
          title: "Medicinas",
          tabBarLabel: "Medicinas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bed" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="opciones"
        options={{
          title: "Opciones",
          tabBarLabel: "Opciones",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="options" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
