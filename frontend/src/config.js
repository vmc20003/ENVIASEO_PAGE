// Configuración del API - Backend de Alcaldía (principal)
const config = {
  development: {
    alcaldiaApiUrl: 'http://localhost:4001',
    alumbradoApiUrl: 'http://localhost:4000'
  },
  production: {
    alcaldiaApiUrl: 'https://alcaldia-backend.onrender.com',
    alumbradoApiUrl: 'https://alumbrado-backend.onrender.com'
  }
};

// Determinar el entorno
const environment = process.env.NODE_ENV || 'development';
const currentConfig = config[environment];

// API principal para Alcaldía (como está en render.yaml)
export const API_BASE_URL = currentConfig.alcaldiaApiUrl;
// API para Alumbrado Público
export const ALUMBRADO_API_BASE_URL = currentConfig.alumbradoApiUrl;
