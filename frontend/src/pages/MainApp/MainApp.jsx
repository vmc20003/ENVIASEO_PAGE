import React, { useState, useEffect, useCallback } from "react";
import "./MainApp.css";
import AlumbradoTableSimple from "../../components/AlumbradoTableSimple";
import { API_CONFIG, isDemoMode } from "../../config.js";
import { demoAlumbradoService } from "../../services/demoService.js";

const PAGE_SIZE = 50;

function MainApp({ onBack }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [message, setMessage] = useState("");

  // Función para cargar datos con paginación
  const fetchData = useCallback(async (page = 1, searchTerm = '') => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        const demoData = await demoAlumbradoService.getAllRecords();
        setData(demoData);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalRecords: demoData.length,
          limit: PAGE_SIZE,
          startIndex: 1,
          endIndex: demoData.length
        });
        setMessage(`Modo demo: ${demoData.length} registros cargados`);
        return;
      }

      const url = searchTerm.trim() 
        ? `${API_CONFIG.ALUMBRADO.BASE_URL}/all-records?getAll=true&search=${encodeURIComponent(searchTerm)}`
        : `${API_CONFIG.ALUMBRADO.BASE_URL}/all-records?page=${page}&limit=${PAGE_SIZE}`;

      const response = await fetch(url);
      const result = await response.json();

      if (response.ok) {
        const records = result.data || result.resultados || result;
        setData(records);

        if (searchTerm.trim()) {
          // Para búsquedas, mostrar todos los resultados sin paginación
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalRecords: records.length,
            limit: records.length,
            startIndex: 1,
            endIndex: records.length
          });
        } else {
          // Para datos normales, usar paginación del servidor
          setPagination({
            currentPage: result.pagination?.currentPage || page,
            totalPages: result.pagination?.totalPages || 1,
            totalRecords: result.pagination?.totalRecords || records.length,
            limit: result.pagination?.limit || PAGE_SIZE,
            startIndex: result.pagination?.startIndex || ((page - 1) * PAGE_SIZE) + 1,
            endIndex: result.pagination?.endIndex || Math.min(page * PAGE_SIZE, records.length)
          });
        }

        setMessage(`Datos cargados: ${records.length} registros`);
      } else {
        throw new Error(result.error || 'Error al cargar datos');
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setMessage(`Error: ${error.message}`);
      setData([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para manejar cambio de página
  const handlePageChange = useCallback((page, searchTerm = '') => {
    fetchData(page, searchTerm);
  }, [fetchData]);

  // Función para refrescar datos
  const handleRefresh = useCallback((searchTerm = '') => {
    fetchData(1, searchTerm);
  }, [fetchData]);

  // NO cargar datos iniciales automáticamente
  // useEffect(() => {
  //   fetchData();
  // }, [fetchData]);

  return (
    <div className="alumbrado-container">
      {/* Indicador de modo demo */}
      {isDemoMode() && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          animation: 'pulse 2s infinite'
        }}>
          🎭 MODO DEMO
        </div>
      )}
      
      {/* Header */}
      <div className="alumbrado-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>Sistema de Asistencia</h1>
            <span>ALUMBRADO PÚBLICO</span>
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
          <h1>🏢 Sistema de Gestión de Asistencia</h1>
          <h2>✨ Control integral de horarios, horas extra y reportes de personal para Alumbrado Público</h2>
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

        {/* Componente de tabla */}
        <AlumbradoTableSimple
          data={data}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onRefresh={handleRefresh}
          externalLoading={loading}
        />
      </div>
    </div>
  );
}

export default MainApp;