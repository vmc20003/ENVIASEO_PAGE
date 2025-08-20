import fs from "fs";
import path from "path";
import { config } from "../config.js";

const dbFile = path.join(config.UPLOAD_FOLDER, config.DATABASE_FILE);

export function loadDB() {
  if (!fs.existsSync(dbFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(dbFile, "utf8"));
  } catch (e) {
    console.error("Error loading database:", e);
    return [];
  }
}

export function saveDB(data) {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), "utf8");
    console.log(`Database saved with ${data.length} records`);
  } catch (e) {
    console.error("Error saving database:", e);
    throw e;
  }
}

export function mergeRows(existing, incoming) {
  // Evitar duplicados por cedula y time
  const key = (r) => `${String(r.personNo).replace(/\D/g, "")}|${r.time}`;
  const map = new Map(existing.map((r) => [key(r), r]));
  for (const row of incoming) {
    map.set(key(row), row);
  }
  return Array.from(map.values());
}

export function getStats() {
  const db = loadDB();
  return {
    totalRecords: db.length,
    uniquePersons: new Set(db.map((r) => String(r.personNo).replace(/\D/g, "")))
      .size,
  };
}

export function searchByQuery(query) {
  const db = loadDB();
  const q = String(query).replace(/\s+/g, "").toLowerCase();
  return db
    .filter((row) => {
      const nombre = (row.firstName || "").replace(/\s+/g, "").toLowerCase();
      const apellido = (row.lastName || "").replace(/\s+/g, "").toLowerCase();
      const cedula = String(row.personNo).replace(/\D/g, "");
      return nombre.includes(q) || apellido.includes(q) || cedula.includes(q);
    })
    .map((row) => {
      const [fecha, ...horaParts] = (row.time || "").split(" ");
      const hora = horaParts.join(" ");
      return {
        nombre: row.firstName,
        apellido: row.lastName,
        cedula: String(row.personNo).replace(/\D/g, ""),
        punto_acceso: row.accessPoint,
        tipo_asistencia: row.attendanceType,
        fecha: fecha || "",
        hora: hora || "",
      };
    });
}

export function clearDatabase() {
  saveDB([]);
}
