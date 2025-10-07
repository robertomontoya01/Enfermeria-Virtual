import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Tab = { key: string; label: string };

interface Props {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export default function SmallTabs({ tabs, activeKey, onChange }: Props) {
  return (
    <View style={styles.container}>
      {tabs.map((t) => {
        const active = t.key === activeKey;
        return (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, active && styles.activeTab]}
            onPress={() => onChange(t.key)}
            activeOpacity={0.9}
          >
            <Text style={[styles.tabText, active && styles.activeText]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    padding: 4,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    margin: 20,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: "#1e88e5",
    shadowColor: "#1e88e5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  activeText: {
    color: "#fff",
    fontWeight: "700",
  },
});
