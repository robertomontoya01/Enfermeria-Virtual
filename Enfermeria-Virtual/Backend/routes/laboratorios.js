// Backend/routes/laboratorios.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// Obtener laboratorios
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, Nombre AS nombre FROM Laboratorios"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error en GET /laboratorios:", err);
    res.status(500).json({ error: "Error al obtener laboratorios" });
  }
});

module.exports = router;
