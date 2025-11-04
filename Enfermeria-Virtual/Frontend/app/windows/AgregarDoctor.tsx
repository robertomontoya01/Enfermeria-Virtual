import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../../constants/config";

export default function AgregarDoctor() {
  const router = useRouter();
  const navigation = useNavigation();

  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: "Agregar Doctor" });
  }, [navigation]);

  const handleCrearDoctor = async () => {
    const Nombre = nombre.trim();
    const Apellidos = apellidos.trim();
    const Email = email.trim();
    const Telefono = telefono.trim();

    if (!Nombre || !Apellidos || !Email || !Telefono) {
      Alert.alert("Error", "Por favor llena todos los campos obligatorios");
      return;
    }

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("token");

      const payload = { Nombre, Apellidos, Email, Telefono };

      const res = await axios.post(
        `${API_BASE_URL}/api/auth/register-doctor`,
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      const nuevoId = res.data?.userId || res.data?.id || res.data?.insertId;
      const nombreCompleto = `${Nombre} ${Apellidos}`.trim();

      Alert.alert("Éxito", res.data?.mensaje || "Doctor creado correctamente", [
        {
          text: "OK",
          onPress: () =>
            router.replace({
              pathname: "/windows/FormularioCita",
              params: {
                docId: String(nuevoId),
                docNombre: nombreCompleto,
                ts: Date.now().toString(),
              },
            }),
        },
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Error",
        error?.response?.data?.error ||
          "No se pudo crear el doctor. Verifica que el email no exista."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrar Doctor</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        placeholderTextColor="#9ca3af"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellidos"
        placeholderTextColor="#9ca3af"
        value={apellidos}
        onChangeText={setApellidos}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#9ca3af"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        keyboardType="phone-pad"
        placeholderTextColor="#9ca3af"
        value={telefono}
        onChangeText={setTelefono}
      />

      <TouchableOpacity
        style={[styles.saveButton, saving && { opacity: 0.7 }]}
        onPress={handleCrearDoctor}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "Guardando..." : "Guardar Doctor"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={saving}
      >
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1c3d5a",
    marginBottom: 24,
    textAlign: "center",
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
  cancelButton: {
    marginTop: 16,
    alignSelf: "center",
  },
  cancelText: {
    color: "#1c3d5a",
    fontWeight: "600",
    fontSize: 15,
  },
});
