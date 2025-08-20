import xlsx from "xlsx";
import { excelConfig } from "../config.js";

// Normalizador flexible para nombres de columnas
export function normalize(str) {
  return String(str).replace(/\s+/g, "").replace(/\./g, "").toLowerCase();
}

// Función para encontrar la clave real del encabezado en el archivo Excel
export function findHeaderKey(keys, searchTerms) {
  if (typeof searchTerms === "string") {
    searchTerms = [searchTerms];
  }

  for (const search of searchTerms) {
    const normalizedSearch = normalize(search);

    // Buscar coincidencia exacta
    let found = keys.find((k) => normalize(k) === normalizedSearch);
    if (found) return found;

    // Buscar coincidencia parcial más flexible
    found = keys.find((k) => {
      const normalizedKey = normalize(k);
      return (
        normalizedKey.includes(normalizedSearch) ||
        normalizedSearch.includes(normalizedKey) ||
        normalizedKey.startsWith(normalizedSearch) ||
        normalizedSearch.startsWith(normalizedKey)
      );
    });

    if (found) return found;
  }

  return null;
}

// NUEVO: Buscar la fila de encabezados real ignorando filas con celdas gigantes
function findHeaderRowAndHeaders(sheet) {
  const range = xlsx.utils.decode_range(sheet["!ref"]);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    let rowValues = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = sheet[xlsx.utils.encode_cell({ r: R, c: C })];
      rowValues.push(cell ? String(cell.v) : "");
    }
    // Ignorar filas donde la primera celda tenga muchas comas (celdas gigantes tipo CSV)
    if (
      rowValues[0] &&
      rowValues[0].split(",").length > 5 &&
      rowValues.filter((x) => x).length === 1
    ) {
      continue;
    }
    const normalizedRow = rowValues.map((v) => normalize(v));
    if (
      normalizedRow.some((v) => v.includes("firstname")) &&
      normalizedRow.some((v) => v.includes("lastname")) &&
      (normalizedRow.some((v) => v.includes("personno")) ||
        normalizedRow.some((v) => v.includes("cardno")))
    ) {
      return { headerRow: R, headers: rowValues };
    }
  }
  return { headerRow: 0, headers: [] };
}

// NUEVO: Mejorar el parser para CSV embebido en Excel
function parseCsvEmbedded(sheet) {
  const range = xlsx.utils.decode_range(sheet["!ref"]);
  let rows = [];
  for (let R = range.s.r; R <= range.e.r; ++R) {
    let rowValues = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = sheet[xlsx.utils.encode_cell({ r: R, c: C })];
      rowValues.push(cell ? String(cell.v) : "");
    }
    rows.push(rowValues);
  }
  // Detectar si la primera fila es un CSV embebido (una celda muy larga con muchas comas)
  if (rows[0].length === 1 && rows[0][0].split(",").length > 5) {
    const headers = rows[0][0].split(",").map((h) => h.trim());
    const data = rows.slice(1).map((r) => {
      const values = r[0] ? r[0].split(",") : [];
      let obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || "";
      });
      return obj;
    });
    return data;
  }
  return null;
}

export function parseCsvLikeExcel(sheet) {
  const range = xlsx.utils.decode_range(sheet["!ref"]);
  let rows = [];
  for (let R = range.s.r; R <= range.e.r; ++R) {
    let rowValues = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = sheet[xlsx.utils.encode_cell({ r: R, c: C })];
      rowValues.push(cell ? String(cell.v) : "");
    }
    rows.push(rowValues);
  }

  // Si la primera fila tiene solo una celda con comas, es CSV disfrazado
  if (rows[0].length === 1 && rows[0][0].includes(",")) {
    console.log("Detectado formato CSV en Excel - procesando encabezados...");
    const headers = rows[0][0].split(",").map((h) => h.trim());
    console.log("Encabezados extraídos:", headers);

    const data = rows.slice(1).map((r) => {
      const values = r[0] ? r[0].split(",") : [];
      let obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || "";
      });
      return obj;
    });
    return data;
  }

  // Si hay múltiples filas con una sola celda cada una, intentar procesar como CSV
  if (
    rows.length > 1 &&
    rows.every((r) => r.length === 1 && r[0].includes(","))
  ) {
    console.log("Detectado formato CSV en múltiples filas - procesando...");
    const headers = rows[0][0].split(",").map((h) => h.trim());
    console.log("Encabezados extraídos:", headers);

    const data = rows.slice(1).map((r) => {
      const values = r[0] ? r[0].split(",") : [];
      let obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || "";
      });
      return obj;
    });
    return data;
  }

  return null;
}

