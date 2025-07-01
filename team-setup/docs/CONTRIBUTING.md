# Guía de Contribución - Sistema de Gestión de Asistencia

## 🚀 Cómo Trabajar en Equipo

### 1. Configuración Inicial

#### Para el primer desarrollador:
```bash
# Inicializar repositorio Git
git init
git add .
git commit -m "Initial commit: Sistema de Gestión de Asistencia"

# Crear repositorio en GitHub/GitLab y conectar
git remote add origin https://github.com/tu-usuario/nombre-del-repo.git
git branch -M main
git push -u origin main
```

#### Para otros desarrolladores:
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/nombre-del-repo.git
cd nombre-del-repo

# Ejecutar configuración automática
./team-setup/scripts/setup-team.ps1
```

### 2. Flujo de Trabajo (Git Flow)

#### Antes de empezar a trabajar:
```bash
# Actualizar tu rama principal
git checkout main
git pull origin main

# Crear una nueva rama para tu feature
git checkout -b feature/nombre-de-la-funcionalidad
```

#### Durante el desarrollo:
```bash
# Hacer commits frecuentes y descriptivos
git add .
git commit -m "feat: agregar funcionalidad de búsqueda avanzada"

# Subir tu rama al repositorio remoto
git push origin feature/nombre-de-la-funcionalidad
```

#### Al terminar tu trabajo:
```bash
# Actualizar tu rama con los últimos cambios de main
git checkout main
git pull origin main
git checkout feature/nombre-de-la-funcionalidad
git merge main

# Resolver conflictos si los hay, luego:
git push origin feature/nombre-de-la-funcionalidad
```

### 3. Convenciones de Commits

Usa estos prefijos para tus commits:
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bugs
- `docs:` - Documentación
- `style:` - Cambios de formato (espacios, comas, etc.)
- `refactor:` - Refactorización de código
- `test:` - Agregar o modificar tests
- `chore:` - Tareas de mantenimiento

Ejemplos:
```bash
git commit -m "feat: agregar validación de archivos Excel"
git commit -m "fix: corregir cálculo de horas extras"
git commit -m "docs: actualizar README con nuevas instrucciones"
```

### 4. Estructura de Ramas

- `main` - Código estable y listo para producción
- `develop` - Rama de desarrollo (opcional)
- `feature/*` - Nuevas funcionalidades
- `hotfix/*` - Correcciones urgentes

### 5. Resolución de Conflictos

Si hay conflictos al hacer merge:

1. **Identificar el conflicto:**
```bash
git status
```

2. **Abrir los archivos con conflictos** y resolver manualmente
3. **Marcar como resuelto:**
```bash
git add archivo-con-conflicto.js
```

4. **Completar el merge:**
```bash
git commit -m "resolve: conflictos en archivo.js"
```

### 6. Code Review

Antes de hacer merge a main:
1. Crear un Pull Request (PR) en GitHub/GitLab
2. Solicitar review a otro desarrollador
3. Hacer las correcciones sugeridas
4. Una vez aprobado, hacer merge

### 7. Variables de Entorno

Cada desarrollador debe crear su propio archivo `.env` basado en `team-setup/config/env.example`.

### 8. Comunicación

- **Slack/Discord:** Para comunicación diaria
- **Issues en GitHub:** Para reportar bugs y nuevas funcionalidades
- **Pull Requests:** Para revisión de código
- **Documentación:** Mantener actualizada en el README

### 9. Herramientas Recomendadas

- **VS Code** con extensiones:
  - GitLens
  - Prettier
  - ESLint
  - Live Share (para programación en tiempo real)

- **GitHub Desktop** (alternativa gráfica a Git)

### 10. Buenas Prácticas

1. **Nunca trabajar directamente en main**
2. **Hacer commits pequeños y frecuentes**
3. **Escribir mensajes de commit descriptivos**
4. **Probar tu código antes de hacer push**
5. **Comunicar cambios importantes al equipo**
6. **Mantener la documentación actualizada**

### 11. Comandos Útiles

```bash
# Ver estado del repositorio
git status

# Ver historial de commits
git log --oneline

# Ver diferencias
git diff

# Descartar cambios en un archivo
git checkout -- archivo.js

# Ver ramas
git branch -a

# Cambiar de rama
git checkout nombre-rama
```

### 12. En Caso de Emergencia

Si algo sale mal:
```bash
# Descartar todos los cambios
git reset --hard HEAD

# Volver a un commit específico
git reset --hard <commit-hash>

# Recuperar archivos eliminados
git checkout HEAD -- archivo-eliminado.js
```

## 📞 Contacto

Para dudas sobre el flujo de trabajo, contacta al líder del proyecto o crea un issue en GitHub.
