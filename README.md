# Sistema de Gestión de Asistencia - envíaseo E.S.P.

Este proyecto permite subir archivos Excel con datos de asistencia y buscar empleados por número de cédula para calcular horas extras.

## Requisitos Previos

### 1. Node.js
Descarga e instala Node.js desde: https://nodejs.org/
- Versión recomendada: 18.x o superior
- Para verificar la instalación: `node --version`

### 2. npm (viene con Node.js)
Para verificar: `npm --version`

## Instalación y Configuración

### Paso 1: Clonar/Descargar el proyecto
Asegúrate de tener todos los archivos del proyecto en tu máquina.

### Paso 2: Instalar dependencias del Backend
```bash
cd backend
npm install
```

### Paso 3: Instalar dependencias del Frontend
```bash
cd frontend
npm install
```

## Ejecución del Proyecto

### Opción 1: Ejecutar Backend y Frontend por separado

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
El servidor backend se ejecutará en: http://localhost:4000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
La aplicación React se ejecutará en: http://localhost:3000

### Opción 2: Scripts automatizados (Windows PowerShell)

Crea un archivo `start-project.ps1` en la raíz del proyecto:

```powershell
# Script para iniciar el proyecto completo
Write-Host "Iniciando Sistema de Gestión de Asistencia..." -ForegroundColor Green

# Iniciar Backend
Write-Host "Iniciando Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"

# Esperar 3 segundos
Start-Sleep -Seconds 3

# Iniciar Frontend
Write-Host "Iniciando Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"

Write-Host "Proyecto iniciado correctamente!" -ForegroundColor Green
Write-Host "Backend: http://localhost:4000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
```

Ejecuta el script:
```powershell
.\start-project.ps1
```

## Uso de la Aplicación

1. **Abrir el navegador** en http://localhost:3000
2. **Subir archivo Excel** con datos de asistencia
3. **Buscar empleado** ingresando los dígitos de la cédula
4. **Ver resultados** de horas extras por fecha

## Estructura del Proyecto

```
App_Test/
├── backend/
│   ├── package.json
│   ├── server.js
│   └── uploads_excel/     # Carpeta donde se guardan los archivos
├── frontend/
│   ├── package.json
│   ├── public/
│   │   ├── index.html
│   │   └── logo_enviaseo.png
│   └── src/
│       ├── App.jsx
│       ├── index.js
│       └── styles.css
└── README.md
```

## Funcionalidades

- ✅ Subir archivos Excel (.xlsx, .xls)
- ✅ Procesar datos de asistencia automáticamente
- ✅ Búsqueda en tiempo real por cédula
- ✅ Cálculo de horas extras
- ✅ Gestión de archivos subidos
- ✅ Interfaz responsiva y moderna

## Solución de Problemas

### Error: "Port 3000 is already in use"
```bash
# Encontrar proceso usando el puerto
netstat -ano | findstr :3000
# Terminar proceso (reemplazar PID con el número encontrado)
taskkill /PID <PID> /F
```

### Error: "Port 4000 is already in use"
```bash
# Encontrar proceso usando el puerto
netstat -ano | findstr :4000
# Terminar proceso (reemplazar PID con el número encontrado)
taskkill /PID <PID> /F
```

### Error: "Module not found"
```bash
# Reinstalar dependencias
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

## Tecnologías Utilizadas

- **Backend**: Node.js, Express.js, Multer, XLSX
- **Frontend**: React.js, Bootstrap
- **Base de datos**: Archivos temporales en memoria

## 🚀 Trabajo en Equipo

Para trabajar en conjunto con otra persona, sigue estos pasos:

### Configuración Inicial para Nuevos Miembros

1. **Ejecutar el script de configuración:**
```powershell
npm run setup-team
```

2. **Revisar la guía de contribución:**
```bash
# Leer el archivo team-setup/docs/CONTRIBUTING.md
```

### Flujo de Trabajo

1. **Antes de empezar:**
```bash
git checkout main
git pull origin main
git checkout -b feature/nombre-de-la-funcionalidad
```

2. **Durante el desarrollo:**
```bash
git add .
git commit -m "feat: descripción de los cambios"
git push origin feature/nombre-de-la-funcionalidad
```

3. **Al terminar:**
- Crear Pull Request en GitHub/GitLab
- Solicitar review
- Hacer merge una vez aprobado

### Herramientas Recomendadas

- **VS Code** con extensiones: GitLens, Prettier, ESLint, Live Share
- **GitHub Desktop** (alternativa gráfica)
- **Slack/Discord** para comunicación

### Comandos Útiles

```bash
# Ver estado del repositorio
git status

# Ver historial de commits
git log --oneline

# Cambiar de rama
git checkout nombre-rama

# Iniciar proyecto completo
npm run dev

# Iniciar en modo equipo
npm run dev-team
```

Para más detalles, consulta el archivo `team-setup/docs/CONTRIBUTING.md`.

## Soporte

Para cualquier problema o consulta, revisa los logs en las terminales donde ejecutas los servicios.
