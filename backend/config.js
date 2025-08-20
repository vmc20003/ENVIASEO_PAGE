export const config = {
  PORT: process.env.PORT || 4000,
  UPLOAD_FOLDER: "uploads_excel",
  DATABASE_FILE: "database.json",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "https://alcaldia-frontend.onrender.com",
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [".xlsx", ".xls"],
  PAGE_SIZE: 10,
};

export const excelConfig = {
  // Configuraciones para el procesamiento de Excel
  HEADER_SEARCH_TERMS: {
    firstName: ["First Name", "FirstName", "firstname", "Nombre", "nombre"],
    lastName: ["Last Name", "LastName", "lastname", "Apellido", "apellido"],
    personNo: [
      "Person No.",
      "PersonNo",
      "personno",
      "Card No.",
      "Cedula",
      "cedula",
    ],
    time: ["Time", "time", "Hora", "hora"],
    accessPoint: ["Access Point", "AccessPoint", "accesspoint", "Punto Acceso"],
    attendanceType: [
      "Attendance Type",
      "AttendanceType",
      "Event Type",
      "Tipo Asistencia",
    ],
  },
  MIN_CEDULA_LENGTH: 1,
  DEBUG_ROWS: 3, // Número de filas para mostrar en logs de depuración
};
