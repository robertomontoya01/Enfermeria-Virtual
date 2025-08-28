import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";

type RegistroGlucosa = {
  fecha: string;
  paso: string;
  valor: string;
};

const pasos = [
  "Antes del desayuno",
  "Después del desayuno",
  "Antes de la comida",
  "Después de la comida",
  "Antes de la cena",
  "Después de la cena",
];

export default function BitacoraGlucosa() {
  const [diaActual, setDiaActual] = useState(0);
  const [glucosa, setGlucosa] = useState("");
  const [registros, setRegistros] = useState<RegistroGlucosa[]>([]);

  const guardarRegistro = () => {
    if (!glucosa) {
      Alert.alert("Error", "Por favor ingresa un valor de glucosa.");
      return;
    }

    const nuevoRegistro: RegistroGlucosa = {
      fecha: new Date().toLocaleDateString(),
      paso: pasos[diaActual],
      valor: glucosa,
    };

    setRegistros([...registros, nuevoRegistro]);
    setGlucosa("");
    setDiaActual((prev) => (prev + 1) % pasos.length);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Bitácora de Glucosa Capilar</Text>
      <Text style={styles.pasoActual}>Registro: {pasos[diaActual]}</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Valor de glucosa (mg/dL)"
        value={glucosa}
        onChangeText={setGlucosa}
      />

      <Button title="Guardar Registro" onPress={guardarRegistro} />

      <View style={styles.historialContainer}>
        <Text style={styles.titulo}>Historial</Text>
        {registros.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardFecha}>{item.fecha}</Text>
            <Text style={styles.cardPaso}>{item.paso}</Text>
            <Text style={styles.cardValor}>{item.valor} mg/dL</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  titulo: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  pasoActual: { fontSize: 16, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
  },
  historialContainer: {
    marginTop: 20,
  },

  card: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardFecha: {
    fontSize: 12,
    color: "#555",
    marginBottom: 4,
  },

  cardPaso: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },

  cardValor: {
    fontSize: 14,
    color: "#222",
  },
});
