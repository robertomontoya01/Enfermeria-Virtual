import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import axios from "axios";
import { switchSelector, cardCitas } from "../../styles/styles";
import CitaVisual from "./citaVisual";
import { API_BASE_URL } from "../../constants/config";

interface Cita {
  ID: number;
  Fecha_cita: string;
  DoctorID: number;
  PacienteID: number;
  StatusID: number;
  LaboratorioID?: number | null;

  doctorNombre?: string;
  pacienteNombre?: string;
  laboratorioNombre?: string;
  statusNombre?: string;
}

type UserType = "doctor" | "paciente";

export const SwitchSelector = () => {
  const [usuario, setUsuario] = useState<{
    id: number;
    tipo_usuario: UserType;
  } | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [selectedTab, setSelectedTab] = useState<
    "activas" | "canceladas" | "anteriores"
  >("activas");

  useEffect(() => {
    setUsuario({ id: 3, tipo_usuario: "paciente" });
  }, []);

  useEffect(() => {
    if (!usuario) return;

    axios
      .get(`${API_BASE_URL}/api/citas`, {
        params: { userId: usuario.id, type: usuario.tipo_usuario },
      })
      .then((res) => setCitas(res.data))
      .catch((err) => console.error("Error al obtener citas:", err));
  }, [usuario]);

  const statusMap = {
    activas: [1, 2], // Pendiente y Confirmada
    canceladas: [3], // Cancelada
    anteriores: [4], // Rechazada
  };

  const citasFiltradas = citas.filter((cita) =>
    statusMap[selectedTab].includes(cita.StatusID)
  );

  return (
    <View style={switchSelector.container}>
      {/* Pestañas */}
      <View style={switchSelector.tabs}>
        {["activas", "canceladas", "anteriores"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab as any)}
            style={[
              switchSelector.tab,
              selectedTab === tab && switchSelector.activeTab,
            ]}
          >
            <Text
              style={[
                switchSelector.tabText,
                selectedTab === tab && switchSelector.activeText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de citas */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={cardCitas.scrollContent}
      >
        {citasFiltradas.length === 0 && (
          <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
            No hay citas en esta sección
          </Text>
        )}
        {citasFiltradas.map((cita) => (
          <CitaVisual key={cita.ID} cita={cita} />
        ))}
      </ScrollView>
    </View>
  );
};
