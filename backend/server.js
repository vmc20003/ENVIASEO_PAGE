import express from "express";
import cors from "cors";
import multer from "multer";
import XLSX from "xlsx";
import path from "path";
import fs from "fs";
import { config } from "./config.js";
import { processExcelData } from "./utils/excelProcessor.js";
import {
  loadDB,
  saveDB,
  mergeRows,
  getStats,
  searchByQuery,
  clearDatabase,
} from "./utils/database.js";
import {
  loadHorarios,
  addOrUpdateHorario,
  deleteHorario,
} from "./utils/horarios.js";
import { fileManager } from "./utils/fileManager.js";

const app = express();

// CORS: reflejar el origen para permitir credenciales desde cualquier host
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Crear carpeta de uploads si no existe
if (!fs.existsSync(config.UPLOAD_FOLDER)) {
  fs.mkdirSync(config.UPLOAD_FOLDER, { recursive: true });
}

// Sincronizar archivos existentes al iniciar
fileManager.syncWithFileSystem();

// Middleware para identificar el tipo de sistema
app.use((req, res, next) => {
  // Detectar si es alcaldía o alumbrado basado en la ruta o headers
  req.systemType = req.path.startsWith('/alcaldia') ? 'alcaldia' : 'alumbrado';
  next();
});

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.UPLOAD_FOLDER),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (config.ALLOWED_FILE_TYPES.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Tipo de archivo no permitido. Solo se permiten archivos Excel (.xlsx, .xls)"
        )
      );
    }
  },
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "El archivo es demasiado grande. Máximo 10MB." });
    }
  }
  if (error.message.includes("Tipo de archivo no permitido")) {
    return res.status(400).json({ error: error.message });
  }
  next(error);
});

// ===== RUTAS UNIFICADAS =====

// Endpoint de subida unificado
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "No se proporcionó ningún archivo" });
    }

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const processed = processExcelData(sheet);

    // Cargar y unir con la base de datos
    const db = loadDB();
    const merged = mergeRows(db, processed);
    saveDB(merged);

    // Agregar archivo al FileManager para persistencia
    const fileInfo = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    };
    const savedFile = fileManager.addFile(fileInfo);

    res.json({
      message: "Archivo subido y procesado correctamente.",
      systemType: req.systemType,
      recordsProcessed: processed.length,
      totalRecords: merged.length,
      fileId: savedFile.id,
      filename: savedFile.filename
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      error: `Error procesando el archivo: ${error.message}`,
      details: error.stack
    });
  }
});

// Endpoint para limpiar base de datos
app.post("/clear-database", (req, res) => {
  try {
    console.log("🧹 Limpiando base de datos...");
    clearDatabase();
    
    res.json({ 
      message: "Base de datos limpiada correctamente",
      success: true
    });
  } catch (error) {
    console.error("Error clearing database:", error);
    res.status(500).json({ 
      error: "Error al limpiar la base de datos",
      success: false
    });
  }
});

// Endpoint para listar archivos
app.get("/files", (req, res) => {
  try {
    const files = fileManager.getAllFiles();
    res.json({
      files,
      systemType: req.systemType,
      totalFiles: files.length
    });
  } catch (error) {
    console.error("Error listing files:", error);
    res.status(500).json({ error: "No se pudieron listar los archivos." });
  }
});

// Endpoint para procesar archivo específico
app.get("/records-by-file/:filename", async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    console.log(`🔄 Procesando archivo: ${filename}`);
    
    // Buscar el archivo físico
    const files = fileManager.getAllFiles();
    console.log(`📁 Archivos disponibles:`, files.map(f => ({
      originalName: f.originalName,
      filename: f.filename,
      id: f.id
    })));
    
    const fileInfo = files.find(f => 
      f.originalName === filename || 
      f.filename === filename
    );
    
    console.log(`🔍 Archivo encontrado:`, fileInfo ? 'SÍ' : 'NO');
    
    if (!fileInfo) {
      console.log(`❌ Archivo NO encontrado. Buscado: "${filename}"`);
      return res.status(404).json({ 
        error: "Archivo no encontrado",
        count: 0,
        records: []
      });
    }
    
    console.log(`✅ Archivo encontrado:`, fileInfo);
    
    // Procesar el archivo Excel
    const filePath = path.join(fileInfo.path);
    console.log(`📂 Ruta del archivo: ${filePath}`);
    console.log(`📂 ¿Existe el archivo?: ${fs.existsSync(filePath)}`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        error: "Archivo físico no encontrado",
        count: 0,
        records: []
      });
    }
    
    // Leer y procesar el archivo
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    const processedData = processExcelData(sheet);
    console.log(`📊 Archivo ${filename} procesado: ${processedData.length} registros`);
    
    // Agregar información del archivo fuente a cada registro
    const recordsWithSource = processedData.map(record => ({
      ...record,
      sourceFile: filename,
      archivo: filename,
      fileName: filename
    }));
    
    // Guardar en la base de datos
    const existingData = loadDB();
    const updatedData = [...existingData, ...recordsWithSource];
    saveDB(updatedData);
    
    console.log(`💾 Base de datos actualizada con ${recordsWithSource.length} nuevos registros`);
    
    res.json({
      filename,
      count: recordsWithSource.length,
      records: recordsWithSource,
      message: `Archivo ${filename} procesado correctamente`
    });
    
  } catch (error) {
    console.error("Error procesando archivo:", error);
    res.status(500).json({ 
      error: `Error procesando archivo: ${error.message}`,
      count: 0,
      records: []
    });
  }
});