export function forceParseCsvLikeExcel(sheet) {
  const range = xlsx.utils.decode_range(sheet["!ref"]);
  let rows = [];
  for (let R = range.s.r; R <= range.e.r; ++R) {
    let rowValues = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = sheet[xlsx.utils.encode_cell({ r: R, c: C })];
      rowValues.push(cell ? String(cell.v) : "");
    }
    rows.push(rowValues);
  }
  // Buscar la primera fila que tenga una sola celda con comas
  const headerRowIndex = rows.findIndex(
    (r) => r.length === 1 && r[0].includes(",")
  );
  if (headerRowIndex !== -1) {
    const headers = rows[headerRowIndex][0].split(",").map((h) => h.trim());
    const data = rows.slice(headerRowIndex + 1).map((r) => {
      const values = r[0] ? r[0].split(",") : [];
      let obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || "";
      });
      return obj;
    });
    return data;
  }
  return null;
}

export function processExcelData(sheet) {
  // Buscar la fila de encabezados real ignorando filas basura
  const { headerRow, headers } = findHeaderRowAndHeaders(sheet);
  if (!headers.length) {
    throw new Error("No se encontraron encabezados válidos en el archivo.");
  }
  // Procesar solo las filas debajo del encabezado
  let data = xlsx.utils.sheet_to_json(sheet, {
    defval: "",
    header: headers,
    range: headerRow + 1,
  });

  if (data.length > 0) {
    const keys = Object.keys(data[0]);
    console.log("Encabezados detectados:", keys);
  }

  const processed = data
    .map((row, idx) => {
      const keys = Object.keys(row);
      const firstNameKey = findHeaderKey(
        keys,
        excelConfig.HEADER_SEARCH_TERMS.firstName
      );
      const lastNameKey = findHeaderKey(
        keys,
        excelConfig.HEADER_SEARCH_TERMS.lastName
      );
      const personNoKey = findHeaderKey(
        keys,
        excelConfig.HEADER_SEARCH_TERMS.personNo
      );
      const timeKey = findHeaderKey(keys, excelConfig.HEADER_SEARCH_TERMS.time);
      const accessPointKey = findHeaderKey(
        keys,
        excelConfig.HEADER_SEARCH_TERMS.accessPoint
      );
      const attendanceTypeKey = findHeaderKey(
        keys,
        excelConfig.HEADER_SEARCH_TERMS.attendanceType
      );
      // Separar nombre y apellido si vienen juntos en una celda
      let firstName = row[firstNameKey] || "";
      let lastName = row[lastNameKey] || "";
      if (firstName && firstName.includes(",")) {
        const parts = firstName.split(",");
        firstName = parts[0].trim();
        lastName = parts[1] ? parts[1].trim() : lastName;
      }
      if (lastName && lastName.includes(",")) {
        const parts = lastName.split(",");
        lastName = parts[0].trim();
      }
      return {
        firstName,
        lastName,
        personNo: row[personNoKey] || "",
        time: row[timeKey] || "",
        accessPoint: row[accessPointKey] || "",
        attendanceType: row[attendanceTypeKey] || "",
      };
    })
    .filter((row) => {
      const cedula = String(row.personNo).replace(/\D/g, "");
      // Solo incluir filas donde la cédula sea un número colombiano válido (mínimo 5 dígitos)
      return cedula.length >= 5 && !isNaN(Number(cedula));
    });

  console.log("Datos procesados:", processed.slice(0, 5));
  return processed;
}
