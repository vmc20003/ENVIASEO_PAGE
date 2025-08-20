import React, { useState } from "react";
import "./LoginPage.css";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simular proceso de login
    setTimeout(() => {
      if (username === "admin" && password === "admin") {
        onLogin(true);
      } else {
        setError("Credenciales incorrectas. Usa: admin/admin");
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="login-container">
      {/* Efectos de fondo */}
      <div className="background-effects">
        <div className="floating-shapes">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="shape"
              style={{
                "--delay": `${i * 0.5}s`,
                "--duration": `${3 + i * 0.5}s`,
                "--size": `${20 + i * 10}px`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="login-main">
        <div className="login-card">
          {/* Header del login */}
          <div className="login-header">
            <div className="logo-section">
              <div className="logo-icon">
                <img
                  src="/logo_sistema.jpg"
                  alt="Logo Sistema de Gestión"
                  className="logo-image"
                />
              </div>
              <div className="logo-text">
                <h1>Sistema de Gestión</h1>
                <p>Inicia sesión para continuar</p>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <div className="input-wrapper">
                <div className="input-icon">
                  <i className="bi bi-person"></i>
                </div>
                <input
                  type="text"
                  placeholder="Usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="input-wrapper">
                <div className="input-icon">
                  <i className="bi bi-lock"></i>
                </div>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="error-message">
                <i className="bi bi-exclamation-triangle"></i>
                <span>{error}</span>
              </div>
            )}

            {/* Botón de login */}
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right"></i>
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Credenciales de prueba */}
          <div className="demo-credentials">
            <div className="demo-header">
              <i className="bi bi-info-circle"></i>
              <span>Credenciales de Prueba</span>
            </div>
            <div className="demo-content">
              <div className="credential-item">
                <span className="label">Usuario:</span>
                <span className="value">admin</span>
              </div>
              <div className="credential-item">
                <span className="label">Contraseña:</span>
                <span className="value">admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="login-footer">
        <div className="footer-content">
          <p>&copy; 2024 Sistema de Gestión. Todos los derechos reservados.</p>
          <div className="footer-links">
            <span>Política de Privacidad</span>
            <span>•</span>
            <span>Términos de Uso</span>
            <span>•</span>
            <span>Soporte Técnico</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
