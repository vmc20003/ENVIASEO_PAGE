# 🚀 Pasos para Desplegar en Render

## 📋 Preparación

### 1. Verificar que todo esté funcionando localmente
```bash
# Backend
cd backend-alcaldia
npm start

# Frontend (en otra terminal)
cd frontend
npm start
```

### 2. Hacer commit de todos los cambios
```bash
git add .
git commit -m "Preparar para despliegue en Render"
git push origin main
```

## 🌐 Despliegue en Render

### Paso 1: Desplegar Backend

1. **Ir a [render.com](https://render.com) y hacer login**
2. **Click en "New +" → "Web Service"**
3. **Conectar repositorio GitHub**
   - Seleccionar `App_Test`
   - Autorizar acceso si es necesario
4. **Configurar servicio:**
   - **Name**: `alcaldia-backend`
   - **Environment**: `Node`
   - **Region**: Seleccionar la más cercana
   - **Branch**: `main`
   - **Build Command**: `cd backend-alcaldia && npm install`
   - **Start Command**: `cd backend-alcaldia && npm start`
   - **Plan**: `Free`
5. **Variables de Entorno:**
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: `https://alcaldia-frontend.onrender.com` (se configurará después)
6. **Click en "Create Web Service"**
7. **Esperar a que termine el build y esté "Live"**

### Paso 2: Desplegar Frontend

1. **Click en "New +" → "Static Site"**
2. **Conectar el mismo repositorio**
3. **Configurar sitio estático:**
   - **Name**: `alcaldia-frontend`
   - **Branch**: `main`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Plan**: `Free`
4. **Variables de Entorno:**
   - `REACT_APP_API_URL`: `https://alcaldia-backend.onrender.com`
5. **Click en "Create Static Site"**
6. **Esperar a que termine el build**

### Paso 3: Actualizar URLs

1. **Volver al backend** (`alcaldia-backend`)
2. **Editar variables de entorno:**
   - `FRONTEND_URL`: `https://alcaldia-frontend.onrender.com`
3. **Hacer redeploy** (click en "Manual Deploy")

## ✅ Verificación

### Backend
- URL: `https://alcaldia-backend.onrender.com`
- Health check: `https://alcaldia-backend.onrender.com/health`
- Debe responder con estado "OK"

### Frontend
- URL: `https://alcaldia-frontend.onrender.com`
- Debe cargar sin errores
- Debe poder subir archivos Excel
- Debe mostrar datos correctamente

## 🔧 Solución de Problemas

### Error de Build
- Verificar logs en Render
- Asegurar que `npm install` funcione localmente
- Verificar que no haya errores de sintaxis

### Error de CORS
- Verificar que `FRONTEND_URL` esté configurado correctamente
- Asegurar que el frontend use la URL del backend de producción

### Error de Puerto
- Render asigna automáticamente el puerto via `process.env.PORT`
- No hardcodear puertos en el código

## 📱 URLs Finales

- **Frontend**: `https://alcaldia-frontend.onrender.com`
- **Backend**: `https://alcaldia-backend.onrender.com`
- **API**: `https://alcaldia-backend.onrender.com/upload`

## 🎯 Próximos Pasos

1. **Configurar dominio personalizado** (opcional)
2. **Migrar a base de datos PostgreSQL** (gratis en Render)
3. **Configurar monitoreo y alertas**
4. **Implementar backup automático**
5. **Configurar CI/CD con GitHub Actions**
