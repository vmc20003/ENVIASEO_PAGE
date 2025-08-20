import { excelConfig } from "../config.js";
import xlsx from "xlsx";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function processExcelData(workbook) {
  const data = [];

  // Validar que el workbook sea válido
  if (
    !workbook ||
    !workbook.SheetNames ||
    !Array.isArray(workbook.SheetNames)
  ) {
    console.log("❌ Workbook inválido o sin hojas");
    return data;
  }

  console.log(`📋 Hojas disponibles: ${workbook.SheetNames.join(", ")}`);

  // Si el workbook no tiene datos válidos, intentar leer el archivo directamente
  if (
    workbook.SheetNames.length === 0 ||
    !workbook.Sheets[workbook.SheetNames[0]]
  ) {
    console.log(
      "⚠️ Workbook sin datos válidos, intentando leer archivo directamente..."
    );

    // Buscar el archivo más reciente en uploads_excel
    const uploadsDir = path.join(__dirname, "..", "uploads_excel");
    if (fs.existsSync(uploadsDir)) {
      const files = fs
        .readdirSync(uploadsDir)
        .filter((file) => file.endsWith(".xls") || file.endsWith(".xlsx"));

      if (files.length > 0) {
        // Usar el archivo más reciente
        const latestFile = files.sort().reverse()[0];
        const filePath = path.join(uploadsDir, latestFile);
        console.log(`📄 Intentando leer archivo: ${latestFile}`);

        // Usar la opción que funciona
        try {
          workbook = xlsx.readFile(filePath, { cellDates: true });
          console.log(
            "✅ Archivo leído correctamente con opción cellDates: true"
          );
        } catch (error) {
          console.log("❌ Error leyendo archivo:", error.message);
          return data;
        }
      }
    }
  }

  // Validar nuevamente después de intentar leer el archivo
  if (
    !workbook ||
    !workbook.SheetNames ||
    !Array.isArray(workbook.SheetNames) ||
    workbook.SheetNames.length === 0
  ) {
    console.log("❌ No se pudo leer el archivo Excel correctamente");
    return data;
  }

  // Usar la primera hoja disponible
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    console.log("❌ No se pudo acceder a la hoja del Excel");
    return data;
  }

  console.log(`📄 Procesando hoja: ${sheetName}`);

  // Obtener el rango de la hoja
  let range = sheet["!ref"];
  if (!range) {
    console.log("❌ Hoja vacía o sin datos");
    return data;
  }

  console.log(`📊 Rango original: ${range}`);

  // Verificar si el rango es válido
  const [start, end] = range.split(":");
  if (!start || !end) {
    console.log("❌ Rango inválido");
    return data;
  }

  // Extraer información del rango
  const startColMatch = start.match(/[A-Z]+/);
  const startRowMatch = start.match(/\d+/);
  const endColMatch = end.match(/[A-Z]+/);
  const endRowMatch = end.match(/\d+/);

  if (!startColMatch || !startRowMatch || !endColMatch || !endRowMatch) {
    console.log("❌ Formato de rango inválido");
    return data;
  }

  let startCol = startColMatch[0];
  let startRow = parseInt(startRowMatch[0]);
  let endCol = endColMatch[0];
  let endRow = parseInt(endRowMatch[0]);

  console.log(`📊 Rango extraído: ${startCol}${startRow} a ${endCol}${endRow}`);

  // Buscar encabezados en la fila 1 (según la estructura real del archivo)
  const headerRow = 1;
  console.log(`🔍 Buscando encabezados en fila ${headerRow}`);

  // Encontrar índices de columnas
  const columnIndices = findColumnIndices(sheet, headerRow, startCol, endCol);

  console.log("Índices de columnas encontrados:", columnIndices);

  // Verificar que tengamos al menos algunas columnas importantes
  const foundColumns = Object.values(columnIndices).filter(
    (index) => index !== -1
  );
  if (foundColumns.length < 1) {
    console.log("❌ No se encontraron suficientes columnas válidas");
    return data;
  }

  console.log(`✅ Encontrados encabezados en fila ${headerRow}`);
  console.log("Índices de columnas encontrados:", columnIndices);

  // Procesar filas de datos (empezar desde la fila 2, después de los encabezados)
  // Manejar el caso donde cada registro está dividido en DOS FILAS consecutivas
  let currentRecord = null;

  for (let row = headerRow + 1; row <= endRow; row++) {
    const rowData = {};
    let hasData = false;

    // Extraer datos de cada columna
    Object.keys(columnIndices).forEach((key) => {
      const colIndex = columnIndices[key];
      if (colIndex !== -1) {
        const cellAddress = `${colIndex}${row}`;
        const cell = sheet[cellAddress];
        const cellValue = cell ? cell.v : "";
        rowData[key] = cellValue;
        if (cellValue && cellValue.toString().trim() !== "") {
          hasData = true;
        }
      }
    });

    // Solo procesar filas con datos válidos
    if (hasData) {
      // Verificar que no sea una fila de encabezados o texto descriptivo
      const isHeaderRow = Object.values(rowData).some((value) => {
        const strValue = value.toString().toLowerCase();
        return (
          strValue.includes("id de persona") ||
          strValue.includes("nombre") ||
          strValue.includes("departamento") ||
          strValue.includes("hora") ||
          strValue.includes("punto de verificación") ||
          strValue.includes("informe de los registros") ||
          strValue.includes("estado de asistencia") ||
          strValue.includes("nombre personalizado") ||
          strValue.includes("fuente de datos") ||
          strValue.includes("gestión de informe") ||
          strValue.includes("temperatura") ||
          strValue.includes("anormal")
        );
      });

      // Verificar que tenga al menos un ID válido (no vacío y no texto descriptivo)
      const hasValidId =
        rowData.idPersona &&
        rowData.idPersona.toString().trim() !== "" &&
        !rowData.idPersona.toString().toLowerCase().includes("informe") &&
        !rowData.idPersona.toString().toLowerCase().includes("id de persona");

      if (!isHeaderRow && hasValidId) {
        // Si tenemos un registro actual y el ID es el mismo, combinar los datos
        if (currentRecord && currentRecord.idPersona === rowData.idPersona) {
          // Combinar nombres si están en filas consecutivas
          if (rowData.nombre && rowData.nombre !== currentRecord.nombre) {
            // Extraer solo el nombre real (sin el ID embebido)
            const cleanName = extractCleanName(rowData.nombre);
            if (cleanName) {
              currentRecord.nombre = cleanName;
            } else {
              // Si no se puede extraer, concatenar
              currentRecord.nombre =
                currentRecord.nombre + " " + rowData.nombre;
            }
          }

          // Combinar punto de verificación si está dividido
          if (
            rowData.puntoVerificacion &&
            rowData.puntoVerificacion !== currentRecord.puntoVerificacion
          ) {
            if (currentRecord.puntoVerificacion) {
              currentRecord.puntoVerificacion =
                currentRecord.puntoVerificacion +
                " " +
                rowData.puntoVerificacion;
            } else {
              currentRecord.puntoVerificacion = rowData.puntoVerificacion;
            }
          }

          // Actualizar otros campos si es necesario
          if (rowData.hora && !currentRecord.hora) {
            currentRecord.hora = rowData.hora;
          }
          if (rowData.departamento && !currentRecord.departamento) {
            currentRecord.departamento = rowData.departamento;
          }
        } else {
          // Si tenemos un registro anterior, guardarlo
          if (currentRecord) {
            const cleanedRecord = cleanRecord(currentRecord);
            if (Object.keys(cleanedRecord).length > 0) {
              data.push(cleanedRecord);
            }
          }

          // Crear nuevo registro
          currentRecord = { ...rowData };

          // Limpiar el nombre del ID embebido desde el inicio
          if (currentRecord.nombre) {
            const cleanName = extractCleanName(currentRecord.nombre);
            if (cleanName) {
              currentRecord.nombre = cleanName;
            }
          }
        }
      }
    }
  }

  // Agregar el último registro si existe
  if (currentRecord) {
    const cleanedRecord = cleanRecord(currentRecord);
    if (Object.keys(cleanedRecord).length > 0) {
      data.push(cleanedRecord);
    }
  }

  console.log(`Procesados ${data.length} registros de Excel en total`);

  // Mostrar algunos ejemplos de datos procesados
  if (data.length > 0) {
    console.log("Ejemplos de datos procesados:");
    data.slice(0, 3).forEach((row, index) => {
      console.log(`Fila ${index + 1}:`, row);
    });
  }

  return data;
}

