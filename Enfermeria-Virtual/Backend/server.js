const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db"); // tu conexión a MySQL
const app = express();
const PORT = 3000;
const SECRET_KEY = "mi_secreto_super_seguro"; // cámbialo por algo más seguro

app.use(cors());
app.use(express.json());

/* ========= MIDDLEWARE DE AUTENTICACIÓN ========= */
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Token requerido" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.user = user; // { id: X, type: "paciente"/"doctor" }
    next();
  });
}

/* ========= REGISTRO ========= */
app.post("/api/register", async (req, res) => {
  const {
    nombre,
    apellidos,
    fecha_nacimiento,
    email,
    telefono,
    password,
    especialidad_id,
  } = req.body;

  try {
    if (
      !nombre ||
      !apellidos ||
      !fecha_nacimiento ||
      !email ||
      !telefono ||
      !password
    ) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔒 Forzar el tipo de usuario (ejemplo: 2 = paciente)
    const tipo_usuario_id = 2;

    const query = `
      INSERT INTO Usuarios 
      (Nombre, Apellidos, Fecha_Nacimiento, Email, Telefono, Password, Tipo_usuario_id, Especialidad_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [
        nombre,
        apellidos,
        fecha_nacimiento,
        email,
        telefono,
        hashedPassword,
        tipo_usuario_id, // 👈 siempre paciente
        especialidad_id || null,
      ],
      (err, results) => {
        if (err) {
          console.error("Error en la BD:", err);
          return res
            .status(500)
            .json({ error: "Error al registrar usuario en la base de datos" });
        }

        res.json({
          mensaje: "Usuario registrado correctamente",
          userId: results.insertId,
        });
      }
    );
  } catch (error) {
    console.error("Error al encriptar contraseña:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* ========= LOGIN ========= */
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM Usuarios WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Error interno" });
    if (results.length === 0)
      return res.status(401).json({ error: "Usuario no encontrado" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ error: "Contraseña incorrecta!" });

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
  });
});

/* ========= OBTENER CITAS ========= */
app.get("/api/citas", authMiddleware, (req, res) => {
  const { id: userId } = req.user;
  const query = `
    SELECT 
      Citas.ID, 
      Citas.Fecha_cita,
      Citas.DoctorID,
      Citas.PacienteID,
      Citas.StatusID,
      Citas.LaboratorioID,
      Citas.Motivo,
      CONCAT(U.Nombre, ' ', U.Apellidos) AS doctorNombre,
      L.Nombre AS laboratorioNombre,
      SC.Status_citas AS statusNombre
    FROM Citas
    LEFT JOIN Usuarios U ON Citas.DoctorID = U.id
    LEFT JOIN Laboratorios L ON Citas.LaboratorioID = L.id
    LEFT JOIN Status_citas SC ON Citas.StatusID = SC.id
    WHERE Citas.DoctorID = ? OR Citas.PacienteID = ?
    order by Citas.Fecha_cita ASC
  `;
  db.query(query, [userId, userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener citas" });
    res.json(results);
  });
});

/* ========= CREAR CITA CON VALIDACIONES ========= */
app.post("/api/citas", authMiddleware, (req, res) => {
  const { Motivo, DoctorID, LaboratorioID, Fecha_cita } = req.body;

  if (!Motivo || !DoctorID || !Fecha_cita) {
    return res
      .status(400)
      .json({ error: "Motivo, Doctor y Fecha son obligatorios" });
  }

  const pacienteID = req.user.id; // paciente que hace la cita
  const fecha = new Date(Fecha_cita);

  // Validar que la fecha sea futura
  if (fecha <= new Date()) {
    return res
      .status(400)
      .json({ error: "La fecha de la cita debe ser futura" });
  }

  // Validar que el doctor no tenga otra cita a la misma hora
  const checkQuery = `
    SELECT * FROM Citas 
    WHERE DoctorID = ? AND Fecha_cita = ?
  `;
  db.query(checkQuery, [DoctorID, Fecha_cita], (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ error: "Error al verificar disponibilidad" });
    if (results.length > 0) {
      return res
        .status(400)
        .json({ error: "El doctor ya tiene una cita a esa hora" });
    }

    // Insertar cita
    const insertQuery = `
      INSERT INTO Citas (PacienteID, DoctorID, LaboratorioID, Fecha_cita, Motivo, StatusID)
      VALUES (?, ?, ?, ?, ?, 1)
    `;
    db.query(
      insertQuery,
      [pacienteID, DoctorID, LaboratorioID || null, Fecha_cita, Motivo],
      (err, results) => {
        if (err) return res.status(500).json({ error: "Error al crear cita" });
        res.json({
          mensaje: "Cita creada correctamente",
          id: results.insertId,
        });
      }
    );
  });
});

/* ========= USUARIOS ========= */
app.get("/api/usuarios", (req, res) => {
  const { tipo } = req.query;
  let query =
    "SELECT id, CONCAT(Nombre, ' ', Apellidos) AS nombreCompleto FROM Usuarios";
  if (tipo === "doctor") query += " WHERE Tipo_usuario_id = 2";
  else if (tipo === "paciente") query += " WHERE Tipo_usuario_id = 1";

  db.query(query, (err, results) => {
    if (err)
      return res.status(500).json({ error: "Error al obtener usuarios" });
    res.json(results);
  });
});

/* ========= LABORATORIOS ========= */
app.get("/api/laboratorios", (req, res) => {
  const query = "SELECT id, Nombre AS nombre FROM Laboratorios";
  db.query(query, (err, results) => {
    if (err)
      return res.status(500).json({ error: "Error al obtener laboratorios" });
    res.json(results);
  });
});

app.listen(PORT, () =>
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
);
