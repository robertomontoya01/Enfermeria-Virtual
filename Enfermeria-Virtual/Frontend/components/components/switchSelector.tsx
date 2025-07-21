import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { switchSelector, cardCitas } from "../../styles/styles";
import CitaVisual from "@/components/components/citaVisual";

export const SwitchSelector = () => {
  const [selectedTab, setSelectedTab] = useState<
    "activas" | "canceladas" | "anteriores"
  >("activas");

  return (
    <View style={switchSelector.container}>
      {/* ─── PESTAÑAS ─── */}
      <View style={switchSelector.tabs}>
        {["activas", "canceladas", "anteriores"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab as any)}
            style={[
              switchSelector.tab,
              selectedTab === tab && switchSelector.activeTab,
            ]}
          >
            <Text
              style={[
                switchSelector.tabText,
                selectedTab === tab && switchSelector.activeText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── CONTENIDO ─── */}

      {selectedTab === "activas" && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={cardCitas.scrollContent}
        >
          <CitaVisual />

          <CitaVisual />
          <CitaVisual />
          <CitaVisual />
          <CitaVisual />
        </ScrollView>
      )}
      {selectedTab === "canceladas" && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={cardCitas.scrollContent}
        ></ScrollView>
      )}
      {selectedTab === "anteriores" && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={cardCitas.scrollContent}
        ></ScrollView>
      )}
    </View>
  );
};
