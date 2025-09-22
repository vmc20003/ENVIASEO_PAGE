// Configuración de APIs para diferentes funcionalidades
export const API_CONFIG = {
  // Backend principal (Alumbrado Público)
  ALUMBRADO: {
    BASE_URL: process.env.REACT_APP_ALUMBRADO_API_URL || 'http://localhost:4000',
    ENDPOINTS: {
      UPLOAD: '/api/upload',
      DATA: '/api/data',
      FILES: '/api/files'
    }
  },
  
  // Backend de Alcaldía de Envigado
  ALCALDIA: {
    BASE_URL: process.env.REACT_APP_ALCALDIA_API_URL || 'http://localhost:4002',
    ENDPOINTS: {
      UPLOAD: '/api/upload',
      DATA: '/api/data',
      FILES: '/api/files'
    }
  },
  
  // Backend de Enviaseo Control de Acceso
  ENVIASEO_CONTROL_ACCESO: {
    BASE_URL: process.env.REACT_APP_ENVIASEO_API_URL || 'http://localhost:4001',
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
