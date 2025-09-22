import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./EnviaseoControlAccesoPage.css";
import { API_CONFIG } from "../../config.js";
import logoEnviaseo from "../../assets/logo_enviaseo_simple.svg";

function EnviaseoControlAccesoPage({ onBack }) {
  const [currentView, setCurrentView] = useState("main");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [itemsPerPage] = useState(20); // Mostrar 20 registros por página
  const [files, setFiles] = useState([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [soloConHorasExtra, setSoloConHorasExtra] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      // Aquí se procesaría el archivo
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setUploadedFile(droppedFile);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleProcessFile = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      
      const response = await fetch(`${API_CONFIG.ENVIASEO_CONTROL_ACCESO.BASE_URL}${API_CONFIG.ENVIASEO_CONTROL_ACCESO.ENDPOINTS.UPLOAD}`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Cargar datos después del procesamiento exitoso
        await loadData();
        setCurrentView("data");
      } else {
        throw new Error(result.error || 'Error al procesar el archivo');
      }
      
    } catch (error) {
      console.error('Error al procesar archivo:', error);
      alert(`Error al procesar el archivo: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    setCurrentPage(1);
    // Cargar datos con búsqueda
    loadData(1, searchValue);
  };

  // Debounce del término de búsqueda
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      loadData(1, searchTerm);
    }, 350);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Cargar datos desde el backend con paginación
  const loadData = async (page = 1, search = '') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        search: search
      });
      
      const response = await fetch(`${API_CONFIG.ENVIASEO_CONTROL_ACCESO.BASE_URL}${API_CONFIG.ENVIASEO_CONTROL_ACCESO.ENDPOINTS.DATA}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setFilteredData(result.data);
        setTotalPages(result.pagination.totalPages);
        setCurrentPage(result.pagination.currentPage);
        setTotalRecords(result.pagination.totalRecords);
      } else {
        throw new Error(result.error || 'Error al cargar los datos');
      }
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert(`Error al cargar los datos: ${error.message}`);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_CONFIG.ENVIASEO_CONTROL_ACCESO.BASE_URL}${API_CONFIG.ENVIASEO_CONTROL_ACCESO.ENDPOINTS.FILES}`);
      if (response.ok) {
        const result = await response.json();
        // Filtrar solo archivos de Enviaseo Control de Acceso
        const enviaseoFiles = (result.data || []).filter(file => 
          file.type === 'enviaseo-control-acceso' || 
          !file.type || // Si no tiene tipo, asumir que es de Enviaseo
          file.filename?.includes('enviaseo') ||
          file.originalName?.includes('enviaseo')
        );
        setFiles(enviaseoFiles);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (currentView === "data") {
      loadData(1, searchTerm);
    }
    fetchFiles();
  }, [currentView]);

  // Funciones de paginación
  const startIndex = useMemo(() => (currentPage - 1) * itemsPerPage, [currentPage, itemsPerPage]);
  const endIndex = useMemo(() => startIndex + itemsPerPage, [startIndex, itemsPerPage]);
  const currentData = useMemo(() => filteredData, [filteredData]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadData(page, searchTerm);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      loadData(newPage, searchTerm);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      loadData(newPage, searchTerm);
    }
  };

  const renderMainView = () => (
    <>
      {/* Sección de carga de archivos */}
      <div className="modern-card">
        <div className="card-header">
          <h3>
            <i className="bi bi-cloud-upload"></i>
            📊 Carga de Datos de Control de Acceso
          </h3>
          <p>🌱 Importe archivos Excel (.xlsx, .xls) con registros de control de acceso para procesamiento automático</p>
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
              <i className={`${uploadedFile ? 'bi bi-check-circle-fill' : 'bi bi-cloud-upload'}`}></i>
            </div>
            
            <div className="upload-text">
              {uploadedFile ? '✅ Archivo Seleccionado' : '📊 Seleccionar Archivo de Datos'}
            </div>
            
            <div className="upload-subtitle">
              {uploadedFile ? 'Haz clic para cambiar el archivo' : 'Arrastra tu archivo Excel aquí o haz clic para seleccionar'}
            </div>
            
            <div className="upload-formats">
              {uploadedFile ? `Archivo: ${uploadedFile.name}` : 'Formatos compatibles: .xlsx, .xls'}
            </div>
            
            <input
              type="file"
              className="file-input"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isProcessing}
              id="fileInput"
            />
          </div>
          
          {/* Botón de procesamiento */}
          <button
            className={`upload-button ${!uploadedFile || isProcessing ? 'disabled' : ''}`}
            onClick={handleProcessFile}
            disabled={!uploadedFile || isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="spinner"></span>
                Procesando archivo...
              </>
            ) : (
              <>
                <i className="bi bi-play-circle"></i>
                {uploadedFile ? 'Procesar Archivo Excel' : 'Selecciona un archivo primero'}
              </>
            )}
            </button>
          </div>
        </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">📊 {totalRecords || 0}</div>
          <div className="stat-label">Total Registros</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">👥 {data.length || 0}</div>
          <div className="stat-label">Registros Cargados</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">📁 {files.length || 0}</div>
          <div className="stat-label">Archivos Subidos</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">🔍 {filteredData.length || 0}</div>
          <div className="stat-label">Resultados Filtrados</div>
        </div>
      </div>

      {/* Archivos subidos */}
      <div className="modern-card">
        <div className="card-header">
          <h3>
            <i className="bi bi-folder"></i>
            📁 Archivos Subidos
          </h3>
          <p>🗂️ Lista de archivos Excel procesados en el sistema</p>
        </div>
        <div className="upload-section">
          {!Array.isArray(files) || files.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <img 
                  src={logoEnviaseo} 
                  alt="Logo Enviaseo" 
                  className="empty-logo"
                />
              </div>
              <div className="empty-title">
                📁 Sin Archivos Cargados
              </div>
              <div className="empty-description">
                Importe un archivo Excel para visualizar los registros de control de acceso
              </div>
              <div className="empty-actions">
                <button 
                  onClick={() => document.getElementById('fileInput')?.click()}
                  className="btn-modern btn-primary"
                >
                  <i className="bi bi-upload"></i>
                  📁 Importar Archivo
                </button>
              </div>
            </div>
          ) : (
            <div className="files-list">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <div className="file-icon">
                      <i className="bi bi-file-earmark-excel"></i>
                    </div>
                    <div className="file-details">
                      <h4 className="file-name">
                        {(file.originalName || file.filename || file.name) && (file.originalName || file.filename || file.name).length > 30
                          ? (file.originalName || file.filename || file.name).substring(0, 30) + "..."
                          : (file.originalName || file.filename || file.name) || "Archivo sin nombre"}
                      </h4>
                      <p className="file-date">
                        <i className="bi bi-calendar3"></i>
                        {file.uploadDate ? new Date(file.uploadDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : "Fecha no disponible"}
                      </p>
                      <p className="file-size">
                        <i className="bi bi-hdd"></i>
                        {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Tamaño no disponible"}
                      </p>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button
                      className="btn-action btn-view"
                      onClick={() => {
                        const fileUrl = `${API_CONFIG.ENVIASEO_CONTROL_ACCESO.BASE_URL}/files/${file.filename || file.name}`;
                        window.open(fileUrl, "_blank");
                      }}
                      title="Ver archivo"
                    >
                      <i className="bi bi-eye"></i>
                      <span>Ver</span>
                    </button>
                    <button
                      className="btn-action btn-download"
                      onClick={() => {
                        const fileUrl = `${API_CONFIG.ENVIASEO_CONTROL_ACCESO.BASE_URL}/files/${file.filename || file.name}`;
                        const link = document.createElement('a');
                        link.href = fileUrl;
                        link.download = file.originalName || file.filename || file.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      title="Descargar archivo"
                    >
                      <i className="bi bi-download"></i>
                      <span>Descargar</span>
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={async () => {
                        if (
                          window.confirm(
                            "¿Estás seguro de que quieres eliminar este archivo? Esta acción no se puede deshacer."
                          )
                        ) {
                          try {
                            const response = await fetch(
                              `${API_CONFIG.ENVIASEO_CONTROL_ACCESO.BASE_URL}/files/${file.filename || file.name}`,
                              { method: "DELETE" }
                            );
                            if (response.ok) {
                              await fetchFiles();
                              alert("Archivo eliminado exitosamente");
                            } else {
                              alert("Error al eliminar el archivo");
                            }
                          } catch (error) {
                            console.error("Error deleting file:", error);
                            alert("Error al eliminar el archivo");
                          }
                        }
                      }}
                      title="Eliminar archivo"
                    >
                      <i className="bi bi-trash"></i>
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderDataView = () => (
    <div>
      {/* Filtros y búsqueda */}
      <div className="modern-card">
        <div className="card-header">
          <h3>
            <i className="bi bi-funnel"></i>
            🔍 Filtros y Consultas
          </h3>
          <p>🌱 Busque y filtre registros por nombre, grupo, punto de acceso o ID</p>
        </div>
        <div className="filters-section">
          <div className="filters-grid">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Buscar por nombre, grupo, punto de acceso, ID o tarjeta..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            <div className="action-buttons">
              <button className="btn-modern btn-secondary" onClick={() => setCurrentView("main")}>
                <i className="bi bi-arrow-left"></i>
                🔙 Volver al Panel
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
                  <th>Nombre</th>
                  <th>Grupo</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Tipo de Asistencia</th>
                  <th>Fecha y Hora Completa</th>
                  <th>Punto de Acceso</th>
                  <th>Temperatura</th>
                  <th>Máscara</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="font-medium">{item.nombreCompleto || "N/A"}</td>
                      <td>{item.grupoPersonas || "N/A"}</td>
                      <td>{item.fecha || "N/A"}</td>
                      <td>
                        {item.hora ? (
                          <div className="text-center">
                            <div className="font-mono text-sm">{item.hora}</div>
                            <div className="text-xs text-gray-500">({item.puntoAcceso || "N/A"})</div>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>
                        {item.tipoAsistencia ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {item.tipoAsistencia}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="font-mono text-sm">{item.tiempo || "N/A"}</td>
                      <td>{item.puntoAcceso || "N/A"}</td>
                      <td>
                        {item.temperatura ? (
                          <div className="text-center">
                            <div className="font-mono text-sm">{item.temperatura}</div>
                            <div className="text-xs text-gray-500">({item.estadoTemperatura || "N/A"})</div>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="text-center">
                        {item.usandoMascara ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Sí</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">No</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="empty-state">
                      <div className="empty-icon">
                        <img 
                          src={logoEnviaseo} 
                          alt="Logo Enviaseo" 
                          className="empty-logo"
                        />
                      </div>
                      <div className="empty-title">
                        {searchTerm.length === 0
                          ? "📊 Registros de Control de Acceso"
                          : "🔍 Sin Resultados"}
                      </div>
                      <div className="empty-description">
                        {searchTerm.length === 0
                          ? "Importe un archivo Excel para visualizar los registros de control de acceso del personal"
                          : "No se encontraron resultados para su consulta"}
                      </div>
                      <div className="empty-actions">
                        <button 
                          onClick={() => setCurrentView("main")}
                          className="btn-modern btn-primary"
                        >
                          <i className="bi bi-upload"></i>
                          📁 Importar Archivo
                        </button>
                        <button 
                          onClick={() => handleSearch("")}
                          className="btn-modern btn-secondary"
                        >
                          <i className="bi bi-search"></i>
                          👀 Ver Todos los Registros
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
        </table>
      </div>
      
      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            <span className="text-sm text-gray-600">
              Mostrando {startIndex + 1} - {Math.min(endIndex, totalRecords)} de {totalRecords} registros
            </span>
          </div>
          
          <div className="pagination">
            <button 
              className="page-link" 
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <i className="bi bi-chevron-left"></i>
              Anterior
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              // Mostrar solo algunas páginas alrededor de la actual
              if (
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 2 && page <= currentPage + 2)
              ) {
                return (
                  <button
                    key={page}
                    className={`page-link ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === currentPage - 3 || 
                page === currentPage + 3
              ) {
                return <span key={page} className="page-link disabled">...</span>;
              }
              return null;
            })}
            
            <button 
              className="page-link" 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="enviaseo-container">
      {/* Header moderno */}
      <div className="enviaseo-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>Sistema de Control</h1>
            <span>ENVIASEO CONTROL DE ACCESO</span>
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
          <h1>🌱 Sistema de Gestión de Control de Acceso</h1>
          <h2>✨ Gestión y control de acceso para personal de Enviaseo E.S.P.</h2>
        </div>
        
        {currentView === "main" ? renderMainView() : renderDataView()}
      </div>
    </div>
  );
}

export default EnviaseoControlAccesoPage;
