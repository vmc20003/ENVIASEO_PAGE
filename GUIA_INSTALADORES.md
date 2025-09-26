# Guía de Instaladores - Sistema Enviaseo v1.3.0

## 📦 Instaladores Disponibles

### 1. **INSTALADOR_MEJORADO.bat** (Recomendado)
**Para usuarios que quieren opciones avanzadas**

#### Características:
- ✅ **4 opciones de instalación**
- ✅ **Verificación completa del sistema**
- ✅ **Instalación personalizada**
- ✅ **Diagnóstico integrado**
- ✅ **Scripts de inicio automáticos**

#### Opciones disponibles:
1. **Instalación Completa** - Todos los módulos y dependencias
2. **Instalación Rápida** - Solo frontend en modo demo
3. **Instalación Personalizada** - Selecciona qué instalar
4. **Solo Verificar Sistema** - Diagnóstico sin instalar

#### Uso:
```bash
# Ejecutar instalador mejorado
.\INSTALADOR_MEJORADO.bat
```

---

### 2. **INSTALADOR_RAPIDO.bat**
**Para usuarios experimentados o reinstalaciones**

#### Características:
- ⚡ **Instalación automática**
- ⚡ **Sin confirmaciones innecesarias**
- ⚡ **Modo silencioso disponible**
- ⚡ **Ideal para scripts automatizados**

#### Opciones disponibles:
1. **Instalación Completa** - Todos los módulos
2. **Solo Frontend** - Modo demo únicamente
3. **Instalación Silenciosa** - Sin output visible

#### Uso:
```bash
# Ejecutar instalador rápido
.\INSTALADOR_RAPIDO.bat
```

---

### 3. **INSTALAR_SISTEMA.bat** (Básico)
**Instalador tradicional y simple**

#### Características:
- 🔧 **Instalación básica**
- 🔧 **Verificación de Node.js**
- 🔧 **Instalación completa por defecto**
- 🔧 **Scripts de inicio simples**

#### Uso:
```bash
# Ejecutar instalador básico
.\INSTALAR_SISTEMA.bat
```

---

### 4. **DIAGNOSTICO_SISTEMA.bat**
**Para verificar el estado del sistema**

#### Características:
- 🔍 **Verificación completa**
- 🔍 **Detección de problemas**
- 🔍 **Recomendaciones automáticas**
- 🔍 **Acciones de corrección**

#### Verificaciones:
- ✅ Node.js y NPM instalados
- ✅ Puertos disponibles (3000, 5000, 5001, 5002)
- ✅ Archivos del proyecto presentes
- ✅ Dependencias instaladas
- ✅ Scripts de inicio creados
- ✅ Procesos Node.js en ejecución

#### Uso:
```bash
# Ejecutar diagnóstico
.\DIAGNOSTICO_SISTEMA.bat
```

---

## 🚀 Scripts de Inicio Creados

### **INICIAR_ENVIASEO_COMPLETO.bat**
- Inicia todos los módulos del sistema
- Frontend: http://localhost:3000
- Backends: 5000, 5001, 5002
- Modo completo con todas las funcionalidades

### **INICIAR_ENVIASEO_RAPIDO.bat**
- Solo frontend en modo demo
- Frontend: http://localhost:3000
- Sin dependencia de backends
- Carga inmediata

### **DETENER_ENVIASEO.bat**
- Detiene todos los procesos Node.js
- Cierre limpio del sistema
- Libera puertos

### **REINICIAR_ENVIASEO.bat**
- Detiene procesos anteriores
- Limpia archivos temporales
- Reinicia el sistema
- Opción de modo completo o rápido

---

## 📋 Comparación de Instaladores

| Característica | Mejorado | Rápido | Básico | Diagnóstico |
|----------------|----------|--------|--------|-------------|
| **Opciones múltiples** | ✅ | ✅ | ❌ | ❌ |
| **Verificación completa** | ✅ | ❌ | ✅ | ✅ |
| **Instalación personalizada** | ✅ | ❌ | ❌ | ❌ |
| **Modo silencioso** | ❌ | ✅ | ❌ | ❌ |
| **Diagnóstico integrado** | ✅ | ❌ | ❌ | ✅ |
| **Acciones automáticas** | ✅ | ✅ | ❌ | ✅ |
| **Ideal para principiantes** | ✅ | ❌ | ✅ | ❌ |
| **Ideal para expertos** | ✅ | ✅ | ❌ | ✅ |

---

## 🎯 Recomendaciones de Uso

### **Para Usuarios Nuevos:**
```bash
# Usar instalador mejorado
.\INSTALADOR_MEJORADO.bat
# Seleccionar opción 1 (Instalación Completa)
```

### **Para Usuarios Experimentados:**
```bash
# Usar instalador rápido
.\INSTALADOR_RAPIDO.bat
# Seleccionar opción 1 (Instalación Completa)
```

### **Para Demostraciones Rápidas:**
```bash
# Usar instalador rápido
.\INSTALADOR_RAPIDO.bat
# Seleccionar opción 2 (Solo Frontend)
```

### **Para Solución de Problemas:**
```bash
# Primero ejecutar diagnóstico
.\DIAGNOSTICO_SISTEMA.bat
# Luego usar instalador apropiado según recomendaciones
```

### **Para Reinstalaciones:**
```bash
# Usar instalador rápido con modo silencioso
.\INSTALADOR_RAPIDO.bat
# Seleccionar opción 3 (Instalación Silenciosa)
```

---

## 🔧 Solución de Problemas Comunes

### **Error: "Node.js no está instalado"**
```bash
# Solución:
1. Ir a https://nodejs.org/
2. Descargar versión LTS
3. Ejecutar instalador
4. Reiniciar sistema
5. Ejecutar instalador nuevamente
```

### **Error: "Puertos en uso"**
```bash
# Solución:
1. Ejecutar DIAGNOSTICO_SISTEMA.bat
2. Seleccionar "Detener procesos Node.js"
3. O reiniciar el sistema
4. Ejecutar instalador nuevamente
```

### **Error: "Dependencias no instaladas"**
```bash
# Solución:
1. Ejecutar DIAGNOSTICO_SISTEMA.bat
2. Seleccionar "Solo instalar dependencias"
3. O ejecutar instalador completo
```

### **Error: "Scripts no encontrados"**
```bash
# Solución:
1. Ejecutar cualquier instalador
2. Los scripts se crean automáticamente
3. O copiar desde distribución
```

---

## 📞 Soporte

### **Archivos de Ayuda:**
- `README.md` - Documentación principal
- `GUIA_INSTALACION.md` - Guía de instalación detallada
- `CHANGELOG.md` - Historial de cambios
- `manual-usuario.md` - Manual de usuario

### **Scripts de Emergencia:**
```bash
# Si nada funciona, usar estos comandos manuales:
npm install
npm --prefix frontend install
npm --prefix backend install
npm --prefix backend-alcaldia install
npm --prefix backend-enviaseo-control-acceso install
npm start
```

---

**Desarrollado por:** Enviaseo E.S.P.  
**Versión:** 1.3.0  
**Última actualización:** Enero 2025
