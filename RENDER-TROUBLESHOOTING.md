# Solución de Problemas - Despliegue en Render

## Problemas Comunes y Soluciones

### 1. Backend no responde (Error 404)

**Síntomas:**
- El frontend carga pero no puede conectarse al backend
- Error 404 al acceder a endpoints del backend
- Health check falla

**Soluciones:**

#### A. Verificar configuración del puerto
```javascript
// En server-new.js
const serverPort = process.env.PORT || PORT;
app.listen(serverPort, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${serverPort}`);
});
```

#### B. Verificar variables de entorno en Render
- Ir al dashboard de Render
- Seleccionar el servicio `alcaldia-backend`
- Verificar que las variables estén configuradas:
  - `NODE_ENV=production`
  - `FRONTEND_URL=https://alcaldia-frontend.onrender.com`

#### C. Verificar logs del servidor
- En Render Dashboard → Logs
- Buscar errores de inicio del servidor
- Verificar que el puerto se esté configurando correctamente

### 2. CORS Errors

**Síntomas:**
- Errores de CORS en la consola del navegador
- Frontend no puede hacer requests al backend

**Solución:**
```javascript
// En config.js - producción
production: {
  port: process.env.PORT || 4001,
  corsOrigin: process.env.FRONTEND_URL || "https://alcaldia-frontend.onrender.com",
  // ...
}
```

### 3. Health Check Falla

**Síntomas:**
- Render marca el servicio como "Build Failed" o "Deploy Failed"
- El servicio no se inicia correctamente

**Soluciones:**

#### A. Verificar endpoint de health check
```javascript
app.get("/health", (req, res) => {
  try {
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || PORT
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      error: error.message
    });
  }
});
```

#### B. Aumentar timeout del health check
```yaml
# En render.yaml
healthCheckTimeout: 180
```

### 4. Problemas de Dependencias

**Síntomas:**
- Error durante el build
- Módulos no encontrados

**Solución:**
```bash
# Verificar que todas las dependencias estén en package.json
npm install --production
```

### 5. Problemas de Archivos

**Síntomas:**
- Error al subir archivos Excel
- Directorio de uploads no existe

**Solución:**
```javascript
// Crear directorio si no existe
const uploadDir = path.join(__dirname, "uploads_excel");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
```

## Comandos de Diagnóstico

### Probar backend localmente
```bash
cd backend-alcaldia
npm start
```

### Probar endpoints
```bash
# Health check
curl http://localhost:4001/health

# Ruta raíz
curl http://localhost:4001/

# Test endpoint
curl http://localhost:4001/test
```

### Probar en producción
```bash
# Reemplazar con la URL real del backend
curl https://alcaldia-backend.onrender.com/health
curl https://alcaldia-backend.onrender.com/test
```

## Verificación de Despliegue

1. **Verificar build exitoso** en Render Dashboard
2. **Verificar logs** sin errores críticos
3. **Probar endpoints** manualmente
4. **Verificar conectividad** desde el frontend

## Contacto

Si los problemas persisten, revisar:
- Logs completos en Render Dashboard
- Configuración de variables de entorno
- Estado del servicio en Render
