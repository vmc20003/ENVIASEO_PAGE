import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

class FileManager {
  constructor() {
    this.filesMetadataPath = path.join(config.UPLOAD_FOLDER, 'files-metadata.json');
    this.uploadedFiles = [];
    this.loadFilesMetadata();
  }

  // Cargar metadatos de archivos existentes
  loadFilesMetadata() {
    try {
      if (fs.existsSync(this.filesMetadataPath)) {
        const data = fs.readFileSync(this.filesMetadataPath, 'utf8');
        this.uploadedFiles = JSON.parse(data);
        console.log(`📁 Cargados ${this.uploadedFiles.length} archivos desde metadatos`);
      }
    } catch (error) {
      console.error('❌ Error cargando metadatos de archivos:', error);
      this.uploadedFiles = [];
    }
  }

  // Guardar metadatos de archivos
  saveFilesMetadata() {
    try {
      if (!fs.existsSync(config.UPLOAD_FOLDER)) {
        fs.mkdirSync(config.UPLOAD_FOLDER, { recursive: true });
      }
      fs.writeFileSync(this.filesMetadataPath, JSON.stringify(this.uploadedFiles, null, 2));
    } catch (error) {
      console.error('❌ Error guardando metadatos de archivos:', error);
    }
  }

  // Agregar nuevo archivo
  addFile(fileInfo) {
    const fileMetadata = {
      id: Date.now().toString(),
      filename: fileInfo.filename,
      originalName: fileInfo.originalname,
      size: fileInfo.size,
      mtime: new Date().toISOString(),
      path: fileInfo.path,
      processed: true
    };

    this.uploadedFiles.push(fileMetadata);
    this.saveFilesMetadata();
    return fileMetadata;
  }

  // Obtener todos los archivos
  getAllFiles() {
    return this.uploadedFiles;
  }

  // Obtener archivo por ID
  getFileById(id) {
    return this.uploadedFiles.find(file => file.id === id);
  }

  // Obtener archivo por nombre
  getFileByFilename(filename) {
    return this.uploadedFiles.find(file => file.filename === filename);
  }

  // Eliminar archivo
  removeFile(id) {
    const fileIndex = this.uploadedFiles.findIndex(file => file.id === id);
    if (fileIndex !== -1) {
      const file = this.uploadedFiles[fileIndex];
      
      // Eliminar archivo físico
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (error) {
        console.error(`❌ Error eliminando archivo físico: ${file.path}`, error);
      }

      // Eliminar de metadatos
      this.uploadedFiles.splice(fileIndex, 1);
      this.saveFilesMetadata();
      return true;
    }
    return false;
  }

  // Verificar archivos existentes en el sistema de archivos
  syncWithFileSystem() {
    try {
      if (!fs.existsSync(config.UPLOAD_FOLDER)) {
        return;
      }

      const filesInFolder = fs.readdirSync(config.UPLOAD_FOLDER);
      const excelFiles = filesInFolder.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return config.ALLOWED_FILE_TYPES.includes(ext) && 
               file !== config.DATABASE_FILE &&
               file !== 'files-metadata.json';
      });

      // Agregar archivos que no están en metadatos
      excelFiles.forEach(filename => {
        const existingFile = this.uploadedFiles.find(f => f.filename === filename);
        if (!existingFile) {
          const filePath = path.join(config.UPLOAD_FOLDER, filename);
          const stats = fs.statSync(filePath);
          
          const newFile = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            filename: filename,
            originalName: filename.replace(/^\d+-/, ''), // Remover timestamp
            size: stats.size,
            mtime: stats.mtime.toISOString(),
            path: filePath,
            processed: false // Marcar como no procesado para que se pueda reprocesar
          };

          this.uploadedFiles.push(newFile);
          console.log(`📁 Archivo existente detectado: ${filename}`);
        }
      });

      this.saveFilesMetadata();
      console.log(`🔄 Sincronización completada. Total archivos: ${this.uploadedFiles.length}`);
    } catch (error) {
      console.error('❌ Error sincronizando con sistema de archivos:', error);
    }
  }

  // Marcar archivo como procesado
  markAsProcessed(filename) {
    const file = this.uploadedFiles.find(f => f.filename === filename);
    if (file) {
      file.processed = true;
      file.mtime = new Date().toISOString();
      this.saveFilesMetadata();
    }
  }

  // Limpiar todos los archivos
  clearAllFiles() {
    this.uploadedFiles = [];
    this.saveFilesMetadata();
    console.log('🗑️ Todos los archivos eliminados de metadatos');
  }

  // Obtener estadísticas de archivos
  getStats() {
    return {
      totalFiles: this.uploadedFiles.length,
      processedFiles: this.uploadedFiles.filter(f => f.processed).length,
      unprocessedFiles: this.uploadedFiles.filter(f => !f.processed).length,
      totalSize: this.uploadedFiles.reduce((sum, f) => sum + (f.size || 0), 0)
    };
  }
}

export const fileManager = new FileManager();
