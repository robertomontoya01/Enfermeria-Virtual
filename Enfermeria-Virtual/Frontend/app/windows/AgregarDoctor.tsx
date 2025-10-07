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
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellidos"
        value={apellidos}
        onChangeText={setApellidos}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        keyboardType="phone-pad"
        value={telefono}
        onChangeText={setTelefono}
      />

      <TouchableOpacity
        style={[styles.button, saving && { opacity: 0.7 }]}
        onPress={handleCrearDoctor}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? "Guardando..." : "Guardar Doctor"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        disabled={saving}
      >
        <Text style={styles.backText}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "stretch",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e88e5",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#1e88e5",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    marginTop: 20,
    alignSelf: "center",
  },
  backText: {
    color: "#1e88e5",
    fontSize: 15,
    fontWeight: "600",
  },
});
