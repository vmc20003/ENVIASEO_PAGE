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
        message: 'Servidor Windows funcionando',
        timestamp: new Date().toISOString(),
        url: req.url,
        method: req.method,
        platform: process.platform
      }));
    } else if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Windows Server',
        platform: process.platform
      }));
    } else if (req.url === '/test') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        message: 'Test endpoint funcionando en Windows',
        timestamp: new Date().toISOString(),
        platform: process.platform
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

// En Windows, usar solo el puerto sin especificar host
server.listen(PORT, () => {
  console.log(`🚀 Servidor Windows ejecutándose en puerto ${PORT}`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   - GET /`);
  console.log(`   - GET /health`);
  console.log(`   - GET /test`);
  console.log(`🔧 Configuración:`);
  console.log(`   - PORT: ${PORT}`);
  console.log(`   - Platform: ${process.platform}`);
});

server.on('error', (error) => {
  console.error('❌ Error del servidor:', error);
});
