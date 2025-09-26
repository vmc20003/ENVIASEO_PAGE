import ExcelJS from 'exceljs';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

async function processExcelFile(filePath, config) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`El archivo no existe: ${filePath}`);
    }
    
    const fileExtension = path.extname(filePath).toLowerCase();
    let workbook;
    
    if (fileExtension === '.xls') {
      // Para archivos .xls usar XLSX que maneja mejor este formato
      const xlsxWorkbook = XLSX.readFile(filePath);
      const sheetName = xlsxWorkbook.SheetNames[0];
      const worksheet = xlsxWorkbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Convertir a formato compatible con ExcelJS
      workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Sheet1');
      
      jsonData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell !== undefined && cell !== null) {
            ws.getCell(rowIndex + 1, colIndex + 1).value = cell;
          }
        });
      });
    } else {
      // Para archivos .xlsx usar ExcelJS
      workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
    }
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('No se encontró ninguna hoja en el archivo Excel');
    }
    
    const headers = findHeaders(worksheet, config.HEADER_SEARCH_TERMS);
    
    if (Object.keys(headers).length === 0) {
      throw new Error('No se pudieron identificar los encabezados del archivo. Verifica que las columnas coincidan con los nombres esperados.');
    }
    
  const processedData = [];
  let rowCount = 0;
  const headerRow = Math.max(...Object.values(headers).map(col => {
    for (let r = 1; r <= 10; r++) {
      const cell = worksheet.getRow(r).getCell(col);
      const cellValue = cell.value?.toString().trim();
      if (cellValue && Object.values(config.HEADER_SEARCH_TERMS).some(terms => 
        terms.some(term => cellValue.toLowerCase().includes(term.toLowerCase()))
      )) {
        return r;
      }
    }
    return 1;
  }));
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRow) return;
    
    rowCount++;
    const rowData = processRow(row, headers, config);
    if (rowData && isValidRow(rowData, config)) {
      processedData.push(rowData);
    }
  });
  
  const validatedData = applyAccessControlValidations(processedData, config);
  
  let finalData = validatedData;
  if (config.ACCESS_CONTROL_CONFIG.VALIDATIONS.groupByPerson) {
    finalData = groupDataByPerson(validatedData, config);
  } else {
    finalData = validatedData.map(record => ({
      ...record,
      nombreCompleto: record.nombreCompleto || record.nombreArchivo,
      fecha: record.fecha || extractDateFromTime(record.tiempo)?.date || 'N/A',
      hora: record.hora || extractTimeFromDateTime(record.tiempo) || 'N/A'
    }));
  }
  
  return finalData;
    
  } catch (error) {
    console.error('❌ Error al procesar archivo Excel:', error);
    throw error;
  }
}

/**
 * Encuentra los encabezados en la primera fila del Excel
 * @param {Object} worksheet - Hoja de Excel
 * @param {Object} searchTerms - Términos de búsqueda para cada campo
 * @returns {Object} Mapeo de campos encontrados
 */
