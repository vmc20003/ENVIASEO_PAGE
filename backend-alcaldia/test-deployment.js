import fetch from 'node-fetch';

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:4001';

async function testBackend() {
  console.log('🧪 Probando backend en:', BASE_URL);
  
  const endpoints = [
    '/',
    '/health',
    '/test',
    '/stats',
    '/files',
    '/access-points'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Probando: ${endpoint}`);
      const response = await fetch(`${BASE_URL}${endpoint}`);
      const data = await response.json();
      
      console.log(`✅ Status: ${response.status}`);
      console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`❌ Error en ${endpoint}:`, error.message);
    }
  }
}

// Ejecutar pruebas
testBackend().catch(console.error);
