import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../../constants/config";

export default function AgregarLaboratorio() {
  const router = useRouter();
  const navigation = useNavigation();

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ubicacion, setUbicacion] = useState("");

  useEffect(() => {
    navigation.setOptions({ title: "Agregar Laboratorio" });
  }, [navigation]);

  const handleGuardar = async () => {
    if (!nombre.trim() || !direccion.trim()) {
      Alert.alert("Error", "El nombre y la dirección son obligatorios");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Sesión", "No hay token de autenticación.");
        return;
      }

      const payload = {
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        telefono: telefono.trim() || null,
        ubicacion: ubicacion.trim() || null,
      };

      const res = await axios.post(
        `${API_BASE_URL}/api/laboratorios`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert("Éxito", "Laboratorio agregado correctamente", [
        { text: "OK", onPress: () => router.back() },
      ]);

      setNombre("");
      setDireccion("");
      setTelefono("");
      setUbicacion("");
    } catch (err: any) {
      console.error(
        "Error al guardar laboratorio:",
        err?.response?.data || err?.message
      );
      Alert.alert(
        "Error",
        err?.response?.data?.error || "No se pudo guardar el laboratorio"
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nuevo Laboratorio</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del laboratorio"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Dirección"
        value={direccion}
        onChangeText={setDireccion}
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Referencias del lugar (Opcional)"
        value={ubicacion}
        onChangeText={setUbicacion}
      />

      <TouchableOpacity style={styles.button} onPress={handleGuardar}>
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#1e88e5",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
