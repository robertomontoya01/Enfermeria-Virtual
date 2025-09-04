// Backend/server.js
require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "2mb" })); // las fotos ya no van en JSON
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ✅ Servir archivos subidos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas
app.use("/api/auth", require("./routes/auth"));
app.use("/api/citas", require("./routes/citas"));
app.use("/api/usuarios", require("./routes/usuarios"));
app.use("/api/laboratorios", require("./routes/laboratorios"));
app.use("/api/medicamentos", require("./routes/medicamentos"));
app.use("/api/vias", require("./routes/vias"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use((req, res) => {
  res
    .status(404)
    .json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

app.use((err, _req, res, _next) => {
  console.error("Error no controlado:", err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
