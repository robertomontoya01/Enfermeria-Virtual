// app/Inicio.tsx
import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Inicio() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.replace("/(tabs)"); // o cualquier otra ruta
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bienvenido a Enfermería Virtual</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 20, fontWeight: "bold" },
});
