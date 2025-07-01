import express from 'express';
import cors from 'cors';
import multer from 'multer';
import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const uploadFolder = path.join('uploads_excel');
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Reemplazar processedData por base de datos persistente en JSON
const dbFile = path.join(uploadFolder, 'database.json');

function loadDB() {
  if (!fs.existsSync(dbFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf8');
}

function mergeRows(existing, incoming) {
  // Evitar duplicados por cedula y time
  const key = r => `${String(r.personNo).replace(/\D/g, '')}|${r.time}`;
  const map = new Map(existing.map(r => [key(r), r]));
  for (const row of incoming) {
    map.set(key(row), row);
  }
  return Array.from(map.values());
}

// Normalizador flexible para nombres de columnas
function normalize(str) {
  return String(str).replace(/\s+/g, '').replace(/\./g, '').toLowerCase();
}

// Función para encontrar la clave real del encabezado en el archivo Excel, permitiendo coincidencias parciales
function findHeaderKey(keys, search) {
  const normalizedSearch = normalize(search);
  
  // Buscar coincidencia exacta
  let found = keys.find(k => normalize(k) === normalizedSearch);
  if (found) return found;
  
  // Buscar coincidencia parcial más flexible
  found = keys.find(k => {
    const normalizedKey = normalize(k);
    return normalizedKey.includes(normalizedSearch) || 
           normalizedSearch.includes(normalizedKey) ||
           normalizedKey.startsWith(normalizedSearch) || 
           normalizedSearch.startsWith(normalizedKey);
  });
  
  return found || null;
}

function getHeaderRowAndHeaders(sheet) {
  const range = xlsx.utils.decode_range(sheet['!ref']);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    let rowValues = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = sheet[xlsx.utils.encode_cell({ r: R, c: C })];
      rowValues.push(cell ? String(cell.v) : '');
    }
    const normalizedRow = rowValues.map(v => normalize(v));
    if (
      normalizedRow.some(v => v.includes('firstname')) &&
      normalizedRow.some(v => v.includes('lastname')) &&
      (normalizedRow.some(v => v.includes('personno')) || normalizedRow.some(v => v.includes('cardno')))
    ) {
      return { headerRow: R, headers: rowValues };
    }
  }
  return { headerRow: 0, headers: [] };
}

function parseCsvLikeExcel(sheet) {
  const range = xlsx.utils.decode_range(sheet['!ref']);
  let rows = [];
  for (let R = range.s.r; R <= range.e.r; ++R) {
    let rowValues = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = sheet[xlsx.utils.encode_cell({ r: R, c: C })];
      rowValues.push(cell ? String(cell.v) : '');
    }
    rows.push(rowValues);
  }
  
  // Si la primera fila tiene solo una celda con comas, es CSV disfrazado
  if (rows[0].length === 1 && rows[0][0].includes(',')) {
    console.log('Detectado formato CSV en Excel - procesando encabezados...');
    const headers = rows[0][0].split(',').map(h => h.trim());
    console.log('Encabezados extraídos:', headers);
    
    const data = rows.slice(1).map(r => {
      const values = r[0] ? r[0].split(',') : [];
      let obj = {};
      headers.forEach((h, i) => { 
        obj[h] = values[i] || ''; 
      });
      return obj;
    });
    return data;
  }
  
  // Si hay múltiples filas con una sola celda cada una, intentar procesar como CSV
  if (rows.length > 1 && rows.every(r => r.length === 1 && r[0].includes(','))) {
    console.log('Detectado formato CSV en múltiples filas - procesando...');
    const headers = rows[0][0].split(',').map(h => h.trim());
    console.log('Encabezados extraídos:', headers);
    
    const data = rows.slice(1).map(r => {
      const values = r[0] ? r[0].split(',') : [];
      let obj = {};
      headers.forEach((h, i) => { 
        obj[h] = values[i] || ''; 
      });
      return obj;
    });
    return data;
  }
  
  return null;
}

function forceParseCsvLikeExcel(sheet) {
  const range = xlsx.utils.decode_range(sheet['!ref']);
  let rows = [];
  for (let R = range.s.r; R <= range.e.r; ++R) {
    let rowValues = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = sheet[xlsx.utils.encode_cell({ r: R, c: C })];
      rowValues.push(cell ? String(cell.v) : '');
    }
    rows.push(rowValues);
  }
  // Buscar la primera fila que tenga una sola celda con comas
  const headerRowIndex = rows.findIndex(r => r.length === 1 && r[0].includes(','));
  if (headerRowIndex !== -1) {
    const headers = rows[headerRowIndex][0].split(',').map(h => h.trim());
    const data = rows.slice(headerRowIndex + 1).map(r => {
      const values = r[0] ? r[0].split(',') : [];
      let obj = {};
      headers.forEach((h, i) => { obj[h] = values[i] || ''; });
      return obj;
    });
    return data;
  }
  return null;
}

app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  let data = forceParseCsvLikeExcel(sheet) || parseCsvLikeExcel(sheet);
  if (!data) {
    const { headerRow, headers } = getHeaderRowAndHeaders(sheet);
    data = xlsx.utils.sheet_to_json(sheet, { defval: '', header: headers, range: headerRow + 1 });
  }

  const processed = data.map(row => {
    const keys = Object.keys(row);
    const firstNameKey = findHeaderKey(keys, 'First Name');
    const lastNameKey = findHeaderKey(keys, 'Last Name');
    const personNoKey = findHeaderKey(keys, 'Person No.') || findHeaderKey(keys, 'Card No.');
    const timeKey = findHeaderKey(keys, 'Time');
    const accessPointKey = findHeaderKey(keys, 'Access Point');
    const attendanceTypeKey = findHeaderKey(keys, 'Attendance Type') || findHeaderKey(keys, 'Event Type');
    return {
      firstName: row[firstNameKey] || '',
      lastName: row[lastNameKey] || '',
      personNo: row[personNoKey] || '',
      time: row[timeKey] || '',
      accessPoint: row[accessPointKey] || '',
      attendanceType: row[attendanceTypeKey] || ''
    };
  }).filter(row => String(row.personNo).replace(/\D/g, '').length > 0);

  // Cargar y unir con la base de datos
  const db = loadDB();
  const merged = mergeRows(db, processed);
  saveDB(merged);
  res.json({ message: 'Archivo subido y procesado correctamente.' });
});

