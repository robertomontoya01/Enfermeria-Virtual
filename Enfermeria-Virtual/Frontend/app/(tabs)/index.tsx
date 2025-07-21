// app/(tabs)/agenda.tsx
import React from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { styles, cardCitas } from "../../styles/styles";
import CitaVisual from "@/components/components/citaVisual";

export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <View>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
        />{" "}
        <Text style={styles.Maintitle}>Enfermeria Virtual</Text>
      </View>
      <View style={styles.line} />
      <Text style={styles.title}>Proximas citas</Text>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={cardCitas.scrollContent}
      ></ScrollView>
    </View>
  );
}
