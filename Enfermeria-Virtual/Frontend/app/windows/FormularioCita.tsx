import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { API_BASE_URL } from "../../constants/config";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";

type Doctor = { id: number; nombreCompleto: string };
type Lab = { id: number; nombre: string };

export default function FormularioCita() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    labId?: string;
    labNombre?: string;
    docId?: string;
    docNombre?: string;
  }>();

  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [laboratorios, setLaboratorios] = useState<Lab[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedLaboratorio, setSelectedLaboratorio] = useState<number | null>(
    null
  );
  const [fecha, setFecha] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [motivo, setMotivo] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const [resDoctores, resLab] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/usuarios?tipo=doctor`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/api/laboratorios`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setDoctores(resDoctores.data || []);
      setLaboratorios(resLab.data || []);
    } catch (err) {
      console.error("Error al obtener datos:", err);
      Alert.alert("Error", "No se pudieron cargar doctores o laboratorios");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    if (params?.labId) {
      const id = Number(params.labId);
      if (!Number.isNaN(id)) {
        setSelectedLaboratorio(id);
        const existe = (laboratorios || []).some((l) => l.id === id);
        if (!existe && params.labNombre) {
          setLaboratorios((prev) => [
            { id, nombre: String(params.labNombre) },
            ...(prev || []),
          ]);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.labId, params?.labNombre, laboratorios.length]);

  useEffect(() => {
    if (params?.docId) {
      const id = Number(params.docId);
      if (!Number.isNaN(id)) {
        setSelectedDoctor(id);
        const existe = (doctores || []).some((d) => d.id === id);
        if (!existe && params.docNombre) {
          setDoctores((prev) => [
            { id, nombreCompleto: String(params.docNombre) },
            ...(prev || []),
          ]);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.docId, params?.docNombre, doctores.length]);

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) setFecha(selectedDate);
  };

  const openDateTimePicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: fecha,
        onChange: (event, selectedDate) => {
          if (selectedDate) {
            const newDate = new Date(selectedDate);
            DateTimePickerAndroid.open({
              value: newDate,
              onChange: (_event, selectedTime) => {
                if (selectedTime) {
                  newDate.setHours(selectedTime.getHours());
                  newDate.setMinutes(selectedTime.getMinutes());
                  setFecha(newDate);
                }
              },
              mode: "time",
              is24Hour: true,
            });
          }
        },
        mode: "date",
        minimumDate: new Date(),
      });
    } else {
      setShowPicker(true);
    }
  };

  const formatDateForApi = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const formatDateForUI = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const handleGuardar = async () => {
    if (!motivo.trim() || !selectedDoctor) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios");
      return;
    }
    if (fecha <= new Date()) {
      Alert.alert("Error", "La fecha de la cita debe ser futura");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await axios.post(
        `${API_BASE_URL}/api/citas`,
        {
          Motivo: motivo,
          DoctorID: selectedDoctor,
          LaboratorioID: selectedLaboratorio,
          Fecha_cita: formatDateForApi(fecha),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Éxito", res.data.mensaje || "Cita guardada correctamente");
      setMotivo("");
      setSelectedDoctor(null);
      setSelectedLaboratorio(null);
      setFecha(new Date());
    } catch (err: any) {
      console.error("Error al guardar cita:", err);
      Alert.alert(
        "Error",
        err.response?.data?.error || "No se pudo guardar la cita"
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Motivo de la Cita *</Text>
      <TextInput
        style={styles.input}
        value={motivo}
        onChangeText={setMotivo}
        placeholder="Describe el motivo"
      />

      <View style={styles.row}>
        <Text style={[styles.label, { flex: 1 }]}>Selecciona Doctor *</Text>
        <TouchableOpacity
          style={styles.addDocBtn}
          onPress={() =>
            router.push({
              pathname: "/windows/AgregarDoctor",
              params: { from: "FormularioCita", tipo: "doctor" },
            })
          }
        >
          <Text style={styles.addDocText}>+ Agregar doctor</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedDoctor}
          onValueChange={(v) => setSelectedDoctor(v)}
        >
          <Picker.Item label="Selecciona un doctor" value={null} />
          {(doctores || []).map((doc) => (
            <Picker.Item
              key={doc.id}
              label={doc.nombreCompleto}
              value={doc.id}
            />
          ))}
        </Picker>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { flex: 1 }]}>Selecciona Laboratorio</Text>
        <TouchableOpacity
          style={styles.addLabBtn}
          onPress={() =>
            router.push({
              pathname: "/windows/AgregarLaboratorio",
              params: { from: "FormularioCita" },
            })
          }
        >
          <Text style={styles.addLabText}>+ Agregar laboratorio</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedLaboratorio}
          onValueChange={(v) => setSelectedLaboratorio(v)}
        >
          <Picker.Item label="Selecciona un laboratorio" value={null} />
          {(laboratorios || []).map((lab) => (
            <Picker.Item key={lab.id} label={lab.nombre} value={lab.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Selecciona Fecha y Hora *</Text>
      <TouchableOpacity style={styles.dateButton} onPress={openDateTimePicker}>
        <Text style={styles.dateText}>{formatDateForUI(fecha)}</Text>
      </TouchableOpacity>

      {showPicker && Platform.OS === "ios" && (
        <DateTimePicker
          value={fecha}
          mode="datetime"
          display="spinner"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleGuardar}>
        <Text style={styles.buttonText}>Guardar Cita</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  label: { fontWeight: "700", marginTop: 20, marginBottom: 10, fontSize: 16 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
  dateButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 20,
  },
  dateText: { fontSize: 16, color: "#000" },
  button: {
    backgroundColor: "#1e88e5",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  addLabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#e3f2fd",
    borderWidth: 1,
    borderColor: "#90caf9",
  },
  addLabText: { color: "#1976d2", fontWeight: "700", fontSize: 12 },

  addDocBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#e8f5e9",
    borderWidth: 1,
    borderColor: "#a5d6a7",
  },
  addDocText: { color: "#2e7d32", fontWeight: "700", fontSize: 12 },
});
