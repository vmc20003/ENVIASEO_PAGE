import express from "express";
import cors from "cors";
import multer from "multer";
import xlsx from "xlsx";
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

const app = express();

app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

// Crear carpeta de uploads si no existe
if (!fs.existsSync(config.UPLOAD_FOLDER)) {
  fs.mkdirSync(config.UPLOAD_FOLDER, { recursive: true });
}

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

    res.json({
      message: "Archivo subido y procesado correctamente.",
      recordsProcessed: processed.length,
      totalRecords: merged.length,
    });
  } catch (error) {
    console.error("Error processing upload:", error);
    res.status(500).json({ error: "Error procesando el archivo" });
  }
});

app.get("/buscar/:query", (req, res) => {
  try {
    const resultados = searchByQuery(req.params.query);
    res.json(resultados);
  } catch (error) {
    console.error("Error searching:", error);
    res.status(500).json({ error: "Error en la búsqueda" });
  }
});

// Endpoint para listar archivos subidos
app.get("/files", (req, res) => {
  fs.readdir(config.UPLOAD_FOLDER, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "No se pudieron listar los archivos." });
    }

    // Filtrar solo archivos Excel y excluir la base de datos
    const excelFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return (
        config.ALLOWED_FILE_TYPES.includes(ext) && file !== config.DATABASE_FILE
      );
    });

    // Devolver nombre y fecha de modificación
    const fileList = excelFiles.map((name) => {
      const stats = fs.statSync(path.join(config.UPLOAD_FOLDER, name));
      return {
        name,
        mtime: stats.mtime,
        size: stats.size,
      };
    });
    res.json(fileList);
  });
});

// Endpoint para descargar archivo
app.get("/files/:filename", (req, res) => {
  const filePath = path.join(config.UPLOAD_FOLDER, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Archivo no encontrado" });
  }
  res.download(filePath);
});

// Endpoint para eliminar archivo
app.delete("/files/:filename", (req, res) => {
  const filePath = path.join(config.UPLOAD_FOLDER, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Archivo no encontrado" });
  }

  try {
    fs.unlinkSync(filePath);
    res.json({ message: "Archivo eliminado correctamente." });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Error eliminando el archivo" });
  }
});

// Endpoint para procesar un archivo ya existente
app.post("/process/:filename", async (req, res) => {
  try {
    console.log("Procesando archivo:", req.params.filename);
    const filePath = path.join(config.UPLOAD_FOLDER, req.params.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const processed = processExcelData(sheet);

    // Cargar y unir con la base de datos
    const db = loadDB();
    const merged = mergeRows(db, processed);
    saveDB(merged);

    res.json({
      message: "Archivo procesado correctamente.",
      recordsProcessed: processed.length,
      totalRecords: merged.length,
    });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Error procesando el archivo" });
  }
});

// Endpoint para obtener estadísticas de la base de datos
app.get("/stats", (req, res) => {
  try {
    const stats = getStats();
    res.json(stats);
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({ error: "Error obteniendo estadísticas" });
  }
});

// Endpoint para limpiar la base de datos
app.delete("/clear-db", (req, res) => {
  try {
    clearDatabase();
    res.json({ message: "Base de datos limpiada correctamente." });
  } catch (error) {
    console.error("Error clearing database:", error);
    res.status(500).json({ error: "Error limpiando la base de datos" });
  }
});

// Endpoint para obtener todos los registros
app.get("/all-records", (req, res) => {
  try {
    const db = loadDB();
    // Separar fecha y hora para todos los registros
    const processedDb = db.map((row) => {
      const [fecha, ...horaParts] = (row.time || "").split(" ");
      const hora = horaParts.join(" ");
      return {
        ...row,
        fecha: fecha || "",
        hora: hora || "",
      };
    });
    res.json(processedDb);
  } catch (error) {
    console.error("Error loading all records:", error);
    res.status(500).json({ error: "Error al cargar todos los registros" });
  }
});

// Endpoints para gestión de horarios personalizados
app.get("/horarios", (req, res) => {
  try {
    const horarios = loadHorarios();
    res.json(horarios);
  } catch (e) {
    res.status(500).json({ error: "Error al cargar horarios" });
  }
});

app.post("/horarios", (req, res) => {
  try {
    const horario = req.body;
    if (
      !horario.cedula ||
      !horario.fecha_inicio ||
      !horario.fecha_fin ||
      !horario.hora_ingreso ||
      !horario.hora_salida
    ) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
    addOrUpdateHorario(horario);
    res.json({ message: "Horario guardado correctamente" });
  } catch (e) {
    res.status(500).json({ error: "Error al guardar horario" });
  }
});

app.delete("/horarios", (req, res) => {
  try {
    const { cedula, fecha_inicio, fecha_fin } = req.body;
    if (!cedula || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
    deleteHorario(cedula, fecha_inicio, fecha_fin);
    res.json({ message: "Horario eliminado correctamente" });
  } catch (e) {
    res.status(500).json({ error: "Error al eliminar horario" });
  }
});

// Endpoint raíz
app.get("/", (req, res) => {
  res.json({
    message: "Sistema de Alumbrado Público - API Backend",
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || config.PORT,
    endpoints: {
      health: "/health",
      upload: "/upload",
      files: "/files",
      stats: "/stats",
      search: "/buscar/:cedula",
      allRecords: "/all-records"
    }
  });
});

// Endpoint de salud del servidor
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Manejo de rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Error interno del servidor" });
});

const serverPort = process.env.PORT || config.PORT;
app.listen(serverPort, '0.0.0.0', () => {
  console.log(
    `🚀 Servidor backend corriendo en puerto ${serverPort}`
  );
  console.log(`📁 Carpeta de uploads: ${config.UPLOAD_FOLDER}`);
  console.log(
    `💾 Base de datos: ${path.join(config.UPLOAD_FOLDER, config.DATABASE_FILE)}`
  );
  console.log(`🌐 CORS origin: ${config.CORS_ORIGIN}`);
  console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`);
});
