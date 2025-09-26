# Guía de Instalación - Sistema de Gestión Enviaseo

## 📋 Índice
1. [Resumen del Sistema](#resumen-del-sistema)
2. [Opciones de Instalación](#opciones-de-instalación)
3. [Instalación Paso a Paso](#instalación-paso-a-paso)
4. [Distribución en Múltiples Computadores](#distribución-en-múltiples-computadores)
5. [Solución de Problemas](#solución-de-problemas)
6. [Requisitos del Sistema](#requisitos-del-sistema)

## 🎯 Resumen del Sistema

El **Sistema de Gestión Enviaseo** es una aplicación web que permite gestionar la asistencia y control de acceso del personal en diferentes módulos organizacionales:

- **Sistema de Asistencia - Alumbrado Público** (Puerto 4000)
- **Sistema de Asistencia - Alcaldía de Envigado** (Puerto 4002)  
- **Sistema de Control - Enviaseo Control de Acceso** (Puerto 4001)
- **Frontend Web** (Puerto 3000)

## 🛠️ Opciones de Instalación

### 1. Instalador Ejecutable (.exe) - **RECOMENDADO**
- **Archivo**: `app-electron/dist/Sistema Enviaseo Setup.exe`
- **Ventajas**: Instalación automática, acceso directo en escritorio
- **Uso**: Doble clic en el archivo .exe

### 2. Paquete de Distribución
- **Carpeta**: `Sistema_Enviaseo_Distribucion/`
- **Ventajas**: Control total, personalizable
- **Uso**: Ejecutar `INSTALAR.bat`

### 3. Instalación Manual
- **Scripts**: `INSTALAR_SISTEMA.bat`
- **Ventajas**: Para usuarios técnicos
- **Uso**: Ejecutar script como administrador

## 📦 Instalación Paso a Paso

### Opción A: Instalador Ejecutable

1. **Descargar el instalador**
   ```
   Sistema Enviaseo Setup.exe
   ```

2. **Ejecutar como administrador**
   - Hacer clic derecho → "Ejecutar como administrador"

3. **Seguir el wizard de instalación**
   - Seleccionar directorio de instalación
   - Crear accesos directos (recomendado)
   - Completar instalación

4. **Iniciar el sistema**
   - Acceso directo en escritorio: "Sistema Enviaseo"
   - O desde menú inicio

### Opción B: Paquete de Distribución

1. **Extraer el paquete**
   ```
   Sistema_Enviaseo_Distribucion.zip
   ```

2. **Ejecutar instalador**
   ```batch
   INSTALAR.bat
   ```

3. **Seguir instrucciones en pantalla**
   - Verificar Node.js
   - Instalar dependencias
   - Construir aplicación

4. **Iniciar sistema**
   ```batch
   INICIAR_ENVIASEO.bat
   ```

## 🚀 Distribución en Múltiples Computadores

### Método 1: Distribución de Archivo .exe

1. **Generar el instalador**
   ```batch
   GENERAR_INSTALADOR_FINAL.bat
   ```

2. **Comprimir y distribuir**
   ```
   Sistema Enviaseo Setup.exe
   ```

3. **Instrucciones para usuarios**
   - Ejecutar como administrador
   - Seguir wizard de instalación
   - Usar acceso directo en escritorio

### Método 2: Distribución de Paquete Completo

1. **Generar paquete**
   ```batch
   CREAR_PAQUETE_DISTRIBUCION.bat
   ```

2. **Comprimir carpeta**
   ```
   Sistema_Enviaseo_Distribucion.zip
   ```

3. **Distribuir archivo comprimido**
   - Email, USB, red compartida
   - Incluir instrucciones de instalación

### Método 3: Distribución por Red

1. **Colocar en servidor compartido**
   ```
   \\servidor\Sistema_Enviaseo\
   ```

2. **Crear script de instalación remota**
   ```batch
   @echo off
   net use Z: \\servidor\Sistema_Enviaseo
   Z:\INSTALAR.bat
   ```

## ⚙️ Configuración Post-Instalación

### Verificar Instalación

1. **Verificar puertos**
   ```batch
   netstat -an | find "3000"
   netstat -an | find "4000"
   netstat -an | find "4001"
   netstat -an | find "4002"
   ```

2. **Probar acceso**
   - Abrir navegador
   - Ir a `http://localhost:3000`
   - Verificar que cargue la página

### Configurar Inicio Automático (Opcional)

1. **Crear tarea programada**
   ```batch
   schtasks /create /tn "Sistema Enviaseo" /tr "C:\Sistema_Enviaseo\INICIAR_ENVIASEO.bat" /sc onlogon
   ```

2. **O agregar al inicio**
   - Copiar acceso directo a carpeta de inicio
   - `C:\Users\[Usuario]\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup`

## 🔧 Solución de Problemas

### Error: "Puerto ya en uso"

**Solución:**
```batch
# Detener procesos en puertos específicos
netstat -ano | find "3000"
taskkill /PID [PID_NUMBER] /F
```

### Error: "Node.js no encontrado"

**Solución:**
1. Instalar Node.js desde https://nodejs.org/
2. Reiniciar computadora
3. Verificar instalación: `node --version`

### Error: "Módulo no encontrado"

**Solución:**
```batch
# Reinstalar dependencias
npm install
npm --prefix frontend install
npm --prefix backend install
npm --prefix backend-alcaldia install
npm --prefix backend-enviaseo-control-acceso install
```

### Error: "Permisos insuficientes"

**Solución:**
1. Ejecutar como administrador
2. Verificar permisos de carpeta
3. Desactivar antivirus temporalmente

### Sistema no inicia

**Diagnóstico:**
```batch
# Verificar logs
npm start > log.txt 2>&1

# Verificar puertos
netstat -an | findstr "3000\|4000\|4001\|4002"

# Verificar procesos Node.js
tasklist | find "node.exe"
```

## 📋 Requisitos del Sistema

### Requisitos Mínimos
- **Sistema Operativo**: Windows 10/11 (64-bit)
- **RAM**: 4GB mínimo, 8GB recomendado
- **Espacio en Disco**: 2GB disponible
- **Procesador**: Intel Core i3 o equivalente
- **Red**: Conexión a internet (solo para instalación)

### Requisitos de Red
- **Puertos Disponibles**: 3000, 4000, 4001, 4002
- **Firewall**: Permitir conexiones locales
- **Antivirus**: Agregar excepción para la aplicación

### Software Requerido
- **Node.js**: Versión 16 o superior
- **NPM**: Incluido con Node.js
- **Navegador**: Chrome, Firefox, Edge (versiones recientes)

## 📞 Soporte Técnico

### Información de Contacto
- **Desarrollador**: Enviaseo E.S.P.
- **Versión**: 1.0.0
- **Fecha**: 2024

### Recursos Adicionales
- **Manual de Usuario**: `manual-usuario.md`
- **Logs del Sistema**: Carpeta `logs/`
- **Configuración**: Archivos `.env` en cada backend

### Escalación de Problemas
1. Verificar logs de error
2. Comprobar requisitos del sistema
3. Reinstalar aplicación
4. Contactar administrador del sistema

---

## 🎉 ¡Instalación Completada!

Una vez instalado correctamente, podrá acceder al sistema en:
**http://localhost:3000**

El sistema incluye tres módulos principales:
- 🏢 **Alumbrado Público**: Gestión de asistencia
- 🏛️ **Alcaldía de Envigado**: Control municipal  
- 🛡️ **Enviaseo**: Control de acceso

¡Gracias por usar el Sistema de Gestión Enviaseo!
