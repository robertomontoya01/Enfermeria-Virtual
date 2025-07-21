export interface Cita {
  id: string;
  fecha: string; // ISO string
  doctor: string;
  lugar: string;
  estado: "CONFIRMADA" | "CANCELADA" | "COMPLETADA";
  synced: boolean;
}
