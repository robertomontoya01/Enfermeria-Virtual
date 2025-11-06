// Backend/routes/vias.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/vias -> devuelve todas las vías
router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT Via_id, Nombre, Descripcion FROM vias ORDER BY Nombre ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error en GET /vias:", err);
    res.status(500).json({ error: "Error al obtener vías" });
  }
});

module.exports = router;
