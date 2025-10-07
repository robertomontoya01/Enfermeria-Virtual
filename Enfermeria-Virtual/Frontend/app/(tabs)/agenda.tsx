import React from "react";
import { View } from "react-native";
import { styles } from "../../styles/styles";
import { AddButton } from "@/components/components/addButton";
import { SwitchSelector } from "@/components/components/switchSelector";

export default function AgendaScreen() {
  return (
    <View style={styles.container}>
      <SwitchSelector />

      <AddButton />
    </View>
  );
}
