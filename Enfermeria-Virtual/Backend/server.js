const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

/* ========= REGISTRO DE USUARIO ========= */
app.post("/api/register", async (req, res) => {
  const {
    nombre,
    apellidos,
    email,
    telefono,
    password,
    tipo_usuario_id,
    especialidad_id,
  } = req.body;

  try {
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO Usuarios (Nombre, Apellidos, email, Telefono, password, Tipo_usuario_id, Especialidad_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [
        nombre,
        apellidos,
        email,
        telefono,
        hashedPassword,
        tipo_usuario_id,
        especialidad_id || null,
      ],
      (err, results) => {
        if (err) {
          console.error("Error al registrar usuario:", err);
          return res.status(500).json({ error: "Error al registrar usuario" });
        }
        res.json({ mensaje: "Usuario registrado correctamente" });
      }
    );
  } catch (error) {
    console.error("Error al encriptar contraseña:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

/* ========= LOGIN ========= */
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM Usuarios WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Error en login:", err);
      return res.status(500).json({ error: "Error interno" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = results[0];

    // Verificar contraseña
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    res.json({
      mensaje: "Login exitoso",
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
app.get("/api/citas", (req, res) => {
  const query = `
    SELECT 
      Citas.ID, 
      Citas.Fecha_cita,
      Citas.DoctorID,
      Citas.PacienteID,
      Citas.StatusID,
      Citas.LaboratorioID,
      CONCAT(U.Nombre, ' ', U.Apellidos) AS doctorNombre,
      L.Nombre AS laboratorioNombre,
      SC.Status_citas AS statusNombre
    FROM Citas
    LEFT JOIN Usuarios U ON Citas.DoctorID = U.id
    LEFT JOIN Laboratorios L ON Citas.LaboratorioID = L.id
    LEFT JOIN Status_citas SC ON Citas.StatusID = SC.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener citas:", err);
      return res.status(500).json({ error: "Error al obtener citas" });
    }
    res.json(results);
  });
});

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
