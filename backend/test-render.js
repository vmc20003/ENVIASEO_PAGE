import express from "express";
import cors from "cors";

const app = express();

// CORS simple y directo
app.use(cors({
  origin: "https://alcaldia-frontend.onrender.com",
  credentials: true
}));

app.use(express.json());

// Endpoint raíz
app.get("/", (req, res) => {
  res.json({ 
    message: "Servidor de prueba Render funcionando",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 4000,
    host: process.env.HOST || '0.0.0.0'
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Test Render Server"
  });
});

// Endpoint de prueba
app.get("/test", (req, res) => {
  res.json({ 
    message: "Endpoint de prueba funcionando",
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || 'localhost'; // Cambiar a localhost para pruebas locales

app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor de prueba Render ejecutándose en ${HOST}:${PORT}`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   - GET /`);
  console.log(`   - GET /health`);
  console.log(`   - GET /test`);
  console.log(`🔧 Variables de entorno:`);
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   - PORT: ${process.env.PORT}`);
  console.log(`   - HOST: ${process.env.HOST}`);
});

// Manejo de errores
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
});
