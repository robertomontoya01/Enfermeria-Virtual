require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("fs");

const caCert = fs.readFileSync(__dirname + "/certs/ca.pem");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: {
    ca: caCert,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool
  .getConnection()
  .then(() =>
    console.log("✅ Conexión establecida con certificado SSL (Railway MySQL)")
  )
  .catch((err) => console.error("❌ Error de conexión MySQL:", err.message));

module.exports = pool;
