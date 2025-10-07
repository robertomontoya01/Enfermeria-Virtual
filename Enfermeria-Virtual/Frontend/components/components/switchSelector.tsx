import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { switchSelector, cardCitas } from "../../styles/styles";
import CitaVisual from "./citaVisual";
import { API_BASE_URL } from "../../constants/config";
import { useFocusEffect } from "@react-navigation/native";

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

export const SwitchSelector = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [selectedTab, setSelectedTab] = useState<
    "activas" | "canceladas" | "anteriores"
  >("activas");
  const [refreshing, setRefreshing] = useState(false);

  const fetchCitas = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${API_BASE_URL}/api/citas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCitas(res.data);
    } catch (err) {
      console.error("Error al obtener citas:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCitas();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCitas();
    setRefreshing(false);
  };

  const today = new Date();

  const citasFiltradas = citas.filter((cita) => {
    const citaFecha = new Date(cita.Fecha_cita);
    switch (selectedTab) {
      case "activas":
        return (
          (cita.StatusID === 1 || cita.StatusID === 2) && citaFecha >= today
        );
      case "canceladas":
        return cita.StatusID === 3 || cita.StatusID === 4;
      case "anteriores":
        return citaFecha < today;
      default:
        return false;
    }
  });

  const tabNames = {
    activas: "Pendientes y Confirmadas",
    canceladas: "Canceladas y Rechazadas",
    anteriores: "Anteriores",
  };

  const tabColors = {
    activas: "#339900",
    canceladas: "#cc3300",
    anteriores: "#ec942c",
  };

  return (
    <View style={switchSelector.container}>
      {/* Pestañas */}
      <View style={switchSelector.tabs}>
        {(["activas", "canceladas", "anteriores"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={[
              switchSelector.tab,
              {
                backgroundColor: tabColors[tab],
                borderRadius: 1,
              },
            ]}
          >
            <Text
              style={[
                switchSelector.tabText,
                { textAlign: "center", color: "#fff", fontWeight: "700" },
              ]}
            >
              {tabNames[tab]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de citas */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={cardCitas.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
