# 🚀 Despliegue en Render - Sistema de Asistencia Alcaldía de Envigado

## 📋 Pasos para Desplegar

### 1. Preparar el Repositorio
- Asegúrate de que todos los cambios estén commitados en GitHub
- El repositorio debe ser público o tener acceso desde Render

### 2. Desplegar Backend en Render

1. **Ir a [render.com](https://render.com) y hacer login**
2. **Crear Nuevo Servicio Web**
   - Click en "New +" → "Web Service"
   - Conectar tu repositorio de GitHub
   - Seleccionar el repositorio `App_Test`

3. **Configurar el Backend**
   - **Name**: `alcaldia-backend`
   - **Environment**: `Node`
   - **Region**: Seleccionar la más cercana (ej: Oregon)
   - **Branch**: `main` (o tu rama principal)
   - **Build Command**: `cd backend-alcaldia && npm install`
   - **Start Command**: `cd backend-alcaldia && npm start`
   - **Plan**: `Free`

4. **Variables de Entorno**
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: `https://alcaldia-frontend.onrender.com`

5. **Click en "Create Web Service"**

### 3. Desplegar Frontend en Render

1. **Crear Nuevo Servicio Estático**
   - Click en "New +" → "Static Site"
   - Conectar el mismo repositorio

2. **Configurar el Frontend**
   - **Name**: `alcaldia-frontend`
   - **Branch**: `main`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Plan**: `Free`

3. **Variables de Entorno**
   - `REACT_APP_API_URL`: `https://alcaldia-backend.onrender.com`

4. **Click en "Create Static Site"**

### 4. Verificar el Despliegue

1. **Backend**: Debería estar disponible en `https://alcaldia-backend.onrender.com`
2. **Frontend**: Debería estar disponible en `https://alcaldia-frontend.onrender.com`
3. **Health Check**: Visitar `/health` en el backend

## 🔧 Solución de Problemas

### Error de Build
- Verificar que `npm install` funcione localmente
- Revisar los logs de build en Render

### Error de CORS
- Verificar que `FRONTEND_URL` esté configurado correctamente
- Asegurar que el frontend use la URL del backend de producción

### Error de Puerto
- Render asigna automáticamente el puerto via `process.env.PORT`
- No hardcodear puertos en el código

## 📱 URLs Finales

- **Frontend**: `https://alcaldia-frontend.onrender.com`
- **Backend**: `https://alcaldia-backend.onrender.com`
- **API Endpoints**: 
  - Upload: `POST /upload`
  - Health: `GET /health`
  - Files: `GET /files`
  - Stats: `GET /stats`

## 🎯 Próximos Pasos

1. **Base de Datos**: Migrar de memoria a PostgreSQL (gratis en Render)
2. **Almacenamiento**: Usar S3 o similar para archivos
3. **Monitoreo**: Configurar alertas y logs
4. **SSL**: Automático en Render
5. **Escalabilidad**: Actualizar a plan pago cuando sea necesario
