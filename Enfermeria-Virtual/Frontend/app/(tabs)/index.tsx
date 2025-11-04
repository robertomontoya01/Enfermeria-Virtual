import React, { useState } from "react";
import { View, Text, Image } from "react-native";
import { styles } from "../../styles/styles";
import CitasActivas from "../windows/CitasActivas";
import SmallTabs from "../../components/components/smallTabs";
import MedicamentosActivos from "../windows/MedicamentosActivos";

export default function AgendaScreen() {
  const [active, setActive] = useState<"citas" | "medicamentos">("citas");

  return (
    <View style={styles.container}>
      <View>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.Maintitle}>Enfermería Virtual</Text>
      </View>

      <View style={styles.line} />
      <Text style={styles.title}>Recordatorios</Text>

      <SmallTabs
        tabs={[
          { key: "citas", label: "Citas" },
          { key: "medicamentos", label: "Medicamentos" },
        ]}
        activeKey={active}
        onChange={(k) => setActive(k as "citas" | "medicamentos")}
      />

      <View style={{ flex: 1, alignSelf: "stretch" }}>
        {active === "citas" ? <CitasActivas /> : <MedicamentosActivos />}
      </View>
    </View>
  );
}
