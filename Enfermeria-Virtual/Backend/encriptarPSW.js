const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function encriptarContrasenas() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "enfermeria_virtual",
  });

  try {
    const [usuarios] = await connection.execute(
      "SELECT id, password FROM Usuarios"
    );

    for (const usuario of usuarios) {
      const { id, password } = usuario;

      // Encripta la contraseña (asumiendo que está sin encriptar)
      const hashedPassword = await bcrypt.hash(password, 10);

      await connection.execute(
        "UPDATE Usuarios SET password = ? WHERE id = ?",
        [hashedPassword, id]
      );

      console.log(`Contraseña del usuario ${id} encriptada.`);
    }

    console.log("Proceso completado.");
  } catch (error) {
    console.error("Error al encriptar contraseñas:", error);
  } finally {
    await connection.end();
  }
}

encriptarContrasenas();
