// server.js
const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./db");

app.use(cors());
app.use(express.json());

// Rutas básicas
app.get("/", (req, res) => {
  res.send("API del laboratorio médico");
});

// Ejemplo: obtener todas las citas
app.get("/citas", (req, res) => {
  db.query("SELECT * FROM citas", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
