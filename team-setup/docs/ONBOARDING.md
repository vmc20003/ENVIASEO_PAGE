# 📋 Checklist de Onboarding - Nuevos Miembros

## ✅ Configuración Inicial

### 1. Herramientas Básicas
- [ ] **Git** instalado y configurado
  ```bash
  git --version
  git config --global user.name "Tu Nombre"
  git config --global user.email "tu-email@ejemplo.com"
  ```
- [ ] **Node.js** (versión 18.x o superior)
  ```bash
  node --version
  npm --version
  ```
- [ ] **Editor de código** (VS Code recomendado)
  - [ ] Instalar extensiones recomendadas del proyecto

### 2. Configuración del Proyecto
- [ ] Clonar el repositorio
  ```bash
  git clone <URL-DEL-REPOSITORIO>
  cd nombre-del-proyecto
  ```
- [ ] Ejecutar script de configuración
  ```bash
  ./team-setup/scripts/setup-team.ps1
  ```
- [ ] Verificar que todo funciona
  ```bash
  ./team-setup/scripts/dev-team.ps1
  ```

## ✅ Entendimiento del Proyecto

### 3. Documentación
- [ ] Leer **README.md** completo
- [ ] Revisar **team-setup/docs/CONTRIBUTING.md** para entender el flujo de trabajo
- [ ] Entender la estructura del proyecto:
  - `backend/` - Servidor Node.js/Express
  - `frontend/` - Aplicación React
  - `uploads_excel/` - Archivos subidos por usuarios
  - `team-setup/` - Configuración del equipo

### 4. Funcionalidades
- [ ] Probar subir un archivo Excel
- [ ] Probar buscar un empleado por cédula
- [ ] Entender el cálculo de horas extras
- [ ] Revisar el código del backend y frontend

## ✅ Flujo de Trabajo

### 5. Git y Ramas
- [ ] Entender el flujo de ramas:
  - `main` - Código estable
  - `feature/*` - Nuevas funcionalidades
  - `hotfix/*` - Correcciones urgentes
- [ ] Practicar comandos básicos:
  ```bash
  git status
  git checkout -b feature/mi-primera-funcionalidad
  git add .
  git commit -m "feat: descripción"
  git push origin feature/mi-primera-funcionalidad
  ```

### 6. Desarrollo
- [ ] Crear tu primera rama de feature
- [ ] Hacer un cambio pequeño (ej: cambiar un texto)
- [ ] Hacer commit y push
- [ ] Crear un Pull Request (aunque sea de prueba)

## ✅ Comunicación

### 7. Herramientas de Comunicación
- [ ] Unirse al canal de comunicación del equipo (Slack/Discord)
- [ ] Configurar notificaciones de GitHub/GitLab
- [ ] Entender cómo reportar bugs y solicitar features

### 8. Convenciones del Equipo
- [ ] Entender las convenciones de commits
- [ ] Revisar el estilo de código (Prettier, ESLint)
- [ ] Conocer el proceso de code review

## ✅ Próximos Pasos

### 9. Primera Tarea
- [ ] Asignarse una tarea simple del backlog
- [ ] Crear rama para la tarea
- [ ] Desarrollar la funcionalidad
- [ ] Solicitar code review
- [ ] Hacer merge una vez aprobado

### 10. Integración al Equipo
- [ ] Participar en las reuniones diarias
- [ ] Compartir progreso regularmente
- [ ] Ayudar a otros miembros cuando sea posible
- [ ] Proponer mejoras al proceso

## 🎯 Objetivos del Primer Mes

- [ ] Completar al menos 2-3 features pequeñas
- [ ] Participar en code reviews de otros
- [ ] Entender completamente el flujo de trabajo
- [ ] Sentirse cómodo con la base de código
- [ ] Contribuir ideas de mejora

## 📞 Contacto y Soporte

Si tienes dudas durante el onboarding:
- **Líder del proyecto**: [Nombre y contacto]
- **Mentor asignado**: [Nombre y contacto]
- **Canal de Slack/Discord**: [Nombre del canal]
- **Issues de GitHub**: Para reportar problemas

## 🎉 ¡Bienvenido al Equipo!

Una vez completado este checklist, estarás listo para contribuir activamente al proyecto. ¡No dudes en preguntar si necesitas ayuda con cualquier paso!
