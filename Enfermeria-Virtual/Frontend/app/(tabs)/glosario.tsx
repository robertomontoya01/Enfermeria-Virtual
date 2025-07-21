// app/(tabs)/agenda.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function GlosarioScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Glosario de medicinas</Text>
      {/* Aquí iría tu lista de citas, calendario, etc. */}
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
