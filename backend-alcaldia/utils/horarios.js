import fs from "fs";
import path from "path";
import { config } from "../config.js";

const HORARIOS_FILE = "horarios.json";

// Cargar horarios desde archivo JSON
export function loadHorarios() {
  try {
    const horariosPath = path.join(
      process.cwd(),
      config.UPLOAD_FOLDER,
      HORARIOS_FILE
    );
    if (fs.existsSync(horariosPath)) {
      const data = fs.readFileSync(horariosPath, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading horarios:", error);
  }
  return [];
}

// Guardar horarios en archivo JSON
export function saveHorarios(horarios) {
  try {
    const horariosPath = path.join(
      process.cwd(),
      config.UPLOAD_FOLDER,
      HORARIOS_FILE
    );
    const horariosDir = path.dirname(horariosPath);

    if (!fs.existsSync(horariosDir)) {
      fs.mkdirSync(horariosDir, { recursive: true });
    }

    fs.writeFileSync(horariosPath, JSON.stringify(horarios, null, 2));
    return true;
  } catch (error) {
    console.error("Error saving horarios:", error);
    return false;
  }
}

// Agregar o actualizar horario
export function addOrUpdateHorario(horario) {
  const horarios = loadHorarios();
  const existingIndex = horarios.findIndex((h) => h.id === horario.id);

  if (existingIndex !== -1) {
    horarios[existingIndex] = { ...horarios[existingIndex], ...horario };
  } else {
    horarios.push({
      id: Date.now().toString(),
      ...horario,
      createdAt: new Date().toISOString(),
    });
  }

  return saveHorarios(horarios);
}

// Eliminar horario
export function deleteHorario(horarioId) {
  const horarios = loadHorarios();
  const filteredHorarios = horarios.filter((h) => h.id !== horarioId);
  return saveHorarios(filteredHorarios);
}
