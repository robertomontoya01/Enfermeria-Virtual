// db.js
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost", // o IP de tu servidor MySQL
  user: "root", // tu usuario
  password: "root", // tu contraseña
  database: "laboratorio", // nombre de tu base
});

db.connect((err) => {
  if (err) {
    console.error("Error conectando a la BD:", err);
    return;
  }
  console.log("Conectado a MySQL");
});

module.exports = db;
