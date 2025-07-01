# Plantilla para Mensajes de Commit

## Formato Recomendado

```
<tipo>(<alcance>): <descripción corta>

[descripción larga opcional]

[notas de pie opcional]
```

## Tipos de Commit

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Cambios de formato (espacios, comas, etc.)
- **refactor**: Refactorización de código
- **test**: Agregar o modificar tests
- **chore**: Tareas de mantenimiento

## Alcance (Opcional)

- **frontend**: Cambios en React/UI
- **backend**: Cambios en Node.js/API
- **db**: Cambios en base de datos
- **config**: Cambios de configuración
- **ci**: Cambios en integración continua

## Ejemplos

### Nueva funcionalidad
```
feat(frontend): agregar validación de formulario de búsqueda

- Implementar validación en tiempo real
- Mostrar mensajes de error descriptivos
- Agregar indicadores visuales de estado
```

### Corrección de bug
```
fix(backend): corregir cálculo de horas extras

El cálculo no consideraba los días festivos correctamente.
Ahora se valida contra la lista de días no laborables.

Fixes #123
```

### Documentación
```
docs: actualizar README con instrucciones de instalación

- Agregar sección de requisitos previos
- Incluir comandos de instalación paso a paso
- Documentar variables de entorno necesarias
```

### Refactorización
```
refactor(backend): reorganizar estructura de rutas

- Separar rutas por módulos
- Crear middleware de autenticación
- Mejorar manejo de errores
```

## Reglas Importantes

1. **Usar imperativo**: "agregar" no "agregado"
2. **Primera línea < 50 caracteres**
3. **Descripción clara y específica**
4. **Explicar el por qué, no solo el qué**
5. **Referenciar issues cuando sea relevante**

## Comandos Útiles

```bash
# Commit con mensaje corto
git commit -m "feat: agregar nueva funcionalidad"

# Commit con mensaje largo
git commit -m "feat: agregar nueva funcionalidad" -m "Descripción detallada de los cambios realizados"

# Commit con referencia a issue
git commit -m "fix: corregir bug en cálculo" -m "Fixes #123"
```
