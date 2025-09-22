import fs from "fs";
import path from "path";

const dbFile = path.join("uploads_excel", "database.json");

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
  // Evitar duplicados por idPersona y hora
  const key = (r) => `${String(r.idPersona).replace(/\D/g, "")}|${r.hora}`;
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
    uniquePersons: new Set(db.map((r) => String(r.idPersona).replace(/\D/g, "")))
      .size,
  };
}

export function searchByQuery(query) {
  const db = loadDB();
  const q = String(query).replace(/\s+/g, "").toLowerCase();
  return db
    .filter((row) => {
      const nombre = (row.nombre || "").replace(/\s+/g, "").toLowerCase();
      const idPersona = String(row.idPersona).replace(/\D/g, "");
      const departamento = (row.departamento || "").replace(/\s+/g, "").toLowerCase();
      return nombre.includes(q) || idPersona.includes(q) || departamento.includes(q);
    })
    .map((row) => ({
      idPersona: String(row.idPersona).replace(/\D/g, ""),
      nombre: row.nombre,
      departamento: row.departamento,
      hora: row.hora,
      puntoVerificacion: row.puntoVerificacion,
    }));
}

export function clearDatabase() {
  saveDB([]);
}
