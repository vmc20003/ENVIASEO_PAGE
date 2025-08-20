// Configuración del API
const config = {
  development: {
    apiUrl: 'http://localhost:4001'
  },
  production: {
    apiUrl: 'https://alcaldia-backend.onrender.com'
  }
};

// Determinar el entorno
const environment = process.env.NODE_ENV || 'development';
const currentConfig = config[environment];

export const API_BASE_URL = currentConfig.apiUrl;
