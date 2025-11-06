// Backend/routes/tomas.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

/**
 * GET /api/tomas
 * Lista todas las tomas del usuario autenticado
 */
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT 
        t.Toma_id,
        t.Medicamento_id,
        m.Nombre AS Nombre_medicamento,
        m.Dosis,
        t.Fecha_hora_programada,
        t.Fecha_hora_real,
        t.Estatus_id,
        t.Observaciones
      FROM tomas_medicamento t
      JOIN medicamentos m ON m.Medicamento_id = t.Medicamento_id
      WHERE t.Usuario_id = ?
      ORDER BY t.Fecha_hora_programada DESC
      `,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET /api/tomas", err?.message);
    res.status(500).json({ message: "Error al obtener tomas" });
  }
});

/**
 * GET /api/tomas/proximas?limit=10
 * Próximas tomas PENDIENTES (Estatus_id = 1) a partir de ahora
 */
router.get("/proximas", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Number(req.query.limit ?? 10);

    const [rows] = await db.query(
      `
      SELECT 
        t.Toma_id,
        t.Medicamento_id,
        m.Nombre AS Nombre_medicamento,
        m.Dosis,
        t.Fecha_hora_programada,
        t.Estatus_id,
        t.Observaciones
      FROM tomas_medicamento t
      JOIN medicamentos m ON m.Medicamento_id = t.Medicamento_id
      WHERE t.Usuario_id = ?
        AND t.Estatus_id = 1
        AND t.Fecha_hora_programada >= NOW()
      ORDER BY t.Fecha_hora_programada ASC
      LIMIT ?
      `,
      [userId, limit]
    );

    res.json(rows);
  } catch (err) {
    console.error("GET /api/tomas/proximas", err?.message);
    res.status(500).json({ message: "Error al obtener próximas tomas" });
  }
});

/**
 * PUT /api/tomas/:id/tomar
 */
router.put("/:id/tomar", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const tomaId = Number(req.params.id);
    const { observaciones } = req.body || {};

    const [result] = await db.query(
      `
      UPDATE tomas_medicamento
      SET Estatus_id = 2,
          Fecha_hora_real = NOW(),
          Observaciones = COALESCE(?, Observaciones)
      WHERE Toma_id = ? AND Usuario_id = ?
      `,
      [observaciones ?? null, tomaId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Toma no encontrada" });
    }

    res.json({ message: "Toma marcada como Tomada" });
  } catch (err) {
    console.error("PUT /api/tomas/:id/tomar", err?.message);
    res.status(500).json({ message: "Error al actualizar la toma" });
  }
});

/**
 * PUT /api/tomas/:id/omitir
 */
router.put("/:id/omitir", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const tomaId = Number(req.params.id);
    const { observaciones } = req.body || {};

    const [result] = await db.query(
      `
      UPDATE tomas_medicamento
      SET Estatus_id = 3,
          Observaciones = COALESCE(?, Observaciones)
      WHERE Toma_id = ? AND Usuario_id = ?
      `,
      [observaciones ?? null, tomaId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Toma no encontrada" });
    }

    res.json({ message: "Toma marcada como Omitida" });
  } catch (err) {
    console.error("PUT /api/tomas/:id/omitir", err?.message);
    res.status(500).json({ message: "Error al actualizar la toma" });
  }
});

module.exports = router;
