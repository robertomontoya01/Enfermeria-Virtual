// Backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../db");

const SECRET_KEY = process.env.JWT_SECRET || "mi_secreto_super_seguro";

/* ========= Registro ========= */
router.post("/register", async (req, res) => {
  try {
    const {
      Nombre,
      Apellidos,
      Fecha_Nacimiento,
      Email,
      Telefono,
      Password,
      Especialidad_id,
    } = req.body;

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

    const emailNorm = String(Email).trim().toLowerCase();
    const telNorm = String(Telefono).trim();

    const [[emailDup]] = await db.execute(
      "SELECT COUNT(*) AS c FROM Usuarios WHERE LOWER(Email)=LOWER(?)",
      [emailNorm]
    );
    if (emailDup.c > 0) {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }

    const [[telDup]] = await db.execute(
      "SELECT COUNT(*) AS c FROM Usuarios WHERE Telefono = ?",
      [telNorm]
    );
    if (telDup.c > 0) {
      return res.status(409).json({ error: "El teléfono ya está registrado" });
    }

    const Tipo_usuario_id = 1;
    const hashed = await bcrypt.hash(Password, 10);

    const [result] = await db.execute(
      `INSERT INTO Usuarios
        (Nombre, Apellidos, Fecha_Nacimiento, Email, Telefono, Password, Tipo_usuario_id, Especialidad_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Nombre,
        Apellidos,
        Fecha_Nacimiento,
        emailNorm,
        telNorm,
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
    if (error && error.code === "ER_DUP_ENTRY") {
      const msg = (error.sqlMessage || "").toLowerCase();
      if (msg.includes("email")) {
        return res.status(409).json({ error: "El correo ya está registrado" });
      }
      if (
        msg.includes("telefono") ||
        msg.includes("tel") ||
        msg.includes("phone")
      ) {
        return res
          .status(409)
          .json({ error: "El teléfono ya está registrado" });
      }
      return res.status(409).json({ error: "Dato duplicado (índice único)" });
    }
    console.error("Error en /register:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* ========= Login ========= */
router.post("/login", async (req, res) => {
  const email = (req.body.Email || req.body.email || "")
    .toString()
    .trim()
    .toLowerCase();
  const plainPassword = (
    req.body.Password ||
    req.body.password ||
    ""
  ).toString();

  try {
    if (!email || !plainPassword) {
      return res
        .status(400)
        .json({ error: "Email y contraseña son obligatorios" });
    }

    const [rows] = await db.execute(
      `SELECT 
         id,
         Nombre,
         Apellidos,
         Email   AS email,
         Telefono,
         Password AS password,
         Tipo_usuario_id
       FROM Usuarios
       WHERE Email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(plainPassword, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id, type: user.Tipo_usuario_id === 1 ? "paciente" : "doctor" },
      SECRET_KEY,
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

/* ========= Registro de doctor con datos genéricos ========= */
router.post("/register-doctor", async (req, res) => {
  const { Nombre, Apellidos, Email, Telefono } = req.body;

  if (!Nombre || !Apellidos || !Email || !Telefono) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const Tipo_usuario_id = 2; // Doctor
    const Fecha_Nacimiento = "1970-01-01";
    const Password = "default123";
    const Especialidad_id = null;

    const hashed = await bcrypt.hash(Password, 10);

    const emailNorm = String(Email).trim().toLowerCase();

    const [result] = await db.execute(
      `INSERT INTO Usuarios 
       (Nombre, Apellidos, Fecha_Nacimiento, Email, Telefono, Password, Tipo_usuario_id, Especialidad_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Nombre,
        Apellidos,
        Fecha_Nacimiento,
        emailNorm,
        Telefono,
        hashed,
        Tipo_usuario_id,
        Especialidad_id,
      ]
    );

    res.json({ mensaje: "Doctor registrado", userId: result.insertId });
  } catch (error) {
    if (error && error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }
    console.error("Error en /register-doctor:", error);
    res.status(500).json({ error: "Error al registrar doctor" });
  }
});

module.exports = router;
