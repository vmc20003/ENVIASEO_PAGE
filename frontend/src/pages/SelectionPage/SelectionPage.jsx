import React from "react";
import "./SelectionPage.css";

function SelectionPage({ onSelectOption, onLogout }) {
  const options = [
    {
      id: "attendance",
      title: "Sistema de Asistencia",
      subtitle: "Alumbrado Público",
      description: "Gestión de horarios, horas extra y reportes de asistencia",
      icon: "bi-lightbulb",
      color: "#ff9800",
      gradient: "linear-gradient(135deg, #ff9800, #ffb74d)",
    },
    {
      id: "alcaldia-envigado",
      title: "Sistema de Asistencia",
      subtitle: "Alcaldía de Envigado",
      description: "Control de asistencia y verificación de personal municipal",
      icon: "bi-building",
      color: "#2e7d32",
      gradient: "linear-gradient(135deg, #2e7d32, #4caf50)",
    },
    {
      id: "reports",
      title: "Reportes",
      subtitle: "Análisis y Estadísticas",
      description: "Generación de reportes detallados y análisis de datos",
      icon: "bi-graph-up",
      color: "#2196f3",
      gradient: "linear-gradient(135deg, #2196f3, #64b5f6)",
    },
    {
      id: "settings",
      title: "Configuración",
      subtitle: "Ajustes del Sistema",
      description: "Configuración de parámetros y preferencias del sistema",
      icon: "bi-gear",
      color: "#9c27b0",
      gradient: "linear-gradient(135deg, #9c27b0, #ba68c8)",
    },
  ];

  return (
    <div className="selection-container">
      {/* Header */}
      <div className="selection-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-placeholder">
              <i className="bi bi-shield-check"></i>
              <span>Sistema de Gestión</span>
            </div>
          </div>
          <button onClick={onLogout} className="btn-logout">
            <i className="bi bi-box-arrow-right"></i>
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="selection-main">
        <div className="main-card">
          {/* Título principal */}
          <div className="title-section">
            <h1>Panel de Control</h1>
            <h2>Selecciona el sistema que deseas gestionar</h2>
          </div>

          {/* Grid de opciones */}
          <div className="options-grid">
            {options.map((option) => (
              <div
                key={option.id}
                className={`option-card ${option.id === "attendance" ? "alumbrado-card" : ""} ${option.id === "alcaldia-envigado" ? "alcaldia-card" : ""}`}
                onClick={() => onSelectOption(option.id)}
                style={{ "--card-gradient": option.gradient }}
              >
                <div className="card-header">
                  <div
                    className="icon-container"
                    style={{ background: option.gradient }}
                  >
                    <i className={`bi ${option.icon}`}></i>
                  </div>
                  <div className="card-title">
                    <h3>{option.title}</h3>
                    <h4 style={{ color: option.id === "attendance" ? "#ff9800" : "inherit" }}>{option.subtitle}</h4>
                  </div>
                </div>
                <div className="card-content">
                  <p>{option.description}</p>
                </div>
                <div className="card-footer">
                  <span className="access-text">Acceder</span>
                  <i className="bi bi-arrow-right"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectionPage;
