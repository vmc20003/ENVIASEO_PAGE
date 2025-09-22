#!/usr/bin/env node

/**
 * Script para construir el instalador .exe del Sistema de Gestión de Asistencia
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Construyendo instalador .exe...\n');

// Verificar que estamos en el directorio correcto
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: No se encontró package.json. Ejecuta este script desde el directorio electron-app/');
  process.exit(1);
}

try {
  // 1. Instalar dependencias de Electron
  console.log('📦 Instalando dependencias de Electron...');
  execSync('npm install', { stdio: 'inherit' });

  // 2. Construir la aplicación para Windows
  console.log('\n🔨 Construyendo aplicación para Windows...');
  execSync('npm run build-win', { stdio: 'inherit' });

  // 3. Verificar que se creó el instalador
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    const installerFile = files.find(file => file.endsWith('.exe'));
    
    if (installerFile) {
      console.log('\n✅ ¡Instalador creado exitosamente!');
      console.log(`📁 Ubicación: ${path.join(distPath, installerFile)}`);
      console.log('\n📋 Información del instalador:');
      console.log('   • Archivo: ' + installerFile);
      console.log('   • Tamaño: ' + (fs.statSync(path.join(distPath, installerFile)).size / 1024 / 1024).toFixed(2) + ' MB');
      console.log('\n🚀 Para instalar la aplicación:');
      console.log('   1. Ejecuta el archivo .exe generado');
      console.log('   2. Sigue las instrucciones del instalador');
      console.log('   3. La aplicación se instalará y creará accesos directos');
    } else {
      console.error('❌ Error: No se encontró el archivo .exe generado');
    }
  } else {
    console.error('❌ Error: No se creó el directorio dist/');
  }

} catch (error) {
  console.error('❌ Error durante la construcción:', error.message);
  process.exit(1);
}






