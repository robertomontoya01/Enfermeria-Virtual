// app/AgregarCita.tsx
import React, { useEffect, useState } from "react";
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

export default function AgregarCita() {
  const [doctores, setDoctores] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedLaboratorio, setSelectedLaboratorio] = useState<number | null>(
    null
  );
  const [fecha, setFecha] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        const resDoctores = await axios.get(
          `${API_BASE_URL}/api/usuarios?tipo=doctor`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDoctores(resDoctores.data);

        const resLab = await axios.get(`${API_BASE_URL}/api/laboratorios`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLaboratorios(resLab.data);
      } catch (err) {
        console.error("Error al obtener datos:", err);
        Alert.alert("Error", "No se pudieron cargar doctores o laboratorios");
      }
    };
    fetchData();
  }, []);

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

  // 🔧 Función para enviar al backend (con segundos)
  const formatDateForApi = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 🔧 Función para mostrar en UI (sin segundos)
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
          Fecha_cita: formatDateForApi(fecha), // 👈 aquí el formato correcto para la API
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

      <Text style={styles.label}>Selecciona Doctor *</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedDoctor}
          onValueChange={(itemValue) => setSelectedDoctor(itemValue)}
        >
          <Picker.Item label="Selecciona un doctor" value={null} />
          {doctores.map((doc: any) => (
            <Picker.Item
              key={doc.id}
              label={doc.nombreCompleto}
              value={doc.id}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Selecciona Laboratorio</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedLaboratorio}
          onValueChange={(itemValue) => setSelectedLaboratorio(itemValue)}
        >
          <Picker.Item label="Selecciona un laboratorio" value={null} />
          {laboratorios.map((lab: any) => (
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
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
