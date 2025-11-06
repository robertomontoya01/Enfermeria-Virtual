require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: {
    // Railway usa certificados auto-firmados, por eso usamos esta configuración
    minVersion: "TLSv1.2",
    rejectUnauthorized: false,
  },
  connectTimeout: 20000, // 20 segundos para conectar
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

pool
  .getConnection()
  .then(() =>
    console.log(
      "✅ Conexión establecida con MySQL (Railway público con TLSv1.2)"
    )
  )
  .catch((err) => console.error("❌ Error de conexión MySQL:", err.message));

module.exports = pool;
