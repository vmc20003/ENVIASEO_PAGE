import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function saveToDatabase(data, type) {
  try {
    const dbPath = path.join(__dirname, '..', config.UPLOAD_FOLDER, config.DATABASE_FILE);
    const dbDir = path.dirname(dbPath);
    
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    let database = {};
    if (fs.existsSync(dbPath)) {
      try {
        const dbContent = fs.readFileSync(dbPath, 'utf8');
        database = JSON.parse(dbContent);
      } catch (error) {
        console.warn('Error al leer base de datos existente, creando nueva:', error.message);
        database = {};
      }
    }
    
    if (!database[type]) {
      database[type] = [];
    }
    
    if (!Array.isArray(data)) {
      console.error('Error: data debe ser un array, recibido:', typeof data);
      throw new Error('Data must be an array');
    }
    
    const timestampedData = data.map((record, index) => ({
      id: `${Date.now()}-${index}`,
      timestamp: new Date().toISOString(),
      ...record
    }));
    
    database[type].push(...timestampedData);
    fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
    
    return timestampedData;
    
  } catch (error) {
    console.error('Error al guardar en base de datos:', error);
    throw error;
  }
}
async function getDataFromDatabase(type) {
  try {
    const dbPath = path.join(__dirname, '..', config.UPLOAD_FOLDER, config.DATABASE_FILE);
    
    if (!fs.existsSync(dbPath)) {
      return [];
    }
    
    const dbContent = fs.readFileSync(dbPath, 'utf8');
    const database = JSON.parse(dbContent);
    
    if (!database[type]) {
      return [];
    }
    
    return database[type];
    
  } catch (error) {
    console.error('Error al obtener datos de la base de datos:', error);
    return [];
  }
}

export {
  saveToDatabase,
  getDataFromDatabase
};
