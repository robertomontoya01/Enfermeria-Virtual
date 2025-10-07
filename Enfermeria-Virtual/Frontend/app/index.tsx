import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants/config";

export default function Inicio() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor llena todos los campos");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: email.trim(),
        password,
      });

      const { token, usuario } = res.data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("usuario", JSON.stringify(usuario));

      axios.defaults.headers.common.Authorization = `Bearer ${token}`;

      Alert.alert("Bienvenido", usuario.nombre);
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error?.response?.data?.error || "Error en el login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo y título */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.Maintitle}>Enfermería Virtual</Text>
      </View>

      {/* Campos de login */}
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Botón login */}
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </Text>
      </TouchableOpacity>

      {/* Crear cuenta */}
      <TouchableOpacity
        style={styles.createAccountButton}
        onPress={() => router.push("/windows/Registro")}
      >
        <Text style={styles.createAccountText}>Crear una cuenta</Text>
      </TouchableOpacity>
    </View>
  );
}

// === Estilos ===
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "stretch",
    padding: 20,
    paddingTop: 100,
    backgroundColor: "#fff",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  Maintitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#336699",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#336699",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  createAccountButton: {
    padding: 80,
    alignItems: "center",
  },
  createAccountText: {
    color: "#336699",
    fontSize: 16,
    fontWeight: "600",
  },
});
