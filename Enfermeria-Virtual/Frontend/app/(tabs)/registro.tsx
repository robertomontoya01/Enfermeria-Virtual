import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  FlatList,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as XLSX from "xlsx";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../../constants/config";

type RegistroGlucosa = {
  id?: number;
  fecha: string;
  paso: string;
  valor: number;
  paso_index?: number;
};

type Raw = any;

const pasos = [
  "Antes del desayuno",
  "Después del desayuno",
  "Antes de la comida",
  "Después de la comida",
  "Antes de la cena",
  "Después de la cena",
];

const normalizeRegistro = (r: Raw): RegistroGlucosa => ({
  id: r.id ?? r.ID,
  fecha: (r.fecha ?? r.Fecha ?? "").slice(0, 10),
  paso: r.paso ?? r.Paso ?? "",
  valor: Number(r.valor ?? r.Valor ?? 0),
  paso_index:
    typeof r.paso_index === "number"
      ? r.paso_index
      : pasos.indexOf(r.paso ?? r.Paso ?? ""),
});

function hoyYYYYMMDD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const ANDROID_DOWNLOADS_URI_KEY = "downloadsDirUri";

export default function RegistroGlucosaScreen() {
  const [valor, setValor] = useState<string>("");
  const [registros, setRegistros] = useState<RegistroGlucosa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE_URL}/api/glucosa`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const payload: Raw[] = Array.isArray(data) ? data : data?.rows ?? [];
        setRegistros(payload.map(normalizeRegistro));
      } catch (e) {
        console.log("Error cargando registros", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const diasUnicos = useMemo(() => {
    const set = new Set(registros.map((r) => r.fecha));
    return Array.from(set).sort();
  }, [registros]);

  const pasoIndexActual = useMemo(
    () => diasUnicos.length % pasos.length,
    [diasUnicos.length]
  );
  const pasoActual = pasos[pasoIndexActual];
  const hayRegistroHoy = useMemo(
    () => registros.some((r) => r.fecha === hoyYYYYMMDD()),
    [registros]
  );

  const guardarRegistro = async () => {
    if (hayRegistroHoy) {
      Alert.alert("Ya registrado", "Ya existe un registro para hoy.");
      return;
    }
    const n = Number(valor);
    if (!valor || Number.isNaN(n) || n <= 0) {
      Alert.alert("Valor inválido", "Ingresa un número válido (mg/dL).");
      return;
    }

    const nuevoRegistro: RegistroGlucosa = {
      fecha: hoyYYYYMMDD(),
      paso: pasoActual,
      paso_index: pasoIndexActual,
      valor: n,
    };

    try {
      const token = await AsyncStorage.getItem("token");
      const { data } = await axios.post(
        `${API_BASE_URL}/api/glucosa`,
        nuevoRegistro,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      setRegistros((prev) => [{ ...nuevoRegistro, id: data?.id }, ...prev]);
      setValor("");
      Alert.alert("Éxito", "Registro guardado correctamente.");
    } catch (e: any) {
      console.log("Error POST /api/glucosa", e?.message);
      Alert.alert("Error", "No se pudo guardar el registro.");
    }
  };

  const exportarExcel = async () => {
    if (registros.length === 0) {
      Alert.alert("Sin datos", "No hay registros para exportar.");
      return;
    }

    const rows = registros
      .slice()
      .sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
      .map((r, i) => ({
        "#": i + 1,
        Fecha: r.fecha,
        Paso: r.paso,
        "Valor (mg/dL)": r.valor,
      }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Bitacora");

    const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `bitacora_glucosa_${ts}.xlsx`;

    try {
      if (Platform.OS === "android") {
        let directoryUri = await AsyncStorage.getItem(
          ANDROID_DOWNLOADS_URI_KEY
        );

        if (!directoryUri) {
          const perm =
            await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (!perm.granted) {
            Alert.alert(
              "Permiso requerido",
              "Debes conceder acceso a una carpeta (por ejemplo, Descargas) para guardar el archivo."
            );
            return;
          }
          directoryUri = perm.directoryUri;
          await AsyncStorage.setItem(ANDROID_DOWNLOADS_URI_KEY, directoryUri);
        }

        const mime =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        const uri = await FileSystem.StorageAccessFramework.createFileAsync(
          directoryUri!,
          filename,
          mime
        );

        await FileSystem.writeAsStringAsync(uri, wbout, {
          encoding: FileSystem.EncodingType.Base64,
        });

        Alert.alert(
          "Éxito",
          "El archivo se guardó automáticamente en Descargas."
        );
      } else {
        const fileUri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, wbout, {
          encoding: FileSystem.EncodingType.Base64,
        });
        Alert.alert("Archivo guardado", `Se guardó en:\n${fileUri}`);
      }
    } catch (e: any) {
      console.log("Error exportando Excel:", e?.message);
      Alert.alert("Error", "No se pudo guardar el archivo.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bitácora de Glucosa</Text>
      <Text style={styles.subtitle}>
        Registro de hoy: <Text style={{ fontWeight: "700" }}>{pasoActual}</Text>
      </Text>

      <TextInput
        style={[styles.input, hayRegistroHoy && { opacity: 0.6 }]}
        keyboardType="numeric"
        placeholder="Valor de glucosa (mg/dL)"
        value={valor}
        onChangeText={setValor}
        editable={!hayRegistroHoy}
      />

      <TouchableOpacity
        style={[
          styles.btnGuardar,
          hayRegistroHoy && { backgroundColor: "#999" },
        ]}
        onPress={guardarRegistro}
        disabled={hayRegistroHoy}
        activeOpacity={0.8}
      >
        <Ionicons
          name="save"
          size={16}
          color="#fff"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.btnText}>Guardar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnExportar}
        onPress={exportarExcel}
        activeOpacity={0.8}
      >
        <Ionicons
          name="download"
          size={16}
          color="#1c3d5a"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.btnExportText}>Exportar</Text>
      </TouchableOpacity>

      <Text style={[styles.subtitle, { marginTop: 20 }]}>Historial</Text>
      {loading ? (
        <Text>Cargando...</Text>
      ) : registros.length === 0 ? (
        <Text>No hay registros aún.</Text>
      ) : (
        <FlatList
          data={registros}
          keyExtractor={(item, idx) => String(item.id ?? idx)}
          contentContainerStyle={{ paddingVertical: 8 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardFecha}>{item.fecha}</Text>
              <Text style={styles.cardPaso}>{item.paso}</Text>
              <Text style={styles.cardValor}>{item.valor} mg/dL</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "#f8f9fa" },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1c3d5a",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1e1e1e",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  btnGuardar: {
    flexDirection: "row",
    backgroundColor: "#1c3d5a",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  btnExportar: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#ffffffff",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  btnExportText: { color: "#1c3d5a", fontWeight: "600", fontSize: 14 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardFecha: { fontSize: 12, color: "#555", marginBottom: 4 },
  cardPaso: { fontSize: 16, fontWeight: "600", marginBottom: 2 },
  cardValor: { fontSize: 14, color: "#222" },
});
