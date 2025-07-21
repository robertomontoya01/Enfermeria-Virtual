import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useNavigation } from "expo-router"; // 👈 importas desde expo-router

export default function FormularioCita() {
  const [fecha, setFecha] = useState("");
  const [doctor, setDoctor] = useState("");
  const [lugar, setLugar] = useState("");
  const [estado, setEstado] = useState("");

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: "Agregar Cita",
    });
  }, [navigation]);

  const guardarCita = () => {
    if (!fecha || !doctor || !lugar || !estado) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }
    Alert.alert("Éxito", "Cita guardada correctamente");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Fecha (ej. 2025-07-01 11:30)</Text>
      <TextInput
        style={styles.input}
        value={fecha}
        onChangeText={setFecha}
        placeholder="Fecha"
      />

      <Text style={styles.label}>Doctor</Text>
      <TextInput
        style={styles.input}
        value={doctor}
        onChangeText={setDoctor}
        placeholder="Doctor"
      />

      <Text style={styles.label}>Lugar</Text>
      <TextInput
        style={styles.input}
        value={lugar}
        onChangeText={setLugar}
        placeholder="Lugar"
      />

      <Text style={styles.label}>Estado</Text>
      <TextInput
        style={styles.input}
        value={estado}
        onChangeText={setEstado}
        placeholder="Estado (CONFIRMADA, CANCELADA)"
      />

      <View style={styles.boton}>
        <Button title="Guardar Cita" onPress={guardarCita} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    padding: 8,
  },
  boton: {
    marginTop: 24,
  },
});
