// ...existing code...
import React, { useState, useEffect, useRef } from "react";

import "./AlcaldiaEnvigadoPage.css";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { API_BASE_URL } from "../../config";

const PAGE_SIZE = 10;

function AlcaldiaEnvigadoPage({ onBack }) {
  const searchTimeoutRef = useRef();
  const [file, setFile] = useState(null);
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [resultados, setResultados] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [accessPoints, setAccessPoints] = useState([]);
  const [selectedAccessPoint, setSelectedAccessPoint] = useState("all");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleAccessPointChange = (e) => {
    const newAccessPoint = e.target.value;
    console.log("🔄 Cambiando filtro a:", newAccessPoint);
    handleFilterChange(newAccessPoint);
  };

  const loadDataWithFilter = async (accessPoint) => {
    setSearching(true);
    setMessage("Cargando datos filtrados...");

    try {
      const url =
        accessPoint === "all"
          ? `${API_BASE_URL}/all-records`
          : `${API_BASE_URL}/all-records?accessPoint=${encodeURIComponent(
              accessPoint
            )}`;

      console.log("🌐 URL de petición:", url);
      console.log("🎯 Filtro seleccionado:", accessPoint);

      const recordsResponse = await fetch(url);
      const records = await recordsResponse.json();

      if (records.length > 0) {
        console.log("📊 Registros recibidos:", records.length);
        console.log("🔍 Primer registro:", records[0]);
        setResultados(records);
        setMessage(
          `Datos cargados: ${records.length} registros disponibles${
            accessPoint !== "all" ? ` (filtrados por ${accessPoint})` : ""
          }`
        );
      } else {
        setResultados([]);
        setMessage(
          accessPoint !== "all"
            ? `No se encontraron registros para ${accessPoint}`
            : "No hay datos disponibles"
        );
      }
    } catch (error) {
      console.error("❌ Error cargando datos filtrados:", error);
      setMessage("Error cargando datos filtrados");
    } finally {
      setSearching(false);
    }
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

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Error desconocido");
      }

      // Cargar los datos procesados desde el servidor
      const recordsResponse = await fetch(`${API_BASE_URL}/all-records`);
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
      const response = await fetch(`${API_BASE_URL}/files`);
      const data = await response.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchAccessPoints = async () => {
    try {
      console.log("🔍 Obteniendo puntos de acceso...");
      const response = await fetch(`${API_BASE_URL}/access-points`);
      const data = await response.json();
      console.log("📊 Puntos de acceso recibidos:", data);
      setAccessPoints(data.accessPoints || []);
      console.log("✅ Puntos de acceso guardados:", data.accessPoints || []);
    } catch (error) {
      console.error("❌ Error fetching access points:", error);
      setAccessPoints([]);
    }
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
      const response = await fetch(`${API_BASE_URL}/clear`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage("Base de datos limpiada correctamente");
        setResultados([]);
        window.__registrosExcel = [];
        fetchStats();
        fetchFiles();
      } else {
        const data = await response.json();
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Error de conexión: ${error.message}`);
    }
  };

  const loadSavedData = async () => {
    setSearching(true);
    setMessage("Cargando datos guardados...");
    try {
      // Primero verificar si hay archivos subidos
      const filesResponse = await fetch(`${API_BASE_URL}/files`);
      const files = await filesResponse.json();

      // Luego cargar los registros con filtro
      const url =
        selectedAccessPoint === "all"
          ? `${API_BASE_URL}/all-records`
          : `${API_BASE_URL}/all-records?accessPoint=${encodeURIComponent(
              selectedAccessPoint
            )}`;

      console.log("🌐 URL de petición:", url);
      console.log("🎯 Filtro seleccionado:", selectedAccessPoint);

      const recordsResponse = await fetch(url);
      const records = await recordsResponse.json();

      if (records.length > 0) {
        // Hay datos guardados, cargarlos
        setResultados(records);

        // Solo actualizar window.__registrosExcel si no hay filtro activo
        if (selectedAccessPoint === "all") {
          window.__registrosExcel = records;
        }

        setMessage(
          `Datos cargados: ${records.length} registros disponibles${
            selectedAccessPoint !== "all"
              ? ` (filtrados por ${selectedAccessPoint})`
              : ""
          }`
        );
      } else if (files.length > 0) {
        // Hay archivos pero no hay datos procesados
        setMessage(
          `Se encontraron ${files.length} archivo(s) pero no están procesados. Sube el archivo nuevamente para procesarlo.`
        );
        setResultados([]);
        if (selectedAccessPoint === "all") {
          window.__registrosExcel = [];
        }
      } else {
        // No hay archivos ni datos
        setMessage(
          "No hay datos guardados. Sube un archivo Excel para comenzar."
        );
        setResultados([]);
        if (selectedAccessPoint === "all") {
          window.__registrosExcel = [];
        }
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
      setMessage("Error cargando datos guardados");
    } finally {
      setSearching(false);
    }
  };

  const refreshData = async () => {
    setSearching(true);
    setMessage("Refrescando datos...");
    try {
      const response = await fetch(`${API_BASE_URL}/all-records`);
      const data = await response.json();
      setResultados(data);
      window.__registrosExcel = data;
      setMessage(`Analizando ${data.length} registros...`);
    } catch (error) {
      setMessage(`Error refrescando datos: ${error.message}`);
    } finally {
      setSearching(false);
    }
  };

  const processUploadedFiles = async () => {
    setSearching(true);
    setMessage("Procesando archivos subidos...");
    try {
      // Obtener lista de archivos
      const filesResponse = await fetch(`${API_BASE_URL}/files`);
      const files = await filesResponse.json();

      if (files.length === 0) {
        setMessage("No hay archivos para procesar");
        return;
      }

      // Procesar el archivo más reciente
      const latestFile = files[files.length - 1];
      setMessage(`Procesando archivo: ${latestFile.name}...`);

      // Llamar al endpoint de reprocesamiento
      const reprocessResponse = await fetch(
        `${API_BASE_URL}/reprocess/${latestFile.name}`,
        {
          method: "POST",
        }
      );

      const reprocessData = await reprocessResponse.json();

      if (!reprocessResponse.ok) {
        throw new Error(
          reprocessData.error || reprocessData.details || "Error desconocido"
        );
      }

      // Cargar los datos procesados
      const recordsResponse = await fetch(`${API_BASE_URL}/all-records`);
      const records = await recordsResponse.json();

      setResultados(records);
      window.__registrosExcel = records;
      setMessage(
        `Archivo procesado: ${reprocessData.recordsProcessed} registros cargados. Total en BD: ${reprocessData.totalRecords}`
      );
      fetchStats();
      fetchFiles();
    } catch (error) {
      console.error("Error processing files:", error);
      setMessage(`Error procesando archivos: ${error.message}`);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    console.log("🚀 Iniciando carga de datos...");
    fetchFiles();
    fetchStats();
    fetchAccessPoints();
    // Cargar datos automáticamente al entrar a la página
    loadSavedData();
  }, []);

  // Función directa para manejar búsqueda
  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(1);

    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Aplicar búsqueda con debounce
    searchTimeoutRef.current = setTimeout(() => {
      const term = value.toLowerCase().trim();
      let baseData = window.__registrosExcel || [];

      // Si hay filtro activo, buscar solo en los datos filtrados
      if (selectedAccessPoint !== "all") {
        baseData = baseData.filter(
          (r) =>
            r.puntoVerificacion &&
            r.puntoVerificacion.includes(selectedAccessPoint)
        );
      }

      if (term.length > 0) {
        setSearching(true);
        setMessage("Buscando...");

        const filtered = baseData.filter(
          (r) =>
            (r.idPersona &&
              r.idPersona.toString().toLowerCase().includes(term)) ||
            (r.nombre && r.nombre.toLowerCase().includes(term)) ||
            (r.departamento && r.departamento.toLowerCase().includes(term)) ||
            (r.hora && r.hora.toLowerCase().includes(term)) ||
            (r.puntoVerificacion &&
              r.puntoVerificacion.toLowerCase().includes(term))
        );

        setResultados(filtered);
        setMessage(
          filtered.length > 0
            ? `${filtered.length} resultados encontrados`
            : "No se encontraron resultados"
        );
        setSearching(false);
      } else {
        // Si no hay término de búsqueda, restaurar datos según filtro
        if (selectedAccessPoint === "all") {
          setResultados(window.__registrosExcel || []);
          setMessage("");
        } else {
          // Mantener filtro activo
          const filtered = baseData.filter(
            (r) =>
              r.puntoVerificacion &&
              r.puntoVerificacion.includes(selectedAccessPoint)
          );
          setResultados(filtered);
          setMessage(
            filtered.length > 0
              ? `${filtered.length} registros filtrados por ${selectedAccessPoint}`
              : "No se encontraron registros para este punto de acceso"
          );
        }
        setSearching(false);
      }
    }, 150); // Debounce más rápido
  };

  // Función para manejar cambio de filtro
  const handleFilterChange = (newAccessPoint) => {
    setSelectedAccessPoint(newAccessPoint);
    setSearchTerm(""); // Limpiar búsqueda
    setPage(1);

    if (newAccessPoint === "all") {
      setResultados(window.__registrosExcel || []);
      setMessage("");
    } else {
      const baseData = window.__registrosExcel || [];
      const filtered = baseData.filter(
        (r) =>
          r.puntoVerificacion && r.puntoVerificacion.includes(newAccessPoint)
      );
      setResultados(filtered);
      setMessage(
        filtered.length > 0
          ? `${filtered.length} registros filtrados por ${newAccessPoint}`
          : "No se encontraron registros para este punto de acceso"
      );
    }
  };

  // Paginación
  const totalPages = Math.ceil(resultados.length / PAGE_SIZE);
  const paginatedResults = Array.isArray(resultados)
    ? resultados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : [];

  // Debug: mostrar estado actual
  console.log("🎯 Estado actual - selectedAccessPoint:", selectedAccessPoint);
  console.log("📊 Estado actual - resultados.length:", resultados.length);
  console.log(
    "📄 Estado actual - paginatedResults.length:",
    paginatedResults.length
  );

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
    const visible = 5;
    let start = Math.max(1, page - Math.floor(visible / 2));
    let end = start + visible - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - visible + 1);
    }
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return (
      <div className="d-flex justify-content-center mt-4">
        <nav>
          <ul className="pagination">
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                &laquo;
              </button>
            </li>
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                &lt;
              </button>
            </li>
            {pages.map((i) => (
              <li key={i} className={`page-item ${page === i ? "active" : ""}`}>
                <button className="page-link" onClick={() => setPage(i)}>
                  {i}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${page === totalPages ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                &gt;
              </button>
            </li>
            <li
              className={`page-item ${page === totalPages ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setPage(totalPages)}
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
      {/* Header con logo y botón de volver */}
      <div className="alcaldia-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-placeholder">
              <i className="bi bi-building"></i>
              <span>Alcaldía de Envigado</span>
            </div>
          </div>
          <button onClick={onBack} className="btn-volver">
            <i className="bi bi-arrow-left"></i>
            Volver al Panel
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="alcaldia-main">
        <div className="main-card">
          {/* Título principal */}
          <div className="title-section">
            <h1>Sistema de Asistencia</h1>
            <h2>Alcaldía de Envigado</h2>
          </div>

          {/* Sección de carga de archivos */}
          <div className="upload-section">
            <div className="upload-container">
              <div className="file-input-wrapper">
                <input
                  type="file"
                  className="file-input"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={loading}
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="file-label">
                  <i className="bi bi-cloud-upload"></i>
                  <span>{file ? file.name : "Seleccionar archivo Excel"}</span>
                </label>
              </div>
              <button
                className="btn-upload"
                onClick={handleUpload}
                disabled={!file || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Subiendo...
                  </>
                ) : (
                  <>
                    <i className="bi bi-upload"></i>
                    Subir Archivo
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mensaje de estado */}
          {message && (
            <div
              className={`message ${
                message.includes("Error") || message.includes("No se")
                  ? "error"
                  : "success"
              }`}
            >
              <i
                className={`bi ${
                  message.includes("Error") || message.includes("No se")
                    ? "bi-exclamation-triangle"
                    : "bi-check-circle"
                }`}
              ></i>
              {message}
            </div>
          )}

          {/* Barra de búsqueda y acciones */}
          <div className="search-section">
            <div className="search-container">
              <div className="search-input-wrapper">
                <i className="bi bi-search search-icon"></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar por ID, nombre, departamento, hora o punto de verificación..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  disabled={searching}
                />
              </div>
              <div className="action-buttons">
                <button
                  className="btn-refresh"
                  onClick={refreshData}
                  disabled={searching}
                  title="Refrescar datos"
                >
                  <i className="bi bi-arrow-clockwise"></i>
                  Refrescar
                </button>
                <button
                  className="btn-process"
                  onClick={processUploadedFiles}
                  disabled={searching}
                  title="Procesar archivos subidos"
                >
                  <i className="bi bi-gear"></i>
                  Procesar Archivos
                </button>
                <button
                  className="btn-clear"
                  onClick={clearDatabase}
                  title="Limpiar base de datos"
                >
                  <i className="bi bi-trash"></i>
                  Limpiar BD
                </button>
              </div>

              {/* Filtro de Puntos de Acceso */}
              <div className="filter-section">
                <div className="filter-container">
                  <label htmlFor="accessPointFilter" className="filter-label">
                    <i className="bi bi-funnel"></i>
                    Filtrar por Punto de Acceso:
                  </label>
                  <select
                    id="accessPointFilter"
                    className="filter-select"
                    value={selectedAccessPoint}
                    onChange={handleAccessPointChange}
                    disabled={searching}
                  >
                    <option value="all">Todos los puntos de acceso</option>
                    {accessPoints.map((point, index) => (
                      <option key={index} value={point}>
                        {point}
                      </option>
                    ))}
                    {/* Debug: mostrar cantidad de puntos */}
                    {accessPoints.length === 0 && (
                      <option disabled>
                        No hay puntos de acceso disponibles
                      </option>
                    )}
                  </select>
                  {selectedAccessPoint !== "all" && (
                    <button
                      className="btn-clear-filter"
                      onClick={() => handleFilterChange("all")}
                      title="Limpiar filtro"
                    >
                      <i className="bi bi-x-circle"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal con tabla y sidebar */}
          <div className="content-section">
            {/* Tabla principal */}
            <div className="table-section">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID de Persona</th>
                      <th>Nombre</th>
                      <th>Departamento</th>
                      <th>Hora</th>
                      <th>Punto de Verificación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searching ? (
                      <tr>
                        <td colSpan={5} className="loading-cell">
                          <div className="loading-spinner">
                            <span className="spinner"></span>
                            <span>Buscando...</span>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedResults.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-cell">
                          <div className="empty-state">
                            <i className="bi bi-inbox"></i>
                            <span>
                              {searchTerm.length === 0
                                ? "No hay datos cargados. Sube un archivo Excel para comenzar."
                                : "No se encontraron resultados"}
                            </span>
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
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {renderPagination(page, totalPages, setPage)}
            </div>

            {/* Sidebar con estadísticas y archivos */}
            <div className="sidebar">
              {/* Estadísticas */}
              <div className="stats-card">
                <div className="card-header">
                  <i className="bi bi-graph-up"></i>
                  <h3>Estadísticas</h3>
                </div>
                <div className="stats-content">
                  <div className="stat-item">
                    <div className="stat-number">
                      {stats?.totalRecords || 0}
                    </div>
                    <div className="stat-label">Total Registros</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">
                      {stats?.uniquePersons || 0}
                    </div>
                    <div className="stat-label">Personas Únicas</div>
                  </div>
                </div>
              </div>

              {/* Archivos subidos */}
              <div className="files-card">
                <div className="card-header">
                  <i className="bi bi-folder"></i>
                  <h3>Archivos Subidos</h3>
                </div>
                <div className="files-content">
                  {files.length === 0 ? (
                    <div className="empty-files">
                      <i className="bi bi-folder-x"></i>
                      <span>No hay archivos subidos</span>
                    </div>
                  ) : (
                    <div className="files-list">
                      {files.map((file, index) => (
                        <div key={index} className="file-item">
                          <div className="file-info">
                            <span className="file-name">
                              {file.name.length > 25
                                ? file.name.substring(0, 25) + "..."
                                : file.name}
                            </span>
                            <span className="file-date">
                              {new Date(file.mtime).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="file-actions">
                            <button
                              className="btn-file-action"
                              onClick={() =>
                                window.open(
                                  `${API_BASE_URL}/files/${file.name}`,
                                  "_blank"
                                )
                              }
                              title="Ver archivo"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button
                              className="btn-file-action delete"
                              onClick={async () => {
                                if (
                                  window.confirm(
                                    "¿Estás seguro de que quieres eliminar este archivo?"
                                  )
                                ) {
                                  try {
                                    const response = await fetch(
                                      `${API_BASE_URL}/files/${file.name}`,
                                      { method: "DELETE" }
                                    );
                                    if (response.ok) {
                                      fetchFiles();
                                    }
                                  } catch (error) {
                                    console.error(
                                      "Error deleting file:",
                                      error
                                    );
                                  }
                                }
                              }}
                              title="Eliminar archivo"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Botón de exportar */}
              {resultados.length > 0 && (
                <button className="btn-export" onClick={exportarExcel}>
                  <i className="bi bi-file-earmark-excel"></i>
                  Exportar a Excel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlcaldiaEnvigadoPage;
