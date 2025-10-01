# 🚀 Guía de Instaladores - Sistema de Gestión de Asistencia v1.3.0

## 📋 Instaladores Disponibles

### 1. 🎯 **INSTALADOR_COMPLETO.bat** - Recomendado para nuevos usuarios
**Descripción:** Instalación completa y detallada con verificaciones exhaustivas.

**Características:**
- ✅ Verificación completa de Node.js y npm
- ✅ Instalación de todas las dependencias
- ✅ Creación de carpetas necesarias
- ✅ Verificación de puertos
- ✅ Creación de scripts de inicio
- ✅ Información detallada del sistema
- ✅ Opción de inicio automático

**Uso:** Doble clic en `INSTALADOR_COMPLETO.bat`

---

### 2. ⚡ **INSTALADOR_RAPIDO.bat** - Para usuarios experimentados
**Descripción:** Instalación rápida para usuarios que ya tienen Node.js instalado.

**Características:**
- ⚡ Instalación rápida y silenciosa
- ✅ Verificación básica de Node.js
- ✅ Instalación en paralelo
- ✅ Creación de script de inicio rápido
- ✅ Interfaz minimalista

**Uso:** Doble clic en `INSTALADOR_RAPIDO.bat`

---

### 3. 🔍 **DIAGNOSTICO_SISTEMA.bat** - Para resolución de problemas
**Descripción:** Diagnóstico completo del sistema para detectar y resolver problemas.

**Características:**
- 🔍 Verificación exhaustiva del sistema
- 📊 Información detallada del entorno
- 🌐 Verificación de puertos
- 📁 Verificación de estructura de carpetas
- 🔄 Verificación de procesos Node.js
- 📋 Resumen y recomendaciones
- 🔧 Opción de instalación automática

**Uso:** Doble clic en `DIAGNOSTICO_SISTEMA.bat`

---

## 🎯 Cuál Instalador Usar

### 👤 **Nuevo Usuario**
```
INSTALADOR_COMPLETO.bat
```
- Primera instalación
- No estás seguro de tener Node.js
- Quieres información detallada

### ⚡ **Usuario Experimentado**
```
INSTALADOR_RAPIDO.bat
```
- Ya tienes Node.js instalado
- Quieres instalación rápida
- Conoces el sistema

### 🔧 **Resolución de Problemas**
```
DIAGNOSTICO_SISTEMA.bat
```
- El sistema no funciona
- Errores de puertos
- Problemas de dependencias

---

## 📦 Scripts Generados por los Instaladores

### 🚀 **INICIAR_SISTEMA.bat**
Inicia todo el sistema completo (frontend + todos los backends)

### 🎭 **INICIAR_SOLO_FRONTEND.bat**
Inicia solo el frontend en modo demo

### 🔄 **REINICIAR_SISTEMA.bat**
Detiene procesos Node.js y reinicia el sistema

### ⚡ **INICIAR_RAPIDO.bat** (solo Instalador Rápido)
Inicio rápido del sistema

---

## 🌐 Puertos del Sistema

| Servicio | Puerto | URL |
|----------|--------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend Alumbrado | 5000 | http://localhost:5000 |
| Backend Alcaldía | 5002 | http://localhost:5002 |
| Backend Enviaseo | 5001 | http://localhost:5001 |

---

## 🔧 Requisitos del Sistema

### ✅ **Requisitos Mínimos**
- Windows 10 o superior
- Node.js 16.x o superior
- npm 8.x o superior
- 4GB RAM mínimo
- 2GB espacio libre en disco

### 📥 **Descarga de Node.js**
- **Sitio oficial:** https://nodejs.org/
- **Versión recomendada:** LTS (Long Term Support)
- **Incluye:** Node.js + npm

---

## 🚨 Solución de Problemas Comunes

### ❌ **Error: Node.js no encontrado**
```
Solución: Instala Node.js desde https://nodejs.org/
```

### ❌ **Error: Puerto en uso**
```
Solución: Ejecuta REINICIAR_SISTEMA.bat
```

### ❌ **Error: Dependencias no instaladas**
```
Solución: Ejecuta INSTALADOR_COMPLETO.bat
```

### ❌ **Error: Carpeta no encontrada**
```
Solución: Ejecuta DIAGNOSTICO_SISTEMA.bat
```

---

## 📞 Soporte

### 🔍 **Autodiagnóstico**
1. Ejecuta `DIAGNOSTICO_SISTEMA.bat`
2. Revisa el resumen y recomendaciones
3. Sigue las soluciones sugeridas

### 🔄 **Reinstalación Completa**
1. Ejecuta `DIAGNOSTICO_SISTEMA.bat`
2. Si hay problemas, ejecuta `INSTALADOR_COMPLETO.bat`
3. Reinicia el sistema

### ⚡ **Reinstalación Rápida**
1. Ejecuta `INSTALADOR_RAPIDO.bat`
2. Usa `INICIAR_RAPIDO.bat` para iniciar

---

## 📋 Checklist de Instalación

### ✅ **Antes de Instalar**
- [ ] Windows 10 o superior
- [ ] Node.js instalado (verificar con `node --version`)
- [ ] npm disponible (verificar con `npm --version`)
- [ ] Espacio libre suficiente (2GB mínimo)

### ✅ **Después de Instalar**
- [ ] Todos los node_modules instalados
- [ ] Carpetas de uploads creadas
- [ ] Scripts de inicio generados
- [ ] Puertos disponibles
- [ ] Sistema iniciado correctamente

### ✅ **Verificación Final**
- [ ] Frontend accesible en http://localhost:3000
- [ ] Todos los módulos cargan correctamente
- [ ] Sin errores en la consola
- [ ] Sistema funcionando sin problemas

---

## 🎉 ¡Listo para Usar!

Una vez completada la instalación, puedes:

1. **Acceder al sistema:** http://localhost:3000
2. **Seleccionar módulo:** Alumbrado, Alcaldía o Enviaseo
3. **Cargar archivos Excel:** Para procesar datos de asistencia
4. **Ver estadísticas:** Horas trabajadas, horas extra, etc.

**¡El sistema está listo para gestionar la asistencia de tu organización!** 🚀