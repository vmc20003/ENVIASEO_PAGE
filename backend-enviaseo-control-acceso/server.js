import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ExcelJS from 'exceljs';
import { config, excelConfig } from './config.js';
import { processExcelFile } from './utils/excelProcessor.js';
import { saveToDatabase, getDataFromDatabase } from './utils/database.js';

const app = express();

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Limpiar base de datos al iniciar el servidor
function cleanDatabaseOnStartup() {
  try {
    const dbPath = path.join(__dirname, config.UPLOAD_FOLDER, config.DATABASE_FILE);
    if (fs.existsSync(dbPath)) {
      fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
      console.log('🧹 Base de datos limpiada al iniciar servidor');
    } else {
      console.log('📁 Base de datos no existe, se creará cuando sea necesario');
    }
  } catch (error) {
    console.error('❌ Error al limpiar base de datos:', error.message);
  }
}

// Limpiar base de datos al iniciar
cleanDatabaseOnStartup();

// Middleware
// CORS: reflejar el origen para permitir credenciales desde cualquier host
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, config.UPLOAD_FOLDER);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, extension);
    cb(null, `${timestamp}-${nameWithoutExt}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    if (config.ALLOWED_FILE_TYPES.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se permiten archivos Excel (.xlsx, .xls)'));
    }
  }
});

// Rutas
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Enviaseo Control de Acceso API',
    timestamp: new Date().toISOString()
  });
});

// Health check básico
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Enviaseo Control de Acceso API',
    timestamp: new Date().toISOString()
  });
});

// Subir y procesar archivo Excel
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;

    console.log(`Archivo recibido: ${fileName} (${fileSize} bytes)`);

    // Procesar el archivo Excel
    const processedData = await processExcelFile(filePath, excelConfig);

    if (!processedData || processedData.length === 0) {
      return res.status(400).json({ error: 'No se pudieron procesar datos del archivo' });
    }

    // Guardar en la base de datos
    const savedData = await saveToDatabase(processedData, 'enviaseo-control-acceso');

    // Guardar metadata del archivo
    const fileMetadata = {
      id: Date.now().toString(),
      originalName: fileName,
      processedName: path.basename(filePath),
      uploadDate: new Date().toISOString(),
      fileSize: fileSize,
      recordsProcessed: processedData.length,
      type: 'enviaseo-control-acceso'
    };

    const metadataPath = path.join(__dirname, config.UPLOAD_FOLDER, 'files-metadata.json');
    let metadata = [];
    if (fs.existsSync(metadataPath)) {
      metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    }
    metadata.push(fileMetadata);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    res.json({
      success: true,
      message: 'Archivo procesado exitosamente',
      data: {
        recordsProcessed: processedData.length,
        fileName: fileName,
        fileId: fileMetadata.id
      }
    });

  } catch (error) {
    console.error('Error al procesar archivo:', error);
    res.status(500).json({ 
      error: 'Error al procesar el archivo',
      details: error.message 
    });
  }
});

// Obtener datos procesados
app.get('/api/data', async (req, res) => {
  try {
    const { page = 1, limit = config.PAGE_SIZE, search = '' } = req.query;
    
    const data = await getDataFromDatabase('enviaseo-control-acceso');
    
    let filteredData = data;
    
    // Aplicar búsqueda si se proporciona
    if (search) {
      filteredData = data.filter(item => 
        (item.nombreCompleto && item.nombreCompleto.toLowerCase().includes(search.toLowerCase())) ||
        (item.grupoPersonas && item.grupoPersonas.toLowerCase().includes(search.toLowerCase())) ||
        (item.puntoAcceso && item.puntoAcceso.toLowerCase().includes(search.toLowerCase())) ||
        (item.id && item.id.includes(search)) ||
        (item.numeroTarjeta && item.numeroTarjeta.includes(search))
      );
    }
    
    // Aplicar paginación
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredData.length / limit),
        totalRecords: filteredData.length,
        recordsPerPage: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ 
      error: 'Error al obtener los datos',
      details: error.message 
    });
  }
});

// Obtener metadata de archivos
app.get('/api/files', (req, res) => {
  try {
    const metadataPath = path.join(__dirname, config.UPLOAD_FOLDER, 'files-metadata.json');
    
    if (!fs.existsSync(metadataPath)) {
      return res.json({ success: true, data: [] });
    }
    
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const enviaseoFiles = metadata.filter(file => file.type === 'enviaseo-control-acceso');
    
    res.json({
      success: true,
      data: enviaseoFiles
    });
    
  } catch (error) {
    console.error('Error al obtener metadata de archivos:', error);
    res.status(500).json({ 
      error: 'Error al obtener metadata de archivos',
      details: error.message 
    });
  }
});

// Obtener registros por archivo específico
app.get('/records-by-file/:filename', (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    
    // Buscar registros por archivo en la base de datos
    const data = getDataFromDatabase('enviaseo-control-acceso');
    const allRecords = data || [];
    
    const fileRecords = allRecords.filter(record => 
      record.archivo === filename || 
      record.sourceFile === filename ||
      record.fileName === filename
    );
    
    res.json({
      filename,
      count: fileRecords.length,
      records: fileRecords
    });
  } catch (error) {
    console.error("Error getting records by file:", error);
    res.status(500).json({ 
      error: "No se pudieron obtener los registros del archivo.",
      count: 0,
      records: []
    });
  }
});

// Endpoint para obtener la ruta de la carpeta de archivos
app.get('/files-path', (req, res) => {
  try {
    const uploadPath = path.join(__dirname, config.UPLOAD_FOLDER);
    res.json({
      path: config.UPLOAD_FOLDER,
      absolutePath: uploadPath
    });
  } catch (error) {
    console.error("Error getting files path:", error);
    res.status(500).json({ 
      error: "No se pudo obtener la ruta de archivos."
    });
  }
});

// Eliminar archivo y sus datos
app.delete('/api/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const metadataPath = path.join(__dirname, config.UPLOAD_FOLDER, 'files-metadata.json');
    
    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({ error: 'No se encontró metadata de archivos' });
    }
    
    let metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const fileIndex = metadata.findIndex(file => file.id === fileId);
    
    if (fileIndex === -1) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    const fileToDelete = metadata[fileIndex];
    
    // Eliminar archivo físico
    const filePath = path.join(__dirname, config.UPLOAD_FOLDER, fileToDelete.processedName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Eliminar de metadata
    metadata.splice(fileIndex, 1);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    // Eliminar datos de la base de datos (opcional - mantener historial)
    
    res.json({
      success: true,
      message: 'Archivo eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({ 
      error: 'Error al eliminar el archivo',
      details: error.message 
    });
  }
});

// Manejo de errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    details: error.message 
  });
});

// Iniciar servidor
const PORT = config.PORT;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor Enviaseo Control de Acceso ejecutándose en puerto ${PORT}`);
  console.log(`📁 Carpeta de uploads: ${path.join(__dirname, config.UPLOAD_FOLDER)}`);
  console.log(`🌐 CORS habilitado para cualquier origen`);
});

export default app;
