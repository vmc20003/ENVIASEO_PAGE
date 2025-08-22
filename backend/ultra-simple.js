import http from 'http';

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://alcaldia-frontend.onrender.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Routes
  if (req.method === 'GET') {
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Servidor ultra-simple funcionando',
        timestamp: new Date().toISOString(),
        url: req.url,
        method: req.method
      }));
    } else if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Ultra Simple Server'
      }));
    } else if (req.url === '/test') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Test endpoint funcionando',
        timestamp: new Date().toISOString()
      }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found', url: req.url }));
    }
  } else {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor ultra-simple ejecutándose en ${HOST}:${PORT}`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   - GET /`);
  console.log(`   - GET /health`);
  console.log(`   - GET /test`);
  console.log(`🔧 Configuración:`);
  console.log(`   - HOST: ${HOST}`);
  console.log(`   - PORT: ${PORT}`);
});

server.on('error', (error) => {
  console.error('❌ Error del servidor:', error);
});
