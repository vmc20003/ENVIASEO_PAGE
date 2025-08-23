# 🧹 Guía de Limpieza de Servicios Render

## 📊 Situación Actual
Actualmente tienes **6 servicios** desplegados en Render, pero solo necesitas **3** para que tu aplicación funcione correctamente.

### ✅ Servicios Esenciales (MANTENER)
1. **`alcaldia-backend`** - Backend principal de la Alcaldía (puerto 4001)
2. **`alumbrado-backend`** - Backend de Alumbrado Público (puerto 4000)
3. **`alcaldia-frontend`** - Frontend unificado (puerto 3000)

### ❌ Servicios Redundantes (ELIMINAR)
1. **`Alcaldia-Frontend`** - Frontend estático redundante
2. **`Backend Alumbrado`** - Duplicado del backend de alumbrado
3. **`Pagina-Valeria-Enviaseo`** - Servicio no necesario

## 🚀 Pasos para Limpiar

### Paso 1: Verificar Servicios Principales
Antes de eliminar nada, asegúrate de que los 3 servicios esenciales funcionen:

```bash
# Verificar backend alcaldía
curl https://alcaldia-backend.onrender.com/health

# Verificar backend alumbrado
curl https://alumbrado-backend.onrender.com/health

# Verificar frontend
curl https://alcaldia-frontend.onrender.com
```

### Paso 2: Eliminar Servicios Redundantes
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Encuentra cada servicio redundante
3. Haz clic en el servicio → Settings → Delete Service
4. Confirma la eliminación

**⚠️ IMPORTANTE**: Elimina solo los 3 servicios redundantes, NO los esenciales.

### Paso 3: Actualizar Configuración
El archivo `render.yaml` ya está actualizado para mantener solo los servicios necesarios.

### Paso 4: Verificar Funcionamiento
Después de la limpieza, verifica que todo funcione:

```bash
# Ejecutar el script de verificación
./cleanup-render-services.ps1
```

## 🔧 Configuración Final

### Backend Alcaldía
- **URL**: https://alcaldia-backend.onrender.com
- **Puerto**: 4001
- **Función**: API principal para gestión de asistencia

### Backend Alumbrado
- **URL**: https://alumbrado-backend.onrender.com
- **Puerto**: 4000
- **Función**: API para gestión de alumbrado público

### Frontend Unificado
- **URL**: https://alcaldia-frontend.onrender.com
- **Puerto**: 3000
- **Función**: Interfaz web para ambos sistemas

## 📈 Beneficios de la Limpieza

1. **Menor consumo de recursos** - Solo 3 servicios en lugar de 6
2. **Mejor mantenimiento** - Menos servicios que monitorear
3. **Reducción de costos** - Menos servicios gratuitos utilizados
4. **Arquitectura más clara** - Separación clara de responsabilidades
5. **Despliegue más rápido** - Menos servicios que construir

## 🚨 Consideraciones Importantes

- **No elimines** servicios hasta confirmar que los principales funcionan
- **Haz backup** de cualquier configuración importante
- **Monitorea** los servicios después de la limpieza
- **Verifica** que las URLs en el frontend apunten correctamente

## 📞 En Caso de Problemas

Si algo deja de funcionar después de la limpieza:

1. Verifica los logs en Render Dashboard
2. Confirma que las URLs estén correctas
3. Revisa que los servicios estén activos
4. Si es necesario, puedes recrear un servicio eliminado

## ✅ Checklist de Limpieza

- [ ] Verificar que los 3 servicios principales funcionen
- [ ] Eliminar `Alcaldia-Frontend` (Static)
- [ ] Eliminar `Backend Alumbrado`
- [ ] Eliminar `Pagina-Valeria-Enviaseo`
- [ ] Confirmar que solo quedan 3 servicios
- [ ] Verificar funcionamiento de la aplicación completa
- [ ] Hacer commit del `render.yaml` actualizado

---

**Resultado Final**: Sistema más limpio, eficiente y fácil de mantener con solo los servicios esenciales funcionando.
