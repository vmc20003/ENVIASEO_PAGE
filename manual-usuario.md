# Manual de Usuario - Sistema de Gestión de Asistencia
## Enviaseo E.S.P.

---

## Índice
1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Panel Principal](#panel-principal)
4. [Módulo Alumbrado Público](#módulo-alumbrado-público)
5. [Módulo Alcaldía de Envigado](#módulo-alcaldía-de-envigado)
6. [Módulo Enviaseo Control de Acceso](#módulo-enviaseo-control-de-acceso)
7. [Solución de Problemas](#solución-de-problemas)

---

## Introducción

El Sistema de Gestión de Asistencia de Enviaseo E.S.P. es una aplicación web que permite gestionar y controlar la asistencia del personal en diferentes módulos organizacionales. El sistema está diseñado para procesar archivos Excel con datos de asistencia y generar reportes detallados.

### Características Principales:
- ✅ Gestión de asistencia por módulos
- ✅ Procesamiento de archivos Excel
- ✅ Generación de reportes
- ✅ Búsqueda y filtrado de datos
- ✅ Estadísticas en tiempo real
- ✅ Exportación de datos

---

## Acceso al Sistema

### Paso 1: Iniciar el Sistema
1. Abrir el navegador web
2. Navegar a: `http://localhost:3000`
3. El sistema mostrará la página de inicio

### Paso 2: Iniciar Sesión
1. En la página de inicio, hacer clic en el botón **"Iniciar Sesión"**
2. El sistema redirigirá automáticamente al panel principal
3. No se requiere credenciales específicas para el acceso de demostración

---

## Panel Principal

### Descripción
El panel principal es la página de selección donde se puede acceder a los diferentes módulos del sistema.

### Funciones Disponibles:

#### 1. **Sistema de Asistencia - Alumbrado Público**
- **Descripción**: Gestión de horarios, horas extra y reportes de asistencia para el personal de alumbrado público
- **Acceso**: Hacer clic en la tarjeta correspondiente
- **Color**: Naranja/Amarillo

#### 2. **Sistema de Asistencia - Alcaldía de Envigado**
- **Descripción**: Control de asistencia y verificación de personal municipal
- **Acceso**: Hacer clic en la tarjeta correspondiente
- **Color**: Verde

#### 3. **Sistema de Control - Enviaseo Control de Acceso**
- **Descripción**: Gestión y control de acceso para personal de Enviaseo
- **Acceso**: Hacer clic en la tarjeta correspondiente
- **Color**: Azul

#### 4. **Cerrar Sesión**
- **Ubicación**: Esquina superior derecha
- **Función**: Cierra la sesión y regresa a la página de inicio

---

## Módulo Alumbrado Público

### Acceso
1. Desde el panel principal, hacer clic en **"Sistema de Asistencia - Alumbrado Público"**
2. El sistema cargará la interfaz del módulo

### Funciones Principales:

#### 1. **Subir Archivo Excel**
**Paso a paso:**
1. En la sección "Cargar Archivo de Asistencia", hacer clic en **"Seleccionar archivo Excel"**
2. Navegar y seleccionar el archivo Excel (.xlsx o .xls) con los datos de asistencia
3. Verificar que el archivo se haya seleccionado correctamente
4. Hacer clic en el botón **"Subir Archivo"**
5. Esperar a que aparezca el mensaje de confirmación

**Formato del archivo Excel requerido:**
- Columnas: ID, Nombre, Departamento, Fecha/Hora, Punto de Acceso
- Formato de fecha: DD/MM/YYYY HH:MM
- Archivos soportados: .xlsx, .xls

#### 2. **Filtrar Datos**
**Paso a paso:**
1. En la sección de filtros, marcar la casilla **"Solo mostrar registros con horas extra"** si se desea filtrar
2. Hacer clic en **"Exportar Filtrados"** para generar un reporte con los datos filtrados

#### 3. **Buscar Registros**
**Paso a paso:**
1. En el campo de búsqueda, escribir el nombre, ID o departamento a buscar
2. Hacer clic en el botón **"Buscar"** o presionar Enter
3. Los resultados se mostrarán en la tabla
4. Para limpiar la búsqueda, hacer clic en **"Limpiar"**

#### 4. **Navegar por Páginas**
**Paso a paso:**
1. En la parte inferior de la tabla, usar los botones de navegación:
   - **"<"** para página anterior
   - **">"** para página siguiente
   - Números de página para ir directamente
2. La información de paginación muestra: "Página X de Y"

#### 5. **Ver Estadísticas**
**Ubicación**: Panel lateral derecho
**Información mostrada**:
- Total de empleados
- Total de registros
- Horas trabajadas promedio
- Registros con horas extra

#### 6. **Gestionar Archivos**
**Ubicación**: Panel lateral derecho
**Funciones**:
- Ver lista de archivos subidos
- Eliminar archivos individuales
- Exportar todos los datos

#### 7. **Volver al Panel**
- Hacer clic en el botón **"Volver al Panel"** en la esquina superior derecha

---

## Módulo Alcaldía de Envigado

### Acceso
1. Desde el panel principal, hacer clic en **"Sistema de Asistencia - Alcaldía de Envigado"**
2. El sistema cargará la interfaz del módulo

### Funciones Principales:

#### 1. **Subir Archivo Excel**
**Paso a paso:**
1. En la sección "Cargar Archivo de Asistencia", hacer clic en **"Seleccionar archivo Excel"**
2. Seleccionar el archivo Excel con datos de asistencia municipal
3. Hacer clic en **"Subir Archivo"**
4. Esperar confirmación de carga exitosa

#### 2. **Buscar Personal**
**Paso a paso:**
1. En el campo de búsqueda, escribir nombre, ID o departamento
2. Seleccionar punto de acceso específico en el dropdown (opcional)
3. Hacer clic en **"Buscar"**

#### 3. **Ver Reportes**
- Los datos se muestran en formato de tabla
- Información incluye: ID, Nombre, Departamento, Fecha/Hora, Punto de Acceso
- Navegación por páginas disponible

#### 4. **Exportar Datos**
- Usar el botón **"Exportar"** para descargar los datos en Excel

---

## Módulo Enviaseo Control de Acceso

### Acceso
1. Desde el panel principal, hacer clic en **"Sistema de Control - Enviaseo Control de Acceso"**
2. El sistema cargará la interfaz del módulo

### Funciones Principales:

#### 1. **Cargar Archivo de Control de Acceso**
**Paso a paso:**
1. En la sección "Cargar Archivo de Control de Acceso", hacer clic en **"Seleccionar archivo Excel"**
2. Seleccionar el archivo Excel con datos de control de acceso
3. Hacer clic en **"Procesar Archivo"**
4. Esperar el procesamiento y confirmación

#### 2. **Buscar Registros de Acceso**
**Paso a paso:**
1. En el campo de búsqueda, escribir criterios de búsqueda
2. Hacer clic en **"Buscar"**
3. Los resultados se mostrarán con información detallada de acceso

#### 3. **Ver Información de Acceso**
**Datos mostrados**:
- Nombre del archivo
- ID de la persona
- Temperatura registrada
- Estado de temperatura
- Uso de máscara
- Número de tarjeta
- Grupo de personas
- Tiempo de acceso
- Punto de acceso
- Lector de tarjetas
- Resultado de autenticación
- Tipo de autenticación
- Tipo de asistencia

#### 4. **Navegación y Exportación**
- Navegación por páginas
- Exportación de datos filtrados
- Limpieza de búsquedas

---

## Solución de Problemas

### Problemas Comunes:

#### 1. **Error al subir archivo**
**Síntomas**: Mensaje de error al intentar subir un archivo
**Soluciones**:
- Verificar que el archivo sea .xlsx o .xls
- Comprobar que el archivo no esté corrupto
- Verificar que el archivo tenga el formato correcto de columnas
- Asegurarse de que el archivo no esté abierto en otra aplicación

#### 2. **No se muestran datos después de subir archivo**
**Síntomas**: Archivo se sube exitosamente pero no aparecen datos
**Soluciones**:
- Verificar el formato de las columnas en el Excel
- Comprobar que las fechas estén en formato correcto
- Revisar que no haya filas vacías al inicio del archivo
- Verificar que los encabezados coincidan con el formato esperado

#### 3. **Error de conexión**
**Síntomas**: Mensajes de "Error de conexión" o "Failed to fetch"
**Soluciones**:
- Verificar que todos los servidores estén ejecutándose
- Comprobar la conexión a internet
- Reiniciar el navegador
- Verificar que no haya firewall bloqueando las conexiones

#### 4. **Búsqueda no encuentra resultados**
**Síntomas**: La búsqueda no devuelve resultados esperados
**Soluciones**:
- Verificar la ortografía del término de búsqueda
- Probar con términos más generales
- Comprobar que los datos estén cargados correctamente
- Limpiar la búsqueda y volver a intentar

### Contacto de Soporte
Para problemas técnicos adicionales, contactar al equipo de desarrollo de Enviaseo E.S.P.

---

## Información Técnica

### Requisitos del Sistema:
- **Navegador**: Chrome, Firefox, Safari, Edge (versiones recientes)
- **Resolución**: Mínimo 1024x768
- **JavaScript**: Habilitado
- **Conexión**: Internet estable

### Servidores del Sistema:
- **Frontend**: http://localhost:3000
- **Backend Alumbrado**: http://localhost:4000
- **Backend Alcaldía**: http://localhost:4002
- **Backend Enviaseo**: http://localhost:4001

### Formatos de Archivo Soportados:
- **Excel**: .xlsx, .xls
- **Tamaño máximo**: 10MB por archivo
- **Codificación**: UTF-8

---

*Manual generado automáticamente por el Sistema de Gestión de Asistencia - Enviaseo E.S.P.*
*Fecha de generación: $(Get-Date -Format "dd/MM/yyyy HH:mm")*

