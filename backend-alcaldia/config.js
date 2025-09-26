// Configuración para desarrollo y producción
const config = {
  development: {
    port: 4001,
    // Permitir cualquier origen por defecto para portabilidad en red local
    corsOrigin: process.env.FRONTEND_URL || "*",
    database: {
      type: "memory" // Base de datos en memoria para desarrollo
    }
  },
  production: {
    port: process.env.PORT || 4001,
    corsOrigin: process.env.FRONTEND_URL || "*",
    database: {
      type: "memory" // Por ahora mantenemos en memoria, después podemos migrar a PostgreSQL
    }
  }
};

// Determinar el entorno
const environment = process.env.NODE_ENV || 'development';
const currentConfig = config[environment];

export default currentConfig;

export const excelConfig = {
  // Configuraciones para el procesamiento de Excel de Alcaldía de Envigado
  HEADER_SEARCH_TERMS: {
    idPersona: [
      "ID de persona",
      "ID de Persona",
      "ID Persona",
      "Person ID",
      "ID",
      "id",
      "identificación",
      "Identificación",
      "cedula",
      "Cedula",
      "documento",
      "Documento",
      "numero",
      "Número",
      "numero de documento",
      "Número de documento",
      "código",
      "Codigo",
      "código de empleado",
      "Codigo de empleado",
      "employee id",
      "Employee ID",
      "legajo",
      "Legajo"
    ],
    nombre: [
      "Nombre", 
      "nombre", 
      "Name", 
      "name",
      "nombres",
      "Nombres",
      "primer nombre",
      "Primer nombre",
      "apellido",
      "Apellido",
      "apellidos",
      "Apellidos",
      "persona",
      "Persona",
      "empleado",
      "Empleado",
      "employee",
      "Employee",
      "full name",
      "Full Name",
      "nombre completo",
      "Nombre completo"
    ],
    departamento: [
      "Departamento", 
      "departamento", 
      "Department", 
      "department",
      "area",
      "Area",
      "seccion",
      "Sección",
      "oficina",
      "Oficina",
      "sector",
      "Sector",
      "division",
      "Division",
      "unidad",
      "Unidad",
      "gerencia",
      "Gerencia"
    ],
    hora: [
      "Hora", 
      "hora", 
      "Time", 
      "time",
      "fecha",
      "Fecha",
      "fecha y hora",
      "Fecha y hora",
      "timestamp",
      "Timestamp",
      "momento",
      "Momento",
      "entrada",
      "Entrada",
      "salida",
      "Salida",
      "check in",
      "Check In",
      "check out",
      "Check Out",
      "hora de entrada",
      "Hora de entrada",
      "hora de salida",
      "Hora de salida"
    ],
    puntoVerificacion: [
      "Punto de verificación de asistencia",
      "Punto de verificación",
      "Punto verificacion",
      "Punto Verificación",
      "Access Point",
      "accesspoint",
      "punto de acceso",
      "Punto de acceso",
      "ubicación",
      "Ubicación",
      "lugar",
      "Lugar",
      "terminal",
      "Terminal",
      "dispositivo",
      "Dispositivo",
      "reader",
      "Reader",
      "lector",
      "Lector",
      "puerta",
      "Puerta",
      "entrada",
      "Entrada",
      "salida",
      "Salida"
    ],
  },
  MIN_ID_LENGTH: 1, // Para IDs que empiezan con '
  DEBUG_ROWS: 3, // Número de filas para mostrar en logs de depuración
};
