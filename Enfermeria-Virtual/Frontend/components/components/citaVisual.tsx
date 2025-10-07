import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { cardCitas } from "../../styles/styles";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface Cita {
  ID: number;
  Fecha_cita: string;
  DoctorID: number;
  doctorNombre?: string;
  laboratorioNombre?: string;
  StatusID: number;
  statusNombre?: string;
}

const coloresStatus: Record<number, string> = {
  1: "#fbc02d", // Pendiente
  2: "#2e7d32", // Confirmada
  3: "#d32f2f", // Cancelada
  4: "#616161", // Rechazada
};

export default function CitaVisual({ cita }: { cita: Cita }) {
  const router = useRouter();

  const fechaFormateada = new Date(cita.Fecha_cita).toLocaleString("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "/windows/DetalleCita",
          params: { id: String(cita.ID) },
        })
      }
    >
      <View style={cardCitas.card}>
        {/* ─── ENCABEZADO (Fecha + ID) ─── */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Fecha */}
          <View style={cardCitas.header}>
            <Ionicons
              name="calendar"
              size={18}
              color="#1e88e5"
              style={{ marginRight: 6 }}
            />
            <Text style={cardCitas.date}>{fechaFormateada}</Text>
          </View>

          {/* Badge con Cita ID */}
          <View
            style={{
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 6,
            }}
          >
            <Text style={cardCitas.id}>ID: {cita.ID}</Text>
          </View>
        </View>

        {/* ─── DOCTOR ─── */}
        <Text style={cardCitas.doctor}>
          {cita.doctorNombre
            ? `Dr. ${cita.doctorNombre}`
            : `Doctor ID: ${cita.DoctorID}`}
        </Text>

        {/* ─── LABORATORIO ─── */}
        <Text style={cardCitas.location}>
          {cita.laboratorioNombre || "Laboratorio no asignado"}
        </Text>

        {/* ─── ESTADO ─── */}
        <Text
          style={[
            cardCitas.status,
            { color: coloresStatus[cita.StatusID] || "#000" },
          ]}
        >
          {cita.statusNombre || `Status ID: ${cita.StatusID}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
