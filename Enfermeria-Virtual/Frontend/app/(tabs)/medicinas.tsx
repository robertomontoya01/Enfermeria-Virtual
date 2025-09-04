// app/(tabs)/medicinas.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { API_BASE_URL } from "../../constants/config";

// ===== Config notificaciones =====

// Tipar explícitamente el handler para que TS valide contra el tipo correcto
const notificationHandler: Notifications.NotificationHandler = {
  handleNotification:
    async (): Promise<Notifications.NotificationBehavior> => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      // Campos requeridos en versiones recientes de expo-notifications
      shouldShowBanner: true,
      shouldShowList: true,
    }),
};

Notifications.setNotificationHandler(notificationHandler);

// ===== Helpers =====
const toMySQLDate = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

type ViaApi = { Via_id: number; Nombre: string; Descripcion?: string | null };

export default function MedicinasScreen() {
  // Form
  const [nombre, setNombre] = useState("");
  const [dosis, setDosis] = useState("");
  const [viaId, setViaId] = useState<number | null>(null);
  const [intervaloHoras, setIntervaloHoras] = useState<string>("8");
  const [observaciones, setObservaciones] = useState("");

  // Fechas
  const [fechaInicio, setFechaInicio] = useState<Date>(new Date());
  const [fechaFin, setFechaFin] = useState<Date>(
    new Date(Date.now() + 3 * 24 * 3600 * 1000)
  );
  const [showInicioPicker, setShowInicioPicker] = useState(false);
  const [showFinPicker, setShowFinPicker] = useState(false);

  // Fotos (solo URI)
  const [fotoFrenteUri, setFotoFrenteUri] = useState<string | null>(null);
  const [fotoReversoUri, setFotoReversoUri] = useState<string | null>(null);

  // Vías
  const [vias, setVias] = useState<ViaApi[]>([]);
  const [loadingVias, setLoadingVias] = useState<boolean>(false);

  // ===== Cargar permisos + Vías =====
  useEffect(() => {
    (async () => {
      await Notifications.requestPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();

      try {
        setLoadingVias(true);
        const token = await AsyncStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/api/vias`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          timeout: 10000,
        });
        const list: ViaApi[] = Array.isArray(res.data) ? res.data : [];
        setVias(list);
        if (list.length > 0) setViaId(list[0].Via_id);
      } catch (e: any) {
        console.error("Error al obtener vías:", e?.message, e?.response?.data);
        Alert.alert(
          "Vías",
          "No fue posible cargar las vías de administración."
        );
      } finally {
        setLoadingVias(false);
      }
    })();
  }, []);

  // ===== Selector de imagen (uri) =====
  const pickImage = async (setter: (uri: string) => void) => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: false, // ⬅️ importante: ya no usamos base64
    });
    if (!res.canceled && res.assets?.[0]?.uri) {
      setter(res.assets[0].uri);
    }
  };

  // ===== Programar recordatorio =====
  const programarRecordatorio = useCallback(
    async (medicina: string, viaTexto: string, horas: number) => {
      if (!horas || horas <= 0) return;
      const trigger: Notifications.TimeIntervalTriggerInput = {
        // @ts-ignore — type requerido en versiones recientes
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, Math.floor(horas * 3600)),
        repeats: true,
      };
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Hora de tu medicina 💊",
          body: `Recuerda tomar: ${medicina} (${viaTexto})`,
        },
        trigger,
      });
    },
    []
  );

  // ===== Enviar al backend como multipart/form-data =====
  const subirMedicamentoFormData = useCallback(
    async (form: {
      nombre: string;
      dosis?: string;
      viaId: number;
      fechaInicio: string;
      fechaFin: string;
      intervaloHoras: number;
      observaciones?: string;
      fotoFrenteUri?: string | null;
      fotoReversoUri?: string | null;
    }) => {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No hay sesión");

      const fd = new FormData();
      fd.append("Nombre", form.nombre);
      if (form.dosis) fd.append("Dosis", form.dosis);
      fd.append("Via_id", String(form.viaId));
      fd.append("Fecha_inicio", form.fechaInicio);
      fd.append("Fecha_fin", form.fechaFin);
      fd.append("Intervalo_horas", String(form.intervaloHoras));
      if (form.observaciones) fd.append("Observaciones", form.observaciones);

      const toFile = (uri: string, name: string) =>
        ({ uri, name, type: "image/jpeg" } as any);

      if (form.fotoFrenteUri) {
        fd.append("Foto_Frontal", toFile(form.fotoFrenteUri, "frente.jpg"));
      }
      if (form.fotoReversoUri) {
        fd.append("Foto_Trasera", toFile(form.fotoReversoUri, "reverso.jpg"));
      }

      const res = await axios.post(`${API_BASE_URL}/api/medicamentos`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // deja que axios ponga el boundary
        },
        timeout: 20000,
      });

      return res.data;
    },
    []
  );

  const viaNombre = useMemo(
    () => (viaId ? vias.find((v) => v.Via_id === viaId)?.Nombre ?? "" : ""),
    [viaId, vias]
  );

  // ===== Guardar =====
  const handleGuardar = useCallback(async () => {
    try {
      if (!nombre.trim())
        return Alert.alert("Falta", "El nombre es obligatorio");
      const ih = Number(intervaloHoras);
      if (!ih || Number.isNaN(ih) || ih <= 0) {
        return Alert.alert("Falta", "Intervalo de horas inválido");
      }
      if (!viaId) {
        return Alert.alert("Vía", "Selecciona la vía de administración");
      }

      const data = await subirMedicamentoFormData({
        nombre,
        dosis: dosis || undefined,
        viaId: viaId,
        fechaInicio: toMySQLDate(fechaInicio),
        fechaFin: toMySQLDate(fechaFin),
        intervaloHoras: ih,
        observaciones: observaciones || undefined,
        fotoFrenteUri,
        fotoReversoUri,
      });

      // Notificación local
      const viaTexto = viaNombre || `Vía ${viaId}`;
      await programarRecordatorio(nombre, viaTexto, ih);

      Alert.alert(
        "Éxito",
        `Medicamento registrado (ID ${
          data?.Medicamento_id ?? "?"
        }) y recordatorios programados`
      );

      // Reset
      setNombre("");
      setDosis("");
      setIntervaloHoras("8");
      setObservaciones("");
      setFotoFrenteUri(null);
      setFotoReversoUri(null);
      setFechaInicio(new Date());
      setFechaFin(new Date(Date.now() + 3 * 24 * 3600 * 1000));
      if (vias[0]) setViaId(vias[0].Via_id);
    } catch (err: any) {
      console.log("ERR medicinas:", {
        msg: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
        url: err?.config?.url,
      });
      Alert.alert(
        "Error",
        err?.response?.data?.error ||
          err?.message ||
          "No se pudo registrar la medicina"
      );
    }
  }, [
    nombre,
    dosis,
    intervaloHoras,
    viaId,
    fechaInicio,
    fechaFin,
    observaciones,
    fotoFrenteUri,
    fotoReversoUri,
    vias,
    viaNombre,
    subirMedicamentoFormData,
    programarRecordatorio,
  ]);

  // Handlers DateTimePicker (tipados)
  const onChangeInicio = (event: DateTimePickerEvent, date?: Date) => {
    void event;
    setShowInicioPicker(false);
    if (date) setFechaInicio(date);
  };
  const onChangeFin = (event: DateTimePickerEvent, date?: Date) => {
    void event;
    setShowFinPicker(false);
    if (date) setFechaFin(date);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrar Medicina</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del medicamento"
        value={nombre}
        onChangeText={setNombre}
      />

      <TextInput
        style={styles.input}
        placeholder="Dosis (ej. 1 tableta, 5ml)"
        value={dosis}
        onChangeText={setDosis}
      />

      {/* Vía */}
      <Text style={styles.label}>Vía de administración</Text>
      <View style={styles.pickerWrap}>
        <Picker
          enabled={!loadingVias && vias.length > 0}
          selectedValue={viaId ?? undefined}
          onValueChange={(v) => setViaId(Number(v))}
        >
          {loadingVias && (
            <Picker.Item label="Cargando vías..." value={undefined} />
          )}
          {!loadingVias && vias.length === 0 && (
            <Picker.Item label="No hay vías disponibles" value={undefined} />
          )}
          {vias.map((v) => (
            <Picker.Item key={v.Via_id} label={v.Nombre} value={v.Via_id} />
          ))}
        </Picker>
      </View>
      {!!viaNombre && (
        <Text style={styles.hint}>Seleccionada: {viaNombre}</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Cada cuántas horas (ej. 8)"
        value={intervaloHoras}
        onChangeText={setIntervaloHoras}
        keyboardType="numeric"
      />

      {/* Fechas */}
      <View style={styles.rowBetween}>
        <View style={{ flex: 1, marginRight: 6 }}>
          <Button
            title={`Fecha inicio: ${toMySQLDate(fechaInicio)}`}
            onPress={() => setShowInicioPicker(true)}
          />
          {showInicioPicker && (
            <DateTimePicker
              value={fechaInicio}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "calendar"}
              onChange={onChangeInicio}
              minimumDate={new Date()}
            />
          )}
        </View>
        <View style={{ flex: 1, marginLeft: 6 }}>
          <Button
            title={`Fecha fin: ${toMySQLDate(fechaFin)}`}
            onPress={() => setShowFinPicker(true)}
          />
          {showFinPicker && (
            <DateTimePicker
              value={fechaFin}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "calendar"}
              onChange={onChangeFin}
              minimumDate={fechaInicio}
            />
          )}
        </View>
      </View>

      <TextInput
        style={[styles.input, { height: 90 }]}
        placeholder="Observaciones"
        value={observaciones}
        onChangeText={setObservaciones}
        multiline
      />

      {/* Fotos */}
      <View style={styles.rowBetween}>
        <View style={{ flex: 1, marginRight: 6 }}>
          <Button
            title="Foto frente caja"
            onPress={() => pickImage((u) => setFotoFrenteUri(u))}
          />
          {fotoFrenteUri ? (
            <Image source={{ uri: fotoFrenteUri }} style={styles.image} />
          ) : null}
        </View>
        <View style={{ flex: 1, marginLeft: 6 }}>
          <Button
            title="Foto reverso caja"
            onPress={() => pickImage((u) => setFotoReversoUri(u))}
          />
          {fotoReversoUri ? (
            <Image source={{ uri: fotoReversoUri }} style={styles.image} />
          ) : null}
        </View>
      </View>

      <View style={{ marginTop: 20, width: "100%" }}>
        <Button
          title="Guardar y programar notificación"
          onPress={handleGuardar}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
    color: "#374151",
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    overflow: "hidden",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
  },
  image: {
    width: "100%",
    height: 140,
    marginTop: 10,
    borderRadius: 8,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  hint: {
    marginBottom: 10,
    color: "#4b5563",
  },
});