function findHeaders(worksheet, searchTerms) {
  const headers = {};
  
  console.log('🔍 Analizando primeras 10 filas para encontrar encabezados...');
  
  // Buscar en las primeras 10 filas
  for (let rowNumber = 1; rowNumber <= 10; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    console.log(`🔍 Analizando fila ${rowNumber}...`);
    
    row.eachCell((cell, colNumber) => {
      const cellValue = cell.value?.toString().trim();
      if (!cellValue) {
        return;
      }
      
      console.log(`🔍 Fila ${rowNumber}, Columna ${colNumber}: "${cellValue}"`);
      
      // Buscar coincidencias para cada campo
      for (const [fieldName, terms] of Object.entries(searchTerms)) {
        if (headers[fieldName]) continue; // Ya encontrado
        
        if (terms.some(term => 
          cellValue.toLowerCase().includes(term.toLowerCase())
        )) {
          headers[fieldName] = colNumber;
          console.log(`✅ Campo "${fieldName}" encontrado en fila ${rowNumber}, columna ${colNumber}: "${cellValue}"`);
          break;
        }
      }
    });
    
    // Si encontramos todos los campos necesarios, salir
    if (Object.keys(headers).length >= 8) {
      console.log('✅ Se encontraron suficientes encabezados, continuando...');
      break;
    }
  }
  
  // Si no encontramos suficientes encabezados, buscar específicamente en la fila 9
  if (Object.keys(headers).length < 8) {
    console.log('🔍 Buscando específicamente en la fila 9...');
    const row9 = worksheet.getRow(9);
    row9.eachCell((cell, colNumber) => {
      const cellValue = cell.value?.toString().trim();
      if (!cellValue) return;
      
      for (const [fieldName, terms] of Object.entries(searchTerms)) {
        if (headers[fieldName]) continue;
        
        if (terms.some(term => 
          cellValue.toLowerCase().includes(term.toLowerCase())
        )) {
          headers[fieldName] = colNumber;
          console.log(`✅ Campo "${fieldName}" encontrado en fila 9, columna ${colNumber}: "${cellValue}"`);
          break;
        }
      }
    });
  }
  
  // Limpiar mapeos incorrectos - si tiempo y nombreArchivo apuntan a la misma columna, 
  // solo mantener nombreArchivo y buscar tiempo en la columna correcta
  if (headers.tiempo === headers.nombreArchivo && headers.nombreArchivo === 1) {
    console.log('🔧 Corrigiendo mapeo incorrecto de tiempo...');
    delete headers.tiempo;
    
    // Buscar tiempo en la columna 8 específicamente
    const row9 = worksheet.getRow(9);
    const cell8 = row9.getCell(8);
    const cellValue8 = cell8.value?.toString().trim();
    
    if (cellValue8 && cellValue8.toLowerCase().includes('tiempo')) {
      headers.tiempo = 8;
      console.log(`✅ Campo "tiempo" corregido a columna 8: "${cellValue8}"`);
    }
  }
  
  // Asegurar que tiempo esté mapeado correctamente
  if (!headers.tiempo) {
    console.log('🔧 Buscando campo tiempo en columna 8...');
    const row9 = worksheet.getRow(9);
    const cell8 = row9.getCell(8);
    const cellValue8 = cell8.value?.toString().trim();
    
    if (cellValue8 && cellValue8.toLowerCase().includes('tiempo')) {
      headers.tiempo = 8;
      console.log(`✅ Campo "tiempo" asignado a columna 8: "${cellValue8}"`);
    }
  }
  
  console.log('🔍 Resumen de encabezados encontrados:', headers);
  return headers;
}

/**
 * Procesa una fila de datos
 * @param {Object} row - Fila de Excel
 * @param {Object} headers - Mapeo de encabezados
 * @param {Object} config - Configuración
 * @returns {Object} Datos procesados de la fila
 */
function processRow(row, headers, config) {
  const rowData = {};
  
  for (const [fieldName, colNumber] of Object.entries(headers)) {
    const cell = row.getCell(colNumber);
    let value = cell.value;
    
      // Procesar valor según el tipo de campo
  switch (fieldName) {
    case 'nombreArchivo':
      value = processNameField(value);
      break;
    case 'id':
      value = processIdField(value);
      break;
    case 'temperatura':
      value = processTemperatureField(value);
      break;
    case 'estadoTemperatura':
      value = processStatusField(value);
      break;
    case 'usandoMascara':
      value = processMaskField(value);
      break;
    case 'numeroTarjeta':
      value = processCardNumberField(value);
      break;
    case 'grupoPersonas':
      value = processGroupField(value);
      break;
    case 'tiempo':
      value = processTimeField(value);
      break;
    case 'puntoAcceso':
      value = processAccessPointField(value);
      break;
    case 'lectorTarjetas':
      value = processReaderField(value);
      break;
    case 'resultadoAutenticacion':
      value = processAuthResultField(value);
      break;
    case 'tipoAutenticacion':
      value = processAuthTypeField(value);
      break;
    case 'tipoAsistencia':
      value = processAttendanceTypeField(value);
      break;
    default:
      value = value?.toString().trim() || '';
  }
    
    rowData[fieldName] = value;
  }
  
  // Crear nombre completo (en este caso es el nombre de archivo)
  if (rowData.nombreArchivo) {
    rowData.nombreCompleto = rowData.nombreArchivo;
  }
  
  // Extraer fecha del campo tiempo si está habilitado
  if (config.ACCESS_CONTROL_CONFIG.VALIDATIONS.extractDateFromTime && rowData.tiempo) {
    const dateTime = extractDateFromTime(rowData.tiempo);
    if (dateTime) {
      rowData.fecha = dateTime.date;
      rowData.hora = dateTime.time;
    }
  }
  
  return rowData;
}

/**
 * Procesa campo de nombre de archivo (nombre de persona)
 * @param {*} value - Valor del campo
 * @returns {string} Nombre procesado
 */
