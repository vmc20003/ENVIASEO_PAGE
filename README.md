# Sistema de Gestión de Asistencia - Enviaseo E.S.P.

## 📋 Descripción

Sistema completo de gestión de asistencia y control de horas extras para Enviaseo E.S.P., desarrollado con tecnologías modernas y una interfaz de usuario mejorada.

## 🚀 Características Principales

### ✨ Interfaz Mejorada
- **Logos grandes y llamativos** - Diseño visual impactante
- **Animaciones suaves** - Efectos de brillo y flotación optimizados
- **Paneles estáticos** - Sin movimientos excesivos para mejor usabilidad
- **Texto nítido** - Renderizado optimizado sin efectos de blur

### 🔧 Funcionalidades Técnicas
- **Puertos optimizados** - Sin conflictos (3000, 5000, 5001, 5002)
- **Modo demo** - Funciona sin backends para demostración
- **Datos corregidos** - Tablas con nombres y apellidos organizados correctamente
- **Múltiples módulos** - Alumbrado Público, Alcaldía de Envigado, Enviaseo Control de Acceso

## 🏗️ Arquitectura del Sistema

```
Sistema Enviaseo
├── Frontend (React) - Puerto 3000
├── Backend Alumbrado Público - Puerto 5000
├── Backend Alcaldía de Envigado - Puerto 5002
└── Backend Enviaseo Control de Acceso - Puerto 5001
```

## 📦 Módulos Incluidos

### 1. Alumbrado Público
- **Puerto:** 5000
- **Funcionalidad:** Gestión de horarios, horas extra y reportes de asistencia
- **Archivos:** Procesamiento de Excel con datos de empleados

### 2. Alcaldía de Envigado
- **Puerto:** 5002
- **Funcionalidad:** Control de asistencia y verificación de personal municipal
- **Archivos:** Gestión de datos de funcionarios públicos

### 3. Enviaseo Control de Acceso
- **Puerto:** 5001
- **Funcionalidad:** Control de acceso con temperatura y verificación de mascarillas
- **Archivos:** Registros de entrada y salida con datos biométricos

## 🛠️ Instalación

### Requisitos Previos
- Node.js (versión 16 o superior)
- npm (versión 8 o superior)
- Puertos 3000, 5000, 5001, 5002 disponibles

### Instalación Rápida
```bash
# Clonar el repositorio
git clone https://github.com/envíaseo/sistema-gestion-asistencia.git
cd sistema-gestion-asistencia

# Instalar dependencias
npm run install-all

# Iniciar el sistema
npm start
```

### Instalación Manual
```bash
# Instalar dependencias de cada módulo
npm install
npm --prefix frontend install
npm --prefix backend install
npm --prefix backend-alcaldia install
npm --prefix backend-enviaseo-control-acceso install

# Iniciar servidores individualmente
npm --prefix backend start                    # Puerto 5000
npm --prefix backend-alcaldia start           # Puerto 5002
npm --prefix backend-enviaseo-control-acceso start  # Puerto 5001
npm --prefix frontend start                    # Puerto 3000
```

## 🎮 Uso del Sistema

### Acceso Principal
- **URL:** http://localhost:3000
- **Interfaz:** Panel de selección de módulos

### Modo Demo
Para probar el sistema sin backends:
```bash
npm run demo
```
- Datos de ejemplo incluidos
- Funciona sin conexión a backends
- Ideal para demostraciones

### Subida de Archivos
1. Selecciona el módulo correspondiente
2. Arrastra archivos Excel (.xlsx, .xls)
3. El sistema procesará automáticamente los datos
4. Visualiza resultados en tiempo real

## 🔧 Configuración

### Puertos Personalizados
Modifica los archivos de configuración para cambiar puertos:

- `frontend/src/config.js` - Configuración del frontend
- `backend/config.js` - Puerto 5000 (Alumbrado)
- `backend-alcaldia/config.js` - Puerto 5002 (Alcaldía)
- `backend-enviaseo-control-acceso/config.js` - Puerto 5001 (Enviaseo)

### Variables de Entorno
```bash
# Frontend
REACT_APP_DEMO_MODE=true          # Activar modo demo
REACT_APP_ALUMBRADO_API_URL=...   # URL del backend Alumbrado
REACT_APP_ALCALDIA_API_URL=...    # URL del backend Alcaldía
REACT_APP_ENVIASEO_API_URL=...    # URL del backend Enviaseo

# Backends
PORT=5000                         # Puerto personalizado
CORS_ORIGIN=*                     # Origen CORS
```

## 📊 Estructura de Datos

### Formato de Archivos Excel
El sistema acepta archivos Excel con las siguientes columnas:

#### Alumbrado Público
- `firstName` / `Nombre` - Nombre del empleado
- `lastName` / `Apellido` - Apellido del empleado
- `personNo` / `Cedula` - Número de identificación
- `time` / `Hora` - Fecha y hora del registro
- `accessPoint` / `Punto Acceso` - Ubicación del registro
- `attendanceType` / `Tipo Asistencia` - Entrada/Salida

