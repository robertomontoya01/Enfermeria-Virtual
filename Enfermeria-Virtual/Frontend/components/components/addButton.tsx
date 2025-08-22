// components/addButton.tsx
import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { addButton } from "../../styles/styles";
import { useRouter } from "expo-router"; // ✅

export const AddButton = () => {
  const router = useRouter(); // ✅

  return (
    <TouchableOpacity
      style={addButton.floatingButton}
      onPress={() => router.push("/windows/FormularioCita")}
      activeOpacity={0.75}
    >
      <Ionicons name="add" size={35} color="#fff" />
    </TouchableOpacity>
  );
};
