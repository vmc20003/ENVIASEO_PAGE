# Sistema de Gestión de Archivos del Backend

## 🎯 Objetivo
Este sistema permite que los archivos Excel subidos se mantengan persistentes entre reinicios del servidor, evitando que se pierdan y permitiendo su revisión posterior.

## 🚀 Funcionalidades Implementadas

### 1. **Persistencia de Archivos**
- Los archivos se guardan permanentemente en la carpeta `uploads_excel`
- Se mantiene un registro de metadatos en `files-metadata.json`
- Los archivos sobreviven a reinicios del servidor

### 2. **Gestión de Archivos**
- **Listar archivos**: `GET /files`
- **Obtener estadísticas**: `GET /files/stats`
- **Eliminar archivo por ID**: `DELETE /files/:id`
- **Eliminar archivo por nombre**: `DELETE /files/name/:filename`
- **Reprocesar archivo**: `POST /files/:id/reprocess`

### 3. **Limpieza del Sistema**
- **Limpiar solo archivos**: `DELETE /clear-files`
- **Limpiar todo (archivos + base de datos)**: `DELETE /clear-all`

## 🧹 Limpieza Inicial

Para limpiar todos los archivos existentes y empezar desde cero:

### Opción 1: Script de PowerShell
```powershell
.\clear-backend-files.ps1
```

### Opción 2: Script de Node.js
```bash
cd backend
node clear-all-files.js
```

### Opción 3: API Endpoints
```bash
# Limpiar solo archivos
curl -X DELETE http://localhost:4000/clear-files

# Limpiar todo (archivos + base de datos)
curl -X DELETE http://localhost:4000/clear-all
```

## 📁 Estructura de Archivos

```
backend/
├── uploads_excel/
│   ├── files-metadata.json    # Metadatos de archivos
│   ├── database.json          # Base de datos
│   └── [archivos Excel]      # Archivos subidos
├── utils/
│   └── fileManager.js         # Gestor de archivos
└── clear-all-files.js         # Script de limpieza
```

## 🔄 Flujo de Trabajo

1. **Al subir un archivo**:
   - Se guarda físicamente en `uploads_excel/`
   - Se procesa y se agrega a la base de datos
   - Se registra en `files-metadata.json`

2. **Al reiniciar el servidor**:
   - Se cargan los metadatos existentes
   - Se sincroniza con archivos físicos
   - Se marcan archivos no procesados

3. **Para eliminar archivos**:
   - Se elimina el archivo físico
   - Se actualiza la base de datos
   - Se actualizan los metadatos

## 📊 Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/files` | Listar todos los archivos |
| `GET` | `/files/stats` | Estadísticas de archivos y base de datos |
| `DELETE` | `/files/:id` | Eliminar archivo por ID |
| `DELETE` | `/files/name/:filename` | Eliminar archivo por nombre |
| `POST` | `/files/:id/reprocess` | Reprocesar archivo existente |
| `DELETE` | `/clear-files` | Limpiar solo archivos |
| `DELETE` | `/clear-all` | Limpiar archivos y base de datos |

## 🛠️ Uso del FileManager

```javascript
import { fileManager } from './utils/fileManager.js';

// Agregar archivo
const fileInfo = {
  filename: 'archivo.xlsx',
  originalname: 'archivo.xlsx',
  size: 1024,
  path: '/ruta/al/archivo'
};
const savedFile = fileManager.addFile(fileInfo);

// Obtener archivos
const allFiles = fileManager.getAllFiles();

// Eliminar archivo
const success = fileManager.removeFile('id-del-archivo');

// Estadísticas
const stats = fileManager.getStats();
```

## ⚠️ Consideraciones Importantes

1. **Reinicio del servidor**: Después de limpiar archivos, reinicia el servidor
2. **Base de datos**: El endpoint `/clear-all` también limpia la base de datos
3. **Metadatos**: Los metadatos se sincronizan automáticamente al iniciar
4. **Archivos huérfanos**: Se detectan y se agregan automáticamente

## 🚨 Solución de Problemas

### Archivos no aparecen después del reinicio
1. Verifica que `files-metadata.json` existe
2. Revisa los logs del servidor
3. Usa `/files/stats` para ver el estado

### Error al eliminar archivos
1. Verifica permisos de escritura
2. Asegúrate de que el archivo existe
3. Revisa los logs de error

### Base de datos corrupta
1. Usa `/clear-all` para limpiar todo
2. Reinicia el servidor
3. Sube archivos nuevamente
