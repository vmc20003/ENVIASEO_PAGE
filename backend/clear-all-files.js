import fs from 'fs';
import path from 'path';
import { config } from './config.js';

console.log('🧹 Iniciando limpieza completa del sistema...');

// Función para limpiar archivos
function clearAllFiles() {
  try {
    const uploadFolder = config.UPLOAD_FOLDER;
    
    if (!fs.existsSync(uploadFolder)) {
      console.log('📁 La carpeta de uploads no existe, no hay nada que limpiar');
      return;
    }

    const files = fs.readdirSync(uploadFolder);
    let deletedCount = 0;
    let errorCount = 0;

    console.log(`📁 Encontrados ${files.length} archivos en ${uploadFolder}`);

    files.forEach(file => {
      try {
        const filePath = path.join(uploadFolder, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Eliminado: ${file}`);
          deletedCount++;
        }
      } catch (error) {
        console.error(`❌ Error eliminando ${file}:`, error.message);
        errorCount++;
      }
    });

    console.log(`\n✅ Limpieza completada:`);
    console.log(`   - Archivos eliminados: ${deletedCount}`);
    console.log(`   - Errores: ${errorCount}`);
    console.log(`   - Total archivos: ${files.length}`);
    
    if (errorCount === 0) {
      console.log('🎉 Sistema completamente limpio');
    } else {
      console.log('⚠️ Algunos archivos no se pudieron eliminar');
    }

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message);
  }
}

// Función para crear estructura de carpetas
function createFolderStructure() {
  try {
    if (!fs.existsSync(config.UPLOAD_FOLDER)) {
      fs.mkdirSync(config.UPLOAD_FOLDER, { recursive: true });
      console.log(`📁 Carpeta ${config.UPLOAD_FOLDER} creada`);
    }
    
    console.log('📁 Estructura de carpetas verificada');
  } catch (error) {
    console.error('❌ Error creando estructura de carpetas:', error.message);
  }
}

// Ejecutar limpieza
clearAllFiles();
createFolderStructure();

console.log('\n🚀 El sistema está listo para recibir nuevos archivos');
console.log('💡 Reinicia el servidor para aplicar los cambios');
