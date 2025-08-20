import fs from "fs";
import path from "path";

const HORARIOS_FILE = path.join("uploads_excel", "horarios.json");

export function loadHorarios() {
  if (!fs.existsSync(HORARIOS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(HORARIOS_FILE, "utf8"));
  } catch (e) {
    console.error("Error loading horarios:", e);
    return [];
  }
}

export function saveHorarios(data) {
  fs.writeFileSync(HORARIOS_FILE, JSON.stringify(data, null, 2), "utf8");
}

export function addOrUpdateHorario(horario) {
  const horarios = loadHorarios();
  // Si existe uno igual (por cédula y rango de fechas), actualizar
  const idx = horarios.findIndex(
    (h) =>
      h.cedula === horario.cedula &&
      h.fecha_inicio === horario.fecha_inicio &&
      h.fecha_fin === horario.fecha_fin
  );
  if (idx !== -1) {
    horarios[idx] = horario;
  } else {
    horarios.push(horario);
  }
  saveHorarios(horarios);
}

export function deleteHorario(cedula, fecha_inicio, fecha_fin) {
  let horarios = loadHorarios();
  horarios = horarios.filter(
    (h) =>
      !(
        h.cedula === cedula &&
        h.fecha_inicio === fecha_inicio &&
        h.fecha_fin === fecha_fin
      )
  );
  saveHorarios(horarios);
}

export function findHorario(cedula, fecha) {
  // Busca el horario de una persona para una fecha específica
  const horarios = loadHorarios();
  return horarios.find(
    (h) =>
      h.cedula === cedula && fecha >= h.fecha_inicio && fecha <= h.fecha_fin
  );
}
