// Backend/server.js
require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");

// Importar tus rutas
const tomasRoutes = require("./routes/tomas");
const glucosaRoutes = require("./routes/glucosa");

const app = express();
const PORT = process.env.PORT || 3000;

/* ================== MIDDLEWARES ================== */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

/* ================== RUTAS PRINCIPALES ================== */

app.use("/api/auth", require("./routes/auth"));

app.use("/api/citas", require("./routes/citas"));
app.use("/api/usuarios", require("./routes/usuarios"));
app.use("/api/laboratorios", require("./routes/laboratorios"));
app.use("/api/medicamentos", require("./routes/medicamentos"));
app.use("/api/vias", require("./routes/vias"));
app.use("/api/glucosa", glucosaRoutes);
app.use("/api/tomas", tomasRoutes);

app.get("/health", (_req, res) => res.json({ ok: true }));

/* ================== MANEJO DE ERRORES ================== */

app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, _req, res, _next) => {
  console.error("Error no controlado:", err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Error interno del servidor" });
});

/* ================== INICIO DEL SERVIDOR ================== */
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
