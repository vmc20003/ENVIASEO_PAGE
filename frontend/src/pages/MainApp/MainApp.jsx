import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./MainApp.css";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { API_CONFIG } from "../../config.js";
import logoAlumbrado from "../../assets/logo_alumbrado_publico_correcto.svg";

const PAGE_SIZE = 10;

function MainApp({ onBack }) {
  const [file, setFile] = useState(null);
  const [digits, setDigits] = useState("");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [files, setFiles] = useState([]);
  const [cedula, setCedula] = useState("");
  const [debouncedCedula, setDebouncedCedula] = useState("");
  const [resultados, setResultados] = useState([]);
  const [stats, setStats] = useState({
    totalEmpleados: 0,
    totalHorasTrabajadas: 0,
    totalHorasExtra: 0,
    promedioHorasPorEmpleado: 0
  });
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [soloConHorasExtra, setSoloConHorasExtra] = useState(false);
  const JORNADA_LABORAL_HORAS = 8;

  // Funciones auxiliares para identificar entrada y salida
  function esEntrada(tipo) {
    if (!tipo) return false;
    const t = tipo.toLowerCase().replace(/[^a-z0-9]/g, "");
    return (
      t.includes("checkin") ||
      t.includes("entrada") ||
      t === "in" ||
      t.includes("ingreso") ||
      t.includes("lectordetarjetasdeentrada")
    );
  }

  function esSalida(tipo) {
    if (!tipo) return false;
    const t = tipo.toLowerCase().replace(/[^a-z0-9]/g, "");
    return (
      t.includes("checkout") ||
      t.includes("salida") ||
      t === "out" ||
      t.includes("egreso") ||
      t.includes("lectordetarjetasdesalida")
    );
  }

  // Procesar resultados agrupados
  const procesarResultadosAgrupados = useCallback((resultados) => {
    const resumenDiario = [];
    const personas = {};

    // Asegurar que resultados sea un array
    if (!Array.isArray(resultados)) {
      console.warn("resultados no es un array:", resultados);
      return resumenDiario;
    }

    resultados.forEach((registro) => {
      // Normalizar campos para aceptar ambos formatos
      const fecha =
        registro.fecha ||
        (registro.time ? registro.time.split(" ")[0] || "" : "");
      const hora =
        registro.hora ||
        (registro.time ? registro.time.split(" ")[1] || "" : "");
      const cedula = registro.cedula || registro.personNo || registro.idPersona || "";
      const nombre = registro.nombre || registro.firstName || "";
      const apellido = registro.apellido || registro.lastName || "";
      const tipo_asistencia =
        registro.tipo_asistencia || 
        registro.attendanceType || 
        registro.puntoVerificacion || "";

      if (!fecha) return;

      const key = `${cedula}-${fecha}`;
      if (!personas[key]) {
        personas[key] = {
          nombre,
          apellido,
          cedula,
          fecha,
          registros: [],
        };
      }
      personas[key].registros.push({
        ...registro,
        fecha,
        hora,
        tipo_asistencia,
      });
    });

    Object.values(personas).forEach((persona) => {
      // Separar check-ins y check-outs
      const checkIns = persona.registros
        .filter((r) => esEntrada(r.tipo_asistencia))
        .sort((a, b) => (a.hora > b.hora ? 1 : -1));

      const checkOuts = persona.registros
        .filter((r) => esSalida(r.tipo_asistencia))
        .sort((a, b) => (a.hora < b.hora ? 1 : -1));

      const primerCheckIn = checkIns[0]?.hora || null;
      const ultimoCheckOut = checkOuts[0]?.hora || null;

      let horasTrabajadas = null;
      let horasExtra = null;

      if (primerCheckIn && ultimoCheckOut) {
        const [h1, m1, s1] = primerCheckIn.split(":").map(Number);
        const [h2, m2, s2] = ultimoCheckOut.split(":").map(Number);
        let diff =
          h2 + m2 / 60 + (s2 || 0) / 3600 - (h1 + m1 / 60 + (s1 || 0) / 3600);
        if (diff < 0) diff += 24;
        horasTrabajadas = diff;
        horasExtra = Math.max(0, horasTrabajadas - JORNADA_LABORAL_HORAS);
      }

      resumenDiario.push({
        nombre: persona.nombre,
        apellido: persona.apellido,
        cedula: persona.cedula,
        fecha: persona.fecha,
        horaCheckin: primerCheckIn,
        horaCheckout: ultimoCheckOut,
        horasTrabajadas,
        horasExtra,
      });
    });

    return resumenDiario;
  }, []);

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
    setMessage("Subiendo archivo...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadUrl = `${API_CONFIG.ALUMBRADO.BASE_URL}/upload`;
      console.log("Uploading to:", uploadUrl);
      console.log("File:", file.name, file.size);

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        setMessage(
          `Archivo subido exitosamente. ${data.recordsProcessed} registros procesados. Total en BD: ${data.totalRecords}`
        );
        setFile(null);
        fetchFiles();
        fetchStats();
      } else {
        setMessage(`Error: ${data.error || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(`Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_CONFIG.ALUMBRADO.BASE_URL}/files`);
      const data = await response.json();
      // El backend devuelve { files: [...] }, extraer el array
      const filesArray = data.files || data;
      setFiles(Array.isArray(filesArray) ? filesArray : []);
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]); // En caso de error, establecer como array vacío
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_CONFIG.ALUMBRADO.BASE_URL}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
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
      const response = await fetch(`${API_CONFIG.ALUMBRADO.BASE_URL}/clear-all`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage("Base de datos limpiada correctamente");
        setResultados([]);
        fetchStats();
      } else {
        const data = await response.json();
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Error de conexión: ${error.message}`);
    }
  };

  const refreshData = async () => {
    setSearching(true);
    setMessage("Refrescando datos...");
    try {
      const response = await fetch(`${API_CONFIG.ALUMBRADO.BASE_URL}/all-records`);
      const data = await response.json();
      // El backend devuelve { resultados: [...] }, extraer el array
      const resultadosArray = data.resultados || data;
      setResultados(resultadosArray);
      setMessage(`Analizando ${resultadosArray.length} registros...`);
    } catch (error) {
      setMessage(`Error refrescando datos: ${error.message}`);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchStats();
  }, []);

  // Debounce de la cédula para reducir llamadas a red
  useEffect(() => {
    const id = setTimeout(() => setDebouncedCedula(cedula), 400);
    return () => clearTimeout(id);
  }, [cedula]);

  // Solo cargar datos una vez al montar el componente
  useEffect(() => {
    const loadInitialData = async () => {
        setSearching(true);
      setMessage("Cargando datos...");
        try {
          const res = await fetch(`${API_CONFIG.ALUMBRADO.BASE_URL}/all-records`);
          const data = await res.json();
          // El backend puede devolver { resultados: [...] } o directamente un array
          const resultadosArray = data.resultados || data;
          setResultados(resultadosArray);
        setMessage(`Cargados ${resultadosArray.length} registros. Use los filtros para buscar.`);
        } catch (error) {
        setMessage(`Error cargando datos: ${error.message}`);
          setResultados([]);
        } finally {
          setSearching(false);
        }
    };

    loadInitialData();
  }, []);

  // Paginación y cálculos memoizados
  const resultadosAgrupados = useMemo(() => {
    const agrupados = procesarResultadosAgrupados(resultados || []);
    const ordenados = agrupados.sort((a, b) => {
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      return b.fecha.localeCompare(a.fecha);
    });
    return ordenados;
  }, [resultados, procesarResultadosAgrupados]);

  const resultadosFiltrados = useMemo(() => {
    let filtrados = resultadosAgrupados || [];
    
    // Filtro por horas extra
    if (soloConHorasExtra) {
      filtrados = filtrados.filter((r) => (r.horasExtra || 0) > 0.001);
    }
    
    // Filtro por búsqueda (nombre, apellido o cédula)
    if (cedula.trim().length > 0) {
      const termino = cedula.trim().toLowerCase();
      filtrados = filtrados.filter((r) => 
        (r.nombre && r.nombre.toLowerCase().includes(termino)) ||
        (r.apellido && r.apellido.toLowerCase().includes(termino)) ||
        (r.cedula && r.cedula.toString().includes(termino))
      );
    }
    
    return filtrados;
  }, [resultadosAgrupados, soloConHorasExtra, cedula]);

  const totalPages = useMemo(() => Math.ceil((resultadosFiltrados || []).length / PAGE_SIZE), [resultadosFiltrados]);
  const paginatedResults = useMemo(() => (resultadosFiltrados || []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [resultadosFiltrados, page]);

  const handleFiltroHorasExtraChange = (e) => {
    console.log("Checkbox cambiado:", e.target.checked);
    setSoloConHorasExtra(e.target.checked);
  };

  // Actualizar mensaje cuando cambian los filtros
  useEffect(() => {
    if (resultadosFiltrados.length > 0) {
      if (cedula.trim().length > 0) {
        setMessage(`${resultadosFiltrados.length} resultados encontrados para "${cedula}"`);
      } else if (soloConHorasExtra) {
        setMessage(`${resultadosFiltrados.length} registros con horas extra`);
      } else {
        setMessage(`${resultadosFiltrados.length} registros mostrados`);
      }
    } else if (resultados.length > 0) {
      setMessage("No se encontraron resultados con los filtros aplicados");
    }
  }, [resultadosFiltrados, cedula, soloConHorasExtra, resultados.length]);


  const decimalToHHMMSS = useCallback(function decimalToHHMMSS(decimalHours) {
    if (
      typeof decimalHours !== "number" ||
      isNaN(decimalHours) ||
      decimalHours <= 0
    ) {
      return "–";
    }
    const totalSeconds = Math.round(decimalHours * 3600);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (num) => String(num).padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }, []);

  async function exportarExcel(resumen, desglose) {
    const workbook = new ExcelJS.Workbook();
    const resumenSheet = workbook.addWorksheet("Resumen");
    const resumenHeaders = [
      "NOMBRE",
      "APELLIDO",
      "CÉDULA",
      "FECHA INICIO",
      "FECHA FINAL",
      "TOTAL INGRESOS",
      "TOTAL SALIDAS",
      "DÍAS CON HORAS EXTRA",
      "TOTAL HORAS EXTRA",
    ];
    resumenSheet.addRow(resumenHeaders);
    resumenSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    resumenSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF388e3c" },
    };
    resumenSheet.addRow([
      resumen.nombre,
      resumen.apellido,
      resumen.cedula,
      resumen.fechaInicio,
      resumen.fechaFinal,
      resumen.totalCheckin,
      resumen.totalCheckout,
      resumen.diasConHorasExtra,
      resumen.totalHorasExtra,
    ]);
    resumenSheet.columns.forEach((col) => (col.width = 18));
    resumenSheet.views = [{ state: "frozen", ySplit: 1 }];
    resumenSheet.eachRow((row) => {
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

    const desgloseSheet = workbook.addWorksheet("Desglose Diario");
    const desgloseHeaders = [
      "FECHA",
      "HORA CHECK-IN",
      "HORA CHECK-OUT",
      "HORAS TRABAJADAS",
      "HORAS EXTRA",
    ];
    desgloseSheet.addRow(desgloseHeaders);
    desgloseSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    desgloseSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF388e3c" },
    };
    desglose.forEach((r) => {
      desgloseSheet.addRow([
        r.fecha,
        r.horaCheckin || "–",
        r.horaCheckout || "–",
        decimalToHHMMSS(r.horasTrabajadas),
        decimalToHHMMSS(r.horasExtra),
      ]);
    });
    desgloseSheet.columns.forEach((col) => (col.width = 18));
    desgloseSheet.views = [{ state: "frozen", ySplit: 1 }];
    desgloseSheet.eachRow((row) => {
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

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `reporte_horas_extra_${resumen.cedula}.xlsx`
    );
  }

  async function exportarExcelGlobal(resumenes, desglose) {
    console.log("Exportando Excel con datos:", { resumenes, desglose });

    if (!desglose || desglose.length === 0) {
      console.log("No hay datos para exportar");
      alert("No hay datos para exportar");
      return;
    }

    const workbook = new ExcelJS.Workbook();

    // Hoja de resumen por persona
    const resumenSheet = workbook.addWorksheet("Resumen por Persona");
    const resumenHeaders = [
      "NOMBRE",
      "APELLIDO",
      "CÉDULA",
      "TOTAL REGISTROS",
      "TOTAL HORAS TRABAJADAS",
      "TOTAL HORAS EXTRA",
      "PROMEDIO HORAS POR DÍA",
    ];
    resumenSheet.addRow(resumenHeaders);
    resumenSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    resumenSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF388e3c" },
    };

    // Crear resumen agrupado por persona
    const resumenPorPersona = {};
    desglose.forEach((r) => {
      const key = `${r.cedula}-${r.nombre}-${r.apellido}`;
      if (!resumenPorPersona[key]) {
        resumenPorPersona[key] = {
          nombre: r.nombre,
          apellido: r.apellido,
          cedula: r.cedula,
          totalRegistros: 0,
          totalHorasTrabajadas: 0,
          totalHorasExtra: 0,
          fechas: new Set(),
        };
      }
      resumenPorPersona[key].totalRegistros++;
      resumenPorPersona[key].totalHorasTrabajadas += r.horasTrabajadas || 0;
      resumenPorPersona[key].totalHorasExtra += r.horasExtra || 0;
      if (r.fecha) resumenPorPersona[key].fechas.add(r.fecha);
    });

    // Agregar filas de resumen
    Object.values(resumenPorPersona).forEach((persona) => {
      const promedioHoras =
        persona.fechas.size > 0
          ? persona.totalHorasTrabajadas / persona.fechas.size
          : 0;

      resumenSheet.addRow([
        persona.nombre,
        persona.apellido,
        persona.cedula,
        persona.totalRegistros,
        decimalToHHMMSS(persona.totalHorasTrabajadas),
        decimalToHHMMSS(persona.totalHorasExtra),
        decimalToHHMMSS(promedioHoras),
      ]);
    });

    // Ajustar ancho de columnas y aplicar estilos
    resumenSheet.columns.forEach((col) => (col.width = 20));
    resumenSheet.eachRow((row) => {
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

    // Hoja de desglose detallado por persona
    const desgloseSheet = workbook.addWorksheet("Desglose Detallado");
    const desgloseHeaders = [
      "NOMBRE",
      "APELLIDO",
      "CÉDULA",
      "FECHA",
      "HORA CHECK-IN",
      "HORA CHECK-OUT",
      "HORAS TRABAJADAS",
      "HORAS EXTRA",
    ];
    desgloseSheet.addRow(desgloseHeaders);
    desgloseSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    desgloseSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF388e3c" },
    };

    // Agrupar datos por persona para mejor organización
    const personas = {};
    desglose.forEach((r) => {
      const key = `${r.cedula}-${r.nombre}-${r.apellido}`;
      if (!personas[key]) personas[key] = [];
      personas[key].push(r);
    });

    // Agregar datos organizados por persona
    Object.values(personas).forEach((registros) => {
      const persona = registros[0];

      // Fila de título de persona
      const rowIdx = desgloseSheet.addRow([
        persona.nombre,
        persona.apellido,
        persona.cedula,
        "",
        "",
        "",
        "",
        "",
      ]).number;

      // Estilo para la fila de título
      desgloseSheet.getRow(rowIdx).font = {
        bold: true,
        color: { argb: "FF1565c0" },
      };
      desgloseSheet.getRow(rowIdx).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFe3f2fd" },
      };

      // Agregar registros de la persona ordenados por fecha
      registros
        .sort((a, b) => b.fecha.localeCompare(a.fecha)) // Más reciente primero
        .forEach((r) => {
          desgloseSheet.addRow([
            "",
            "",
            "",
            r.fecha || "",
            r.horaCheckin || "–",
            r.horaCheckout || "–",
            decimalToHHMMSS(r.horasTrabajadas),
            decimalToHHMMSS(r.horasExtra),
          ]);
        });

      // Fila vacía para separar personas
      desgloseSheet.addRow([]);
    });

    // Ajustar ancho de columnas
    desgloseSheet.columns.forEach((col) => (col.width = 18));

    // Aplicar bordes y alineación
    desgloseSheet.eachRow((row) => {
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
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      saveAs(
        new Blob([buffer], { type: "application/octet-stream" }),
        `reporte_alumbrado_publico_${timestamp}.xlsx`
      );
      console.log("Archivo exportado exitosamente");
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("Error al exportar el archivo: " + error.message);
    }
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
    <div className="alumbrado-container">
      {/* Header moderno */}
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
            {/* Área de selección de archivo mejorada */}
            <div className="upload-container">
              <div 
                className="upload-area" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  document.getElementById('fileInput').click();
                }}
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
              
              {/* Botón de acción mejorado */}
              <div className="upload-actions">
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
            <p>⚡ Busque y filtre registros por cédula, nombre o criterios específicos</p>
          </div>
          <div className="filters-section">
            <div className="filters-grid">
              <div className="search-container">
                <i className="bi bi-search search-icon"></i>
                      <input
                        type="text"
                  className="search-input"
                  placeholder="Ingrese cédula, nombre o apellido..."
                        value={cedula}
                        onChange={(e) => setCedula(e.target.value)}
                />
                  </div>
                  
              <div className="filter-checkbox">
                      <input
                        type="checkbox"
                  className="checkbox-input"
                  id="horasExtra"
                        checked={soloConHorasExtra}
                        onChange={handleFiltroHorasExtraChange}
                />
                <label htmlFor="horasExtra" className="checkbox-text">
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
                <th>NOMBRE</th>
                <th>APELLIDO</th>
                <th>CÉDULA</th>
                <th>FECHA</th>
                <th>HORA CHECK-IN</th>
                <th>HORA CHECK-OUT</th>
                       <th>HORAS TRABAJADAS</th>
                       <th>HORAS EXTRA</th>
                      </tr>
                    </thead>
                    <tbody>
              {paginatedResults.length > 0 ? (
                        paginatedResults.map((resultado, index) => (
                  <tr key={index}>
                    <td>{resultado.nombre}</td>
                    <td>{resultado.apellido}</td>
                    <td>{resultado.cedula}</td>
                            <td>{resultado.fecha}</td>
                    <td>{resultado.horaCheckin}</td>
                    <td>{resultado.horaCheckout}</td>
                    <td>
                      {resultado.horasTrabajadas ? 
                        `${resultado.horasTrabajadas.toFixed(1)}h` : 
                        'N/A'
                      }
                    </td>
                    <td>
                      {resultado.horasExtra && resultado.horasExtra > 0 ? 
                        <span style={{color: '#dc2626', fontWeight: 'bold'}}>
                          +{resultado.horasExtra.toFixed(1)}h
                        </span> : 
                        '0h'
                      }
                            </td>
                          </tr>
                        ))
              ) : (
                <tr>
                         <td colSpan={8} className="empty-state">
                           <div className="empty-icon">
                             <img 
                               src={logoAlumbrado} 
                               alt="Logo Alumbrado Público" 
                               className="empty-logo"
                             />
                              </div>
                           <div className="empty-title">
                             {cedula.length === 0 && !soloConHorasExtra
                               ? "📊 Registros de Asistencia"
                               : soloConHorasExtra && cedula.length === 0
                               ? "⏰ Filtro de Horas Extra"
                               : "🔍 Sin Resultados"}
                           </div>
                           <div className="empty-description">
                             {cedula.length === 0 && !soloConHorasExtra
                               ? "Importe un archivo Excel para visualizar los registros de asistencia del personal"
                               : soloConHorasExtra && cedula.length === 0
                               ? "No se encontraron registros con horas extra. Intente buscar por cédula o nombre."
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
                               onClick={() => setCedula('')}
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

        {/* Estadísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">👥 {stats.totalEmpleados || 0}</div>
            <div className="stat-label">Personal Registrado</div>
              </div>
          <div className="stat-card">
            <div className="stat-number">⏰ {stats.totalHorasTrabajadas ? stats.totalHorasTrabajadas.toFixed(1) : '0.0'}h</div>
            <div className="stat-label">Horas Totales Trabajadas</div>
            </div>
          <div className="stat-card">
            <div className="stat-number">⚡ {stats.totalHorasExtra ? stats.totalHorasExtra.toFixed(1) : '0.0'}h</div>
            <div className="stat-label">Horas Extra Acumuladas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">📊 {stats.promedioHorasPorEmpleado ? stats.promedioHorasPorEmpleado.toFixed(1) : '0.0'}h</div>
            <div className="stat-label">Promedio por Persona</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainApp;
