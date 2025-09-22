import fs from "fs";
import path from "path";

const HORARIOS_FILE = path.join("uploads_excel", "horarios_alcaldia.json");

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
  // Si existe uno igual (por ID y rango de fechas), actualizar
  const idx = horarios.findIndex(
    (h) =>
      h.idPersona === horario.idPersona &&
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

export function deleteHorario(idPersona, fecha_inicio, fecha_fin) {
  let horarios = loadHorarios();
  horarios = horarios.filter(
    (h) =>
      !(
        h.idPersona === idPersona &&
        h.fecha_inicio === fecha_inicio &&
        h.fecha_fin === fecha_fin
      )
  );
  saveHorarios(horarios);
}

export function findHorario(idPersona, fecha) {
  // Busca el horario de una persona para una fecha específica
  const horarios = loadHorarios();
  return horarios.find(
    (h) =>
      h.idPersona === idPersona && fecha >= h.fecha_inicio && fecha <= h.fecha_fin
  );
}

// Función para calcular horas trabajadas basándose en los datos de asistencia
export function calcularHorasTrabajadas(registros) {
  const JORNADA_LABORAL_HORAS = 8; // Horas estándar de trabajo
  
  // Agrupar registros por persona y fecha
  const personasPorFecha = {};
  
  registros.forEach(registro => {
    if (!registro.hora || !registro.idPersona) return;
    
    const [fecha, hora] = registro.hora.split(" ");
    if (!fecha || !hora) return;
    
    const key = `${registro.idPersona}-${fecha}`;
    
    if (!personasPorFecha[key]) {
      personasPorFecha[key] = {
        idPersona: registro.idPersona,
        nombre: registro.nombre,
        departamento: registro.departamento,
        fecha: fecha,
        registros: [],
        entradaMasTemprana: null,
        salidaMasTardia: null,
        horasTrabajadas: 0,
        horasExtra: 0,
        tipoJornada: 'NO CLASIFICADO'
      };
    }
    
    personasPorFecha[key].registros.push({
      hora: hora,
      timestamp: registro.hora,
      puntoVerificacion: registro.puntoVerificacion
    });
  });
  
  // Calcular horas trabajadas para cada persona por fecha
  Object.values(personasPorFecha).forEach(persona => {
    if (persona.registros.length === 0) return;
    
    // Ordenar registros por hora
    persona.registros.sort((a, b) => a.hora.localeCompare(b.hora));
    
    // Tomar la hora más temprana como entrada y la más tardía como salida
    const entrada = persona.registros[0].hora;
    const salida = persona.registros[persona.registros.length - 1].hora;
    
    persona.entradaMasTemprana = entrada;
    persona.salidaMasTardia = salida;
    
    // Calcular horas trabajadas
    const [h1, m1] = entrada.split(":").map(Number);
    const [h2, m2] = salida.split(":").map(Number);
    
    let horasTrabajadas = (h2 + m2 / 60) - (h1 + m1 / 60);
    
    // Si la diferencia es negativa, significa que trabajó hasta el día siguiente
    if (horasTrabajadas < 0) {
      horasTrabajadas += 24;
    }
    
    persona.horasTrabajadas = Math.round(horasTrabajadas * 100) / 100;
    persona.horasExtra = Math.max(0, horasTrabajadas - JORNADA_LABORAL_HORAS);
    
    // Clasificar tipo de jornada
    if (h1 < 7 && h2 >= 17) {
      persona.tipoJornada = 'JORNADA EXTENDIDA';
    } else if (h1 < 7) {
      persona.tipoJornada = 'ENTRADA TEMPRANA';
    } else if (h2 >= 17) {
      persona.tipoJornada = 'SALIDA TARDÍA';
    } else if (h1 >= 7 && h1 < 9) {
      persona.tipoJornada = 'JORNADA ESTÁNDAR';
    } else {
      persona.tipoJornada = 'JORNADA VARIABLE';
    }
  });
  
  return Object.values(personasPorFecha);
}

// Función para obtener registros individuales con horas calculadas
export function obtenerRegistrosConHoras(registros) {
  const JORNADA_LABORAL_HORAS = 8; // Horas estándar de trabajo
  
  // Agrupar registros por persona y fecha para calcular horas
  const personasPorFecha = {};
  
  registros.forEach(registro => {
    if (!registro.hora || !registro.idPersona) return;
    
    const [fecha, hora] = registro.hora.split(" ");
    if (!fecha || !hora) return;
    
    const key = `${registro.idPersona}-${fecha}`;
    
    if (!personasPorFecha[key]) {
      personasPorFecha[key] = {
        registros: []
      };
    }
    
    personasPorFecha[key].registros.push({
      hora: hora,
      timestamp: registro.hora
    });
  });
  
  // Calcular horas trabajadas para cada persona por fecha
  Object.values(personasPorFecha).forEach(persona => {
    if (persona.registros.length === 0) return;
    
    // Ordenar registros por hora
    persona.registros.sort((a, b) => a.hora.localeCompare(b.hora));
    
    // Tomar la hora más temprana como entrada y la más tardía como salida
    const entrada = persona.registros[0].hora;
    const salida = persona.registros[persona.registros.length - 1].hora;
    
    // Calcular horas trabajadas
    const [h1, m1] = entrada.split(":").map(Number);
    const [h2, m2] = salida.split(":").map(Number);
    
    let horasTrabajadas = (h2 + m2 / 60) - (h1 + m1 / 60);
    
    // Si la diferencia es negativa, significa que trabajó hasta el día siguiente
    if (horasTrabajadas < 0) {
      horasTrabajadas += 24;
    }
    
    persona.horasTrabajadas = Math.round(horasTrabajadas * 100) / 100;
    persona.horasExtra = Math.max(0, horasTrabajadas - JORNADA_LABORAL_HORAS);
  });
  
  // Retornar registros individuales con horas calculadas
  return registros.map(registro => {
    if (!registro.hora || !registro.idPersona) return registro;
    
    const [fecha, hora] = registro.hora.split(" ");
    if (!fecha || !hora) return registro;
    
    const key = `${registro.idPersona}-${fecha}`;
    const personaData = personasPorFecha[key];
    
    if (personaData) {
      return {
        idPersona: registro.idPersona,
        nombre: registro.nombre,
        departamento: registro.departamento,
        hora: hora, // Mostrar solo la hora, no la fecha completa
        puntoVerificacion: registro.puntoVerificacion,
        horasTrabajadas: personaData.horasTrabajadas,
        horasExtra: personaData.horasExtra
      };
    }
    
    return {
      idPersona: registro.idPersona,
      nombre: registro.nombre,
      departamento: registro.departamento,
      hora: hora,
      puntoVerificacion: registro.puntoVerificacion,
      horasTrabajadas: 0,
      horasExtra: 0
    };
  });
}

// Función para obtener estadísticas de horarios
export function obtenerEstadisticasHorarios(horariosCalculados) {
  const totalPersonas = horariosCalculados.length;
  const personasConHorasExtra = horariosCalculados.filter(h => h.horasExtra > 0).length;
  const personasConEntradaTemprana = horariosCalculados.filter(h => h.tipoJornada === 'ENTRADA TEMPRANA').length;
  const personasConSalidaTardia = horariosCalculados.filter(h => h.tipoJornada === 'SALIDA TARDÍA').length;
  const personasConJornadaExtendida = horariosCalculados.filter(h => h.tipoJornada === 'JORNADA EXTENDIDA').length;
  
  const totalHorasExtra = horariosCalculados.reduce((sum, h) => sum + h.horasExtra, 0);
  const promedioHorasExtra = totalHorasExtra / totalPersonas;
  
  return {
    totalPersonas,
    personasConHorasExtra,
    personasConEntradaTemprana,
    personasConSalidaTardia,
    personasConJornadaExtendida,
    totalHorasExtra: Math.round(totalHorasExtra * 100) / 100,
    promedioHorasExtra: Math.round(promedioHorasExtra * 100) / 100,
    porcentajeConHorasExtra: Math.round((personasConHorasExtra / totalPersonas) * 100)
  };
}
