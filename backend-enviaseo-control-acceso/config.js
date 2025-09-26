const config = {
  PORT: process.env.PORT || 5001,
  UPLOAD_FOLDER: "uploads_excel",
  DATABASE_FILE: "database.json",
  // Permitir cualquier origen por defecto para portabilidad en red local
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  ALLOWED_FILE_TYPES: [".xlsx", ".xls"],
  PAGE_SIZE: 10,
};

const excelConfig = {
  HEADER_SEARCH_TERMS: {
    nombreArchivo: [
      "Nombre de archivo", "nombre de archivo", "Nombre Archivo", "nombre archivo",
      "File Name", "file name", "Filename", "filename"
    ],
    id: [
      "ID", "id", "Identificación", "identificacion", "Identificacion",
      "Identification", "identification"
    ],
    temperatura: [
      "Temperatura", "temperatura", "Temperature", "temperature",
      "Temp", "temp"
    ],
    estadoTemperatura: [
      "Estado de la temperatura", "estado de la temperatura", "Estado Temperatura", "estado temperatura",
      "Temperature Status", "temperature status", "Temp Status", "temp status"
    ],
    usandoMascara: [
      "Usando máscara o no", "usando máscara o no", "Usando mascara o no", "usando mascara o no",
      "Using Mask", "using mask", "Mask", "mask", "Máscara", "mascara"
    ],
    numeroTarjeta: [
      "Número de tarjeta", "numero de tarjeta", "Número Tarjeta", "numero tarjeta",
      "Card Number", "card number", "Card No", "card no", "Tarjeta", "tarjeta"
    ],
    grupoPersonas: [
      "Grupo de personas", "grupo de personas", "Grupo Personas", "grupo personas",
      "People Group", "people group", "Group", "group", "Grupo", "grupo"
    ],
    tiempo: [
      "Tiempo", "tiempo", "Time", "time", "Hora", "hora", "Horario", "horario"
    ],
    puntoAcceso: [
      "Punto de acceso", "punto de acceso", "Punto Acceso", "punto acceso",
      "Access Point", "access point", "AccessPoint", "accesspoint"
    ],
    lectorTarjetas: [
      "Lector de tarjetas", "lector de tarjetas", "Lector Tarjetas", "lector tarjetas",
      "Card Reader", "card reader", "Reader", "reader"
    ],
    resultadoAutenticacion: [
      "Resultado de la autenticación", "resultado de la autenticacion", "Resultado Autenticacion", "resultado autenticacion",
      "Authentication Result", "authentication result", "Auth Result", "auth result"
    ],
    tipoAutenticacion: [
      "Tipo de autenticación", "tipo de autenticacion", "Tipo Autenticacion", "tipo autenticacion",
      "Authentication Type", "authentication type", "Auth Type", "auth type"
    ],
    tipoAsistencia: [
      "Tipo de asistencia", "tipo de asistencia", "Tipo Asistencia", "tipo asistencia",
      "Attendance Type", "attendance type", "Assistance Type", "assistance type"
    ]
  },
  MIN_CEDULA_LENGTH: 1,
  DEBUG_ROWS: 3,
  
  ACCESS_CONTROL_CONFIG: {
    EVENT_TYPES: {
      ENTRADA: ["Entrada", "entrada", "In", "in", "Entrar", "entrar", "Ingreso", "ingreso", "Entrance", "entrance"],
      SALIDA: ["Salida", "salida", "Out", "out", "Salir", "salir", "Egreso", "egreso", "Exit", "exit"],
      ACCESO_DENEGADO: ["Acceso Denegado", "acceso denegado", "Denied", "denied", "Rechazado", "rechazado", "Access Denied"],
      SUPERVISION: ["Supervisión", "supervision", "Supervision", "supervision", "Monitoreo", "monitoreo", "Monitoring"]
    },
    
    COMMON_ACCESS_POINTS: [
      "Entrada Principal", "Salida Principal", "Entrada de Empleados", "Salida de Empleados",
      "Entrada de Vehículos", "Salida de Vehículos", "Puerta de Seguridad", "Control de Acceso"
    ],
    
    VALIDATIONS: {
      requireTimeFormat: true,
      requireDateFormat: false,
      maxRecordsPerFile: 10000,
      allowDuplicateEntries: false,
      groupByPerson: false,
      extractDateFromTime: true
    },
    
    GROUPING: {
      primaryKey: "nombreArchivo",
      secondaryKey: "grupoPersonas",
      timeField: "tiempo",
      attendanceField: "tipoAsistencia"
    }
  }
};

export { config, excelConfig };
