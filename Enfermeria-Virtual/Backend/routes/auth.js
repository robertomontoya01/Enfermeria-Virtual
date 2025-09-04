// Backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs"); // usa bcryptjs para compatibilidad
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../db");

const SECRET_KEY = process.env.JWT_SECRET || "mi_secreto_super_seguro";

// Registro (paciente por defecto)
router.post("/register", async (req, res) => {
  const {
    Nombre,
    Apellidos,
    Fecha_Nacimiento, // "YYYY-MM-DD"
    Email,
    Telefono,
    Password, // texto plano desde el cliente
    Especialidad_id, // opcional (normalmente null para paciente)
  } = req.body;

  try {
    // Validaciones básicas
    if (
      !Nombre ||
      !Apellidos ||
      !Fecha_Nacimiento ||
      !Email ||
      !Telefono ||
      !Password
    ) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Forzar paciente
    const Tipo_usuario_id = 2;

    // Hash de contraseña
    const hashed = await bcrypt.hash(Password, 10);

    // Insert
    const [result] = await db.execute(
      `INSERT INTO Usuarios
       (Nombre, Apellidos, Fecha_Nacimiento, Email, Telefono, Password, Tipo_usuario_id, Especialidad_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Nombre,
        Apellidos,
        Fecha_Nacimiento,
        Email,
        Telefono,
        hashed,
        Tipo_usuario_id,
        Especialidad_id || null,
      ]
    );

    return res.json({
      mensaje: "Usuario registrado correctamente",
      userId: result.insertId,
    });
  } catch (error) {
    // Duplicado (email único)
    if (error && error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }
    console.error("Error en /register:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Login (devuelve JWT)
// routes/auth.js (solo la ruta de login)
router.post("/login", async (req, res) => {
  // Acepta tanto Email/Password como email/password
  const email = req.body.Email || req.body.email;
  const plainPassword = req.body.Password || req.body.password;

  try {
    if (!email || !plainPassword) {
      return res
        .status(400)
        .json({ error: "Email y contraseña son obligatorios" });
    }

    // OJO: en la DB la columna es 'email' (todo minúsculas)
    const [rows] = await db.execute("SELECT * FROM Usuarios WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = rows[0];

    // OJO: en la DB la columna es 'password' (minúsculas)
    const ok = await bcrypt.compare(plainPassword, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id, type: user.Tipo_usuario_id === 1 ? "paciente" : "doctor" },
      process.env.JWT_SECRET || "mi_secreto_super_seguro",
      { expiresIn: "2h" }
    );

    res.json({
      mensaje: "Login exitoso",
      token,
      usuario: {
        id: user.id,
        nombre: `${user.Nombre} ${user.Apellidos}`,
        email: user.email,
        tipo_usuario: user.Tipo_usuario_id,
      },
    });
  } catch (error) {
    console.error("Error en /api/auth/login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
