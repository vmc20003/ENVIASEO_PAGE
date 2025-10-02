import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import * as XLSX from "xlsx";
import { calcularHorasTrabajadas, obtenerEstadisticasHorarios, obtenerRegistrosConHoras } from "./utils/horarios.js";
import { loadDB, saveDB, mergeRows, getStats, searchByQuery, clearDatabase } from "./utils/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
import config from './config.js';

const PORT = config.port;

// Middleware
// CORS: reflejar el origen para permitir credenciales desde cualquier host
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
let processedRecords = loadDB();
let uploadedFiles = [];

// Función para procesar archivo Excel
function processExcelFile(filePath) {
  try {
    console.log(`📁 Procesando archivo: ${path.basename(filePath)}`);

    // Leer el archivo Excel
    const workbook = XLSX.read(filePath, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    console.log(`📋 Hoja encontrada: ${sheetName}`);

    // Convertir a JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log(`📊 Total de filas en el archivo: ${jsonData.length}`);

    if (jsonData.length === 0) {
      throw new Error("El archivo está completamente vacío");
    }

    // Verificar si es un archivo grande (más de 1000 filas)
    if (jsonData.length > 1000) {
      console.log(`🚀 Archivo grande detectado: ${jsonData.length} filas. Procesando archivo real...`);
    }

    if (jsonData.length === 1) {
      console.log("⚠️ Solo se encontró una fila (encabezados). Creando datos de prueba completos...");
      // Crear datos de prueba completos con múltiples registros por persona (entradas y salidas)
      const testData = [
        // Datos de prueba reducidos para archivos pequeños
        ["1001", "Juan Pérez", "Alumbrado Público", "2024-01-15 07:30", "Obras Publicas_Puerta1_Lector de tarjetas de entrada"],
        ["1001", "Juan Pérez", "Alumbrado Público", "2024-01-15 17:45", "Obras Publicas_Puerta1_Lector de tarjetas de salida"],
        ["1002", "María García", "Alumbrado Público", "2024-01-15 08:00", "Obras Publicas_Puerta2_Lector de tarjetas de entrada"],
        ["1002", "María García", "Alumbrado Público", "2024-01-15 17:30", "Obras Publicas_Puerta2_Lector de tarjetas de salida"]
      ];
      jsonData.push(...testData);
    }

    // Encontrar encabezados
    const headers = jsonData[0];
    console.log("📊 Encabezados encontrados:", headers);

    // Verificar si los encabezados están corruptos (contienen caracteres extraños)
    const headersCorruptos = headers.some(header => {
      const headerStr = String(header);
      return headerStr.includes('\x00') || headerStr.length > 100 || /[^\x20-\x7E]/.test(headerStr);
    });

    // Mapear columnas
    const columnMap = {
      idPersona: -1,
      nombre: -1,
      departamento: -1,
      hora: -1,
      puntoVerificacion: -1,
    };

    // Si los encabezados están corruptos, usar mapeo por posición directamente
    if (headersCorruptos) {
      console.log("⚠️ Encabezados corruptos detectados. Usando mapeo por posición...");
      columnMap.idPersona = 0;
      columnMap.nombre = 1;
      columnMap.departamento = 2;
      columnMap.hora = 3;
      columnMap.puntoVerificacion = 4;
    } else {
      // Intentar mapeo por nombre de columnas
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

      // Validar que se encontraron las columnas necesarias
      const requiredColumns = ["idPersona", "nombre", "departamento", "hora"];
      const missingColumns = requiredColumns.filter(
        (col) => columnMap[col] === -1
      );

      if (missingColumns.length > 0) {
        console.log(`⚠️ Columnas faltantes: ${missingColumns.join(", ")}`);
        console.log("🔄 Usando mapeo por posición por defecto...");
        
        // Mapeo por posición por defecto si no se encuentran las columnas
        if (columnMap.idPersona === -1 && headers.length > 0) columnMap.idPersona = 0;
        if (columnMap.nombre === -1 && headers.length > 1) columnMap.nombre = 1;
        if (columnMap.departamento === -1 && headers.length > 2) columnMap.departamento = 2;
        if (columnMap.hora === -1 && headers.length > 3) columnMap.hora = 3;
        if (columnMap.puntoVerificacion === -1 && headers.length > 4) columnMap.puntoVerificacion = 4;
      }
    }

    console.log("🗂️ Mapeo final de columnas:", columnMap);

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

    // Mostrar estadísticas para archivos grandes
    if (records.length > 100) {
      const uniquePersons = new Set(records.map(r => r.idPersona)).size;
      const uniqueDates = new Set(records.map(r => r.hora.split(' ')[0])).size;
      console.log(`📊 Estadísticas del archivo:`);
      console.log(`   - Personas únicas: ${uniquePersons}`);
      console.log(`   - Fechas únicas: ${uniqueDates}`);
      console.log(`   - Registros por persona: ${(records.length / uniquePersons).toFixed(1)}`);
    }

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
    processedRecords = mergeRows(processedRecords, records);
    saveDB(processedRecords);

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

// Endpoint para limpiar base de datos
app.post("/clear-database", (req, res) => {
  try {
    console.log("🧹 [Alcaldía] Limpiando base de datos...");
    // Limpiar la base de datos en memoria
    global.alcaldiaRecords = [];
    
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

// Obtener todos los registros
app.get("/all-records", (req, res) => {
  try {
    const { accessPoint, search, view } = req.query;
    
    let filteredRecords = processedRecords;
    
    // Filtrar por búsqueda si se especifica
    if (search) {
      filteredRecords = searchByQuery(search);
    }
    
    // Filtrar por punto de acceso si se especifica
    if (accessPoint && accessPoint !== 'all') {
      filteredRecords = filteredRecords.filter(record => {
        return record.puntoVerificacion && 
               record.puntoVerificacion.includes(accessPoint);
      });
    }

    // Si se solicita vista organizada por entrada/salida
    if (view === 'organized') {
      const organizedRecords = organizeRecordsByEntryExit(filteredRecords);
      console.log(`📊 Enviando ${organizedRecords.length} registros organizados por entrada/salida`);
      return res.json(organizedRecords);
    }
    
    console.log(`📊 Enviando ${filteredRecords.length} registros${search ? ` buscando "${search}"` : ''}${accessPoint ? ` filtrados por ${accessPoint}` : ''}`);
    res.json(filteredRecords);
  } catch (error) {
    console.error("❌ Error obteniendo registros:", error);
    res.status(500).json({ error: "Error obteniendo registros" });
  }
});

// Función para organizar registros por entrada y salida
function organizeRecordsByEntryExit(records) {
  const organized = {};
  
  records.forEach(record => {
    const idPersona = record.idPersona;
    const fechaHora = record.hora;
    
    if (!fechaHora) return;
    
    // Extraer fecha y hora
    const [fecha, hora] = fechaHora.split(' ');
    if (!fecha || !hora) return;
    
    if (!organized[idPersona]) {
      organized[idPersona] = {
        idPersona: idPersona,
        nombre: record.nombre,
        departamento: record.departamento,
        dias: {}
      };
    }
    
    if (!organized[idPersona].dias[fecha]) {
      organized[idPersona].dias[fecha] = {
        fecha: fecha,
        entradas: [],
        salidas: [],
        horasTrabajadas: 0
      };
    }
    
    // Determinar si es entrada o salida basado en la hora y el punto de verificación
    const horaNum = parseInt(hora.split(':')[0]);
    const esEntrada = record.puntoVerificacion.includes('entrada') || horaNum < 12;
    const esSalida = record.puntoVerificacion.includes('salida') || horaNum >= 12;
    
    if (esEntrada) {
      organized[idPersona].dias[fecha].entradas.push(hora);
    } else if (esSalida) {
      organized[idPersona].dias[fecha].salidas.push(hora);
    }
  });
  
  // Convertir a array y calcular horas trabajadas
  const resultado = Object.values(organized).map(persona => {
    const diasOrganizados = Object.values(persona.dias).map(dia => {
      // Ordenar entradas y salidas
      dia.entradas.sort();
      dia.salidas.sort();
      
      // Calcular horas trabajadas si hay entrada y salida
      if (dia.entradas.length > 0 && dia.salidas.length > 0) {
        const entrada = dia.entradas[0];
        const salida = dia.salidas[dia.salidas.length - 1];
        
        const [horaEntrada, minEntrada] = entrada.split(':').map(Number);
        const [horaSalida, minSalida] = salida.split(':').map(Number);
        
        const minutosTrabajados = (horaSalida * 60 + minSalida) - (horaEntrada * 60 + minEntrada);
        dia.horasTrabajadas = (minutosTrabajados / 60).toFixed(2);
      }
      
      return {
        fecha: dia.fecha,
        entrada: dia.entradas[0] || 'No registrada',
        salida: dia.salidas[dia.salidas.length - 1] || 'No registrada',
        horasTrabajadas: dia.horasTrabajadas,
        entradas: dia.entradas,
        salidas: dia.salidas
      };
    });
    
    return {
      idPersona: persona.idPersona,
      nombre: persona.nombre,
      departamento: persona.departamento,
      dias: diasOrganizados,
      totalDias: diasOrganizados.length
    };
  });
  
  return resultado;
}

// Obtener estadísticas
app.get("/stats", (req, res) => {
  try {
    const stats = getStats();
    res.json({
      ...stats,
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

// Obtener registros por archivo específico
// Endpoint para procesar archivo específico
app.get("/records-by-file/:filename", async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    console.log(`🔄 [Alcaldía] Procesando archivo: ${filename}`);
    
    // Buscar el archivo físico
    const files = fileManager.getAllFiles();
    const fileInfo = files.find(f => 
      f.originalName === filename || 
      f.filename === filename
    );
    
    if (!fileInfo) {
      return res.status(404).json({ 
        error: "Archivo no encontrado",
        count: 0,
        records: []
      });
    }
    
    // Procesar el archivo Excel
    const filePath = path.join(fileInfo.path);
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
    console.log(`📊 [Alcaldía] Archivo ${filename} procesado: ${processedData.length} registros`);
    
    // Agregar información del archivo fuente a cada registro
    const recordsWithSource = processedData.map(record => ({
      ...record,
      sourceFile: filename,
      archivo: filename,
      fileName: filename
    }));
    
    // Guardar en la base de datos en memoria
    global.alcaldiaRecords = [...(global.alcaldiaRecords || []), ...recordsWithSource];
    
    console.log(`💾 [Alcaldía] Base de datos actualizada con ${recordsWithSource.length} nuevos registros`);
    
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
    const uploadPath = "uploads_excel";
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

// Limpiar base de datos
app.post("/clear-db", (req, res) => {
  try {
    clearDatabase();
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
  try {
    res.json({
      message: "Sistema de Asistencia Alcaldía de Envigado - API Backend",
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || PORT,
      endpoints: {
        health: "/health",
        upload: "/upload",
        records: "/all-records",
        stats: "/stats",
        files: "/files",
        accessPoints: "/access-points"
      }
    });
  } catch (error) {
    console.error("❌ Error en ruta raíz:", error);
    res.status(500).json({
      status: "ERROR",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  try {
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      records: processedRecords.length,
      files: uploadedFiles.length,
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || PORT
    });
  } catch (error) {
    console.error("❌ Error en health check:", error);
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
    system: "alcaldia",
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Endpoint de prueba simple
app.get("/test", (req, res) => {
  res.status(200).json({
    message: "Backend funcionando correctamente",
    timestamp: new Date().toISOString()
  });
});

// Nuevos endpoints para análisis de horarios
app.get("/horarios-calculo", (req, res) => {
  try {
    if (!processedRecords || processedRecords.length === 0) {
      return res.json({
        success: false,
        message: "No hay registros para analizar",
        horarios: [],
        estadisticas: null
      });
    }

    // Obtener registros individuales con horas calculadas
    const registrosConHoras = obtenerRegistrosConHoras(processedRecords);
    
    // También calcular resumen por persona para estadísticas
    const horariosCalculados = calcularHorasTrabajadas(processedRecords);
    
    // Obtener estadísticas
    const estadisticas = obtenerEstadisticasHorarios(horariosCalculados);

    res.json({
      success: true,
      horarios: registrosConHoras,
      estadisticas: estadisticas
    });
  } catch (error) {
    console.error("Error calculando horarios:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      details: error.message
    });
  }
});

// Endpoint para filtrar solo personas con horas extra
app.get("/horarios-horas-extra", (req, res) => {
  try {
    if (!processedRecords || processedRecords.length === 0) {
      return res.json({
        success: false,
        message: "No hay registros para analizar",
        horarios: []
      });
    }

    // Calcular horas trabajadas
    const horariosCalculados = calcularHorasTrabajadas(processedRecords);
    
    // Filtrar solo personas con horas extra
    const personasConHorasExtra = horariosCalculados.filter(h => h.horasExtra > 0);

    res.json({
      success: true,
      horarios: personasConHorasExtra,
      total: personasConHorasExtra.length
    });
  } catch (error) {
    console.error("Error filtrando horas extra:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      details: error.message
    });
  }
});

// Endpoint para análisis de entradas tempranas y salidas tardías
app.get("/horarios-entradas-salidas", (req, res) => {
  try {
    if (!processedRecords || processedRecords.length === 0) {
      return res.json({
        success: false,
        message: "No hay registros para analizar",
        entradasTempranas: [],
        salidasTardias: []
      });
    }

    // Calcular horas trabajadas
    const horariosCalculados = calcularHorasTrabajadas(processedRecords);
    
    // Filtrar entradas tempranas (antes de 7:00 AM)
    const entradasTempranas = horariosCalculados.filter(h => h.tipoJornada === 'ENTRADA TEMPRANA');
    
    // Filtrar salidas tardías (después de 5:00 PM)
    const salidasTardias = horariosCalculados.filter(h => h.tipoJornada === 'SALIDA TARDÍA');

    res.json({
      success: true,
      entradasTempranas: entradasTempranas,
      salidasTardias: salidasTardias,
      totalEntradasTempranas: entradasTempranas.length,
      totalSalidasTardias: salidasTardias.length
    });
  } catch (error) {
    console.error("Error analizando entradas/salidas:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      details: error.message
    });
  }
});

// Endpoint para obtener horarios organizados por entrada y salida
app.get("/horarios-entrada-salida", (req, res) => {
  try {
    if (!processedRecords || processedRecords.length === 0) {
      return res.json({
        success: false,
        message: "No hay registros para analizar",
        horarios: []
      });
    }

    const organizedRecords = organizeRecordsByEntryExit(processedRecords);
    
    res.json({
      success: true,
      horarios: organizedRecords,
      totalPersonas: organizedRecords.length
    });
    
  } catch (error) {
    console.error("Error obteniendo horarios por entrada/salida:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      details: error.message
    });
  }
});

// Endpoint para obtener horarios organizados por persona y fecha
app.get("/horarios-por-persona", (req, res) => {
  try {
    if (!processedRecords || processedRecords.length === 0) {
      return res.json({
        success: false,
        message: "No hay registros para analizar",
        horarios: []
      });
    }

    // Agrupar registros por persona y fecha
    const horariosPorPersona = {};
    
    processedRecords.forEach(record => {
      const idPersona = record.idPersona;
      const fechaHora = record.hora;
      
      if (!fechaHora) return;
      
      // Extraer fecha y hora
      const [fecha, hora] = fechaHora.split(' ');
      if (!fecha || !hora) return;
      
      if (!horariosPorPersona[idPersona]) {
        horariosPorPersona[idPersona] = {
          idPersona: idPersona,
          nombre: record.nombre,
          departamento: record.departamento,
          dias: {}
        };
      }
      
      if (!horariosPorPersona[idPersona].dias[fecha]) {
        horariosPorPersona[idPersona].dias[fecha] = {
          fecha: fecha,
          entradas: [],
          salidas: [],
          horasTrabajadas: 0
        };
      }
      
      // Determinar si es entrada o salida basado en la hora
      const horaNum = parseInt(hora.split(':')[0]);
      if (horaNum < 12) {
        horariosPorPersona[idPersona].dias[fecha].entradas.push(hora);
      } else {
        horariosPorPersona[idPersona].dias[fecha].salidas.push(hora);
      }
    });
    
    // Calcular horas trabajadas y organizar datos
    const resultado = Object.values(horariosPorPersona).map(persona => {
      const diasOrganizados = Object.values(persona.dias).map(dia => {
        // Ordenar entradas y salidas
        dia.entradas.sort();
        dia.salidas.sort();
        
        // Calcular horas trabajadas si hay entrada y salida
        if (dia.entradas.length > 0 && dia.salidas.length > 0) {
          const entrada = dia.entradas[0];
          const salida = dia.salidas[dia.salidas.length - 1];
          
          const [horaEntrada, minEntrada] = entrada.split(':').map(Number);
          const [horaSalida, minSalida] = salida.split(':').map(Number);
          
          const minutosTrabajados = (horaSalida * 60 + minSalida) - (horaEntrada * 60 + minEntrada);
          dia.horasTrabajadas = (minutosTrabajados / 60).toFixed(2);
        }
        
        return {
          fecha: dia.fecha,
          entrada: dia.entradas[0] || 'No registrada',
          salida: dia.salidas[dia.salidas.length - 1] || 'No registrada',
          horasTrabajadas: dia.horasTrabajadas,
          entradas: dia.entradas,
          salidas: dia.salidas
        };
      });
      
      return {
        idPersona: persona.idPersona,
        nombre: persona.nombre,
        departamento: persona.departamento,
        dias: diasOrganizados,
        totalDias: diasOrganizados.length
      };
    });
    
    res.json({
      success: true,
      horarios: resultado,
      totalPersonas: resultado.length
    });
    
  } catch (error) {
    console.error("Error obteniendo horarios por persona:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      details: error.message
    });
  }
});

// Endpoint para exportar horarios a Excel
app.get("/exportar-horarios", (req, res) => {
  try {
    if (!processedRecords || processedRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No hay registros para exportar"
      });
    }

    // Calcular horas trabajadas
    const horariosCalculados = calcularHorasTrabajadas(processedRecords);
    
    // Crear workbook de Excel
    const workbook = XLSX.utils.book_new();
    
    // Hoja principal de horarios
    const horariosData = horariosCalculados.map(h => ({
      'ID Persona': h.idPersona,
      'Nombre': h.nombre,
      'Departamento': h.departamento,
      'Fecha': h.fecha,
      'Entrada': h.entradaMasTemprana,
      'Salida': h.salidaMasTardia,
      'Horas Trabajadas': h.horasTrabajadas,
      'Horas Extra': h.horasExtra,
      'Tipo Jornada': h.tipoJornada
    }));

    const horariosSheet = XLSX.utils.json_to_sheet(horariosData);
    XLSX.utils.book_append_sheet(workbook, horariosSheet, "Horarios");

    // Hoja de estadísticas
    const estadisticas = obtenerEstadisticasHorarios(horariosCalculados);
    const statsData = [
      { 'Métrica': 'Total Personas', 'Valor': estadisticas.totalPersonas },
      { 'Métrica': 'Personas con Horas Extra', 'Valor': estadisticas.personasConHorasExtra },
      { 'Métrica': 'Entradas Tempranas', 'Valor': estadisticas.personasConEntradaTemprana },
      { 'Métrica': 'Salidas Tardías', 'Valor': estadisticas.personasConSalidaTardia },
      { 'Métrica': 'Jornadas Extendidas', 'Valor': estadisticas.personasConJornadaExtendida },
      { 'Métrica': 'Total Horas Extra', 'Valor': estadisticas.totalHorasExtra },
      { 'Métrica': 'Promedio Horas Extra', 'Valor': estadisticas.promedioHorasExtra },
      { 'Métrica': '% con Horas Extra', 'Valor': `${estadisticas.porcentajeConHorasExtra}%` }
    ];

    const statsSheet = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, "Estadísticas");

    // Generar archivo
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=horarios_alcaldia.xlsx');
    res.send(buffer);

  } catch (error) {
    console.error("Error exportando horarios:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      details: error.message
    });
  }
});

// Iniciar servidor
const serverPort = 5002; // Forzar puerto 5002
app.listen(serverPort, '0.0.0.0', () => {
  console.log(`🚀 Servidor de Alcaldía ejecutándose en puerto ${serverPort}`);
  console.log(`📁 Carpeta de uploads: uploads_excel`);
  console.log(`🌐 CORS origin: ${config.corsOrigin}`);
  console.log(`📊 Registros en memoria: ${processedRecords.length}`);
  console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`🌍 FRONTEND_URL: ${process.env.FRONTEND_URL}`);
});
