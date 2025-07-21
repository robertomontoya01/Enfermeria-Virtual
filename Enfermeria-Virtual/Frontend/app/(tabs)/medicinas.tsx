// app/(tabs)/agenda.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function MedicinasScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medicinas</Text>
      {/* Aquí iría tu lista de citas y calendario. */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
});
