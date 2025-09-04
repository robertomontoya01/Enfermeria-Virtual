// Backend/routes/medicamentos.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");
const multer = require("multer");
const fs = require("fs/promises");
const path = require("path");

// === Multer: storage a disco ===
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "medicamentos");

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      cb(null, UPLOAD_DIR);
    } catch (e) {
      cb(e, UPLOAD_DIR);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)?.toLowerCase() || ".jpg";
    const name = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB por archivo
  },
  fileFilter: (req, file, cb) => {
    const ok = /image\/(jpeg|png|jpg|webp)/.test(file.mimetype);
    if (!ok) return cb(new Error("Tipo de archivo no permitido"));
    cb(null, true);
  },
});

// === POST /api/medicamentos ===
// Espera multipart/form-data con:
// campos de texto + files: Foto_Frontal, Foto_Trasera
router.post(
  "/",
  auth,
  upload.fields([
    { name: "Foto_Frontal", maxCount: 1 },
    { name: "Foto_Trasera", maxCount: 1 },
  ]),
  async (req, res) => {
    const Usuario_id = req.user.id;

    // Campos de texto provenientes de multipart/form-data
    let {
      Nombre,
      Dosis,
      Via_id,
      Fecha_inicio, // YYYY-MM-DD
      Fecha_fin, // YYYY-MM-DD
      Intervalo_horas,
      Observaciones,
      Registrado_por,
    } = req.body;

    try {
      // Archivos subidos (si existen)
      const frontalFile = req.files?.Foto_Frontal?.[0] || null;
      const traseraFile = req.files?.Foto_Trasera?.[0] || null;

      // Rutas públicas para servir estático
      const Foto_Frontal = frontalFile
        ? `/uploads/medicamentos/${frontalFile.filename}`
        : null;
      const Foto_Trasera = traseraFile
        ? `/uploads/medicamentos/${traseraFile.filename}`
        : null;

      // Validaciones básicas
      if (!Nombre?.trim()) {
        return res.status(400).json({ error: "Nombre es obligatorio" });
      }
      if (!Via_id) {
        return res.status(400).json({ error: "Via_id es obligatorio" });
      }
      if (!Fecha_inicio || !Fecha_fin) {
        return res
          .status(400)
          .json({ error: "Fecha_inicio y Fecha_fin son obligatorias" });
      }
      const ih = Number(Intervalo_horas);
      if (!ih || Number.isNaN(ih) || ih <= 0) {
        return res
          .status(400)
          .json({ error: "Intervalo_horas debe ser un número > 0" });
      }

      // Normalizar opcionales
      Dosis = Dosis || null;
      Observaciones = Observaciones || null;
      Registrado_por = Registrado_por || null;

      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();

        // Verificar vía
        const [vias] = await conn.execute(
          "SELECT 1 FROM Vias WHERE Via_id = ?",
          [Via_id]
        );
        if (!Array.isArray(vias) || vias.length === 0) {
          await conn.rollback();
          conn.release();
          return res.status(400).json({ error: "La vía indicada no existe" });
        }

        // Insert medicamento (guardamos rutas, no base64)
        const [result] = await conn.execute(
          `INSERT INTO Medicamentos
           (Usuario_id, Nombre, Dosis, Foto_Frontal, Foto_Trasera, Via_id,
            Fecha_inicio, Fecha_fin, Intervalo_horas, Observaciones, Registrado_por)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            Usuario_id,
            Nombre.trim(),
            Dosis,
            Foto_Frontal,
            Foto_Trasera,
            Number(Via_id),
            Fecha_inicio,
            Fecha_fin,
            ih,
            Observaciones,
            Registrado_por,
          ]
        );

        const Medicamento_id = result.insertId;

        // Generar tomas (08:00 a fin del día final)
        let fIni = new Date(`${Fecha_inicio}T08:00:00`);
        const fFin = new Date(`${Fecha_fin}T23:59:59`);
        const tomas = [];

        while (fIni <= fFin) {
          tomas.push([
            Medicamento_id,
            Usuario_id,
            fIni.toISOString().slice(0, 19).replace("T", " "),
          ]);
          fIni.setHours(fIni.getHours() + ih);
        }

        if (tomas.length) {
          await conn.query(
            `INSERT INTO Tomas_Medicamento
             (Medicamento_id, Usuario_id, Fecha_hora_programada)
             VALUES ?`,
            [tomas]
          );
        }

        await conn.commit();
        conn.release();

        return res.status(201).json({
          message: "Medicamento registrado y tomas programadas generadas",
          Medicamento_id,
          Tomas_creadas: tomas.length,
          Foto_Frontal,
          Foto_Trasera,
        });
      } catch (err) {
        try {
          await conn.rollback();
        } catch (_) {}
        conn.release();
        console.error(
          "POST /api/medicamentos error:",
          err?.sqlMessage || err?.message
        );
        return res
          .status(500)
          .json({ error: err?.sqlMessage || "Error al registrar medicamento" });
      }
    } catch (outerErr) {
      console.error("POST /api/medicamentos error:", outerErr?.message);
      return res.status(500).json({ error: "Error interno" });
    }
  }
);

// (Opcional) listar medicamentos del usuario autenticado
router.get("/", auth, async (req, res) => {
  const Usuario_id = req.user.id;
  try {
    const [rows] = await db.execute(
      `SELECT 
         m.Medicamento_id, m.Nombre, m.Dosis, m.Via_id, m.Fecha_inicio, m.Fecha_fin,
         m.Intervalo_horas, m.Observaciones, m.Estado, m.Fecha_registro,
         m.Foto_Frontal, m.Foto_Trasera,
         v.Nombre AS Via_nombre
       FROM Medicamentos m
       LEFT JOIN Vias v ON v.Via_id = m.Via_id
       WHERE m.Usuario_id = ?
       ORDER BY m.Fecha_registro DESC`,
      [Usuario_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(
      "GET /api/medicamentos error:",
      err?.sqlMessage || err?.message
    );
    res.status(500).json({ error: "Error al obtener medicamentos" });
  }
});

module.exports = router;
