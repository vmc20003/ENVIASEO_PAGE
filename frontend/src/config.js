// Configuración del API - Backend Unificado
const config = {
  development: {
    apiUrl: 'http://localhost:4000'
  },
  production: {
    apiUrl: 'https://backend-unificado.onrender.com' // Backend unificado
  }
};

// Determinar el entorno
const environment = process.env.NODE_ENV || 'development';
const currentConfig = config[environment];

// API unificada para ambos sistemas
export const API_BASE_URL = currentConfig.apiUrl;

// Mantener compatibilidad con nombres anteriores
export const ALUMBRADO_API_BASE_URL = currentConfig.apiUrl;
