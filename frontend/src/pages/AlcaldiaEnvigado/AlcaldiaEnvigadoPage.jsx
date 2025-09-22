import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./AlcaldiaEnvigadoPage.css";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { API_CONFIG } from "../../config.js";
import logoAlcaldia from "../../assets/logo_alcaldia_envigado_simple.svg";

const PAGE_SIZE = 10;

function AlcaldiaEnvigadoPage({ onBack }) {
  const [file, setFile] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedAccessPoint, setSelectedAccessPoint] = useState("all");
  const [accessPoints, setAccessPoints] = useState([]);
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [soloConHorasExtra, setSoloConHorasExtra] = useState(false);
  const [horariosCalculados, setHorariosCalculados] = useState([]);
  const [estadisticasHorarios, setEstadisticasHorarios] = useState(null);
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);
  
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Por favor selecciona un archivo");
      return;
    }

    setLoading(true);
    setMessage("Procesando archivo...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_CONFIG.ALCALDIA.BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Error desconocido");
      }

      // Cargar los datos procesados desde el servidor
      const recordsResponse = await fetch(`${API_CONFIG.ALCALDIA.BASE_URL}/all-records`);
      const recordsData = await recordsResponse.json();

      setResultados(Array.isArray(recordsData) ? recordsData : []);
      window.__registrosExcel = Array.isArray(recordsData) ? recordsData : [];

      setMessage(
        `Archivo procesado correctamente. Se encontraron ${data.recordsProcessed} registros. Total en base de datos: ${data.totalRecords}`
      );
      setFile(null);

      // Actualizar estadísticas
      fetchStats();
      fetchFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_CONFIG.ALCALDIA.BASE_URL}/files`);
      const data = await response.json();
      const filesArray = data.files || data;
      setFiles(Array.isArray(filesArray) ? filesArray : []);
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_CONFIG.ALCALDIA.BASE_URL}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchAccessPoints = async () => {
    try {
      const response = await fetch(`${API_CONFIG.ALCALDIA.BASE_URL}/access-points`);
      const data = await response.json();
      setAccessPoints(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching access points:", error);
      setAccessPoints([]);
    }
  };

  const fetchHorariosCalculados = async () => {
    if (resultados.length === 0) return;
    setLoadingHorarios(true);
    try {
      const response = await fetch(`${API_CONFIG.ALCALDIA.BASE_URL}/horarios-calculo`);
      const data = await response.json();
      if (data.success) {
        setHorariosCalculados(data.horarios);
        setEstadisticasHorarios(data.estadisticas);
      }
    } catch (error) {
      console.error("Error fetching horarios:", error);
    } finally {
      setLoadingHorarios(false);
    }
  };

  const handleFiltroHorasExtraChange = (e) => {
    setSoloConHorasExtra(e.target.checked);
    setPage(1);
  };

  const exportarHorariosExcel = async () => {
    try {
      const response = await fetch(`${API_CONFIG.ALCALDIA.BASE_URL}/exportar-horarios`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'horarios_alcaldia.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error exporting horarios:", error);
    }
  };

  const decimalToHHMMSS = (decimalHours) => {
    if (typeof decimalHours !== "number" || isNaN(decimalHours) || decimalHours < 0) {
      return "00:00:00";
    }
    const hours = Math.floor(decimalHours);
    const minutes = Math.floor((decimalHours - hours) * 60);
    const seconds = Math.floor(((decimalHours - hours) * 60 - minutes) * 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const clearDatabase = async () => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres limpiar toda la base de datos?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.ALCALDIA.BASE_URL}/clear-db`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage("Base de datos limpiada correctamente");
        setResultados([]);
        setHorariosCalculados([]);
        setEstadisticasHorarios(null);
        fetchStats();
      } else {
        const data = await response.json();
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Error de conexión: ${error.message}`);
    }
  };

  const loadSavedData = async () => {
    try {
      const response = await fetch(`${API_CONFIG.ALCALDIA.BASE_URL}/all-records`);
      const data = await response.json();
      setResultados(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading saved data:", error);
    }
  };

  const refreshData = async () => {
    setSearching(true);
    setMessage("Refrescando datos...");
    try {
      await loadSavedData();
      setMessage("Datos actualizados correctamente");
    } catch (error) {
      setMessage(`Error refrescando datos: ${error.message}`);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchStats();
    fetchAccessPoints();
  }, []);

  useEffect(() => {
    if (resultados.length > 0) {
      fetchHorariosCalculados();
    }
  }, [resultados]);

  // Función mejorada para manejar búsqueda
  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleFilterChange = (e) => {
    setSelectedAccessPoint(e.target.value);
    setPage(1);
  };

  // Filtrar resultados por punto de acceso
  // Debounce searchTerm para evitar renders y filtros costosos
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(id);
  }, [searchTerm]);

  const filteredResults = useMemo(() => {
    let base = selectedAccessPoint === "all"
      ? resultados
      : resultados.filter(resultado => 
          resultado.puntoVerificacion && 
          resultado.puntoVerificacion.includes(selectedAccessPoint)
        );
    if (!debouncedSearch.trim()) return base;
    const lower = debouncedSearch.toLowerCase();
    return base.filter(r => 
      r.nombre.toLowerCase().includes(lower) ||
      r.idPersona.toLowerCase().includes(lower) ||
      r.departamento.toLowerCase().includes(lower)
    );
  }, [resultados, selectedAccessPoint, debouncedSearch]);

  // Aplicar filtro de horas extra si está activado
  const resultadosFinales = useMemo(() => {
    return soloConHorasExtra ? horariosCalculados.filter(h => h.horasExtra > 0) : filteredResults;
  }, [soloConHorasExtra, horariosCalculados, filteredResults]);

  // Paginación
  const totalPagesCalculated = Math.ceil(resultadosFinales.length / PAGE_SIZE);
  const paginatedResults = resultadosFinales.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Actualizar totalPages si es necesario
  useEffect(() => {
    if (totalPagesCalculated !== totalPages) {
      setTotalPages(totalPagesCalculated);
    }
  }, [totalPagesCalculated, totalPages]);

  // Debug: mostrar estado actual
  console.log("🎯 Estado actual - selectedAccessPoint:", selectedAccessPoint);
  console.log("📊 Estado actual - resultados.length:", resultados.length);
  console.log("📄 Estado actual - paginatedResults.length:", paginatedResults.length);

  async function exportarExcel() {
    if (resultados.length === 0) {
      setMessage("No hay datos para exportar");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Registros Alcaldía");

    // Encabezados
    worksheet.addRow([
      "ID de Persona",
      "Nombre",
      "Departamento",
      "Hora",
      "Punto de Verificación",
    ]);

    // Estilo para encabezados
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF388e3c" },
    };

    // Datos
    resultados.forEach((registro) => {
      worksheet.addRow([
        registro.idPersona || registro.personNo,
        registro.nombre || registro.firstName,
        registro.departamento,
        registro.hora || registro.time,
        registro.puntoVerificacion || registro.accessPoint,
      ]);
    });

    // Ajustar ancho de columnas
    worksheet.columns.forEach((col) => (col.width = 20));

    // Aplicar bordes
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });
    });

    // Guardar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      "registros_alcaldia_envigado.xlsx"
    );
  }

  function renderPagination(page, totalPages, setPage) {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Primera página
    if (startPage > 1) {
      pages.push(
        <li key="first" className="page-item">
          <button className="page-link" onClick={() => setPage(1)}>
            1
          </button>
        </li>
      );
      if (startPage > 2) {
        pages.push(
          <li key="ellipsis1" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
      }
    }

    // Páginas visibles
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li
          key={i}
          className={`page-item ${page === i ? "active" : ""}`}
        >
          <button className="page-link" onClick={() => setPage(i)}>
            {i}
          </button>
        </li>
      );
    }

    // Última página
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <li key="ellipsis2" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
      }
      pages.push(
        <li key="last" className="page-item">
          <button className="page-link" onClick={() => setPage(totalPages)}>
            {totalPages}
          </button>
        </li>
      );
    }

    return (
      <div className="pagination-container">
        <nav aria-label="Navegación de páginas">
          <ul className="pagination">
            <li
              className={`page-item ${page === 1 ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                &laquo;
              </button>
            </li>
            {pages}
            <li
              className={`page-item ${page === totalPages ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                &raquo;
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  }

  return (
    <div className="alcaldia-container">
      {/* Header moderno */}
      <div className="alcaldia-header">
        <div className="header-content">
          <div className="logo-section">
              <h1>Sistema de Asistencia</h1>
            <span>ALCALDÍA DE ENVIGADO</span>
            </div>
          <button className="btn-back" onClick={onBack}>
            <i className="bi bi-arrow-left"></i>
            Volver al Panel
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="main-content">
        {/* Título principal */}
        <div className="title-section">
          <h1>🏛️ Sistema de Gestión de Asistencia</h1>
          <h2>✨ Control integral de asistencia y verificación de personal municipal para la Alcaldía de Envigado</h2>
        </div>

        {/* Sección de carga de archivos */}
        <div className="modern-card">
          <div className="card-header">
            <h3>
              <i className="bi bi-cloud-upload"></i>
              📊 Carga de Datos de Asistencia
            </h3>
            <p>🚀 Importe archivos Excel (.xlsx, .xls) con registros de asistencia para procesamiento automático</p>
          </div>
          <div className="upload-section">
            {/* Área de selección de archivo */}
            <div 
              className="upload-area" 
              onClick={() => document.getElementById('fileInput').click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="upload-icon">
                <i className={`${file ? 'bi bi-check-circle-fill' : 'bi bi-cloud-upload'}`}></i>
              </div>
              
              <div className="upload-text">
                {file ? '✅ Archivo Seleccionado' : '📊 Seleccionar Archivo de Datos'}
              </div>
              
              <div className="upload-subtitle">
                {file ? 'Haz clic para cambiar el archivo' : 'Arrastra tu archivo Excel aquí o haz clic para seleccionar'}
              </div>
              
              <div className="upload-formats">
                {file ? `Archivo: ${file.name}` : 'Formatos compatibles: .xlsx, .xls'}
              </div>
              
                <input
                  type="file"
                className="file-input"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={loading}
                id="fileInput"
              />
              </div>
            
            {/* Botón de subida */}
              <button
              className={`upload-button ${!file || loading ? 'disabled' : ''}`}
                onClick={handleUpload}
                disabled={!file || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                  Procesando archivo...
                  </>
                ) : (
                  <>
                    <i className="bi bi-upload"></i>
                  {file ? 'Subir Archivo Excel' : 'Selecciona un archivo primero'}
                  </>
                )}
              </button>
          </div>
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div className={`status-message ${
            message.includes("Error") || message.includes("No se") ? "error" : "success"
          }`}>
            <i className={`bi ${
                message.includes("Error") || message.includes("No se")
                  ? "bi-exclamation-triangle"
                  : "bi-check-circle"
            }`}></i>
            <span>{message}</span>
          </div>
        )}

        {/* Filtros y búsqueda */}
        <div className="modern-card">
          <div className="card-header">
            <h3>
              <i className="bi bi-funnel"></i>
              🔍 Filtros y Consultas
            </h3>
            <p>⚡ Busque y filtre registros por nombre, ID, departamento o punto de acceso</p>
          </div>
          <div className="filters-section">
            <div className="filters-grid">
            <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar por nombre, ID o departamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

              <div className="filter-select-container">
              <select
                className="filter-select"
                value={selectedAccessPoint}
                onChange={handleFilterChange}
              >
                <option value="all">Todos los puntos de acceso</option>
                {Array.isArray(accessPoints) && accessPoints.map((point, index) => (
                  <option key={index} value={point}>
                    {point}
                  </option>
                ))}
              </select>
              </div>

              <div className="filter-checkbox">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  id="horasExtraAlcaldia"
                  checked={soloConHorasExtra}
                  onChange={(e) => setSoloConHorasExtra(e.target.checked)}
                />
                <label htmlFor="horasExtraAlcaldia" className="checkbox-text">
                  Solo mostrar registros con horas extra
              </label>
            </div>

            <div className="action-buttons">
                <button className="btn-modern btn-primary" onClick={refreshData}>
                <i className="bi bi-arrow-clockwise"></i>
                  🔄 Actualizar Datos
              </button>
                <button className="btn-modern btn-danger" onClick={clearDatabase}>
                <i className="bi bi-trash"></i>
                  🗑️ Limpiar Registros
              </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de registros */}
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID de Persona</th>
                    <th>Nombre</th>
                    <th>Departamento</th>
                    <th>Hora</th>
                    <th>Punto de Verificación</th>
                    {soloConHorasExtra && <th>Horas Trabajadas</th>}
                    {soloConHorasExtra && <th>Horas Extra</th>}
                  </tr>
                </thead>
                <tbody>
                  {searching ? (
                    <tr>
                      <td colSpan={soloConHorasExtra ? 7 : 5} className="loading-cell">
                        <div className="loading-spinner">
                          <span className="spinner"></span>
                          <span>Buscando...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedResults.length === 0 ? (
                    <tr>
                      <td colSpan={soloConHorasExtra ? 7 : 5} className="empty-state">
                        <div className="empty-icon">
                          <img 
                            src={logoAlcaldia} 
                            alt="Logo Alcaldía de Envigado" 
                            className="empty-logo"
                          />
                        </div>
                        <div className="empty-title">
                            {searchTerm.length === 0 && !soloConHorasExtra
                            ? "📊 Registros de Asistencia Municipal"
                              : soloConHorasExtra
                            ? "⏰ Filtro de Horas Extra"
                            : "🔍 Sin Resultados"}
                        </div>
                        <div className="empty-description">
                          {searchTerm.length === 0 && !soloConHorasExtra
                            ? "Importe un archivo Excel para visualizar los registros de asistencia del personal municipal"
                            : soloConHorasExtra
                            ? "No se encontraron registros con horas extra. Intente buscar por nombre o departamento."
                            : "No se encontraron resultados para su consulta"}
                        </div>
                        <div className="empty-actions">
                          <button 
                            onClick={() => document.getElementById('fileInput')?.click()}
                            className="btn-modern btn-primary"
                          >
                            <i className="bi bi-upload"></i>
                            📁 Importar Archivo
                          </button>
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="btn-modern btn-secondary"
                          >
                            <i className="bi bi-search"></i>
                            👀 Ver Todos los Registros
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedResults.map((resultado, index) => (
                      <tr key={index} className="data-row">
                        <td className="id-cell">{resultado.idPersona}</td>
                        <td className="name-cell">{resultado.nombre}</td>
                        <td className="dept-cell">
                          {resultado.departamento}
                        </td>
                        <td className="time-cell">{resultado.hora}</td>
                        <td className="point-cell">
                          {resultado.puntoVerificacion}
                        </td>
                        {soloConHorasExtra && (
                          <td className="hours-cell">
                            {resultado.horasTrabajadas ? decimalToHHMMSS(resultado.horasTrabajadas) : "N/A"}
                          </td>
                        )}
                        {soloConHorasExtra && (
                          <td className="extra-hours-cell">
                            {resultado.horasExtra ? decimalToHHMMSS(resultado.horasExtra) : "0:00:00"}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Estadísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">📊 {stats?.totalRecords || 0}</div>
                  <div className="stat-label">Total Registros</div>
                </div>
          <div className="stat-card">
            <div className="stat-number">👥 {stats?.uniqueEmployees || 0}</div>
            <div className="stat-label">Empleados Únicos</div>
                  </div>
          <div className="stat-card">
            <div className="stat-number">🏢 {stats?.uniqueDepartments || 0}</div>
            <div className="stat-label">Departamentos</div>
                </div>
          <div className="stat-card">
            <div className="stat-number">📁 {files.length}</div>
            <div className="stat-label">Archivos Cargados</div>
              </div>
            </div>
                </div>
                    </div>
  );
}

export default AlcaldiaEnvigadoPage;