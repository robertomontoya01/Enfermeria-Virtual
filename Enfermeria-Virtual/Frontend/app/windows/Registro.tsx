import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: "Crear Cuenta" });
  }, [navigation]);

  const formatDateDDMMYYYY = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

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
      setLoading(true);

      const payload = {
        Nombre: nombre.trim(),
        Apellidos: apellidos.trim(),
        Fecha_Nacimiento: `${fechaNacimiento.getFullYear()}-${String(
          fechaNacimiento.getMonth() + 1
        ).padStart(2, "0")}-${String(fechaNacimiento.getDate()).padStart(
          2,
          "0"
        )}`,
        Email: email.trim().toLowerCase(),
        Telefono: telefono.trim(),
        Password: password,
        Especialidad_id: null,
      };

      const url = `${API_BASE_URL}/api/auth/register`;
      const res = await axios.post(url, payload, {
        headers: { "Content-Type": "application/json" },
      });

      Alert.alert(
        "Éxito",
        res.data?.mensaje || "Usuario registrado correctamente"
      );
      router.replace("/");
    } catch (error: any) {
      console.error("Error al registrar:", error?.response?.data);
      Alert.alert(
        "Error",
        error?.response?.data?.error || "No se pudo crear la cuenta"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>Crear una Cuenta</Text>
          <Text style={styles.subtitle}>
            Completa tus datos para registrarte
          </Text>
        </View>

        {/* Card principal */}
        <View style={styles.card}>
          {/* Nombre */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#7a869a"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor="#999"
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          {/* Apellidos */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#7a869a"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Apellidos"
              placeholderTextColor="#999"
              value={apellidos}
              onChangeText={setApellidos}
            />
          </View>

          {/* Fecha de nacimiento */}
          <TouchableOpacity
            style={[styles.inputContainer, styles.dateInput]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color="#7a869a"
              style={styles.inputIcon}
            />
            <Text
              style={[
                styles.dateText,
                { color: fechaNacimiento ? "#000" : "#999" },
              ]}
            >
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

          {/* Email */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#7a869a"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Teléfono */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="call-outline"
              size={20}
              color="#7a869a"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={telefono}
              onChangeText={setTelefono}
            />
          </View>

          {/* Contraseña */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#7a869a"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Confirmar contraseña */}
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#7a869a"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          {/* Botón */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Registrarme</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Link inferior */}
        <TouchableOpacity
          style={styles.footerLink}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.footerText}>
            ¿Ya tienes cuenta?{" "}
            <Text style={styles.footerHighlight}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// === Estilos ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
    marginTop: -60,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2e3a59",
  },
  subtitle: {
    fontSize: 15,
    color: "#7a869a",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fd",
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 14,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e4eb",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },
  dateInput: {
    justifyContent: "space-between",
  },
  dateText: {
    flex: 1,
    fontSize: 15,
  },
  button: {
    backgroundColor: "#2e3a59",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  footerLink: {
    marginTop: 25,
    alignItems: "center",
  },
  footerText: {
    color: "#6b7280",
    fontSize: 15,
  },
  footerHighlight: {
    color: "#2e3a59",
    fontWeight: "700",
  },
});