function processNameField(value) {
  if (!value) return '';
  
  let name = value.toString().trim();
  
  // Capitalizar primera letra de cada palabra
  name = name.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
  
  return name;
}

/**
 * Procesa campo de ID
 * @param {*} value - Valor del campo
 * @returns {string} ID procesado
 */
function processIdField(value) {
  if (!value) return '';
  return value.toString().trim();
}

/**
 * Procesa campo de temperatura
 * @param {*} value - Valor del campo
 * @returns {string} Temperatura procesada
 */
function processTemperatureField(value) {
  if (!value) return '';
  return value.toString().trim();
}

/**
 * Procesa campo de estado de temperatura
 * @param {*} value - Valor del campo
 * @returns {string} Estado procesado
 */
function processStatusField(value) {
  if (!value) return '';
  return value.toString().trim();
}

/**
 * Procesa campo de uso de máscara
 * @param {*} value - Valor del campo
 * @returns {string} Estado de máscara procesado
 */
function processMaskField(value) {
  if (!value) return '';
  return value.toString().trim();
}

/**
 * Procesa campo de número de tarjeta
 * @param {*} value - Valor del campo
 * @returns {string} Número de tarjeta procesado
 */
function processCardNumberField(value) {
  if (!value) return '';
  return value.toString().trim();
}

/**
 * Procesa campo de grupo de personas
 * @param {*} value - Valor del campo
 * @returns {string} Grupo procesado
 */
function processGroupField(value) {
  if (!value) return '';
  return value.toString().trim();
}

/**
 * Procesa campo de lector de tarjetas
 * @param {*} value - Valor del campo
 * @returns {string} Lector procesado
 */
function processReaderField(value) {
  if (!value) return '';
  return value.toString().trim();
}

/**
 * Procesa campo de resultado de autenticación
 * @param {*} value - Valor del campo
 * @returns {string} Resultado procesado
 */
function processAuthResultField(value) {
  if (!value) return '';
  return value.toString().trim();
}

/**
 * Procesa campo de tipo de autenticación
 * @param {*} value - Valor del campo
 * @returns {string} Tipo procesado
 */
function processAuthTypeField(value) {
  if (!value) return '';
  return value.toString().trim();
}

/**
 * Procesa campo de tipo de asistencia
 * @param {*} value - Valor del campo
 * @returns {string} Tipo procesado
 */
function processAttendanceTypeField(value) {
  if (!value) return '';
  return value.toString().trim();
}

/**
 * Procesa campo de cédula
 * @param {*} value - Valor del campo
 * @returns {string} Cédula procesada
 */
function processCedulaField(value) {
  if (!value) return '';
  
  let cedula = value.toString().trim();
  
  // Remover caracteres no numéricos
  cedula = cedula.replace(/\D/g, '');
  
  return cedula;
}

/**
 * Procesa campo de fecha
 * @param {*} value - Valor del campo
 * @returns {string} Fecha procesada
 */
function processDateField(value) {
  if (!value) return '';
  
  try {
    let date;
    
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string') {
      // Intentar parsear diferentes formatos de fecha
      date = new Date(value);
      if (isNaN(date.getTime())) {
        // Intentar formato DD/MM/YYYY
        const parts = value.split('/');
        if (parts.length === 3) {
          date = new Date(parts[2], parts[1] - 1, parts[0]);
        }
      }
    } else if (typeof value === 'number') {
      // Fecha de Excel (número de días desde 1900)
      date = new Date((value - 25569) * 86400 * 1000);
    }
    
    if (date && !isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    }
    
    return value.toString().trim();
  } catch (error) {
    console.warn('⚠️ Error al procesar fecha:', value, error.message);
    return value.toString().trim();
  }
}

/**
 * Procesa campo de hora
 * @param {*} value - Valor del campo
 * @returns {string} Hora procesada
 */
