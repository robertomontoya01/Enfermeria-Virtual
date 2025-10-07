// Backend/routes/laboratorios.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// === GET /api/laboratorios ===
// Lista de laboratorios del usuario autenticado
router.get("/", auth, async (req, res) => {
  try {
    const usuarioId = req.user?.id; // 👈 viene del token
    if (!usuarioId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const [rows] = await db.execute(
      `SELECT 
         id,
         Nombre      AS nombre,
         Direccion   AS direccion,
         Telefono    AS telefono,
         Ubicacion   AS ubicacion,
         Registrado_por AS registrado_por,
         Fecha_registro,
         Ultima_modificacion
       FROM Laboratorios
       WHERE Registrado_por = ?   -- 👈 filtro por usuario logeado
       ORDER BY id DESC`,
      [usuarioId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error en GET /laboratorios:", err?.message || err);
    res.status(500).json({ error: "Error al obtener laboratorios" });
  }
});

// === POST /api/laboratorios ===
router.post("/", auth, async (req, res) => {
  try {
    const usuarioId = req.user?.id; // 👈 viene del middleware auth (JWT)
    if (!usuarioId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    let { nombre, direccion, telefono, ubicacion } = req.body || {};

    if (!nombre || !direccion) {
      return res
        .status(400)
        .json({ error: "Nombre y dirección son obligatorios" });
    }

    nombre = String(nombre).trim();
    direccion = String(direccion).trim();
    telefono = telefono ? String(telefono).trim() : null;
    ubicacion = ubicacion ? String(ubicacion).trim() : null;

    const [result] = await db.execute(
      `INSERT INTO Laboratorios (Nombre, Direccion, Telefono, Ubicacion, Registrado_por)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, direccion, telefono, ubicacion, usuarioId]
    );

    return res.status(201).json({
      id: result.insertId,
      nombre,
      direccion,
      telefono,
      ubicacion,
      registrado_por: usuarioId,
      message: "Laboratorio creado correctamente",
    });
  } catch (err) {
    console.error("Error en POST /laboratorios:", err?.message || err);
    res.status(500).json({ error: "Error al crear laboratorio" });
  }
});

module.exports = router;
