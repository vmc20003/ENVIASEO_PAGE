import fs from "fs";
import path from "path";
import { config } from "../config.js";

// Cargar base de datos desde archivo JSON
export function loadDB() {
  try {
    const dbPath = path.join(
      process.cwd(),
      config.UPLOAD_FOLDER,
      config.DATABASE_FILE
    );
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading database:", error);
  }
  return [];
}

// Guardar base de datos en archivo JSON
export function saveDB(data) {
  try {
    const dbPath = path.join(
      process.cwd(),
      config.UPLOAD_FOLDER,
      config.DATABASE_FILE
    );
    const dbDir = path.dirname(dbPath);

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Error saving database:", error);
    return false;
  }
}

// Unir filas de datos, evitando duplicados
export function mergeRows(existingData, newData) {
  const merged = [...existingData];

  newData.forEach((newRow) => {
    const isDuplicate = existingData.some((existingRow) => {
      return (
        existingRow.idPersona === newRow.idPersona &&
        existingRow.nombre === newRow.nombre &&
        existingRow.departamento === newRow.departamento &&
        existingRow.hora === newRow.hora &&
        existingRow.puntoVerificacion === newRow.puntoVerificacion
      );
    });

    if (!isDuplicate) {
      merged.push(newRow);
    }
  });

  return merged;
}

// Obtener estadísticas de la base de datos
export function getStats() {
  const data = loadDB();
  const uniquePersons = new Set(data.map((row) => row.idPersona)).size;

  return {
    totalRecords: data.length,
    uniquePersons: uniquePersons,
    lastUpdate: new Date().toISOString(),
  };
}

// Buscar registros por consulta
export function searchByQuery(query, page = 1) {
  const data = loadDB();
  const searchTerm = query.toLowerCase();

  const filtered = data.filter((row) => {
    return (
      (row.idPersona &&
        row.idPersona.toString().toLowerCase().includes(searchTerm)) ||
      (row.nombre && row.nombre.toLowerCase().includes(searchTerm)) ||
      (row.departamento &&
        row.departamento.toLowerCase().includes(searchTerm)) ||
      (row.hora && row.hora.toLowerCase().includes(searchTerm)) ||
      (row.puntoVerificacion &&
        row.puntoVerificacion.toLowerCase().includes(searchTerm))
    );
  });

  const startIndex = (page - 1) * config.PAGE_SIZE;
  const endIndex = startIndex + config.PAGE_SIZE;

  return {
    data: filtered.slice(startIndex, endIndex),
    total: filtered.length,
    page: page,
    totalPages: Math.ceil(filtered.length / config.PAGE_SIZE),
  };
}

// Limpiar base de datos
export function clearDatabase() {
  try {
    const dbPath = path.join(
      process.cwd(),
      config.UPLOAD_FOLDER,
      config.DATABASE_FILE
    );
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    return true;
  } catch (error) {
    console.error("Error clearing database:", error);
    return false;
  }
}
