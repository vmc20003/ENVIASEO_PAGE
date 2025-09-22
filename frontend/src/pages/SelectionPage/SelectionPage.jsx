import React from "react";
import "./SelectionPage.css";
import logoAlumbrado from "../../assets/logo_alumbrado_publico_correcto.svg";
import logoAlcaldia from "../../assets/logo_alcaldia_envigado_decorado.svg";
import logoEnviaseo from "../../assets/logo_enviaseo_simple.svg";

function SelectionPage({ onSelectOption, onLogout }) {
  // Función para descargar el manual de usuario
  const downloadManual = () => {
    // Crear contenido HTML del manual
    const manualContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manual de Usuario - Sistema de Gestión de Asistencia</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
            background: #fff;
        }
        
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-top: 30px;
        }
        
        h2 {
            color: #34495e;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 5px;
            margin-top: 25px;
        }
        
        h3 {
            color: #7f8c8d;
            margin-top: 20px;
        }
        
        h4 {
            color: #95a5a6;
            margin-top: 15px;
        }
        
        .header {
            text-align: center;
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            border: none;
            margin: 0;
            font-size: 2.5em;
        }
        
        .header p {
            font-size: 1.2em;
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        
        .step {
            background: #e8f5e8;
            border-left: 4px solid #4caf50;
            padding: 15px;
            margin: 15px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .step h4 {
            color: #2e7d32;
            margin-top: 0;
        }
        
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-left: 4px solid #f39c12;
            padding: 15px;
            margin: 15px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .info {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            border-left: 4px solid #17a2b8;
            padding: 15px;
            margin: 15px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-left: 4px solid #28a745;
            padding: 15px;
            margin: 15px 0;
            border-radius: 0 8px 8px 0;
        }
        
        code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            color: #e83e8c;
        }
        
        ul, ol {
            padding-left: 25px;
        }
        
        li {
            margin: 8px 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        th, td {
            border: 1px solid #dee2e6;
            padding: 12px;
            text-align: left;
        }
        
        th {
            background: #f8f9fa;
            font-weight: 600;
            color: #495057;
        }
        
        .footer {
            text-align: center;
            margin-top: 50px;
            padding: 20px;
            border-top: 2px solid #ecf0f1;
            color: #7f8c8d;
            font-style: italic;
        }
        
        @media print {
            body {
                max-width: none;
                margin: 0;
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Manual de Usuario</h1>
        <p>Sistema de Gestión de Asistencia - Enviaseo E.S.P.</p>
    </div>

    <h1>Introducción</h1>
    <p>El Sistema de Gestión de Asistencia de Enviaseo E.S.P. es una aplicación web que permite gestionar y controlar la asistencia del personal en diferentes módulos organizacionales.</p>

    <h2>Características Principales:</h2>
    <ul>
        <li>✅ Gestión de asistencia por módulos</li>
        <li>✅ Procesamiento de archivos Excel</li>
        <li>✅ Generación de reportes</li>
        <li>✅ Búsqueda y filtrado de datos</li>
        <li>✅ Estadísticas en tiempo real</li>
        <li>✅ Exportación de datos</li>
    </ul>

    <h1>Acceso al Sistema</h1>
    
    <div class="step">
        <h4>Paso 1: Iniciar el Sistema</h4>
        <ol>
            <li>Abrir el navegador web</li>
            <li>Navegar a: <code>http://localhost:3000</code></li>
            <li>El sistema mostrará la página de inicio</li>
        </ol>
    </div>

    <div class="step">
        <h4>Paso 2: Iniciar Sesión</h4>
        <ol>
            <li>En la página de inicio, hacer clic en el botón <strong>"Iniciar Sesión"</strong></li>
            <li>El sistema redirigirá automáticamente al panel principal</li>
            <li>No se requiere credenciales específicas para el acceso de demostración</li>
        </ol>
    </div>

    <h1>Panel Principal</h1>
    <p>El panel principal es la página de selección donde se puede acceder a los diferentes módulos del sistema.</p>

    <h2>Funciones Disponibles:</h2>

    <h3>1. Sistema de Asistencia - Alumbrado Público</h3>
    <ul>
        <li><strong>Descripción</strong>: Gestión de horarios, horas extra y reportes de asistencia para el personal de alumbrado público</li>
        <li><strong>Acceso</strong>: Hacer clic en la tarjeta correspondiente</li>
        <li><strong>Color</strong>: Naranja/Amarillo</li>
    </ul>

    <h3>2. Sistema de Asistencia - Alcaldía de Envigado</h3>
    <ul>
        <li><strong>Descripción</strong>: Control de asistencia y verificación de personal municipal</li>
        <li><strong>Acceso</strong>: Hacer clic en la tarjeta correspondiente</li>
        <li><strong>Color</strong>: Verde</li>
    </ul>

    <h3>3. Sistema de Control - Enviaseo Control de Acceso</h3>
    <ul>
        <li><strong>Descripción</strong>: Gestión y control de acceso para personal de Enviaseo</li>
        <li><strong>Acceso</strong>: Hacer clic en la tarjeta correspondiente</li>
        <li><strong>Color</strong>: Azul</li>
    </ul>

    <h1>Módulo Alumbrado Público</h1>

    <div class="step">
        <h4>Subir Archivo Excel</h4>
        <ol>
            <li>En la sección "Cargar Archivo de Asistencia", hacer clic en <strong>"Seleccionar archivo Excel"</strong></li>
            <li>Navegar y seleccionar el archivo Excel (.xlsx o .xls) con los datos de asistencia</li>
            <li>Verificar que el archivo se haya seleccionado correctamente</li>
            <li>Hacer clic en el botón <strong>"Subir Archivo"</strong></li>
            <li>Esperar a que aparezca el mensaje de confirmación</li>
        </ol>
    </div>

    <div class="info">
        <h4>Formato del archivo Excel requerido:</h4>
        <ul>
            <li>Columnas: ID, Nombre, Departamento, Fecha/Hora, Punto de Acceso</li>
            <li>Formato de fecha: DD/MM/YYYY HH:MM</li>
            <li>Archivos soportados: .xlsx, .xls</li>
        </ul>
    </div>

    <div class="step">
        <h4>Buscar Registros</h4>
        <ol>
            <li>En el campo de búsqueda, escribir el nombre, ID o departamento a buscar</li>
            <li>Hacer clic en el botón <strong>"Buscar"</strong> o presionar Enter</li>
            <li>Los resultados se mostrarán en la tabla</li>
            <li>Para limpiar la búsqueda, hacer clic en <strong>"Limpiar"</strong></li>
        </ol>
    </div>

    <div class="step">
        <h4>Navegar por Páginas</h4>
        <ol>
            <li>En la parte inferior de la tabla, usar los botones de navegación:
                <ul>
                    <li><strong>"<"</strong> para página anterior</li>
                    <li><strong>">"</strong> para página siguiente</li>
                    <li>Números de página para ir directamente</li>
                </ul>
            </li>
            <li>La información de paginación muestra: "Página X de Y"</li>
        </ol>
    </div>

    <h1>Módulo Alcaldía de Envigado</h1>

    <div class="step">
        <h4>Subir Archivo Excel</h4>
        <ol>
            <li>En la sección "Cargar Archivo de Asistencia", hacer clic en <strong>"Seleccionar archivo Excel"</strong></li>
            <li>Seleccionar el archivo Excel con datos de asistencia municipal</li>
            <li>Hacer clic en <strong>"Subir Archivo"</strong></li>
            <li>Esperar confirmación de carga exitosa</li>
        </ol>
    </div>

    <div class="step">
        <h4>Buscar Personal</h4>
        <ol>
            <li>En el campo de búsqueda, escribir nombre, ID o departamento</li>
            <li>Seleccionar punto de acceso específico en el dropdown (opcional)</li>
            <li>Hacer clic en <strong>"Buscar"</strong></li>
        </ol>
    </div>

    <h1>Módulo Enviaseo Control de Acceso</h1>

    <div class="step">
        <h4>Cargar Archivo de Control de Acceso</h4>
        <ol>
            <li>En la sección "Cargar Archivo de Control de Acceso", hacer clic en <strong>"Seleccionar archivo Excel"</strong></li>
            <li>Seleccionar el archivo Excel con datos de control de acceso</li>
            <li>Hacer clic en <strong>"Procesar Archivo"</strong></li>
            <li>Esperar el procesamiento y confirmación</li>
        </ol>
    </div>

    <div class="step">
        <h4>Buscar Registros de Acceso</h4>
        <ol>
            <li>En el campo de búsqueda, escribir criterios de búsqueda</li>
            <li>Hacer clic en <strong>"Buscar"</strong></li>
            <li>Los resultados se mostrarán con información detallada de acceso</li>
        </ol>
    </div>

    <h1>Solución de Problemas</h1>

    <h2>Problemas Comunes:</h2>

    <div class="warning">
        <h4>Error al subir archivo</h4>
        <p><strong>Síntomas</strong>: Mensaje de error al intentar subir un archivo</p>
        <p><strong>Soluciones</strong>:</p>
        <ul>
            <li>Verificar que el archivo sea .xlsx o .xls</li>
            <li>Comprobar que el archivo no esté corrupto</li>
            <li>Verificar que el archivo tenga el formato correcto de columnas</li>
            <li>Asegurarse de que el archivo no esté abierto en otra aplicación</li>
        </ul>
    </div>

    <div class="warning">
        <h4>Error de conexión</h4>
        <p><strong>Síntomas</strong>: Mensajes de "Error de conexión" o "Failed to fetch"</p>
        <p><strong>Soluciones</strong>:</p>
        <ul>
            <li>Verificar que todos los servidores estén ejecutándose</li>
            <li>Comprobar la conexión a internet</li>
            <li>Reiniciar el navegador</li>
            <li>Verificar que no haya firewall bloqueando las conexiones</li>
        </ul>
    </div>

    <h1>Información Técnica</h1>

    <h2>Requisitos del Sistema:</h2>
    <ul>
        <li><strong>Navegador</strong>: Chrome, Firefox, Safari, Edge (versiones recientes)</li>
        <li><strong>Resolución</strong>: Mínimo 1024x768</li>
        <li><strong>JavaScript</strong>: Habilitado</li>
        <li><strong>Conexión</strong>: Internet estable</li>
    </ul>

    <h2>Servidores del Sistema:</h2>
    <ul>
        <li><strong>Frontend</strong>: http://localhost:3000</li>
        <li><strong>Backend Alumbrado</strong>: http://localhost:4000</li>
        <li><strong>Backend Alcaldía</strong>: http://localhost:4002</li>
        <li><strong>Backend Enviaseo</strong>: http://localhost:4001</li>
    </ul>

    <div class="footer">
        <p>Manual generado automáticamente por el Sistema de Gestión de Asistencia</p>
        <p>Enviaseo E.S.P. - ${new Date().toLocaleDateString('es-ES')}</p>
    </div>
</body>
</html>`;

    // Crear blob y descargar
    const blob = new Blob([manualContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Manual_Usuario_Sistema_Gestion_Asistencia_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    // Mostrar mensaje de éxito
    alert('📄 Manual de usuario descargado exitosamente!\n\nEl archivo se ha guardado como HTML. Para convertirlo a PDF:\n1. Abrir el archivo en el navegador\n2. Presionar Ctrl+P (Imprimir)\n3. Seleccionar "Guardar como PDF"');
  };
  const options = [
    {
      id: "attendance",
      title: "Sistema de Asistencia",
      subtitle: "ALUMBRADO PÚBLICO",
      description: "Gestión de horarios, horas extra y reportes de asistencia",
      icon: "bi-lightbulb",
      color: "#3b82f6",
      gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)",
      logo: logoAlumbrado,
    },
    {
      id: "alcaldia-envigado",
      title: "Sistema de Asistencia",
      subtitle: "ALCALDÍA DE ENVIGADO",
      description: "Control de asistencia y verificación de personal municipal",
      icon: "bi-building",
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
      logo: logoAlcaldia,
    },
    {
      id: "enviaseo-control-acceso",
      title: "Sistema de Control",
      subtitle: "ENVIASEO CONTROL DE ACCESO",
      description: "Gestión y control de acceso para personal de Enviaseo",
      icon: "bi-shield-check",
      color: "#10b981",
      gradient: "linear-gradient(135deg, #10b981, #34d399)",
      logo: logoEnviaseo,
    },

  ];

  return (
    <div className="selection-container">
      {/* Partículas flotantes de fondo */}
      <div className="floating-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Header */}
      <div className="selection-header">
        <div className="header-content">
          <div className="system-info">
            <h1>Sistema de Gestión</h1>
            <p>Control de Acceso y Asistencia</p>
          </div>
          <div className="header-actions">
            <button onClick={downloadManual} className="btn-header">
              <i className="bi bi-file-earmark-pdf"></i>
              Manual
            </button>
            <button onClick={onLogout} className="btn-header">
              <i className="bi bi-box-arrow-right"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="selection-main">
        <div className="selection-title">
          <h1>Panel de Acceso</h1>
          <p>Selecciona el módulo que necesitas utilizar</p>
        </div>

        {/* Grid de opciones */}
        <div className="options-grid">
          {options.map((option, index) => (
            <div
              key={option.id}
              className="option-card"
              onClick={() => onSelectOption(option.id)}
              data-module={option.id}
            >
              <div className="card-icon">
                {option.logo ? (
                  <img 
                    src={option.logo} 
                    alt={`Logo ${option.subtitle}`} 
                  />
                ) : (
                  <i className={option.icon}></i>
                )}
              </div>
              
              <div className="card-content">
                <h2>{option.title}</h2>
                <h3 data-module={option.id}>{option.subtitle}</h3>
                <p>{option.description}</p>
                
                <button 
                  className="btn-access"
                  data-module={option.id}
                >
                  ACCEDER
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SelectionPage;
