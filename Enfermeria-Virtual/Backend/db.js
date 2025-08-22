const mysql = require("mysql2");

// Crear conexión con la base de datos
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "enfermeria_virtual",
});

// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err);
    return;
  }
  console.log("Conectado a MySQL correctamente");
});

// Exportar la conexión para usar en server.js
module.exports = connection;
