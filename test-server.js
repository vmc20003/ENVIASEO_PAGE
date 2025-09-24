console.log('Iniciando prueba del servidor...');

try {
  console.log('Importando express...');
  const express = await import('express');
  console.log('Express importado correctamente');
  
  console.log('Importando config...');
  const { config } = await import('./config.js');
  console.log('Config importado correctamente, puerto:', config.PORT);
  
  console.log('Creando aplicación...');
  const app = express.default();
  console.log('Aplicación creada');
  
  console.log('Configurando puerto...');
  const PORT = config.PORT;
  console.log('Puerto configurado:', PORT);
  
  console.log('Iniciando servidor...');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor ejecutándose en puerto ${PORT}`);
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
