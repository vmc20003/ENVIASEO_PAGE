# Sistema de Gestión de Asistencia - App_Test

Sistema completo para procesar archivos de Excel con datos de asistencia y buscar información por cédula.

## 🚀 Características

- **Procesamiento de Excel**: Soporte para archivos .xlsx y .xls
- **Búsqueda por Cédula**: Búsqueda en tiempo real con debounce
- **Base de Datos Persistente**: Almacenamiento en JSON con deduplicación
- **Gestión de Archivos**: Subir, descargar, procesar y eliminar archivos
- **Estadísticas**: Contador de registros totales y personas únicas
- **Interfaz Moderna**: UI responsive con Bootstrap y diseño atractivo
- **Manejo de Errores**: Validación robusta y mensajes informativos

## 📁 Estructura del Proyecto

```
App_Test/
├── backend/
│   ├── config.js                 # Configuraciones centralizadas
│   ├── server.js                 # Servidor principal
│   ├── utils/
│   │   ├── database.js           # Manejo de base de datos JSON
│   │   └── excelProcessor.js     # Procesamiento de archivos Excel
│   ├── uploads_excel/            # Carpeta de archivos subidos
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Componente principal
│   │   ├── index.js
│   │   └── styles.css
│   └── package.json
└── README.md
```

## 🛠️ Tecnologías Utilizadas

### Backend

- **Node.js** con **Express.js**
- **Multer** para manejo de archivos
- **XLSX** para procesamiento de Excel
- **CORS** para comunicación con frontend
- **ES6 Modules** para organización del código

### Frontend

- **React.js** con hooks
- **Bootstrap 5** para estilos
- **Fetch API** para comunicación con backend

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js (versión 14 o superior)
- npm o yarn

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd App_Test
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del frontend

```bash
cd ../frontend
npm install
```

### 4. Configurar variables de entorno (opcional)

Crear archivo `.env` en la carpeta `backend`:

```env
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

## 🏃‍♂️ Ejecución

### Opción 1: Ejecutar manualmente

#### Backend

```bash
cd backend
npm start
```

#### Frontend

```bash
cd frontend
npm start
```

### Opción 2: Usar scripts de PowerShell (Windows)

```powershell
# Verificar configuración
.\check-setup.ps1

# Iniciar proyecto completo
.\start-project.ps1
```

## 📊 Funcionalidades

### 1. Subir Archivos Excel

- Soporte para archivos .xlsx y .xls
- Validación de tamaño (máximo 10MB)
- Procesamiento automático de encabezados
- Detección inteligente de formatos CSV disfrazados de Excel

### 2. Búsqueda por Cédula

- Búsqueda en tiempo real
- Debounce de 300ms para optimizar rendimiento
- Resultados paginados (10 por página)
- Filtrado por cédula completa o parcial

### 3. Gestión de Archivos

- Lista de archivos subidos con fechas
- Descarga de archivos originales
- Reprocesamiento de archivos existentes
- Eliminación segura de archivos

### 4. Base de Datos

- Almacenamiento persistente en JSON
- Deduplicación automática por cédula y tiempo
- Estadísticas en tiempo real
- Función de limpieza de base de datos

## 🔧 Configuración Avanzada

### Backend (`backend/config.js`)

```javascript
export const config = {
  PORT: 4000,
  UPLOAD_FOLDER: "uploads_excel",
  DATABASE_FILE: "database.json",
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [".xlsx", ".xls"],
};
```

### Procesamiento de Excel (`backend/utils/excelProcessor.js`)

- Configuración de términos de búsqueda para encabezados
- Soporte para múltiples idiomas (español/inglés)
- Logs de depuración configurables

## 📡 API Endpoints

### Archivos

- `POST /upload` - Subir archivo Excel
- `GET /files` - Listar archivos subidos
- `GET /files/:filename` - Descargar archivo
- `DELETE /files/:filename` - Eliminar archivo
- `POST /process/:filename` - Reprocesar archivo

### Búsqueda y Datos

- `GET /buscar/:cedula` - Buscar por cédula
- `GET /stats` - Obtener estadísticas
- `DELETE /clear-db` - Limpiar base de datos

### Sistema

- `GET /health` - Estado del servidor

## 🔍 Procesamiento de Excel

El sistema puede manejar diferentes formatos de archivos Excel:

1. **Excel Estándar**: Archivos con encabezados en la primera fila
2. **CSV en Excel**: Archivos CSV guardados como Excel
3. **Múltiples Formatos**: Detección automática del formato

### Encabezados Soportados

- **Nombre**: First Name, FirstName, firstname, Nombre, nombre
- **Apellido**: Last Name, LastName, lastname, Apellido, apellido
- **Cédula**: Person No., PersonNo, personno, Card No., Cedula, cedula
- **Hora**: Time, time, Hora, hora
- **Punto de Acceso**: Access Point, AccessPoint, accesspoint, Punto Acceso
- **Tipo de Asistencia**: Attendance Type, AttendanceType, Event Type, Tipo Asistencia

## 🐛 Solución de Problemas

### Error: "No se reconoce la información"

1. Verificar que el archivo Excel tenga encabezados válidos
2. Revisar los logs del backend para ver qué encabezados se detectan
3. Asegurar que la cédula esté en una columna reconocible

### Error: "Archivo demasiado grande"

- El límite por defecto es 10MB
- Modificar `MAX_FILE_SIZE` en `config.js` si es necesario

### Error: "Tipo de archivo no permitido"

- Solo se permiten archivos .xlsx y .xls
- Verificar la extensión del archivo

## 🔄 Mejoras Recientes

### v2.0.0 - Reestructuración Completa

- ✅ Código modular y mantenible
- ✅ Manejo robusto de errores
- ✅ Configuración centralizada
- ✅ Mejor procesamiento de Excel
- ✅ Interfaz mejorada con loading states
- ✅ Estadísticas en tiempo real
- ✅ Validación de archivos
- ✅ Logs detallados para depuración

## 📝 Licencia

Este proyecto es de uso interno para gestión de asistencia.

## 🤝 Contribución

Para contribuir al proyecto:

1. Crear una rama para tu feature
2. Implementar los cambios
3. Probar exhaustivamente
4. Crear un Pull Request

---

**Desarrollado con ❤️ para gestión eficiente de asistencia**
