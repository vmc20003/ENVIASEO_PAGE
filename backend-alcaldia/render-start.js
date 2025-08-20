#!/usr/bin/env node

// Logs adicionales para debugging en Render
console.log('🚀 Iniciando servidor en Render...');
console.log('🔧 Variables de entorno:');
console.log('  - NODE_ENV:', process.env.NODE_ENV);
console.log('  - PORT:', process.env.PORT);
console.log('  - FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('  - PWD:', process.cwd());

// Script de inicio específico para Render
import './server-new.js';
