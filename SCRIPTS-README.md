# Scripts de Inicio - App_Test

Este proyecto tiene múltiples opciones para iniciar los servidores. Aquí te explico cada una:

## 🚀 Opciones de Inicio

### 1. **Inicio en CMD Separado (Recomendado)**
```bash
npm run start-cmd
```
- Abre un CMD separado
- Inicia cada servidor en su propia ventana
- Fácil de monitorear cada servicio individualmente
- **Ventajas**: Control individual, logs separados, fácil debugging

### 2. **Inicio en CMD Único**
```bash
npm run start-single-cmd
```
- Abre un solo CMD
- Ejecuta todos los servidores en la misma ventana usando `concurrently`
- **Ventajas**: Una sola ventana, logs combinados, fácil de cerrar todo

### 3. **Inicio Original (PowerShell Jobs)**
```bash
npm run start-original
```
- Usa PowerShell Jobs en segundo plano
- No abre ventanas adicionales
- **Ventajas**: No ocupa ventanas, ejecución en background

### 4. **Inicio Directo con NPM**
```bash
# Instalar todas las dependencias
npm run install-all

# Iniciar todos los servicios con concurrently
npm run dev-all

# O iniciar servicios individuales
npm run start-backend      # Solo backend principal
npm run start-frontend     # Solo frontend
npm run start-alcaldia     # Solo backend alcaldía
```

## 📋 Servicios Disponibles

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Frontend | 3000 | Aplicación React principal |
| Backend Principal | 4000 | API para sistema de alumbrado |
| Backend Alcaldía | 4001 | API para sistema de alcaldía |

## 🔧 Comandos Útiles

### Verificar estado de los servicios
```bash
npm run status-all
```

### Detener todos los servicios
```bash
npm run stop-all
```

### Instalar dependencias
```bash
npm run install-all
```

## 🎯 Recomendación

Para desarrollo, te recomiendo usar:
- **`npm run start-cmd`** - Para debugging y monitoreo individual
- **`npm run start-single-cmd`** - Para una experiencia más limpia

Para producción, usa:
- **`npm run dev-all`** - Con concurrently para mejor gestión

## 🚨 Notas Importantes

1. **Primera vez**: Ejecuta `npm run install-all` antes de usar cualquier script
2. **Puertos**: Asegúrate de que los puertos 3000, 4000 y 4001 estén libres
3. **Node.js**: Requiere Node.js versión 16 o superior
4. **Permisos**: En Windows, puede requerir ejecutar PowerShell como administrador

## 🔍 Troubleshooting

### Error de puerto ocupado
```bash
# Verificar qué proceso usa el puerto
netstat -ano | findstr :3000
netstat -ano | findstr :4000
netstat -ano | findstr :4001

# Terminar proceso (reemplaza PID con el número de proceso)
taskkill /PID <PID> /F
```

### Error de dependencias
```bash
# Limpiar e instalar de nuevo
rm -rf node_modules
rm -rf backend/node_modules
rm -rf frontend/node_modules
rm -rf backend-alcaldia/node_modules
npm run install-all
```