#### Alcaldía de Envigado
- `idPersona` / `ID` - Identificación del funcionario
- `nombre` / `Nombre` - Nombre completo
- `departamento` / `Departamento` - Área de trabajo
- `hora` / `Hora` - Hora del registro
- `puntoVerificacion` / `Punto Verificación` - Ubicación

#### Enviaseo Control de Acceso
- `nombreArchivo` / `Nombre Archivo` - Identificador del archivo
- `id` / `ID` - Identificación del empleado
- `temperatura` / `Temperatura` - Medición de temperatura
- `usandoMascara` / `Usando Máscara` - Estado de la mascarilla
- `numeroTarjeta` / `Número Tarjeta` - Tarjeta de acceso
- `tiempo` / `Tiempo` - Fecha y hora del acceso

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm start                    # Iniciar todos los servidores
npm run start-all           # Iniciar todos los servidores
npm run start-frontend      # Solo frontend
npm run start-backend       # Solo backend Alumbrado
npm run start-alcaldia      # Solo backend Alcaldía
npm run start-enviaseo      # Solo backend Enviaseo

# Reinicio Rápido (NUEVO)
npm run restart-panel       # Reinicio completo del panel
npm run restart-frontend    # Solo frontend en modo demo

# Instaladores Mejorados (NUEVO)
npm run install-improved    # Instalador con opciones avanzadas
npm run install-quick       # Instalador rápido para expertos
npm run install-basic      # Instalador básico tradicional
npm run diagnose           # Diagnóstico del sistema

# Demo
npm run demo                # Modo demo
npm run start-demo          # Iniciar en modo demo

# Construcción
npm run build               # Construir para producción
npm run build-all           # Construir todos los módulos

# Mantenimiento
npm run clean               # Limpiar node_modules y builds
npm run clean:project      # Limpieza completa del proyecto
npm run setup               # Configuración completa
npm run install-all         # Instalar todas las dependencias
```

## 🐛 Solución de Problemas

### ⚡ Solución Rápida (RECOMENDADO)
Si el panel no carga o aparece "Failed to fetch":
```bash
# Reinicio completo del panel
npm run restart-panel

# O ejecutar directamente
.\REINICIAR_PANEL.bat
```

### 🔧 Instaladores Mejorados
Para una instalación más robusta y opciones avanzadas:

```bash
# Instalador con opciones avanzadas (Recomendado)
npm run install-improved

# Instalador rápido para expertos
npm run install-quick

# Diagnóstico del sistema
npm run diagnose
```

**Instaladores disponibles:**
- **INSTALADOR_MEJORADO.bat** - 4 opciones de instalación
- **INSTALADOR_RAPIDO.bat** - Instalación automática
- **DIAGNOSTICO_SISTEMA.bat** - Verificación completa
- **INSTALAR_SISTEMA.bat** - Instalador básico tradicional

### 🧹 Limpieza del Proyecto
Para mantener el proyecto optimizado:

```bash
# Limpieza completa del proyecto
npm run clean:project

# O ejecutar directamente
.\LIMPIAR_PROYECTO.bat
```

**Archivos eliminados automáticamente:**
- ✅ Builds temporales y distribuciones
- ✅ Archivos de prueba y temporales
- ✅ Archivos de sistema (Thumbs.db, .DS_Store)
- ✅ Archivos de backup y temporales
- ✅ Archivos de Excel temporales

**Ver documentación completa:** `ARCHIVOS_ESENCIALES.md`

### Puertos Ocupados
Si encuentras errores de puertos ocupados:
```bash
# Verificar puertos en uso
netstat -an | findstr ":3000\|:5000\|:5001\|:5002"

# Cambiar puertos en archivos de configuración
# O reiniciar el sistema para liberar puertos
```

### Problemas de Memoria
Para sistemas con poca memoria RAM:
- Usa la versión ligera sin `node_modules`
- Instala dependencias por módulo individualmente
- Cierra otras aplicaciones antes de iniciar

### Modo Demo No Funciona
Verifica que no exista archivo `.env` en el frontend:
```bash
# Eliminar archivo .env si existe
rm frontend/.env
```

## 📈 Versiones

### v1.3.0 (Actual)
- ✅ Scripts de reinicio rápido
- ✅ Carga inmediata de módulos
- ✅ Solución automática de errores "Failed to fetch"
- ✅ Modo demo optimizado
- ✅ Gestión mejorada de procesos

### v1.2.0
- ✅ Puertos optimizados (5000, 5001, 5002)
- ✅ Logos grandes y llamativos
- ✅ Animaciones suaves optimizadas
- ✅ Datos de tabla corregidos
- ✅ Modo demo mejorado
- ✅ Sin conflictos de puertos

### v1.1.0
- ✅ Efectos visuales mejorados
- ✅ Modo demo implementado
- ✅ Animaciones de paneles y logos

### v1.0.0
- ✅ Versión inicial
- ✅ Tres módulos funcionales
- ✅ Procesamiento de Excel

## 🤝 Contribución

Para contribuir al proyecto:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Realiza los cambios
4. Envía un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico:
- **Email:** soporte@enviaseo.com
- **Documentación:** Ver `manual-usuario.md`
- **Issues:** GitHub Issues

---

**Desarrollado por:** Enviaseo E.S.P.  
**Versión:** 1.3.0  
**Última actualización:** Enero 2025