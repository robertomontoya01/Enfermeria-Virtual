// Backend/routes/citas.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "mi_secreto_super_seguro";

/** Middleware de auth (usa Authorization: Bearer <token>) */
function auth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Token requerido" });
  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.user = user; // { id, type }
    next();
  });
}

/**
 * GET /api/citas
 * - Devuelve citas del usuario autenticado.
 */
router.get("/", auth, async (req, res) => {
  const { id: userId, type } = req.user;
  const { scope } = req.query;

  try {
    let where = "";
    let params = [];

    if (scope === "all") {
      where = "WHERE (Citas.DoctorID = ? OR Citas.PacienteID = ?)";
      params = [userId, userId];
    } else if (type === "paciente") {
      where = "WHERE Citas.PacienteID = ?";
      params = [userId];
    } else {
      // doctor
      where = "WHERE Citas.DoctorID = ?";
      params = [userId];
    }

    const [rows] = await db.execute(
      `
      SELECT 
        Citas.ID, 
        Citas.Fecha_cita,
        Citas.DoctorID,
        Citas.PacienteID,
        Citas.StatusID,
        Citas.LaboratorioID,
        Citas.Motivo,
        CONCAT(DU.Nombre, ' ', DU.Apellidos) AS doctorNombre,
        CONCAT(PU.Nombre, ' ', PU.Apellidos) AS pacienteNombre,
        L.Nombre AS laboratorioNombre,
        SC.Status_citas AS statusNombre
      FROM Citas
      LEFT JOIN Usuarios DU ON Citas.DoctorID = DU.id
      LEFT JOIN Usuarios PU ON Citas.PacienteID = PU.id
      LEFT JOIN Laboratorios L ON Citas.LaboratorioID = L.id
      LEFT JOIN Status_citas SC ON Citas.StatusID = SC.id
      ${where}
      ORDER BY Citas.Fecha_cita ASC
      `,
      params
    );

    res.json(rows);
  } catch (err) {
    console.error("GET /api/citas:", err);
    res.status(500).json({ error: "Error al obtener citas" });
  }
});

/**
 * GET /api/citas/:id
 * - Devuelve el detalle de una cita con info de doctor, laboratorio y nombre del estatus.
 * - Solo accesible si el usuario autenticado es el Paciente o el Doctor de la cita.
 */
router.get("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { id: userId } = req.user;

  const citaId = Number(id);
  if (!citaId || Number.isNaN(citaId)) {
    return res.status(400).json({ error: "ID de cita inválido" });
  }

  try {
    const [rows] = await db.execute(
      `
      SELECT 
        Citas.ID, 
        Citas.Fecha_cita,
        Citas.DoctorID,
        Citas.PacienteID,
        Citas.StatusID,
        Citas.LaboratorioID,
        Citas.Motivo,

        -- Aliases que espera el frontend
        CONCAT(U.Nombre, ' ', U.Apellidos) AS doctorNombre,
        L.Nombre     AS laboratorioNombre,
        L.Direccion  AS laboratorioDireccion,
        L.Telefono   AS laboratorioTelefono,
        SC.Status_citas AS statusNombre

      FROM Citas
      LEFT JOIN Usuarios U      ON Citas.DoctorID     = U.id
      LEFT JOIN Laboratorios L  ON Citas.LaboratorioID = L.id
      LEFT JOIN Status_citas SC ON Citas.StatusID     = SC.id
      WHERE Citas.ID = ? AND (Citas.PacienteID = ? OR Citas.DoctorID = ?)
      LIMIT 1
      `,
      [citaId, userId, userId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    const row = rows[0];
    row.StatusID = Number(row.StatusID);

    return res.json(row);
  } catch (err) {
    console.error("GET /api/citas/:id:", err?.sqlMessage || err?.message);
    return res.status(500).json({ error: "Error al obtener la cita" });
  }
});

/**
 * POST /api/citas
 * - Crea una cita (paciente autenticado crea con un doctor)
 */
router.post("/", auth, async (req, res) => {
  const { id: pacienteID, type } = req.user;
  const { Motivo, DoctorID, LaboratorioID, Fecha_cita } = req.body;

  if (type !== "paciente") {
    return res.status(403).json({ error: "Solo pacientes pueden crear citas" });
  }

  if (!Motivo || !DoctorID || !Fecha_cita) {
    return res
      .status(400)
      .json({ error: "Motivo, DoctorID y Fecha_cita son obligatorios" });
  }

  const fecha = new Date(Fecha_cita);
  if (isNaN(fecha.getTime())) {
    return res
      .status(400)
      .json({ error: "Fecha_cita inválida. Usa 'YYYY-MM-DD HH:mm:ss'" });
  }
  if (fecha <= new Date()) {
    return res
      .status(400)
      .json({ error: "La fecha de la cita debe ser futura" });
  }

  try {
    // Verificar conflicto con el doctor
    const [exist] = await db.execute(
      `SELECT 1 FROM Citas WHERE DoctorID = ? AND Fecha_cita = ? LIMIT 1`,
      [DoctorID, Fecha_cita]
    );
    if (exist.length > 0) {
      return res
        .status(409)
        .json({ error: "El doctor ya tiene una cita a esa hora" });
    }

    const [result] = await db.execute(
      `INSERT INTO Citas (PacienteID, DoctorID, LaboratorioID, Fecha_cita, Motivo, StatusID)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [pacienteID, DoctorID, LaboratorioID || null, Fecha_cita, Motivo]
    );

    res
      .status(201)
      .json({ mensaje: "Cita creada correctamente", id: result.insertId });
  } catch (err) {
    console.error("POST /api/citas:", err);
    res.status(500).json({ error: "Error al crear cita" });
  }
});

/**
 * PATCH /api/citas/:id/status
 * - Cambia el estado de la cita
 */
router.patch("/:id/status", auth, async (req, res) => {
  const { id: userId, type } = req.user;
  const { id } = req.params;
  const { StatusID } = req.body;

  if (!StatusID)
    return res.status(400).json({ error: "StatusID es obligatorio" });

  try {
    // Obtener cita para validar permisos
    const [rows] = await db.execute(
      `SELECT DoctorID, PacienteID FROM Citas WHERE ID = ?`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Cita no encontrada" });

    const cita = rows[0];
    if (type === "paciente" && cita.PacienteID !== userId) {
      return res.status(403).json({ error: "No puedes modificar esta cita" });
    }
    if (type !== "paciente" && cita.DoctorID !== userId) {
      return res.status(403).json({ error: "No puedes modificar esta cita" });
    }

    await db.execute(`UPDATE Citas SET StatusID = ? WHERE ID = ?`, [
      StatusID,
      id,
    ]);
    res.json({ mensaje: "Estado actualizado" });
  } catch (err) {
    console.error("PATCH /api/citas/:id/status:", err);
    res.status(500).json({ error: "Error al actualizar estado" });
  }
});

/**
 * (Opcional) PATCH /api/citas/:id
 * - Alias para actualizar StatusID sin '/status' (por compatibilidad con el frontend).
 */
router.patch("/:id", auth, async (req, res) => {
  const { StatusID } = req.body;
  if (!StatusID)
    return res.status(400).json({ error: "StatusID es obligatorio" });
  // Reutilizamos la lógica del endpoint /:id/status
  req.params = { ...req.params };
  return router.handle(
    { ...req, url: `/api/citas/${req.params.id}/status`, method: "PATCH" },
    res
  );
});

module.exports = router;
