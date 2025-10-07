import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../../constants/config";
import MedicamentoVisual from "@/components/components/medicamentoVisual";

type Toma = {
  Toma_id: number;
  Medicamento_id: number;
  Nombre_medicamento?: string;
  Dosis?: string;
  Fecha_hora_programada: string;
  Estatus_id: number;
  Observaciones?: string | null;
};

export default function MedicamentosActivos() {
  const [data, setData] = useState<Toma[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);

        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/api/tomas`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        const payload: Toma[] = Array.isArray(res.data)
          ? res.data
          : res.data?.tomas ?? res.data?.data ?? res.data?.rows ?? [];

        // Normaliza fecha a ISO si viene con espacio
        setData(
          (payload || []).map((t) => ({
            ...t,
            Fecha_hora_programada: t.Fecha_hora_programada.includes("T")
              ? t.Fecha_hora_programada
              : t.Fecha_hora_programada.replace(" ", "T"),
          }))
        );
      } catch (e: any) {
        setErr(
          e?.response?.data?.message ||
            "No se pudieron cargar los medicamentos."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const proximas = useMemo(() => {
    const now = Date.now();
    return (data || [])
      .filter(
        (t) =>
          t.Estatus_id === 1 &&
          new Date(t.Fecha_hora_programada).getTime() >= now
      )
      .sort(
        (a, b) =>
          new Date(a.Fecha_hora_programada).getTime() -
          new Date(b.Fecha_hora_programada).getTime()
      );
  }, [data]);

  if (loading) return <ActivityIndicator />;
  if (err) return <Text style={{ color: "red" }}>{err}</Text>;
  if (proximas.length === 0)
    return (
      <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
        No hay tomas próximas.
      </Text>
    );

  return (
    <FlatList
      data={proximas}
      keyExtractor={(item) => String(item.Toma_id)}
      renderItem={({ item }) => <MedicamentoVisual toma={item} />}
      contentContainerStyle={{
        paddingHorizontal: 8,
        paddingBottom: 16,
      }}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      ListHeaderComponent={<View style={{ height: 8 }} />}
      ListFooterComponent={<View style={{ height: 8 }} />}
      showsVerticalScrollIndicator={false}
    />
  );
}
