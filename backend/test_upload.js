import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';

// Configuración de backends
const backends = [
  {
    name: 'Backend Principal (Alumbrado)',
    url: 'http://localhost:4000',
    uploadEndpoint: '/upload'
  },
  {
    name: 'Backend Enviaseo',
    url: 'http://localhost:4001',
    uploadEndpoint: '/api/upload'
  },
  {
    name: 'Backend Alcaldía',
    url: 'http://localhost:4002',
    uploadEndpoint: '/api/upload'
  }
];

async function testUpload(backend) {
  console.log(`\n🔄 Probando subida en ${backend.name}...`);
  
  try {
    // Verificar que el archivo existe
    if (!fs.existsSync('test_data.xlsx')) {
      throw new Error('Archivo test_data.xlsx no encontrado');
    }

    // Crear FormData
    const formData = new FormData();
    formData.append('file', fs.createReadStream('test_data.xlsx'));

    // Realizar la subida
    const response = await fetch(`${backend.url}${backend.uploadEndpoint}`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ ${backend.name}: Subida exitosa`);
      console.log(`   📊 Registros procesados: ${result.recordsProcessed || result.totalRecords || 'N/A'}`);
      console.log(`   📁 Total en BD: ${result.totalRecords || 'N/A'}`);
      console.log(`   📋 Archivo: ${result.fileName || 'N/A'}`);
      return true;
    } else {
      console.log(`❌ ${backend.name}: Error ${response.status}`);
      console.log(`   📝 Mensaje: ${result.message || result.error || 'Error desconocido'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${backend.name}: Error de conexión`);
    console.log(`   📝 Error: ${error.message}`);
    return false;
  }
}

async function testHealthCheck(backend) {
  console.log(`\n🔍 Verificando salud de ${backend.name}...`);
  
  try {
    const healthEndpoint = backend.name.includes('Enviaseo') ? '/api/health' : '/health';
    const response = await fetch(`${backend.url}${healthEndpoint}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ ${backend.name}: Salud OK`);
      console.log(`   📊 Estado: ${result.status || 'OK'}`);
      return true;
    } else {
      console.log(`❌ ${backend.name}: Error de salud ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${backend.name}: No disponible - ${error.message}`);
    return false;
  }
}

async function testFilesEndpoint(backend) {
  console.log(`\n📁 Verificando endpoint de archivos en ${backend.name}...`);
  
  try {
    const filesEndpoint = backend.name.includes('Enviaseo') ? '/api/files' : '/files';
    const response = await fetch(`${backend.url}${filesEndpoint}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ ${backend.name}: Archivos accesibles`);
      console.log(`   📊 Total archivos: ${result.files?.length || result.length || 'N/A'}`);
      return true;
    } else {
      console.log(`❌ ${backend.name}: Error en archivos ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${backend.name}: Error de archivos - ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 INICIANDO PRUEBAS COMPLETAS DEL SISTEMA');
  console.log('==========================================');
  
  let totalTests = 0;
  let passedTests = 0;
  
  // Verificar salud de todos los backends
  console.log('\n📋 FASE 1: Verificación de Salud de Servidores');
  for (const backend of backends) {
    totalTests++;
    if (await testHealthCheck(backend)) {
      passedTests++;
    }
  }
  
  // Verificar endpoints de archivos
  console.log('\n📋 FASE 2: Verificación de Endpoints de Archivos');
  for (const backend of backends) {
    totalTests++;
    if (await testFilesEndpoint(backend)) {
      passedTests++;
    }
  }
  
  // Probar subida de archivos
  console.log('\n📋 FASE 3: Prueba de Subida de Archivos');
  for (const backend of backends) {
    totalTests++;
    if (await testUpload(backend)) {
      passedTests++;
    }
  }
  
  // Resumen final
  console.log('\n📊 RESUMEN FINAL');
  console.log('================');
  console.log(`✅ Pruebas exitosas: ${passedTests}/${totalTests}`);
  console.log(`📈 Porcentaje de éxito: ${((passedTests/totalTests)*100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!');
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Revisar los errores arriba.');
  }
}

// Ejecutar todas las pruebas
runAllTests().catch(console.error);
