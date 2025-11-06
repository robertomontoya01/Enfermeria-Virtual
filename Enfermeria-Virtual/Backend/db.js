require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: "Amazon RDS", // usa SSL tipo Amazon RDS
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 20000,
});

pool
  .getConnection()
  .then(() =>
    console.log(
      "✅ Conexión establecida a MySQL (Railway público con Amazon RDS SSL)"
    )
  )
  .catch((err) => console.error("❌ Error de conexión MySQL:", err.message));

module.exports = pool;
