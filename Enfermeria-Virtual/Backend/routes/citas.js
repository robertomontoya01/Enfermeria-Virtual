app.get("/api/citas", (req, res) => {
  const { userId, type } = req.query;

  let condition = "";
  if (type === "paciente") {
    condition = "WHERE Citas.PacienteID = ?";
  } else if (type === "doctor") {
    condition = "WHERE Citas.DoctorID = ?";
  }

  const query = `
    SELECT 
      Citas.ID, 
      Citas.Fecha_cita,
      Citas.DoctorID,
      Citas.PacienteID,
      Citas.StatusID,
      Citas.LaboratorioID,
      CONCAT(U.Nombre, ' ', U.Apellidos) AS doctorNombre,
      L.Nombre AS laboratorioNombre,
      SC.Status_citas AS statusNombre
    FROM Citas
    LEFT JOIN Usuarios U ON Citas.DoctorID = U.id
    LEFT JOIN Laboratorios L ON Citas.LaboratorioID = L.id
    LEFT JOIN Status_citas SC ON Citas.StatusID = SC.id
    ${condition}
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error al obtener citas:", err);
      return res.status(500).json({ error: "Error al obtener citas" });
    }
    res.json(results);
  });
});
