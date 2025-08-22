const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const db = require("../db");

// Registro de usuario (para pruebas)
router.post("/register", async (req, res) => {
  const {
    Nombre,
    Apellidos,
    email,
    password,
    Telefono,
    Especialidad_id,
    Tipo_usuario_id,
  } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO Usuarios 
      (Nombre, Apellidos, email, password, Telefono, Especialidad_id, Tipo_usuario_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        Nombre,
        Apellidos,
        email,
        hashedPassword,
        Telefono,
        Especialidad_id,
        Tipo_usuario_id,
      ]
    );
    res.json({ mensaje: "Usuario registrado" });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM Usuarios WHERE email = ?", [
      email,
    ]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "Usuario no encontrado" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Contraseña incorrecta" });

    res.json({
      mensaje: "Login exitoso",
      usuario: {
        id: user.id,
        nombre: `${user.Nombre} ${user.Apellidos}`,
        email: user.email,
        tipo_usuario: user.Tipo_usuario_id,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

module.exports = router;
