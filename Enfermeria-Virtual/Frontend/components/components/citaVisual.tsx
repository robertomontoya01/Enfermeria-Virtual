import React from "react";
import { View, Text } from "react-native";
import { cardCitas } from "../../styles/styles";
import { Ionicons } from "@expo/vector-icons";

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
  1: "#fbc02d", // Pendiente - amarillo
  2: "#2e7d32", // Confirmada - verde
  3: "#d32f2f", // Cancelada - rojo
  4: "#616161", // Rechazada - gris oscuro
};

export default function CitaVisual({ cita }: { cita: Cita }) {
  const fechaFormateada = new Date(cita.Fecha_cita).toLocaleString("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={cardCitas.card}>
      {/* ─── FECHA ─── */}
      <View style={cardCitas.header}>
        <Ionicons
          name="calendar"
          size={18}
          color="#1e88e5"
          style={{ marginRight: 6 }}
        />
        <Text style={cardCitas.date}>{fechaFormateada}</Text>
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
  );
}
