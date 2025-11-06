// Backend/routes/usuarios.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// === GET /api/usuarios ===
// Devuelve todos los usuarios o filtra por tipo (doctor o paciente)
router.get("/", async (req, res) => {
  const { tipo } = req.query;

  try {
    let query =
      "SELECT id, CONCAT(Nombre, ' ', Apellidos) AS nombreCompleto FROM usuarios";

    if (tipo === "doctor") query += " WHERE Tipo_usuario_id = 2";
    else if (tipo === "paciente") query += " WHERE Tipo_usuario_id = 1";

    const [rows] = await db.execute(query);
    res.json(rows);
  } catch (err) {
    console.error("Error en GET /usuarios:", err.message);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

module.exports = router;