function processTimeField(value) {
  if (!value) return '';
  
  try {
    let time;
    
    if (value instanceof Date) {
      time = value;
    } else if (typeof value === 'string') {
      time = new Date(`2000-01-01T${value}`);
    } else if (typeof value === 'number') {
      // Hora de Excel (fracción del día)
      const totalSeconds = Math.round(value * 24 * 60 * 60);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      time = new Date(`2000-01-01T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }
    
    if (time && !isNaN(time.getTime())) {
      return time.toTimeString().split(' ')[0]; // Formato HH:MM:SS
    }
    
    return value.toString().trim();
  } catch (error) {
    console.warn('⚠️ Error al procesar hora:', value, error.message);
    return value.toString().trim();
  }
}

/**
 * Procesa campo de punto de acceso
 * @param {*} value - Valor del campo
 * @returns {string} Punto de acceso procesado
 */
function processAccessPointField(value) {
  if (!value) return '';
  
  let accessPoint = value.toString().trim();
  
  // Capitalizar primera letra
  accessPoint = accessPoint.charAt(0).toUpperCase() + accessPoint.slice(1).toLowerCase();
  
  return accessPoint;
}

/**
 * Procesa campo de tipo de evento
 * @param {*} value - Valor del campo
 * @returns {string} Tipo de evento procesado
 */
function processEventTypeField(value) {
  if (!value) return '';
  
  let eventType = value.toString().trim();
  
  // Capitalizar primera letra
  eventType = eventType.charAt(0).toUpperCase() + eventType.slice(1).toLowerCase();
  
  return eventType;
}

/**
 * Extrae fecha y hora del campo tiempo
 * @param {*} timeValue - Valor del campo tiempo
 * @returns {Object|null} Objeto con fecha y hora separadas
 */
function extractDateFromTime(timeValue) {
  if (!timeValue) return null;
  
  try {
    let date;
    
    if (timeValue instanceof Date) {
      date = timeValue;
    } else if (typeof timeValue === 'string') {
      // Intentar parsear diferentes formatos de fecha y hora
      date = new Date(timeValue);
      if (isNaN(date.getTime())) {
        // Intentar formato DD/MM/YYYY HH:MM:SS
        const parts = timeValue.split(' ');
        if (parts.length >= 2) {
          const datePart = parts[0];
          const timePart = parts[1];
          const dateParts = datePart.split('/');
          if (dateParts.length === 3) {
            date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
            if (timePart) {
              const timeParts = timePart.split(':');
              if (timeParts.length >= 2) {
                date.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), timeParts[2] ? parseInt(timeParts[2]) : 0);
              }
            }
          }
        }
      }
    } else if (typeof timeValue === 'number') {
      // Fecha de Excel (número de días desde 1900)
      date = new Date((timeValue - 25569) * 86400 * 1000);
    }
    
    if (date && !isNaN(date.getTime())) {
      return {
        date: date.toISOString().split('T')[0], // Formato YYYY-MM-DD
        time: date.toTimeString().split(' ')[0] // Formato HH:MM:SS
      };
    }
    
    return null;
  } catch (error) {
    console.warn('⚠️ Error al extraer fecha del tiempo:', timeValue, error.message);
    return null;
  }
}

/**
 * Valida si una fila tiene datos válidos
 * @param {Object} rowData - Datos de la fila
 * @param {Object} config - Configuración
 * @returns {boolean} True si la fila es válida
 */
function isValidRow(rowData, config) {
  // Verificar que tenga al menos nombre de archivo (persona) y tiempo
  if (!rowData.nombreArchivo || !rowData.tiempo) {
    return false;
  }
  
  // Verificar que tenga tipo de asistencia
  if (!rowData.tipoAsistencia) {
    return false;
  }
  
  return true;
}

/**
 * Aplica validaciones específicas de control de acceso
 * @param {Array} data - Datos procesados
 * @param {Object} config - Configuración
 * @returns {Array} Datos validados
 */
function applyAccessControlValidations(data, config) {
  const accessConfig = config.ACCESS_CONTROL_CONFIG;
  
  return data.filter(record => {
    // Validar formato de fecha si es requerido
    if (accessConfig.VALIDATIONS.requireDateFormat && record.fecha) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(record.fecha)) {
        console.warn(`⚠️ Formato de fecha inválido: ${record.fecha}`);
        return false;
      }
    }
    
    // Validar formato de hora si es requerido
    if (accessConfig.VALIDATIONS.requireTimeFormat && record.hora) {
      const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
      if (!timeRegex.test(record.hora)) {
        console.warn(`⚠️ Formato de hora inválido: ${record.hora}`);
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Agrupa los datos por persona para mostrar entrada y salida juntas
 * @param {Array} data - Datos procesados
 * @param {Object} config - Configuración
 * @returns {Array} Datos agrupados por persona
 */
function groupDataByPerson(data, config) {
  const groupingConfig = config.ACCESS_CONTROL_CONFIG.GROUPING;
  const groupedData = {};
  
  // Agrupar por persona y grupo
  data.forEach(record => {
    const personKey = record[groupingConfig.primaryKey];
    const groupKey = record[groupingConfig.secondaryKey] || 'Sin Grupo';
    const combinedKey = `${personKey}_${groupKey}`;
    
    if (!groupedData[combinedKey]) {
      groupedData[combinedKey] = {
        nombreCompleto: record.nombreCompleto || record[groupingConfig.primaryKey],
        nombreArchivo: record[groupingConfig.primaryKey],
        grupoPersonas: record[groupingConfig.secondaryKey] || 'Sin Grupo',
        id: record.id,
        temperatura: record.temperatura,
        estadoTemperatura: record.estadoTemperatura,
        usandoMascara: record.usandoMascara,
        numeroTarjeta: record.numeroTarjeta,
        puntoAcceso: record.puntoAcceso,
        lectorTarjetas: record.lectorTarjetas,
        resultadoAutenticacion: record.resultadoAutenticacion,
        tipoAutenticacion: record.tipoAutenticacion,
        registros: [],
        entrada: null,
        salida: null,
        fecha: null
      };
    }
    
    // Agregar registro individual
    groupedData[combinedKey].registros.push({
      tiempo: record.tiempo,
      fecha: record.fecha,
      hora: record.hora,
      tipoAsistencia: record.tipoAsistencia,
      puntoAcceso: record.puntoAcceso,
      temperatura: record.temperatura,
      usandoMascara: record.usandoMascara
    });
    
    // Determinar entrada y salida
    const attendanceType = record[groupingConfig.attendanceField]?.toLowerCase();
    const isEntrada = config.ACCESS_CONTROL_CONFIG.EVENT_TYPES.ENTRADA.some(type => 
      attendanceType.includes(type.toLowerCase())
    );
    const isSalida = config.ACCESS_CONTROL_CONFIG.EVENT_TYPES.SALIDA.some(type => 
      attendanceType.includes(type.toLowerCase())
    );
    
    if (isEntrada && !groupedData[combinedKey].entrada) {
      groupedData[combinedKey].entrada = {
        tiempo: record.tiempo,
        fecha: record.fecha,
        hora: record.hora,
        puntoAcceso: record.puntoAcceso,
        temperatura: record.temperatura,
        usandoMascara: record.usandoMascara
      };
      groupedData[combinedKey].fecha = record.fecha;
    }
    
    if (isSalida && !groupedData[combinedKey].salida) {
      groupedData[combinedKey].salida = {
        tiempo: record.tiempo,
        fecha: record.fecha,
        hora: record.hora,
        puntoAcceso: record.puntoAcceso,
        temperatura: record.temperatura,
        usandoMascara: record.usandoMascara
      };
      if (!groupedData[combinedKey].fecha) {
        groupedData[combinedKey].fecha = record.fecha;
      }
    }
  });
  
  // Convertir a array y calcular duración si hay entrada y salida
  const result = Object.values(groupedData).map(person => {
    if (person.entrada && person.salida) {
      // Calcular duración de trabajo
      const entradaTime = new Date(`2000-01-01T${person.entrada.hora}`);
      const salidaTime = new Date(`2000-01-01T${person.salida.hora}`);
      const durationMs = salidaTime - entradaTime;
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      
      person.duracionTrabajo = `${hours}h ${minutes}m`;
      person.duracionMinutos = Math.floor(durationMs / (1000 * 60));
    }
    
    return person;
  });
  
  // Ordenar por fecha y hora de entrada
  result.sort((a, b) => {
    if (a.fecha && b.fecha) {
      if (a.fecha !== b.fecha) {
        return new Date(a.fecha) - new Date(b.fecha);
      }
      if (a.entrada && b.entrada) {
        return a.entrada.hora.localeCompare(b.entrada.hora);
      }
    }
    return 0;
  });
  
  return result;
}

/**
 * Extrae solo la hora de un valor de fecha y hora
 * @param {*} timeValue - Valor de fecha y hora
 * @returns {string} Hora en formato HH:MM:SS
 */
function extractTimeFromDateTime(timeValue) {
  if (!timeValue) return 'N/A';
  
  try {
    let date;
    
    if (timeValue instanceof Date) {
      date = timeValue;
    } else if (typeof timeValue === 'string') {
      date = new Date(timeValue);
    } else {
      return 'N/A';
    }
    
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    
    return date.toTimeString().split(' ')[0]; // HH:MM:SS
  } catch (error) {
    console.error('Error al extraer hora del tiempo:', error);
    return 'N/A';
  }
}

export {
  processExcelFile
};
