// app/windows/Registro.tsx
import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { API_BASE_URL } from "../../constants/config";

export default function Registro() {
  const router = useRouter();
  const navigation = useNavigation();

  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const formatDateDDMMYYYY = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    navigation.setOptions({ title: "Crear Cuenta" });
  }, [navigation]);

  const joinUrl = (base: string, path: string) =>
    `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

  const handleRegister = async () => {
    if (
      !nombre ||
      !apellidos ||
      !fechaNacimiento ||
      !email ||
      !telefono ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Error", "Por favor llena todos los campos obligatorios");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    try {
      const Nombre = nombre.trim();
      const Apellidos = apellidos.trim();
      const Email = email.trim().toLowerCase();
      const Telefono = telefono.trim();

      const Fecha_Nacimiento = `${fechaNacimiento.getFullYear()}-${(
        fechaNacimiento.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${fechaNacimiento
        .getDate()
        .toString()
        .padStart(2, "0")}`;

      const payload = {
        Nombre,
        Apellidos,
        Fecha_Nacimiento,
        Email,
        Telefono,
        Password: password,
        Especialidad_id: null,
      };

      const url = `${API_BASE_URL}/api/auth/register`;
      console.log("POST", url, payload);

      const res = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });

      Alert.alert(
        "Éxito",
        res.data?.mensaje || "Usuario registrado correctamente"
      );
      router.replace("/");
    } catch (error: any) {
      console.error(
        "Error al registrar:",
        error?.response?.status,
        error?.response?.data
      );
      Alert.alert(
        "Error",
        error?.response?.data?.error || "No se pudo crear la cuenta"
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear una Cuenta</Text>

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

      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ color: fechaNacimiento ? "#000" : "#999" }}>
          {fechaNacimiento
            ? formatDateDDMMYYYY(fechaNacimiento)
            : "Selecciona tu fecha de nacimiento"}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={fechaNacimiento || new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setFechaNacimiento(selectedDate);
          }}
          maximumDate={new Date()}
        />
      )}

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
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarme</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.backText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e88e5",
    marginBottom: 30,
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
  },
  backText: {
    color: "#1e88e5",
    fontSize: 15,
    fontWeight: "600",
  },
});
