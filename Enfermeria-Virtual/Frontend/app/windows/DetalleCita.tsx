import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router"; // 👈 añadido useNavigation
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../../constants/config";
import { cardCitas } from "../../styles/styles";

type CitaDetalle = {
  ID: number;
  Fecha_cita: string;
  Motivo?: string | null;
  DoctorID: number;
  doctorNombre?: string;
  LaboratorioID?: number | null;
  laboratorioNombre?: string | null;
  laboratorioDireccion?: string | null;
  laboratorioTelefono?: string | null;
  StatusID: number;
  statusNombre?: string;
};

const coloresStatus: Record<number, string> = {
  1: "#fbc02d", // Pendiente
  2: "#2e7d32", // Confirmada
  3: "#d32f2f", // Cancelada
  4: "#616161", // Rechazada
};

const tenue = (hex: string, alpha = 0.12) => {
  if (!hex.startsWith("#") || hex.length !== 7) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

function parseFechaFlexible(dt: string): Date {
  if (!dt) return new Date("1970-01-01");
  if (dt.includes("T")) return new Date(dt);
  const [datePart, timePart = "00:00:00"] = dt.split(" ");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm, ss] = timePart.split(":").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, ss ?? 0);
}

export default function DetalleCita() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();

  const [cita, setCita] = useState<CitaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: "Detalle de la Cita" });
  }, [navigation]);

  const api = useMemo(() => {
    const instance = axios.create({ baseURL: API_BASE_URL });
    instance.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return instance;
  }, []);

  const fetchDetalle = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/citas/${id}`);
      setCita(res.data as CitaDetalle);
    } catch (e: any) {
      console.error("Error al cargar cita:", e?.response?.data || e?.message);
      Alert.alert("Error", "No se pudo cargar el detalle de la cita");
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  useEffect(() => {
    fetchDetalle();
  }, [fetchDetalle]);

  const fechaFormateada = useMemo(() => {
    if (!cita?.Fecha_cita) return "";
    const f = parseFechaFlexible(cita.Fecha_cita);
    return f.toLocaleString("es-MX", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [cita?.Fecha_cita]);

  const abrirMaps = (direccion?: string | null) => {
    if (!direccion) {
      Alert.alert(
        "Sin dirección",
        "Esta cita no tiene dirección de laboratorio."
      );
      return;
    }
    const q = encodeURIComponent(direccion);
    const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
    Linking.openURL(url).catch(() => {
      if (Platform.OS === "ios") Linking.openURL(`maps://?q=${q}`);
    });
  };

  const cambiarStatus = async (nuevoStatus: number) => {
    if (!id) return;
    setSaving(true);
    try {
      await api.patch(`/api/citas/${id}/status`, { StatusID: nuevoStatus });
      await fetchDetalle();
    } catch (e: any) {
      console.error(
        "Error al actualizar status:",
        e?.response?.data || e?.message
      );
      Alert.alert(
        "Error",
        e?.response?.data?.error || "No se pudo actualizar el estatus"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={sx.loading}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8, color: "#444" }}>Cargando detalle...</Text>
      </View>
    );
  }

  if (!cita) {
    return (
      <View style={sx.loading}>
        <Text>No se encontró la cita.</Text>
      </View>
    );
  }

  const colorEstado = coloresStatus[cita.StatusID] || "#424242";
  const bgEstado = tenue(colorEstado);

  return (
    <ScrollView contentContainerStyle={sx.container}>
      <View style={[cardCitas.card, sx.cardLifted]}>
        <View style={sx.headerRow}>
          <View style={sx.chip}>
            <Ionicons name="calendar" size={16} color="#1e88e5" />
          </View>
          <Text style={[cardCitas.date, { flex: 1 }]} numberOfLines={2}>
            {fechaFormateada}
          </Text>

          <View style={[sx.pill, { backgroundColor: bgEstado }]}>
            <Text style={[sx.pillText, { color: colorEstado }]}>
              {cita.statusNombre || `Status ID: ${cita.StatusID}`}
            </Text>
          </View>
        </View>
        <View style={sx.divider} />

        {/* Doctor */}
        <View style={sx.row}>
          <Ionicons name="person-circle-outline" size={18} color="#555" />
          <Text style={sx.rowLabel}>Doctor</Text>
        </View>
        <Text style={cardCitas.doctor} numberOfLines={2}>
          {cita.doctorNombre
            ? `Dr. ${cita.doctorNombre}`
            : `Doctor ID: ${cita.DoctorID}`}
        </Text>

        {/* Laboratorio */}
        <View style={[sx.row, { marginTop: 12 }]}>
          <Ionicons name="flask-outline" size={18} color="#555" />
          <Text style={sx.rowLabel}>Laboratorio</Text>
        </View>
        <Text style={cardCitas.location} numberOfLines={2}>
          {cita.laboratorioNombre || "No asignado"}
        </Text>

        {/* Dirección + Maps */}
        <View style={{ marginTop: 10 }}>
          <View style={sx.row}>
            <Ionicons name="location-outline" size={18} color="#555" />
            <Text style={sx.rowLabel}>Dirección</Text>
          </View>

          {cita.laboratorioDireccion ? (
            <View style={sx.addressWrap}>
              <Text style={sx.addressText} numberOfLines={3}>
                {cita.laboratorioDireccion}
              </Text>
              <TouchableOpacity
                style={sx.mapBtn}
                onPress={() => abrirMaps(cita.laboratorioDireccion)}
              >
                <Ionicons name="map-outline" size={16} color="#1e88e5" />
                <Text style={sx.mapBtnText}>Abrir en Maps</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={[cardCitas.location, { color: "#777" }]}>
              No disponible
            </Text>
          )}

          {!!cita.laboratorioTelefono && (
            <Text style={{ marginTop: 6, color: "#555" }}>
              Tel:{" "}
              <Text style={{ fontWeight: "700" }}>
                {cita.laboratorioTelefono}
              </Text>
            </Text>
          )}
        </View>

        {/* Motivo */}
        {!!cita.Motivo && (
          <>
            <View style={[sx.row, { marginTop: 14 }]}>
              <Ionicons name="document-text-outline" size={18} color="#555" />
              <Text style={sx.rowLabel}>Motivo</Text>
            </View>
            <Text style={{ color: "#444", marginTop: 4 }}>{cita.Motivo}</Text>
          </>
        )}
      </View>

      {/* Acciones  */}
      <View style={sx.actionsCard}>
        <Text style={sx.actionsTitle}>Acciones</Text>

        <View style={sx.actionsGrid}>
          <TouchableOpacity
            style={[
              sx.actionBtn,
              { borderColor: "#fbc02d", backgroundColor: tenue("#fbc02d") },
            ]}
            onPress={() => cambiarStatus(1)}
            disabled={saving}
          >
            <Ionicons name="time-outline" size={18} color="#fbc02d" />
            <Text style={[sx.actionText, { color: "#fbc02d" }]}>Pendiente</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              sx.actionBtn,
              { borderColor: "#2e7d32", backgroundColor: tenue("#2e7d32") },
            ]}
            onPress={() => cambiarStatus(2)}
            disabled={saving}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color="#2e7d32"
            />
            <Text style={[sx.actionText, { color: "#2e7d32" }]}>Confirmar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              sx.actionBtn,
              { borderColor: "#d32f2f", backgroundColor: tenue("#d32f2f") },
            ]}
            onPress={() => cambiarStatus(3)}
            disabled={saving}
          >
            <Ionicons name="close-circle-outline" size={18} color="#d32f2f" />
            <Text style={[sx.actionText, { color: "#d32f2f" }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const sx = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 28,
    backgroundColor: "#f8f9fa",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLifted: {
    borderLeftWidth: 4,
    borderLeftColor: "#1c3d5a",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  chip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(28,61,90,0.12)",
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillText: {
    fontWeight: "700",
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowLabel: {
    fontWeight: "700",
    color: "#333",
    fontSize: 14,
  },
  addressWrap: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  addressText: {
    flexShrink: 1,
    color: "#333",
    fontSize: 14,
  },
  mapBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1c3d5a",
    backgroundColor: "#eaf0f8",
  },
  mapBtnText: {
    color: "#1c3d5a",
    fontWeight: "700",
    fontSize: 13,
  },
  actionsCard: {
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e6ebf2",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  actionsTitle: {
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 8,
    color: "#1c3d5a",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    minWidth: 100,
    justifyContent: "center",
  },
  actionText: {
    fontWeight: "700",
    fontSize: 13,
  },
  backBtn: {
    marginTop: 18,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backText: {
    color: "#1c3d5a",
    fontWeight: "700",
    fontSize: 14,
  },
});