// Endpoint para obtener la ruta de la carpeta de archivos
app.get("/files-path", (req, res) => {
  try {
    const uploadPath = fileManager.uploadFolder;
    res.json({
      path: uploadPath,
      absolutePath: path.resolve(uploadPath)
    });
  } catch (error) {
    console.error("Error getting files path:", error);
    res.status(500).json({ 
      error: "No se pudo obtener la ruta de archivos."
    });
  }
});

// Endpoint para obtener estadísticas
app.get("/stats", (req, res) => {
  try {
    const fileStats = fileManager.getStats();
    const dbStats = getStats();
    
    res.json({
      systemType: req.systemType,
      files: fileStats,
      database: dbStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({ error: "Error obteniendo estadísticas" });
  }
});

// Endpoint para puntos de acceso
app.get("/access-points", (req, res) => {
  try {
    // Obtener puntos de acceso únicos de la base de datos
    const db = loadDB();
    const accessPoints = new Set();
    
    db.forEach(record => {
      if (record.accessPoint) {
        accessPoints.add(record.accessPoint);
      }
    });
    
    res.json({
      systemType: req.systemType,
      accessPoints: Array.from(accessPoints).sort(),
      total: accessPoints.size
    });
  } catch (error) {
    console.error("Error getting access points:", error);
    res.status(500).json({ error: "Error obteniendo puntos de acceso" });
  }
});

// Endpoint para obtener todos los registros
app.get("/all-records", (req, res) => {
  try {
    const db = loadDB();
    res.json({
      systemType: req.systemType,
      resultados: db,
      total: db.length
    });
  } catch (error) {
    console.error("Error getting all records:", error);
    res.status(500).json({ error: "Error obteniendo registros" });
  }
});

// Endpoint de búsqueda
app.get("/buscar/:query", (req, res) => {
  try {
    const resultados = searchByQuery(req.params.query);
    res.json({
      systemType: req.systemType,
      resultados,
      total: resultados.length
    });
  } catch (error) {
    console.error("Error searching:", error);
    res.status(500).json({ error: "Error en la búsqueda" });
  }
});

// Endpoint para eliminar archivo por ID
app.delete("/files/:id", (req, res) => {
  try {
    const fileId = req.params.id;
    const success = fileManager.removeFile(fileId);
    
    if (success) {
      res.json({ 
        message: "Archivo eliminado correctamente.",
        systemType: req.systemType
      });
    } else {
      res.status(404).json({ error: "Archivo no encontrado" });
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Error eliminando el archivo" });
  }
});

// Endpoint para limpiar archivos
app.delete("/clear-files", (req, res) => {
  try {
    const files = fileManager.getAllFiles();
    let deletedCount = 0;
    
    files.forEach(file => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          deletedCount++;
        }
      } catch (error) {
        console.error(`Error eliminando archivo: ${file.path}`, error);
      }
    });
    
    fileManager.clearAllFiles();
    
    res.json({ 
      message: "Archivos eliminados correctamente",
      systemType: req.systemType,
      filesDeleted: deletedCount
    });
  } catch (error) {
    console.error("Error clearing files:", error);
    res.status(500).json({ error: "Error eliminando archivos" });
  }
});

// Endpoint para limpiar todo
app.delete("/clear-all", (req, res) => {
  try {
    clearDatabase();
    
    const files = fileManager.getAllFiles();
    let deletedCount = 0;
    
    files.forEach(file => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          deletedCount++;
        }
      } catch (error) {
        console.error(`Error eliminando archivo: ${file.path}`, error);
      }
    });
    
    fileManager.clearAllFiles();
    
    res.json({ 
      message: "Sistema limpiado completamente",
      systemType: req.systemType,
      filesDeleted: deletedCount,
      databaseCleared: true
    });
  } catch (error) {
    console.error("Error clearing all:", error);
    res.status(500).json({ error: "Error limpiando el sistema" });
  }
});

// Health check endpoint para Render
app.get("/health", (req, res) => {
  try {
    const fileStats = fileManager.getStats();
    const dbStats = getStats();
    
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      service: "Backend Unificado - Sistema de Gestión de Archivos Excel",
      version: "3.0.0",
      files: fileStats,
      database: dbStats,
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 4000,
      supportedSystems: ["alcaldia", "alumbrado"]
    });
  } catch (error) {
    console.error("Error in health check:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint adicional para verificar que el servidor está funcionando
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    system: "alumbrado",
    timestamp: new Date().toISOString(),
    port: config.PORT
  });
});

// Ruta raíz con información del servicio
app.get("/", (req, res) => {
  res.json({
    message: "Backend Unificado - Sistema de Gestión de Archivos Excel",
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "3.0.0",
    supportedSystems: ["alcaldia", "alumbrado"],
    endpoints: {
      health: "/health",
      upload: "/upload",
      files: "/files",
      stats: "/stats",
      search: "/buscar/:query",
      accessPoints: "/access-points",
      clear: "/clear-files",
      clearAll: "/clear-all"
    }
  });
});

// Iniciar servidor
const PORT = 5000; // Forzar puerto 5000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📁 Carpeta de uploads: ${config.UPLOAD_FOLDER}`);
  console.log(`📊 Archivos cargados: ${fileManager.getAllFiles().length}`);
});
