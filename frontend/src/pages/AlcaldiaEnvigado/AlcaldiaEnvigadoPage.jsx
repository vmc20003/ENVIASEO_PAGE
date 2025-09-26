import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./AlcaldiaEnvigadoPage.css";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { API_CONFIG } from "../../config.js";
import logoAlcaldia from "../../assets/logo_alcaldia_envigado_limpio.svg";

const PAGE_SIZE = 50;

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

  // Funciones para modales interactivos
  const showConfirmModal = (title, message, onConfirm, onCancel = null) => {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease-out;
    `;

    // Crear modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 15px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      overflow: hidden;
      animation: slideIn 0.3s ease-out;
    `;

    // Agregar animaciones CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideIn {
        from { transform: translateY(-50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    modal.innerHTML = `
      <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 25px; text-align: center; color: white;">
        <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
        <h3 style="margin: 0; font-size: 20px; font-weight: 600;">${title}</h3>
      </div>
      <div style="padding: 30px 25px 25px 25px;">
        <p style="margin: 0 0 25px 0; color: #495057; line-height: 1.6; font-size: 16px; text-align: center;">
          ${message}
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button id="confirmBtn" style="
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
          ">
            ✅ Confirmar
          </button>
          <button id="cancelBtn" style="
            background: #6c757d;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
          ">
            ❌ Cancelar
          </button>
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Event listeners
    const confirmBtn = modal.querySelector('#confirmBtn');
    const cancelBtn = modal.querySelector('#cancelBtn');

    const closeModal = () => {
      overlay.style.animation = 'fadeIn 0.3s ease-out reverse';
      modal.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => {
        document.body.removeChild(overlay);
        document.head.removeChild(style);
      }, 300);
    };

    confirmBtn.addEventListener('click', () => {
      closeModal();
      if (onConfirm) onConfirm();
    });

    cancelBtn.addEventListener('click', () => {
      closeModal();
      if (onCancel) onCancel();
    });

    // Cerrar al hacer clic en el overlay
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
        if (onCancel) onCancel();
      }
    });

    // Hover effects
    confirmBtn.addEventListener('mouseenter', () => {
      confirmBtn.style.transform = 'translateY(-2px)';
      confirmBtn.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.4)';
    });
    confirmBtn.addEventListener('mouseleave', () => {
      confirmBtn.style.transform = 'translateY(0)';
      confirmBtn.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.3)';
    });

    cancelBtn.addEventListener('mouseenter', () => {
      cancelBtn.style.transform = 'translateY(-2px)';
      cancelBtn.style.boxShadow = '0 6px 20px rgba(108, 117, 125, 0.4)';
    });
    cancelBtn.addEventListener('mouseleave', () => {
      cancelBtn.style.transform = 'translateY(0)';
      cancelBtn.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.3)';
    });
  };

  const showInfoModal = (title, message, type = 'info') => {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease-out;
    `;

    // Crear modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 15px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      overflow: hidden;
      animation: slideIn 0.3s ease-out;
    `;

    // Agregar animaciones CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideIn {
        from { transform: translateY(-50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    const colors = {
      success: { bg: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', icon: '✅' },
      error: { bg: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)', icon: '❌' },
      info: { bg: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)', icon: 'ℹ️' },
      warning: { bg: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)', icon: '⚠️' }
    };

    const selectedColor = colors[type] || colors.info;

    modal.innerHTML = `
      <div style="background: ${selectedColor.bg}; padding: 25px; text-align: center; color: white;">
        <div style="font-size: 48px; margin-bottom: 10px;">${selectedColor.icon}</div>
        <h3 style="margin: 0; font-size: 20px; font-weight: 600;">${title}</h3>
      </div>
      <div style="padding: 30px 25px 25px 25px;">
        <p style="margin: 0 0 25px 0; color: #495057; line-height: 1.6; font-size: 16px; text-align: center;">
          ${message}
        </p>
        <div style="display: flex; justify-content: center;">
          <button id="closeBtn" style="
            background: ${selectedColor.bg};
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          ">
            Cerrar
          </button>
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Event listeners
    const closeBtn = modal.querySelector('#closeBtn');

    const closeModal = () => {
      overlay.style.animation = 'fadeIn 0.3s ease-out reverse';
      modal.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => {
        document.body.removeChild(overlay);
        document.head.removeChild(style);
      }, 300);
    };

    closeBtn.addEventListener('click', closeModal);

    // Cerrar al hacer clic en el overlay
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });

    // Hover effect
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.transform = 'translateY(-2px)';
      closeBtn.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.transform = 'translateY(0)';
      closeBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    });
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

      // Mostrar mensaje de éxito con modal interactivo
      showInfoModal(
        "✅ Archivo Procesado Exitosamente",
        `<div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 15px 0; border-left: 4px solid #28a745;">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <div style="background: #28a745; color: white; padding: 8px 12px; border-radius: 50%; margin-right: 12px; font-size: 18px;">📊</div>
            <div>
              <h4 style="margin: 0; color: #28a745; font-size: 18px;">Procesamiento Completado</h4>
              <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 14px;">Datos cargados correctamente en la base de datos</p>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="font-size: 24px; font-weight: bold; color: #17a2b8; margin-bottom: 5px;">${data.recordsProcessed}</div>
              <div style="font-size: 12px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Registros Nuevos</div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="font-size: 24px; font-weight: bold; color: #28a745; margin-bottom: 5px;">${data.totalRecords}</div>
              <div style="font-size: 12px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Total en BD</div>
            </div>
          </div>
        </div>`,
        'success'
      );
      
      setMessage(`✅ Archivo procesado: ${data.recordsProcessed} registros nuevos. Total: ${data.totalRecords}`);
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
      let filesArray = data.files || data;
      
      if (Array.isArray(filesArray)) {
        // Obtener información de registros para cada archivo
        const filesWithRecords = await Promise.all(
          filesArray.map(async (file) => {
            try {
              // Obtener registros por archivo desde el backend
              const recordsResponse = await fetch(`${API_CONFIG.ALCALDIA.BASE_URL}/records-by-file/${encodeURIComponent(file.name)}`);
              if (recordsResponse.ok) {
                const recordsData = await recordsResponse.json();
                return {
                  ...file,
                  recordCount: recordsData.count || recordsData.length || 0
                };
              }
              return {
                ...file,
                recordCount: 0
              };
            } catch (error) {
              console.error(`Error fetching records for file ${file.name}:`, error);
              return {
                ...file,
                recordCount: 0
              };
            }
          })
        );
        setFiles(filesWithRecords);
      } else {
        setFiles([]);
      }
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
    showConfirmModal(
      "🗑️ Limpiar Base de Datos",
      "Esta acción eliminará <strong>TODOS</strong> los registros de la base de datos de forma permanente.<br><br>⚠️ <strong>Esta acción no se puede deshacer.</strong>",
      async () => {
        try {
          const response = await fetch(`${API_CONFIG.ALCALDIA.BASE_URL}/clear-db`, {
            method: "DELETE",
          });

          if (response.ok) {
            setMessage("✅ Base de datos limpiada correctamente");
            setResultados([]);
            setHorariosCalculados([]);
            setEstadisticasHorarios(null);
            fetchStats();
          } else {
            const data = await response.json();
            setMessage(`❌ Error: ${data.error}`);
          }
        } catch (error) {
          setMessage(`❌ Error de conexión: ${error.message}`);
        }
      },
      () => {
        console.log("Operación cancelada por el usuario");
      }
    );
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
    setMessage("🔄 Refrescando datos...");
    
    try {
      await loadSavedData();
      
      showInfoModal(
        "✅ Datos Actualizados",
        `Los datos se han actualizado correctamente.<br><br><strong>${resultados.length}</strong> registros cargados en la base de datos.`,
        'success'
      );
      setMessage("✅ Datos actualizados correctamente");
    } catch (error) {
      showInfoModal(
        "❌ Error al Actualizar",
        `No se pudieron actualizar los datos.<br><br>Error: ${error.message}`,
        'error'
      );
      setMessage(`❌ Error refrescando datos: ${error.message}`);
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
              onClick={() => document.getElementById('fileInputAlcaldia').click()}
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
                id="fileInputAlcaldia"
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
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '15px',
                marginBottom: '10px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '50%',
                  fontSize: '24px',
                  boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)'
                }}>
                  🔍
                </div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '24px', 
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Filtros y Consultas
                </h3>
              </div>
              <p style={{ 
                margin: 0, 
                color: '#6b7280', 
                fontSize: '16px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '18px' }}>⚡</span>
                Busque y filtre registros por nombre, ID, departamento o punto de acceso
              </p>
            </div>
          </div>
          
          <div className="filters-section">
            <div className="filters-grid">
              <div className="search-container">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nombre, ID o departamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="filter-select-container">
                <select
                  className="form-control"
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
                  className="form-control"
                  id="horasExtraAlcaldia"
                  checked={soloConHorasExtra}
                  onChange={(e) => setSoloConHorasExtra(e.target.checked)}
                />
                <label htmlFor="horasExtraAlcaldia" className="checkbox-text">
                  Solo mostrar registros con horas extra
                </label>
              </div>

              <div className="action-buttons">
                <button className="btn btn-primary" onClick={refreshData}>
                  <i className="bi bi-arrow-clockwise"></i>
                  Actualizar Datos
                </button>
                <button className="btn btn-secondary" onClick={clearDatabase}>
                  <i className="bi bi-trash"></i>
                  Limpiar Registros
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de registros */}
        <div className="modern-card">
          <div className="card-header">
            <h3>
              <i className="bi bi-table"></i>
              📊 Registros de Asistencia
            </h3>
            <p>Lista de todos los registros de asistencia del personal municipal</p>
          </div>
          
          <div className="table-container">
            <table className="table">
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
                    <td colSpan={soloConHorasExtra ? 7 : 5} className="text-center">
                      <div className="d-flex align-items-center justify-content-center gap-3">
                        <span className="spinner"></span>
                        <span>Buscando...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedResults.length === 0 ? (
                  <tr>
                    <td colSpan={soloConHorasExtra ? 7 : 5} className="text-center">
                      <div className="empty-state">
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
                        <div className="empty-actions d-flex gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              document.getElementById('fileInputAlcaldia').click();
                            }}
                            className="btn btn-primary"
                          >
                            <i className="bi bi-upload"></i>
                            Importar Archivo
                          </button>
                          <button 
                            onClick={() => setSearchTerm('')}
                            className="btn btn-secondary"
                          >
                            <i className="bi bi-search"></i>
                            Ver Todos los Registros
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedResults.map((resultado, index) => (
                    <tr key={index}>
                      <td>{resultado.idPersona}</td>
                      <td>{resultado.nombre}</td>
                      <td>{resultado.departamento}</td>
                      <td>{resultado.hora}</td>
                      <td>{resultado.puntoVerificacion}</td>
                      {soloConHorasExtra && (
                        <td>
                          {resultado.horasTrabajadas ? decimalToHHMMSS(resultado.horasTrabajadas) : "N/A"}
                        </td>
                      )}
                      {soloConHorasExtra && (
                        <td>
                          {resultado.horasExtra ? decimalToHHMMSS(resultado.horasExtra) : "0:00:00"}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Controles de paginación */}
          {renderPagination(page, totalPages, setPage)}
          
          {/* Información de registros */}
          <div className="pagination-info mt-3">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted">
                Mostrando {((page - 1) * PAGE_SIZE) + 1} a {Math.min(page * PAGE_SIZE, resultadosFinales.length)} de {resultadosFinales.length} registros
              </div>
              <div className="text-muted">
                Página {page} de {totalPages}
              </div>
            </div>
          </div>
        </div>

        {/* Sección de archivos subidos - DESPUÉS DE LA TABLA */}
        <div className="modern-card">
          <div className="card-header">
            <h3>
              <i className="bi bi-folder2-open"></i>
              📁 Archivos Subidos
            </h3>
            <p>📂 Gestione y acceda a los archivos Excel procesados</p>
          </div>
          <div className="files-section">
            <div className="files-grid">
              <div className="files-list">
                <div className="files-header">
                  <span className="files-count">{files.length} archivo{files.length !== 1 ? 's' : ''}</span>
                  <button 
                    className="folder-access-btn"
                    onClick={async () => {
                      try {
                        // Obtener la ruta de la carpeta desde el backend
                        const response = await fetch(`${API_CONFIG.ALCALDIA.BASE_URL}/files-path`);
                        const data = await response.json();
                        
                        if (data.absolutePath) {
                          // Mostrar la ruta al usuario para que la copie manualmente
                          const message = `📁 Ruta de la carpeta de archivos:\n\n${data.absolutePath}\n\n📋 Puedes copiar esta ruta y pegarla en el explorador de Windows para abrir la carpeta.`;
                          alert(message);
                          
                          // Intentar copiar la ruta al portapapeles
                          try {
                            await navigator.clipboard.writeText(data.absolutePath);
                            console.log('✅ Ruta copiada al portapapeles');
                          } catch (clipboardError) {
                            console.log('⚠️ No se pudo copiar automáticamente al portapapeles');
                          }
                          
                          // También intentar abrir con protocolo file (puede funcionar en algunos casos)
                          try {
                            window.open(`file:///${data.absolutePath.replace(/\\/g, '/')}`, '_blank');
                          } catch (fileError) {
                            console.log('⚠️ No se pudo abrir directamente con protocolo file');
                          }
                        } else {
                          // Fallback: mostrar información de archivos
                          window.open(`${API_CONFIG.ALCALDIA.BASE_URL}/files`, '_blank');
                        }
                      } catch (error) {
                        console.error('Error obteniendo ruta de carpeta:', error);
                        // Fallback: mostrar información de archivos
                        window.open(`${API_CONFIG.ALCALDIA.BASE_URL}/files`, '_blank');
                      }
                    }}
                    title="Mostrar ruta de la carpeta de archivos"
                  >
                    <i className="bi bi-folder-fill"></i>
                    📂 Ver Ruta de Carpeta
                  </button>
                </div>
                <div className="files-container">
                  {files.length === 0 ? (
                    <div className="no-files">
                      <i className="bi bi-folder-x"></i>
                      <p>No hay archivos subidos aún</p>
                      <small>Suba un archivo Excel para verlo aquí</small>
                    </div>
                  ) : (
                    files.map((file, index) => (
                      <div key={index} className="file-item">
                        <div className="file-icon">
                          <i className="bi bi-file-earmark-excel"></i>
                        </div>
                        <div className="file-info">
                          <div className="file-name">{file.name}</div>
                          <div className="file-details">
                            <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                            <span className="file-date">
                              {file.uploadDate ? new Date(file.uploadDate).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'Fecha no disponible'}
                            </span>
                            <span className="file-records">{file.recordCount || 0} registros</span>
                          </div>
                        </div>
                        <div className="file-actions">
                          <button 
                            className="file-action-btn"
                            onClick={() => {
                              // Descargar archivo
                              const link = document.createElement('a');
                              link.href = `${API_CONFIG.ALCALDIA.BASE_URL}/download/${file.name}`;
                              link.download = file.name;
                              link.click();
                            }}
                            title="Descargar archivo"
                          >
                            <i className="bi bi-download"></i>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="modern-card">
          <div className="card-header">
            <h3>
              <i className="bi bi-graph-up"></i>
              📈 Estadísticas del Sistema
            </h3>
            <p>Resumen de datos y métricas del sistema de asistencia</p>
          </div>
          
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
    </div>
  );
}

export default AlcaldiaEnvigadoPage;