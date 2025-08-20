# Frontend - Sistema de Gestión de Asistencia

## Estructura del Proyecto

El frontend está organizado en una estructura modular con páginas separadas:

```
frontend/
├── src/
│   ├── pages/
│   │   ├── LoginPage/
│   │   │   ├── LoginPage.jsx
│   │   │   └── LoginPage.css
│   │   ├── SelectionPage/
│   │   │   ├── SelectionPage.jsx
│   │   │   └── SelectionPage.css
│   │   └── MainApp/
│   │       ├── MainApp.jsx
│   │       └── MainApp.css
│   ├── App.jsx
│   ├── index.js
│   └── styles.css
└── public/
    └── index.html
```

## Páginas

### 1. LoginPage

- **Ubicación**: `src/pages/LoginPage/`
- **Función**: Página de autenticación con credenciales
- **Características**:
  - Formulario de login con usuario y contraseña
  - Diseño moderno con efectos visuales
  - Validación de credenciales
  - Credenciales de prueba: `admin` / `admin123`

### 2. SelectionPage

- **Ubicación**: `src/pages/SelectionPage/`
- **Función**: Panel de selección para acceder a diferentes módulos
- **Opciones disponibles**:
  - Sistema de Asistencia (funcional)
  - Reportes (en desarrollo)
  - Configuración (en desarrollo)
- **Características**:
  - Diseño de tarjetas interactivas
  - Efectos de hover y selección
  - Botón de cerrar sesión

### 3. MainApp

- **Ubicación**: `src/pages/MainApp/`
- **Función**: Aplicación principal de gestión de asistencia
- **Características**:
  - Subida de archivos Excel
  - Búsqueda de registros
  - Visualización de estadísticas
  - Gestión de archivos subidos
  - Botón para volver al panel de selección

## Flujo de Navegación

1. **LoginPage** → Usuario ingresa credenciales
2. **SelectionPage** → Usuario selecciona módulo
3. **MainApp** → Usuario accede a la funcionalidad principal

## Tecnologías Utilizadas

- **React 18.2.0**
- **Bootstrap 5.3.3** (CSS y JS)
- **Bootstrap Icons 1.11.3**
- **CSS3** con animaciones y efectos modernos

## Características de Diseño

### Estilo Visual

- Gradientes modernos (púrpura a azul)
- Efectos de glassmorphism
- Animaciones suaves y transiciones
- Diseño responsive
- Iconografía de Bootstrap Icons

### Efectos Especiales

- Partículas flotantes en páginas de login y selección
- Efectos de hover en botones y tarjetas
- Animaciones de entrada y salida
- Efectos de ripple en selecciones

## Instalación y Uso

1. **Instalar dependencias**:

   ```bash
   npm install
   ```

2. **Iniciar el servidor de desarrollo**:

   ```bash
   npm start
   ```

3. **Acceder a la aplicación**:
   - URL: `http://localhost:3000`
   - Credenciales: `admin` / `admin123`

## Personalización

### Cambiar Credenciales

Editar en `LoginPage.jsx`:

```javascript
if (credentials.username === "admin" && credentials.password === "admin123") {
  onLogin(true);
}
```

### Agregar Nuevas Opciones

Editar en `SelectionPage.jsx`:

```javascript
const options = [
  // Agregar nuevas opciones aquí
];
```

### Modificar Estilos

Cada página tiene su propio archivo CSS para estilos específicos:

- `LoginPage.css` - Estilos de la página de login
- `SelectionPage.css` - Estilos del panel de selección
- `MainApp.css` - Estilos de la aplicación principal
- `styles.css` - Estilos globales

## Notas de Desarrollo

- El sistema está preparado para integrar con un backend de autenticación real
- Las páginas de reportes y configuración están marcadas para desarrollo futuro
- El diseño es completamente responsive y funciona en dispositivos móviles
- Se incluyen efectos de accesibilidad y UX modernos
