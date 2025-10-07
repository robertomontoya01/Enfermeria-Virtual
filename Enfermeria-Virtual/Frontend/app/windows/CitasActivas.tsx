import React, { useState, useCallback, useMemo } from "react";
import { Text, ScrollView, RefreshControl } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CitaVisual from "../../components/components/citaVisual";
import { API_BASE_URL } from "../../constants/config";
import { cardCitas } from "../../styles/styles";
import { useFocusEffect } from "@react-navigation/native";

const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

type CitaRaw = Omit<Cita, "StatusID"> & { StatusID: number | string };

const ACTIVE_STATUSES = new Set([1, 2]);

function parseFechaFlexible(dt: string): Date {
  if (!dt) return new Date("1970-01-01");
  if (dt.includes("T")) return new Date(dt);
  const [datePart, timePart = "00:00:00"] = dt.split(" ");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm, ss] = timePart.split(":").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, ss ?? 0);
}

export default function CitasActivas() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCitas = useCallback(async () => {
    try {
      const res = await api.get("/api/citas");
      const normalizadas: Cita[] = (res.data as CitaRaw[]).map((c) => ({
        ...c,
        StatusID: Number(c.StatusID),
      }));
      setCitas(normalizadas);
    } catch (err) {
      console.error("Error al obtener citas:", err);
      setCitas([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCitas();
    }, [fetchCitas])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCitas();
    setRefreshing(false);
  }, [fetchCitas]);

  const citasActivas = useMemo(() => {
    const now = new Date();
    return (citas || []).filter((c) => {
      const fecha = parseFechaFlexible(String(c.Fecha_cita));
      return ACTIVE_STATUSES.has(c.StatusID) && fecha >= now;
    });
  }, [citas]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={cardCitas.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {citasActivas.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
          No hay citas activas
        </Text>
      ) : (
        citasActivas.map((cita) => <CitaVisual key={cita.ID} cita={cita} />)
      )}
    </ScrollView>
  );
}