// Función para extraer el nombre limpio sin el ID embebido
function extractCleanName(nombreCompleto) {
  if (!nombreCompleto) return null;

  const nombreStr = nombreCompleto.toString().trim();

  // Buscar patrones como "70565210-ADOLFO LEON LONDOÑO"
  const match = nombreStr.match(/^\d+-(.+)$/);
  if (match) {
    return match[1].trim();
  }

  // Si no hay patrón, devolver el nombre tal como está
  return nombreStr;
}

function cleanRecord(record) {
  const cleanedRecord = {};
  Object.keys(record).forEach((key) => {
    let value = record[key];
    if (value !== null && value !== undefined) {
      // Convertir a string y limpiar
      value = value.toString().trim();
      if (value !== "") {
        cleanedRecord[key] = value;
      }
    }
  });
  return cleanedRecord;
}

function findColumnIndices(sheet, headerRow, startCol, endCol) {
  const indices = {
    idPersona: -1,
    nombre: -1,
    departamento: -1,
    hora: -1,
    puntoVerificacion: -1,
  };

  // Convertir rangos de columnas a índices
  const startColIndex = columnToIndex(startCol);
  const endColIndex = columnToIndex(endCol);

  console.log(
    `Buscando columnas desde ${startCol} (${startColIndex}) hasta ${endCol} (${endColIndex})`
  );

  // Primero, vamos a mostrar todos los encabezados para debug
  const allHeaders = [];
  for (let col = startColIndex; col <= endColIndex; col++) {
    const colLetter = indexToColumn(col);
    const cellAddress = `${colLetter}${headerRow}`;
    const cell = sheet[cellAddress];
    if (cell && cell.v) {
      const headerValue = cell.v.toString().trim();
      allHeaders.push({ col: colLetter, value: headerValue });
      console.log(`Columna ${colLetter}: "${headerValue}"`);
    }
  }

  console.log("Todos los encabezados encontrados:", allHeaders);

  // ARREGLAR: No asignar la misma columna a múltiples campos
  const usedColumns = new Set();

  // Buscar coincidencias exactas primero
  allHeaders.forEach(({ col, value }) => {
    const headerValue = value.toLowerCase().trim();

    // Buscar coincidencias para cada tipo de columna
    Object.keys(excelConfig.HEADER_SEARCH_TERMS).forEach((key) => {
      const searchTerms = excelConfig.HEADER_SEARCH_TERMS[key];
      const found = searchTerms.some((term) => {
        const termLower = term.toLowerCase();
        // Coincidencia exacta
        return headerValue === termLower;
      });

      if (found && indices[key] === -1 && !usedColumns.has(col)) {
        indices[key] = col;
        usedColumns.add(col);
        console.log(`✓ Encontrada columna ${key} en ${col}: "${value}" (coincidencia exacta)`);
      }
    });
  });

  // Si no encontramos algunas columnas, intentar búsquedas más específicas
  if (indices.idPersona === -1) {
    // Buscar columnas que contengan "id", "cedula", "documento", etc.
    const idCol = allHeaders.find(
      (h) =>
        !usedColumns.has(h.col) &&
        (h.value.toLowerCase().includes("id") ||
          h.value.toLowerCase().includes("cedula") ||
          h.value.toLowerCase().includes("documento") ||
          h.value.toLowerCase().includes("numero") ||
          h.value.toLowerCase().includes("código") ||
          h.value.toLowerCase().includes("codigo"))
    );
    if (idCol) {
      indices.idPersona = idCol.col;
      usedColumns.add(idCol.col);
      console.log(
        `✓ Encontrada columna idPersona (búsqueda específica) en ${idCol.col}: "${idCol.value}"`
      );
    }
  }

  if (indices.nombre === -1) {
    // Buscar columnas que contengan "nombre" o "name"
    const nombreCol = allHeaders.find(
      (h) =>
        !usedColumns.has(h.col) &&
        (h.value.toLowerCase().includes("nombre") ||
          h.value.toLowerCase().includes("name") ||
          h.value.toLowerCase().includes("apellido") ||
          h.value.toLowerCase().includes("persona") ||
          h.value.toLowerCase().includes("empleado"))
    );
    if (nombreCol) {
      indices.nombre = nombreCol.col;
      usedColumns.add(nombreCol.col);
      console.log(
        `✓ Encontrada columna nombre (búsqueda específica) en ${nombreCol.col}: "${nombreCol.value}"`
      );
    }
  }

  if (indices.departamento === -1) {
    // Buscar columnas que contengan "departamento" o "area"
    const deptCol = allHeaders.find(
      (h) =>
        !usedColumns.has(h.col) &&
        (h.value.toLowerCase().includes("departamento") ||
          h.value.toLowerCase().includes("department") ||
          h.value.toLowerCase().includes("area") ||
          h.value.toLowerCase().includes("sección") ||
          h.value.toLowerCase().includes("oficina") ||
          h.value.toLowerCase().includes("sector"))
    );
    if (deptCol) {
      indices.departamento = deptCol.col;
      usedColumns.add(deptCol.col);
      console.log(
        `✓ Encontrada columna departamento (búsqueda específica) en ${deptCol.col}: "${deptCol.value}"`
      );
    }
  }

  if (indices.hora === -1) {
    // Buscar columnas que contengan "hora", "fecha", "time"
    const horaCol = allHeaders.find(
      (h) =>
        !usedColumns.has(h.col) &&
        (h.value.toLowerCase().includes("hora") ||
          h.value.toLowerCase().includes("time") ||
          h.value.toLowerCase().includes("fecha") ||
          h.value.toLowerCase().includes("fecha y hora") ||
          h.value.toLowerCase().includes("timestamp") ||
          h.value.toLowerCase().includes("momento"))
    );
    if (horaCol) {
      indices.hora = horaCol.col;
      usedColumns.add(horaCol.col);
      console.log(
        `✓ Encontrada columna hora (búsqueda específica) en ${horaCol.col}: "${horaCol.value}"`
      );
    }
  }

  if (indices.puntoVerificacion === -1) {
    // Buscar columnas que contengan "punto", "acceso", "terminal"
    const puntoCol = allHeaders.find(
      (h) =>
        !usedColumns.has(h.col) &&
        (h.value.toLowerCase().includes("punto") ||
          h.value.toLowerCase().includes("acceso") ||
          h.value.toLowerCase().includes("terminal") ||
          h.value.toLowerCase().includes("dispositivo") ||
          h.value.toLowerCase().includes("ubicación") ||
          h.value.toLowerCase().includes("lugar"))
    );
    if (puntoCol) {
      indices.puntoVerificacion = puntoCol.col;
      usedColumns.add(puntoCol.col);
      console.log(
        `✓ Encontrada columna puntoVerificacion (búsqueda específica) en ${puntoCol.col}: "${puntoCol.value}"`
      );
    }
  }

  return indices;
}

function columnToIndex(column) {
  let index = 0;
  for (let i = 0; i < column.length; i++) {
    index = index * 26 + (column.charCodeAt(i) - 64);
  }
  return index;
}

function indexToColumn(index) {
  let column = "";
  while (index > 0) {
    index--;
    column = String.fromCharCode(65 + (index % 26)) + column;
    index = Math.floor(index / 26);
  }
  return column;
}
