import React, { useState, useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CitaVisual from "../../components/components/citaVisual";
import { API_BASE_URL } from "../../constants/config";
import { cardCitas } from "../../styles/styles";
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

export default function CitasActivas() {
  const [citas, setCitas] = useState<Cita[]>([]);

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

  // 👇 se dispara cada vez que entras a esta ventana
  useFocusEffect(
    useCallback(() => {
      fetchCitas();
    }, [])
  );

  const today = new Date();

  // Solo pendientes (1) y confirmadas (2) y que la fecha sea >= hoy
  const citasActivas = citas.filter((cita) => {
    const citaFecha = new Date(cita.Fecha_cita);
    return (
      (cita.StatusID === 1 ||
        cita.StatusID === 2 ||
        cita.StatusID === 3 ||
        cita.StatusID === 4) &&
      citaFecha >= today
    );
  });

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={cardCitas.scrollContent}
    >
      {citasActivas.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
          No hay citas activas
        </Text>
      )}
      {citasActivas.map((cita) => (
        <CitaVisual key={cita.ID} cita={cita} />
      ))}
    </ScrollView>
  );
}
