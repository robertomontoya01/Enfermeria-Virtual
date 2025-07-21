import React from "react";
import { View, Text } from "react-native";
import { cardCitas } from "../../styles/styles";
import { Ionicons } from "@expo/vector-icons";

export default function CitaVisual() {
  return (
    <View style={cardCitas.card}>
      <View style={cardCitas.header}>
        <Ionicons
          name="calendar"
          size={18}
          color="#1e88e5"
          style={{ marginRight: 6 }}
        />
        <Text style={cardCitas.date}>Lun, 01 Jul 11:30</Text>
      </View>
      <Text style={cardCitas.doctor}>Dra. María Rodríguez</Text>
      <Text style={cardCitas.location}>Laboratorio #1</Text>
      <Text style={[cardCitas.status, { color: "#2e7d32" }]}>CONFIRMADA</Text>
    </View>
  );
}
