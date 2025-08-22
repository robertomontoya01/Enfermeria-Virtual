// app/Inicio.tsx
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
import { API_BASE_URL } from "../constants/config";

export default function Inicio() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor llena todos los campos");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/login`, {
        email,
        password,
      });
      console.log("Login exitoso:", res.data);

      Alert.alert("Bienvenido", res.data.usuario.nombre);
      router.replace("/(tabs)"); // Redirige a la pantalla principal
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error.response?.data?.error || "Error en el login");
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

      {/* Botón */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
    marginBottom: -15,
  },
  Maintitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e88e5",
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
    backgroundColor: "#1e88e5",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
