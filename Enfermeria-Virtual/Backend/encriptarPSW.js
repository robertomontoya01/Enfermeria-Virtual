require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function encriptarContrasenas() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "enfermeria_virtual",
    port: process.env.DB_PORT || 3306,
    ssl:
      process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined,
  });

  try {
    const [usuarios] = await connection.execute(
      "SELECT id, password FROM Usuarios"
    );

    for (const usuario of usuarios) {
      const { id, password } = usuario;

      // Verifica si la contraseña ya está encriptada
      const isHashed =
        password.startsWith("$2a$") || password.startsWith("$2b$");
      if (isHashed) continue; // Evita volver a encriptar

      const hashedPassword = await bcrypt.hash(password, 10);

      await connection.execute(
        "UPDATE Usuarios SET password = ? WHERE id = ?",
        [hashedPassword, id]
      );

      console.log(`Contraseña del usuario ${id} encriptada.`);
    }

    console.log("✅ Proceso completado correctamente.");
  } catch (error) {
    console.error("❌ Error al encriptar contraseñas:", error);
  } finally {
    await connection.end();
  }
}

encriptarContrasenas();
