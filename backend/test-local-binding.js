import express from "express";
import cors from "cors";

const app = express();

// CORS simple
app.use(cors());
app.use(express.json());

// Endpoint de prueba
app.get("/", (req, res) => {
  res.json({ 
    message: "Servidor de prueba con binding correcto",
    timestamp: new Date().toISOString(),
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 4000
  });
});

app.get("/health", (req, res) => {
  res.json({ 
    status: "OK",
    timestamp: new Date().toISOString(),
    binding: `${process.env.HOST || '0.0.0.0'}:${process.env.PORT || 4000}`
  });
});

// Iniciar servidor con la misma lógica que el principal
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor de prueba ejecutándose en ${HOST}:${PORT}`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   - GET /`);
  console.log(`   - GET /health`);
  console.log(`🔧 Configuración:`);
  console.log(`   - HOST: ${HOST}`);
  console.log(`   - PORT: ${PORT}`);
});

// Manejo de errores
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
});
