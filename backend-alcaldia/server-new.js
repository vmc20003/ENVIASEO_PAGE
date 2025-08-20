import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import xlsx from "xlsx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
import config from './config.js';

const PORT = config.port;

// Middleware
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads_excel");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname;
    cb(null, `${timestamp}-${originalName}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".xlsx", ".xls"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos Excel (.xlsx, .xls)"));
    }
  },
});

// Almacenamiento en memoria (simulando base de datos)
let processedRecords = [];
let uploadedFiles = [];

// Función para procesar archivo Excel
function processExcelFile(filePath) {
  try {
    console.log(`📁 Procesando archivo: ${path.basename(filePath)}`);

    // Leer el archivo Excel
    const workbook = xlsx.readFile(filePath, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    console.log(`📋 Hoja encontrada: ${sheetName}`);

    // Convertir a JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length < 2) {
      throw new Error("El archivo no contiene suficientes datos");
    }

    // Encontrar encabezados
    const headers = jsonData[0];
    console.log("📊 Encabezados encontrados:", headers);

    // Mapear columnas
    const columnMap = {
      idPersona: -1,
      nombre: -1,
      departamento: -1,
      hora: -1,
      puntoVerificacion: -1,
    };

    headers.forEach((header, index) => {
      const headerStr = String(header).toLowerCase().trim();

      if (headerStr.includes("id") && headerStr.includes("persona")) {
        columnMap.idPersona = index;
      } else if (
        headerStr.includes("nombre") &&
        !headerStr.includes("personalizado")
      ) {
        columnMap.nombre = index;
      } else if (headerStr.includes("departamento")) {
        columnMap.departamento = index;
      } else if (headerStr.includes("hora")) {
        columnMap.hora = index;
      } else if (
        headerStr.includes("punto") &&
        headerStr.includes("verificación")
      ) {
        columnMap.puntoVerificacion = index;
      }
    });

    console.log("🗂️ Mapeo de columnas:", columnMap);

    // Validar que se encontraron las columnas necesarias
    const requiredColumns = ["idPersona", "nombre", "departamento", "hora"];
    const missingColumns = requiredColumns.filter(
      (col) => columnMap[col] === -1
    );

    if (missingColumns.length > 0) {
      throw new Error(`Columnas faltantes: ${missingColumns.join(", ")}`);
    }

    // Procesar datos
    const records = [];
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];

      // Verificar que la fila tenga datos
      if (!row || row.length === 0) continue;

      const record = {
        idPersona: row[columnMap.idPersona] || "",
        nombre: row[columnMap.nombre] || "",
        departamento: row[columnMap.departamento] || "",
        hora: row[columnMap.hora] || "",
        puntoVerificacion: row[columnMap.puntoVerificacion] || "",
      };

      // Limpiar datos
      record.idPersona = String(record.idPersona).replace(/^'/, "").trim();
      record.nombre = String(record.nombre).trim();
      record.departamento = String(record.departamento).trim();
      record.hora = String(record.hora).trim();
      record.puntoVerificacion = String(record.puntoVerificacion).trim();

      // Limpiar nombre: remover ID si está concatenado
      if (record.nombre.includes("-")) {
        const parts = record.nombre.split("-");
        if (parts.length > 1) {
          // Verificar si la primera parte es un ID numérico
          if (/^\d+$/.test(parts[0].trim())) {
            record.nombre = parts.slice(1).join("-").trim();
          }
        }
      }

      // Solo agregar si tiene datos mínimos
      if (record.idPersona && record.nombre) {
        records.push(record);
      }
    }

    console.log(`✅ Procesados ${records.length} registros válidos`);

    // Mostrar ejemplos
    if (records.length > 0) {
      console.log("📝 Ejemplos de registros:");
      records.slice(0, 3).forEach((record, index) => {
        console.log(`  Registro ${index + 1}:`, {
          idPersona: record.idPersona,
          nombre: record.nombre,
          departamento: record.departamento,
          hora: record.hora,
          puntoVerificacion: record.puntoVerificacion.substring(0, 50) + "...",
        });
      });
    }

    return records;
  } catch (error) {
    console.error("❌ Error procesando archivo:", error.message);
    throw error;
  }
}

// Endpoints

// Subir archivo
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se subió ningún archivo" });
    }

    console.log(`📤 Archivo subido: ${req.file.originalname}`);
    console.log(`📁 Ruta: ${req.file.path}`);
    console.log(`📏 Tamaño: ${req.file.size} bytes`);

    // Procesar el archivo
    const records = processExcelFile(req.file.path);

    // Guardar archivo en la lista
    const fileInfo = {
      name: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mtime: new Date().toISOString(),
      path: req.file.path,
    };

    uploadedFiles.push(fileInfo);

    // Guardar registros procesados
    processedRecords = records;

    res.json({
      message: "Archivo procesado correctamente",
      filename: req.file.filename,
      recordsProcessed: records.length,
      totalRecords: processedRecords.length,
    });
  } catch (error) {
    console.error("❌ Error en upload:", error);
    res.status(500).json({
      error: "Error procesando archivo",
      details: error.message,
    });
  }
});

// Obtener todos los registros
app.get("/all-records", (req, res) => {
  try {
    const { accessPoint } = req.query;
    
    let filteredRecords = processedRecords;
    
    // Filtrar por punto de acceso si se especifica
    if (accessPoint && accessPoint !== 'all') {
      filteredRecords = processedRecords.filter(record => {
        return record.puntoVerificacion && 
               record.puntoVerificacion.includes(accessPoint);
      });
    }
    
    console.log(`📊 Enviando ${filteredRecords.length} registros${accessPoint ? ` filtrados por ${accessPoint}` : ''}`);
    res.json(filteredRecords);
  } catch (error) {
    console.error("❌ Error obteniendo registros:", error);
    res.status(500).json({ error: "Error obteniendo registros" });
  }
});

// Obtener estadísticas
app.get("/stats", (req, res) => {
  try {
    const totalRecords = processedRecords.length;
    const uniquePersons = new Set(processedRecords.map((r) => r.idPersona))
      .size;

    res.json({
      totalRecords,
      uniquePersons,
      lastUpdate: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error);
    res.status(500).json({ error: "Error obteniendo estadísticas" });
  }
});

// Obtener puntos de acceso únicos
app.get("/access-points", (req, res) => {
  try {
    const accessPoints = new Set();
    
    processedRecords.forEach(record => {
      if (record.puntoVerificacion) {
        // Extraer puntos de acceso del campo puntoVerificacion
        const points = record.puntoVerificacion.split(' ');
        points.forEach(point => {
          if (point.includes('_') && point.includes('Puerta')) {
            // Extraer solo la parte del punto de acceso (ej: "Obras Publicas_Puerta1")
            const parts = point.split('_');
            if (parts.length >= 2) {
              const accessPoint = parts[0] + '_' + parts[1];
              accessPoints.add(accessPoint);
            }
          }
        });
      }
    });
    
    const sortedAccessPoints = Array.from(accessPoints).sort();
    
    res.json({
      accessPoints: sortedAccessPoints,
      total: sortedAccessPoints.length
    });
  } catch (error) {
    console.error("❌ Error obteniendo puntos de acceso:", error);
    res.status(500).json({ error: "Error obteniendo puntos de acceso" });
  }
});

// Obtener lista de archivos
app.get("/files", (req, res) => {
  try {
    res.json(uploadedFiles);
  } catch (error) {
    console.error("❌ Error obteniendo archivos:", error);
    res.status(500).json({ error: "Error obteniendo archivos" });
  }
});

// Limpiar base de datos
app.post("/clear-db", (req, res) => {
  try {
    processedRecords = [];
    uploadedFiles = [];

    // Limpiar archivos físicos
    const uploadDir = path.join(__dirname, "uploads_excel");
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      files.forEach((file) => {
        if (file.endsWith(".xlsx") || file.endsWith(".xls")) {
          fs.unlinkSync(path.join(uploadDir, file));
        }
      });
    }

    res.json({ message: "Base de datos limpiada correctamente" });
  } catch (error) {
    console.error("❌ Error limpiando BD:", error);
    res.status(500).json({ error: "Error limpiando base de datos" });
  }
});

// Reprocesar archivo específico
app.post("/reprocess/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "uploads_excel", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    console.log(`🔄 Reprocesando archivo: ${filename}`);

    // Procesar el archivo
    const records = processExcelFile(filePath);

    // Actualizar registros
    processedRecords = records;

    res.json({
      message: "Archivo reprocesado correctamente",
      recordsProcessed: records.length,
      totalRecords: processedRecords.length,
    });
  } catch (error) {
    console.error("❌ Error reprocesando archivo:", error);
    res.status(500).json({
      error: "Error reprocesando archivo",
      details: error.message,
    });
  }
});

// Servir archivos estáticos
app.use("/files", express.static(path.join(__dirname, "uploads_excel")));

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    message: "Sistema de Asistencia Alcaldía de Envigado - API Backend",
    status: "OK",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/health",
      upload: "/upload",
      records: "/all-records",
      stats: "/stats",
      files: "/files",
      accessPoints: "/access-points"
    }
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    records: processedRecords.length,
    files: uploadedFiles.length,
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de Alcaldía ejecutándose en puerto ${PORT}`);
  console.log(`📁 Carpeta de uploads: uploads_excel`);
  console.log(`🌐 CORS origin: ${config.corsOrigin}`);
  console.log(`📊 Registros en memoria: ${processedRecords.length}`);
});
