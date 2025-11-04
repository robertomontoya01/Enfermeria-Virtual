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
        placeholderTextColor="#9ca3af"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Dirección"
        placeholderTextColor="#9ca3af"
        value={direccion}
        onChangeText={setDireccion}
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        placeholderTextColor="#9ca3af"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Referencias del lugar (Opcional)"
        placeholderTextColor="#9ca3af"
        value={ubicacion}
        onChangeText={setUbicacion}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
        <Text style={styles.saveButtonText}>Guardar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
    color: "#1c3d5a",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1e1e1e",
    backgroundColor: "#fff",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  saveButton: {
    backgroundColor: "#1c3d5a",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
