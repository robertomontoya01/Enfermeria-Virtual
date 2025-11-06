// Backend/routes/glucosa.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// Utilidad: valida fecha YYYY-MM-DD
function isYYYYMMDD(s) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

/**
 * GET /api/glucosa
 * Lista registros del usuario autenticado.
 */
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { from, to, limit = 200, offset = 0 } = req.query;

    const params = [userId];
    let where = " WHERE usuario_id = ? ";

    if (from && isYYYYMMDD(from)) {
      where += " AND fecha >= ? ";
      params.push(from);
    }
    if (to && isYYYYMMDD(to)) {
      where += " AND fecha <= ? ";
      params.push(to);
    }

    const sql = `
      SELECT id, usuario_id, fecha, paso_index, paso, valor, created_at
      FROM glucosa_registros
      ${where}
      ORDER BY fecha DESC, id DESC
      LIMIT ? OFFSET ?
    `;
    params.push(Number(limit), Number(offset));

    const [rows] = await db.query(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error("GET /api/glucosa", err?.message);
    return res.status(500).json({ message: "Error al obtener registros" });
  }
});

/**
 * GET /api/glucosa/hoy
 * Devuelve { existe: boolean, registro?: {...} } para bloquear en el cliente.
 */
router.get("/hoy", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `
      SELECT id, usuario_id, fecha, paso_index, paso, valor, created_at
      FROM glucosa_registros
      WHERE usuario_id = ? AND fecha = CURDATE()
      LIMIT 1
      `,
      [userId]
    );

    if (rows.length > 0) {
      return res.json({ existe: true, registro: rows[0] });
    }
    return res.json({ existe: false });
  } catch (err) {
    console.error("GET /api/glucosa/hoy", err?.message);
    return res
      .status(500)
      .json({ message: "Error al verificar el registro de hoy" });
  }
});

/**
 * POST /api/glucosa
 * Crea el registro del día.
 */
router.post("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    let { fecha, paso, paso_index, valor } = req.body || {};

    // Validaciones básicas
    if (!fecha || !isYYYYMMDD(fecha)) {
      return res
        .status(400)
        .json({ message: "Fecha inválida. Usa YYYY-MM-DD." });
    }
    if (typeof paso_index !== "number" || paso_index < 0 || paso_index > 5) {
      return res.status(400).json({ message: "paso_index inválido (0..5)." });
    }
    if (!paso || typeof paso !== "string" || paso.trim().length < 3) {
      return res.status(400).json({ message: "Paso inválido." });
    }
    const nValor = Number(valor);
    if (!valor || Number.isNaN(nValor) || nValor <= 0) {
      return res.status(400).json({ message: "Valor de glucosa inválido." });
    }

    // Insert
    try {
      const [result] = await db.query(
        `
        INSERT INTO glucosa_registros (usuario_id, fecha, paso_index, paso, valor)
        VALUES (?, ?, ?, ?, ?)
        `,
        [userId, fecha, paso_index, paso.trim(), nValor]
      );

      return res.status(201).json({
        id: result.insertId,
        usuario_id: userId,
        fecha,
        paso_index,
        paso: paso.trim(),
        valor: nValor,
      });
    } catch (e) {
      if (e?.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ message: "Ya existe un registro para la fecha indicada." });
      }
      throw e;
    }
  } catch (err) {
    console.error("POST /api/glucosa", err?.message);
    return res.status(500).json({ message: "Error al crear registro" });
  }
});

module.exports = router;
