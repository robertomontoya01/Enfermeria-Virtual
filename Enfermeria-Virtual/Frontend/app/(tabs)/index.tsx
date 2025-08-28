// app/(tabs)/agenda.tsx
import React from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { styles, cardCitas } from "../../styles/styles";
import CitasActivas from "../windows/CitasActivas"; // 👈 importa el componente

export default function AgendaScreen() {
  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.Maintitle}>Enfermería Virtual</Text>
      </View>

      <View style={styles.line} />

      {/* Título */}
      <Text style={styles.title}>Próximas citas</Text>

      {/* Lista de citas activas */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={cardCitas.scrollContent}
      >
        <CitasActivas />
      </ScrollView>
    </View>
  );
}