app.get('/buscar/:cedula', (req, res) => {
  const cedula = String(req.params.cedula).replace(/\D/g, '');
  const db = loadDB();
  // Buscar todas las filas cuya cédula empiece por el valor buscado
  const resultados = db.filter(row => String(row.personNo).replace(/\D/g, '').startsWith(cedula))
    .map(row => ({
      nombre: row.firstName,
      apellido: row.lastName,
      cedula: String(row.personNo).replace(/\D/g, ''),
      punto_acceso: row.accessPoint,
      tipo_asistencia: row.attendanceType
    }));
  res.json(resultados);
});

// Endpoint para listar archivos subidos
app.get('/files', (req, res) => {
  fs.readdir(uploadFolder, (err, files) => {
    if (err) return res.status(500).json({ error: 'No se pudieron listar los archivos.' });
    // Devolver nombre y fecha de modificación
    const fileList = files.map(name => {
      const stats = fs.statSync(path.join(uploadFolder, name));
      return {
        name,
        mtime: stats.mtime
      };
    });
    res.json(fileList);
  });
});

// Endpoint para descargar archivo
app.get('/files/:filename', (req, res) => {
  const filePath = path.join(uploadFolder, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('Archivo no encontrado');
  res.download(filePath);
});

// Endpoint para eliminar archivo
app.delete('/files/:filename', (req, res) => {
  const filePath = path.join(uploadFolder, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('Archivo no encontrado');
  fs.unlinkSync(filePath);
  res.json({ message: 'Archivo eliminado correctamente.' });
});

// Endpoint para procesar un archivo ya existente
app.post('/process/:filename', (req, res) => {
  console.log('Llamada a /process/:filename', req.params.filename);
  const filePath = path.join(uploadFolder, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send('Archivo no encontrado');
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Forzar parseo como CSV disfrazado si es necesario
  let data = forceParseCsvLikeExcel(sheet);
  if (data) {
    console.log('Archivo forzado a procesar como CSV disfrazado de Excel.');
  }
  if (!data) {
    data = parseCsvLikeExcel(sheet);
    if (data) {
      console.log('Archivo procesado como CSV disfrazado de Excel.');
    }
  }
  if (!data) {
    const { headerRow, headers } = getHeaderRowAndHeaders(sheet);
    console.log('Archivo procesado como Excel normal. Encabezados en fila:', headerRow + 1);
    data = xlsx.utils.sheet_to_json(sheet, { defval: '', header: headers, range: headerRow + 1 });
  }

  if (data.length > 0) {
    const keys = Object.keys(data[0]);
    console.log('Encabezados detectados:', keys);
  }

  processedData = data
    .map((row, idx) => {
      const keys = Object.keys(row);
      // Buscar las claves de manera más flexible
      const firstNameKey = findHeaderKey(keys, 'First Name') || findHeaderKey(keys, 'FirstName') || findHeaderKey(keys, 'firstname');
      const lastNameKey = findHeaderKey(keys, 'Last Name') || findHeaderKey(keys, 'LastName') || findHeaderKey(keys, 'lastname');
      const personNoKey = findHeaderKey(keys, 'Person No.') || findHeaderKey(keys, 'PersonNo') || findHeaderKey(keys, 'personno') || findHeaderKey(keys, 'Card No.');
      const timeKey = findHeaderKey(keys, 'Time') || findHeaderKey(keys, 'time');
      const accessPointKey = findHeaderKey(keys, 'Access Point') || findHeaderKey(keys, 'AccessPoint') || findHeaderKey(keys, 'accesspoint');
      const attendanceTypeKey = findHeaderKey(keys, 'Attendance Type') || findHeaderKey(keys, 'AttendanceType') || findHeaderKey(keys, 'Event Type');
      // Logs de depuración para las primeras filas
      if (idx < 3) {
        console.log(`Fila ${idx + 1} keys:`, keys);
        console.log(`firstNameKey:`, firstNameKey, '| Valor:', row[firstNameKey]);
        console.log(`lastNameKey:`, lastNameKey, '| Valor:', row[lastNameKey]);
        console.log(`personNoKey:`, personNoKey, '| Valor:', row[personNoKey]);
        console.log(`timeKey:`, timeKey, '| Valor:', row[timeKey]);
        console.log(`accessPointKey:`, accessPointKey, '| Valor:', row[accessPointKey]);
        console.log(`attendanceTypeKey:`, attendanceTypeKey, '| Valor:', row[attendanceTypeKey]);
      }
      return {
        firstName: row[firstNameKey] || '',
        lastName: row[lastNameKey] || '',
        personNo: row[personNoKey] || '',
        time: row[timeKey] || '',
        accessPoint: row[accessPointKey] || '',
        attendanceType: row[attendanceTypeKey] || ''
      };
    })
    .filter(row => {
      // Solo incluir filas donde personNo sea un número válido y no esté vacío
      const cedula = String(row.personNo).replace(/\D/g, '');
      return cedula.length > 0;
    });
  console.log('Datos procesados (process):', processedData.slice(0, 5));
  res.json({ message: 'Archivo procesado correctamente.' });
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
}); 