import React, { useState, useEffect } from "react";
import "./MainApp.css";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const PAGE_SIZE = 10;

function MainApp({ onBack }) {
  const [file, setFile] = useState(null);
  const [digits, setDigits] = useState("");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [files, setFiles] = useState([]);
  const [cedula, setCedula] = useState("");
  const [resultados, setResultados] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [soloConHorasExtra, setSoloConHorasExtra] = useState(false);
  const JORNADA_LABORAL_HORAS = 8;

  const handleFileChange = (e) => setFile(e.target.files[0]);

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

      const response = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

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
      setMessage(`Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch("http://localhost:4000/files");
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:4000/stats");
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
      const response = await fetch("http://localhost:4000/clear", {
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
      const response = await fetch("http://localhost:4000/all-records");
      const data = await response.json();
      setResultados(data);
      setMessage(`Analizando ${data.length} registros...`);
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

  useEffect(() => {
    const performSearch = async () => {
      setPage(1);

      if (cedula.length > 0) {
        setSearching(true);
        setMessage("Buscando...");
        try {
          const res = await fetch(`http://localhost:4000/buscar/${cedula}`);
          const data = await res.json();
          setResultados(data);
          setMessage(
            data.length > 0
              ? `${data.length} resultados encontrados`
              : "No se encontraron resultados"
          );
        } catch (error) {
          setMessage(`Error de búsqueda: ${error.message}`);
          setResultados([]);
        } finally {
          setSearching(false);
        }
      } else if (soloConHorasExtra) {
        setSearching(true);
        setMessage("Buscando en todos los registros...");
        try {
          const res = await fetch(`http://localhost:4000/all-records`);
          const data = await res.json();
          setResultados(data);
          setMessage(`Analizando ${data.length} registros...`);
        } catch (error) {
          setMessage(`Error de búsqueda: ${error.message}`);
          setResultados([]);
        } finally {
          setSearching(false);
        }
      } else {
        setResultados([]);
        setMessage("");
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [cedula, soloConHorasExtra]);

  // Procesar resultados agrupados
  function procesarResultadosAgrupados(resultados) {
    const resumenDiario = [];
    const personas = {};

    resultados.forEach((registro) => {
      // Normalizar campos para aceptar ambos formatos
      const fecha =
        registro.fecha ||
        (registro.time ? registro.time.split(" ")[0] || "" : "");
      const hora =
        registro.hora ||
        (registro.time ? registro.time.split(" ")[1] || "" : "");
      const cedula = registro.cedula || registro.personNo || "";
      const nombre = registro.nombre || registro.firstName || "";
      const apellido = registro.apellido || registro.lastName || "";
      const tipo_asistencia =
        registro.tipo_asistencia || registro.attendanceType || "";

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
  }

  // Funciones auxiliares para identificar entrada y salida
  function esEntrada(tipo) {
    if (!tipo) return false;
    const t = tipo.toLowerCase().replace(/[^a-z0-9]/g, "");
    return (
      t.includes("checkin") ||
      t.includes("entrada") ||
      t === "in" ||
      t.includes("ingreso")
    );
  }

  function esSalida(tipo) {
    if (!tipo) return false;
    const t = tipo.toLowerCase().replace(/[^a-z0-9]/g, "");
    return (
      t.includes("checkout") ||
      t.includes("salida") ||
      t === "out" ||
      t.includes("egreso")
    );
  }

  // Paginación
  let resultadosAgrupados = procesarResultadosAgrupados(resultados);

  // Debug: mostrar información sobre los datos procesados
  console.log("Resultados originales:", resultados.length);
  console.log("Resultados agrupados:", resultadosAgrupados.length);
  console.log("Muestra de datos agrupados:", resultadosAgrupados.slice(0, 3));
  console.log("Estructura de un registro:", resultadosAgrupados[0]);

  resultadosAgrupados = resultadosAgrupados.sort((a, b) => {
    if (!a.fecha) return 1;
    if (!b.fecha) return -1;
    return b.fecha.localeCompare(a.fecha);
  });

  const resultadosFiltrados = soloConHorasExtra
    ? resultadosAgrupados.filter((r) => {
        const tieneHorasExtra = (r.horasExtra || 0) > 0.001;
        console.log(
          `Filtro horas extra - ${r.nombre} ${r.apellido}: ${r.horasExtra} -> ${tieneHorasExtra}`
        );
        return tieneHorasExtra;
      })
    : resultadosAgrupados;

  console.log("Resultados filtrados:", resultadosFiltrados.length);

  const totalPages = Math.ceil(resultadosFiltrados.length / PAGE_SIZE);
  const paginatedResults = resultadosFiltrados.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleFiltroHorasExtraChange = (e) => {
    console.log("Checkbox cambiado:", e.target.checked);
    setSoloConHorasExtra(e.target.checked);
  };

  function decimalToHHMMSS(decimalHours) {
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
  }

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
      {/* Header con logo y botón de volver */}
      <div className="alumbrado-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-placeholder">
              <i className="bi bi-lightbulb"></i>
              <span>Alumbrado Público</span>
            </div>
          </div>
          <button onClick={onBack} className="btn-volver">
            <i className="bi bi-arrow-left"></i>
            Volver al Panel
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="alumbrado-main">
        <div className="main-card">
          {/* Título principal */}
          <div className="title-section">
            <h1>Sistema de Asistencia</h1>
            <h2>Alumbrado Público</h2>
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

          {/* Filtro de horas extra */}
          <div className="filter-section">
            <div className="filter-container">
              <label className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={soloConHorasExtra}
                  onChange={handleFiltroHorasExtraChange}
                />
                <span className="checkmark"></span>
                Mostrar solo con horas extra
              </label>
              {soloConHorasExtra && resultadosFiltrados.length > 0 && (
                <button
                  className="btn-export-filter"
                  onClick={() => {
                    console.log(
                      "Exportando desde filtro con datos:",
                      resultadosFiltrados
                    );
                    exportarExcelGlobal([], resultadosFiltrados);
                  }}
                >
                  <i className="bi bi-file-earmark-excel"></i>
                  Exportar a Excel
                </button>
              )}
            </div>
          </div>

          {/* Barra de búsqueda y acciones */}
          <div className="search-section">
            <div className="search-container">
              <div className="search-input-wrapper">
                <i className="bi bi-search search-icon"></i>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar por cédula..."
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  disabled={searching}
                />
              </div>
              <div className="action-buttons">
                <button
                  className="btn-refresh"
                  onClick={refreshData}
                  disabled={searching}
                >
                  <i className="bi bi-arrow-clockwise"></i>
                  Refrescar
                </button>
                <button className="btn-clear" onClick={clearDatabase}>
                  <i className="bi bi-trash"></i>
                  Limpiar BD
                </button>
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
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Cédula</th>
                      <th>Fecha</th>
                      <th>Hora Check-In</th>
                      <th>Hora Check-Out</th>
                      <th>Horas Trabajadas</th>
                      <th>Horas Extra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searching ? (
                      <tr>
                        <td colSpan={8} className="loading-cell">
                          <div className="loading-spinner">
                            <span className="spinner"></span>
                            <span>Buscando...</span>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedResults.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="empty-cell">
                          <div className="empty-state">
                            <i className="bi bi-inbox"></i>
                            <span>
                              {cedula.length === 0 && !soloConHorasExtra
                                ? "Ingresa un término de búsqueda para ver registros"
                                : soloConHorasExtra && cedula.length === 0
                                ? "No hay registros con horas extra. Intenta buscar por cédula o nombre."
                                : "No se encontraron resultados"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedResults.map((resultado, index) => (
                        <tr key={index} className="data-row">
                          <td className="name-cell">{resultado.nombre}</td>
                          <td className="name-cell">{resultado.apellido}</td>
                          <td className="id-cell">{resultado.cedula}</td>
                          <td className="date-cell">{resultado.fecha}</td>
                          <td className="time-cell">
                            {resultado.horaCheckin || "–"}
                          </td>
                          <td className="time-cell">
                            {resultado.horaCheckout || "–"}
                          </td>
                          <td className="hours-cell">
                            {decimalToHHMMSS(resultado.horasTrabajadas)}
                          </td>
                          <td className="overtime-cell">
                            {decimalToHHMMSS(resultado.horasExtra)}
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
                                  `http://localhost:4000/files/${file.name}`,
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
                                      `http://localhost:4000/files/${file.name}`,
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
              <div className="export-container">
                {resultadosFiltrados.length > 0 && (
                  <button
                    className="btn-export"
                    onClick={() => {
                      console.log(
                        "Exportando desde sidebar con datos:",
                        resultadosFiltrados
                      );
                      exportarExcelGlobal([], resultadosFiltrados);
                    }}
                  >
                    <i className="bi bi-file-earmark-excel"></i>
                    Exportar a Excel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainApp;
