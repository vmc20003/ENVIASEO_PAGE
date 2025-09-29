// Configuración de APIs para diferentes funcionalidades
// Detect host for portability across PCs and networks
const HOSTNAME = 'localhost';
const DEFAULTS = {
  ALUMBRADO: `http://${HOSTNAME}:5000`,
  ALCALDIA: `http://${HOSTNAME}:5002`,
  ENVIASEO: `http://${HOSTNAME}:5001`
};

export const API_CONFIG = {
  // Backend principal (Alumbrado Público)
  ALUMBRADO: {
    BASE_URL: process.env.REACT_APP_ALUMBRADO_API_URL || DEFAULTS.ALUMBRADO,
    ENDPOINTS: {
      UPLOAD: '/upload',
      DATA: '/data',
      FILES: '/files',
      HEALTH: '/health'
    }
  },
  
  // Backend de Alcaldía de Envigado
  ALCALDIA: {
    BASE_URL: process.env.REACT_APP_ALCALDIA_API_URL || DEFAULTS.ALCALDIA,
    ENDPOINTS: {
      UPLOAD: '/api/upload',
      DATA: '/api/data',
      FILES: '/api/files'
    }
  },
  
  // Backend de Enviaseo Control de Acceso
  ENVIASEO_CONTROL_ACCESO: {
    BASE_URL: process.env.REACT_APP_ENVIASEO_API_URL || DEFAULTS.ENVIASEO,
    ENDPOINTS: {
      UPLOAD: '/api/upload',
      DATA: '/api/data',
      FILES: '/api/files',
      HEALTH: '/api/health'
    }
  }
};

// Configuración general de la aplicación
export const APP_CONFIG = {
  APP_NAME: 'Sistema de Gestión Enviaseo',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'soporte@enviaseo.com',
  
  // Configuración de archivos
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['.xlsx', '.xls'],
  
  // Configuración de paginación
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  
  // Configuración de UI
  THEME: {
    PRIMARY_COLOR: '#667eea',
    SECONDARY_COLOR: '#764ba2',
    SUCCESS_COLOR: '#27ae60',
    WARNING_COLOR: '#f39c12',
    ERROR_COLOR: '#e74c3c',
    INFO_COLOR: '#3498db'
  }
};

// Configuración de desarrollo
export const DEV_CONFIG = {
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  LOG_LEVEL: process.env.REACT_APP_LOG_LEVEL || 'info',
  MOCK_API: process.env.REACT_APP_MOCK_API === 'true'
};

// Modo Demo - Datos de prueba para demostración sin backends
export const DEMO_DATA = {
  ALUMBRADO: [
    {
      firstName: "JUAN",
      lastName: "PÉREZ GARCÍA",
      nombre: "JUAN",
      apellido: "PÉREZ GARCÍA",
      personNo: "12345678",
      cedula: "12345678",
      time: "2024-01-15 08:00:00",
      fecha: "2024-01-15",
      hora: "08:00",
      accessPoint: "Entrada Principal",
      attendanceType: "Check In",
      tipo_asistencia: "Check In"
    },
    {
      firstName: "JUAN",
      lastName: "PÉREZ GARCÍA",
      nombre: "JUAN",
      apellido: "PÉREZ GARCÍA",
      personNo: "12345678",
      cedula: "12345678",
      time: "2024-01-15 17:00:00",
      fecha: "2024-01-15",
      hora: "17:00",
      accessPoint: "Salida Principal",
      attendanceType: "Check Out",
      tipo_asistencia: "Check Out"
    },
    {
      firstName: "MARÍA",
      lastName: "LÓPEZ RODRÍGUEZ",
      nombre: "MARÍA",
      apellido: "LÓPEZ RODRÍGUEZ",
      personNo: "87654321",
      cedula: "87654321",
      time: "2024-01-15 08:15:00",
      fecha: "2024-01-15",
      hora: "08:15",
      accessPoint: "Entrada Principal",
      attendanceType: "Check In",
      tipo_asistencia: "Check In"
    },
    {
      firstName: "MARÍA",
      lastName: "LÓPEZ RODRÍGUEZ",
      nombre: "MARÍA",
      apellido: "LÓPEZ RODRÍGUEZ",
      personNo: "87654321",
      cedula: "87654321",
      time: "2024-01-15 16:45:00",
      fecha: "2024-01-15",
      hora: "16:45",
      accessPoint: "Salida Principal",
      attendanceType: "Check Out",
      tipo_asistencia: "Check Out"
    },
    {
      firstName: "CARLOS",
      lastName: "MARTÍNEZ SILVA",
      nombre: "CARLOS",
      apellido: "MARTÍNEZ SILVA",
      personNo: "11223344",
      cedula: "11223344",
      time: "2024-01-15 07:30:00",
      fecha: "2024-01-15",
      hora: "07:30",
      accessPoint: "Entrada Principal",
      attendanceType: "Check In",
      tipo_asistencia: "Check In"
    },
    {
      firstName: "CARLOS",
      lastName: "MARTÍNEZ SILVA",
      nombre: "CARLOS",
      apellido: "MARTÍNEZ SILVA",
      personNo: "11223344",
      cedula: "11223344",
      time: "2024-01-15 17:30:00",
      fecha: "2024-01-15",
      hora: "17:30",
      accessPoint: "Salida Principal",
      attendanceType: "Check Out",
      tipo_asistencia: "Check Out"
    }
  ],
  ALCALDIA: [
    {
      idPersona: "1001",
      nombre: "Ana Sofía Restrepo",
      departamento: "Secretaría General",
      hora: "08:00",
      puntoVerificacion: "Alcaldía_Puerta1"
    },
    {
      idPersona: "1002",
      nombre: "Roberto Carlos Vélez",
      departamento: "Hacienda",
      hora: "08:15",
      puntoVerificacion: "Alcaldía_Puerta2"
    }
  ],
  ENVIASEO: [
    {
      nombreArchivo: "control_acceso_2024.xlsx",
      id: "EMP001",
      temperatura: "36.5°C",
      estadoTemperatura: "Normal",
      usandoMascara: "Sí",
      numeroTarjeta: "12345",
      grupoPersonas: "Personal Operativo",
      tiempo: "2024-01-15 08:00:00",
      puntoAcceso: "Entrada Principal",
      lectorTarjetas: "Lector 01",
      resultadoAutenticacion: "Exitoso",
      tipoAutenticacion: "Tarjeta",
      tipoAsistencia: "Entrada"
    }
  ]
};

// Función para detectar si estamos en modo demo
export const isDemoMode = () => {
  return false; // DESHABILITADO - siempre false
};