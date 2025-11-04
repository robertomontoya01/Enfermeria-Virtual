import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../../constants/config";
import { MaterialIcons } from "@expo/vector-icons";

// ===== Config notificaciones =====
const notificationHandler: Notifications.NotificationHandler = {
  handleNotification:
    async (): Promise<Notifications.NotificationBehavior> => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
};
Notifications.setNotificationHandler(notificationHandler);

const toMySQLDate = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

type ViaApi = { Via_id: number; Nombre: string; Descripcion?: string | null };

export default function MedicinasScreen() {
  const [nombre, setNombre] = useState("");
  const [dosis, setDosis] = useState("");
  const [viaId, setViaId] = useState<number | null>(null);
  const [intervaloHoras, setIntervaloHoras] = useState<string>("8");
  const [observaciones, setObservaciones] = useState("");

  const [fechaInicio, setFechaInicio] = useState<Date>(new Date());
  const [fechaFin, setFechaFin] = useState<Date>(
    new Date(Date.now() + 3 * 24 * 3600 * 1000)
  );
  const [showInicioPicker, setShowInicioPicker] = useState(false);
  const [showFinPicker, setShowFinPicker] = useState(false);

  const [fotoFrenteUri, setFotoFrenteUri] = useState<string | null>(null);
  const [fotoReversoUri, setFotoReversoUri] = useState<string | null>(null);

  const [vias, setVias] = useState<ViaApi[]>([]);
  const [loadingVias, setLoadingVias] = useState<boolean>(false);

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

  const pickImage = async (setter: (uri: string) => void) => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: false,
    });
    if (!res.canceled && res.assets?.[0]?.uri) setter(res.assets[0].uri);
  };

  const programarRecordatorio = useCallback(
    async (medicina: string, viaTexto: string, horas: number) => {
      if (!horas || horas <= 0) return;
      const trigger: Notifications.TimeIntervalTriggerInput = {
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
      if (form.fotoFrenteUri)
        fd.append("Foto_Frontal", toFile(form.fotoFrenteUri, "frente.jpg"));
      if (form.fotoReversoUri)
        fd.append("Foto_Trasera", toFile(form.fotoReversoUri, "reverso.jpg"));

      const res = await axios.post(`${API_BASE_URL}/api/medicamentos`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
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

  const handleGuardar = useCallback(async () => {
    try {
      if (!nombre.trim())
        return Alert.alert("Falta", "El nombre es obligatorio");
      const ih = Number(intervaloHoras);
      if (!ih || Number.isNaN(ih) || ih <= 0)
        return Alert.alert("Falta", "Intervalo de horas inválido");
      if (!viaId)
        return Alert.alert("Vía", "Selecciona la vía de administración");

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

      const viaTexto = viaNombre || `Vía ${viaId}`;
      await programarRecordatorio(nombre, viaTexto, ih);

      Alert.alert(
        "Éxito",
        `Medicamento registrado (ID ${
          data?.Medicamento_id ?? "?"
        }) y recordatorios programados`
      );

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
      console.log("ERR medicinas:", err);
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

      <Text style={styles.label}>Cada cuantas horas:</Text>
      <TextInput
        style={styles.input}
        placeholder="(ej. 8)"
        value={intervaloHoras}
        onChangeText={setIntervaloHoras}
        keyboardType="numeric"
      />

      <View style={styles.rowBetween}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowInicioPicker(true)}
        >
          <MaterialIcons
            name="calendar-today"
            size={20}
            color="#2e3a59"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.dateButtonText}>{toMySQLDate(fechaInicio)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowFinPicker(true)}
        >
          <MaterialIcons
            name="calendar-today"
            size={20}
            color="#2e3a59"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.dateButtonText}>{toMySQLDate(fechaFin)}</Text>
        </TouchableOpacity>
      </View>

      {showInicioPicker && (
        <DateTimePicker
          value={fechaInicio}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "calendar"}
          onChange={onChangeInicio}
          minimumDate={new Date()}
        />
      )}
      {showFinPicker && (
        <DateTimePicker
          value={fechaFin}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "calendar"}
          onChange={onChangeFin}
          minimumDate={fechaInicio}
        />
      )}

      <TextInput
        style={[styles.input, { height: 90, textAlignVertical: "top" }]}
        placeholder="Observaciones"
        value={observaciones}
        onChangeText={setObservaciones}
        multiline
      />

      <View style={styles.imagesContainer}>
        <View style={styles.imageColumn}>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => pickImage((u) => setFotoFrenteUri(u))}
          >
            <Text style={styles.imageButtonText}>Foto frente caja</Text>
          </TouchableOpacity>
          {fotoFrenteUri && (
            <Image source={{ uri: fotoFrenteUri }} style={styles.image} />
          )}
        </View>
        <View style={styles.imageColumn}>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => pickImage((u) => setFotoReversoUri(u))}
          >
            <Text style={styles.imageButtonText}>Foto reverso caja</Text>
          </TouchableOpacity>
          {fotoReversoUri && (
            <Image source={{ uri: fotoReversoUri }} style={styles.image} />
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleGuardar}>
        <Text style={styles.buttonText}>Guardar y programar notificación</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 30,
    backgroundColor: "#f5f7fb",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2e3a59",
    textAlign: "center",
    marginBottom: 24,
  },
  label: { fontSize: 15, fontWeight: "600", color: "#7a869a", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e4eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1e1e1e",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#e0e4eb",
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e4eb",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    marginHorizontal: 5,
  },
  dateButtonText: { fontSize: 16, color: "#1e1e1e", fontWeight: "500" },
  imagesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  imageColumn: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    marginHorizontal: 5,
  },
  imageButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e4eb",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    width: "100%",
    marginBottom: 10,
  },
  imageButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2e3a59",
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e4eb",
    backgroundColor: "#f8f9fd",
  },
  button: {
    backgroundColor: "#2e3a59",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
