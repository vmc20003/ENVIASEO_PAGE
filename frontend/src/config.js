// Configuración del API
const config = {
  development: {
    alcaldiaApiUrl: 'http://localhost:4001',
    alumbradoApiUrl: 'http://localhost:4000'
  },
  production: {
    alcaldiaApiUrl: 'https://pagina-valeria-enviaseo.onrender.com',
    alumbradoApiUrl: 'https://alumbrado-backend.onrender.com'
  }
};

// Determinar el entorno
const environment = process.env.NODE_ENV || 'development';
const currentConfig = config[environment];

export const API_BASE_URL = currentConfig.alcaldiaApiUrl;
// Usar el backend separado de Alumbrado
export const ALUMBRADO_API_BASE_URL = currentConfig.alumbradoApiUrl;
