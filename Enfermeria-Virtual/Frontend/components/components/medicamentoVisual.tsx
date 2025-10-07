import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cardCitas } from "../../styles/styles";

interface Medicamento {
  Toma_id: number;
  Medicamento_id: number;
  Nombre_medicamento?: string;
  Dosis?: string;
  Fecha_hora_programada: string;
  Estatus_id: number; // 1 Pendiente, 2 Tomado, 3 Omitido
}

const coloresStatusMed: Record<number, string> = {
  1: "#fbc02d", // Pendiente
  2: "#2e7d32", // Tomado
  3: "#d32f2f", // Omitido
};

const statusBg = (hex: string) => {
  if (hex.startsWith("#") && hex.length === 7) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},0.12)`;
  }
  return "rgba(0,0,0,0.08)";
};

function parseFecha(fecha: string): Date | null {
  if (!fecha) return null;
  const iso = fecha.includes("T") ? fecha : fecha.replace(" ", "T");
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

export default function MedicamentoVisual({
  toma,
  onPress,
}: {
  toma: Medicamento;
  onPress?: () => void;
}) {
  const d = parseFecha(toma.Fecha_hora_programada);
  const fechaFormateada = d
    ? d.toLocaleString("es-MX", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Fecha inválida";

  const Wrapper = (onPress ? TouchableOpacity : View) as React.ComponentType<
    TouchableOpacityProps | ViewProps
  >;

  const colorEstado = coloresStatusMed[toma.Estatus_id] || "#333";
  const pillBg = statusBg(colorEstado);

  return (
    <Wrapper
      {...(onPress
        ? ({ onPress, activeOpacity: 0.85 } as TouchableOpacityProps)
        : {})}
    >
      <View
        style={[
          cardCitas.card,
          {
            padding: 8,
            marginVertical: 1,
            width: "90%",
            alignSelf: "center",
            paddingBottom: 0,
          },
        ]}
      >
        {/* ─── ENCABEZADO ─── */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Fecha con icono */}
          <View style={[cardCitas.header, { alignItems: "center" }]}>
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(142,36,170,0.09)",
                marginRight: 8,
              }}
            >
              <Ionicons name="medkit" size={16} color="#8e24aa" />
            </View>
            <Text style={cardCitas.date}>{fechaFormateada}</Text>
          </View>

          {/* Derecha: ID + estado */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: pillBg,
                marginLeft: 8,
              }}
            >
              <Text style={{ fontWeight: "700", color: colorEstado }}>
                {toma.Estatus_id === 1
                  ? "Pendiente"
                  : toma.Estatus_id === 2
                  ? "Tomado"
                  : "Omitido"}
              </Text>
            </View>
          </View>
        </View>

        {/* Nombre */}
        <Text style={cardCitas.doctor} numberOfLines={1}>
          {toma.Nombre_medicamento ?? `Medicamento #${toma.Medicamento_id}`}
        </Text>

        {/* Dosis */}
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
        >
          <Ionicons
            name="leaf-outline"
            size={16}
            color="#666"
            style={{ marginRight: 6, marginTop: 8 }}
          />
          <Text style={cardCitas.location} numberOfLines={1}>
            {toma.Dosis ? `Dosis: ${toma.Dosis}` : "Dosis no especificada"}
          </Text>
        </View>

        {/* Pie */}
        <Text style={[cardCitas.status, { color: colorEstado }]} />
      </View>
    </Wrapper>
  );
}
