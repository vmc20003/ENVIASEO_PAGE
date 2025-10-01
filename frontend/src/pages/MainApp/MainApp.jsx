import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./MainApp.css";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { API_CONFIG, isDemoMode } from "../../config.js";
import { demoAlumbradoService } from "../../services/demoService.js";
import logoAlumbrado from "../../assets/logo_alumbrado_publico_correcto.svg";

const PAGE_SIZE = 50;

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

    if (!Array.isArray(resultados)) {
      return resumenDiario;
    }

    // Procesar cada registro
    resultados.forEach((registro) => {
      // Mapear correctamente los datos del backend
      let fecha = "";
      let hora = "";
      let cedula = "";
      let nombre = "";
      let apellido = "";
      let tipo_asistencia = "";

      // Extraer fecha y hora del campo 'time'
      if (registro.time) {
        const timeParts = registro.time.split(" ");
        fecha = timeParts[0] || "";
        hora = timeParts[1] || "";
      }

      // Mapear cédula desde personNo
      cedula = registro.personNo || "";

      // Mapear nombres desde firstName y lastName
      nombre = registro.firstName || "";
      apellido = registro.lastName || "";

      // Mapear tipo de asistencia
      tipo_asistencia = registro.attendanceType || "";

      // Validar que tengamos datos mínimos
      if (!fecha || !cedula) return;

      const key = `${cedula}-${fecha}`;
      if (!personas[key]) {
        personas[key] = {
          nombre: nombre,
          apellido: apellido,
          cedula: cedula,
          fecha: fecha,
          registros: [],
        };
      }
      personas[key].registros.push({
        hora: hora,
        tipo_asistencia: tipo_asistencia,
      });
    });

    // Procesar cada persona
    Object.values(personas).forEach((persona) => {
      // Separar entradas y salidas
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

      // Calcular horas trabajadas
      if (primerCheckIn && ultimoCheckOut) {
        const [h1, m1] = primerCheckIn.split(":").map(Number);
        const [h2, m2] = ultimoCheckOut.split(":").map(Number);
        let diff = h2 + m2 / 60 - (h1 + m1 / 60);
        if (diff < 0) diff += 24; // Manejar cambio de día
        horasTrabajadas = diff;
        horasExtra = Math.max(0, horasTrabajadas - JORNADA_LABORAL_HORAS);
      }

      // Crear resumen con datos organizados
      const resumen = {
        nombre: persona.nombre,
        apellido: persona.apellido,
        cedula: persona.cedula,
        fecha: persona.fecha,
        horaCheckin: primerCheckIn,
        horaCheckout: ultimoCheckOut,
        horasTrabajadas,
        horasExtra,
      };
      
      resumenDiario.push(resumen);
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
      if (isDemoMode()) {
        // Simular subida de archivo en modo demo
        const data = await demoAlumbradoService.uploadFile(file);
        setMessage(`Archivo procesado exitosamente (modo demo). ${data.data.totalRecords} registros simulados.`);
        setFile(null);
        fetchFiles();
        fetchStats();
        
        // Recargar datos demo
        const demoData = await demoAlumbradoService.getAllRecords();
        setResultados(demoData);
        setMessage(`Archivo procesado exitosamente. ${demoData.length} registros de demostración cargados.`);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const uploadUrl = `${API_CONFIG.ALUMBRADO.BASE_URL}${API_CONFIG.ALUMBRADO.ENDPOINTS.UPLOAD}`;
      console.log("Uploading to:", uploadUrl);
      console.log("File:", file.name, file.size);
      console.log("API Config:", API_CONFIG.ALUMBRADO);

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        setMessage(
          `Archivo subido exitosamente. ${data.recordsProcessed} registros procesados. Total en BD: ${data.totalRecords}`
        );
        setFile(null);
        fetchFiles();
        fetchStats();
        
        // Recargar los datos después de subir el archivo
        try {
          const dataResponse = await fetch(`${API_CONFIG.ALUMBRADO.BASE_URL}/all-records`);
          const dataRecords = await dataResponse.json();
          const resultadosArray = dataRecords.resultados || dataRecords;
          setResultados(resultadosArray);
          setMessage(`Archivo subido exitosamente. ${resultadosArray.length} registros cargados.`);
        } catch (error) {
          console.error("Error recargando datos:", error);
          setMessage(`Archivo subido pero error recargando datos: ${error.message}`);
        }
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
      if (isDemoMode()) {
        const data = await demoAlumbradoService.getFiles();
        setFiles(data);
        return;
      }
      
      const response = await fetch(`${API_CONFIG.ALUMBRADO.BASE_URL}/files`);
      const data = await response.json();
      // El backend devuelve { files: [...] }, extraer el array
      let filesArray = data.files || data;
      
      if (Array.isArray(filesArray)) {
        // Obtener información de registros para cada archivo
        const filesWithRecords = await Promise.all(
          filesArray.map(async (file) => {
            try {
              console.log('📄 Procesando archivo:', file);
              const filename = file.name || file.filename || file.originalName;
              console.log('📝 Nombre del archivo a buscar:', filename);
              
              if (!filename) {
                console.warn('⚠️ Archivo sin nombre válido:', file);
                return {
                  ...file,
                  recordCount: 0
                };
              }
              
              // Obtener registros por archivo desde el backend
              const recordsResponse = await fetch(`${API_CONFIG.ALUMBRADO.BASE_URL}/records-by-file/${encodeURIComponent(filename)}`);
              if (recordsResponse.ok) {
                const recordsData = await recordsResponse.json();
                console.log('📊 Datos de registros obtenidos:', recordsData);
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
      setFiles([]); // En caso de error, establecer como array vacío
    }
  };

  const fetchStats = async () => {
    try {
      if (isDemoMode()) {
        const data = await demoAlumbradoService.getStats();
        setStats(data);
        return;
      }
      
      const response = await fetch(`${API_CONFIG.ALUMBRADO.BASE_URL}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Función para crear modal de confirmación interactivo
  const showConfirmModal = (title, message, onConfirm, onCancel = null) => {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      backdrop-filter: blur(4px);
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      padding: 0;
      border-radius: 15px;
      max-width: 450px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      overflow: hidden;
      transform: scale(0.9);
      animation: modalAppear 0.3s ease-out forwards;
    `;
    
    // Agregar animación CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes modalAppear {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes modalDisappear {
        from { transform: scale(1); opacity: 1; }
        to { transform: scale(0.9); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    modalContent.innerHTML = `
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
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
            min-width: 100px;
          ">
            ✅ Confirmar
          </button>
          
          <button id="cancelBtn" style="
            background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
            min-width: 100px;
          ">
            ❌ Cancelar
          </button>
        </div>
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Event listeners con efectos hover
    const confirmBtn = document.getElementById('confirmBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    confirmBtn.addEventListener('mouseenter', () => {
      confirmBtn.style.transform = 'translateY(-2px)';
      confirmBtn.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
    });
    
    confirmBtn.addEventListener('mouseleave', () => {
      confirmBtn.style.transform = 'translateY(0)';
      confirmBtn.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
    });
    
    cancelBtn.addEventListener('mouseenter', () => {
      cancelBtn.style.transform = 'translateY(-2px)';
      cancelBtn.style.boxShadow = '0 6px 20px rgba(108, 117, 125, 0.4)';
    });
    
    cancelBtn.addEventListener('mouseleave', () => {
      cancelBtn.style.transform = 'translateY(0)';
      cancelBtn.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.3)';
    });
    
    const closeModal = (callback) => {
      modalContent.style.animation = 'modalDisappear 0.3s ease-out forwards';
      setTimeout(() => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
        if (callback) callback();
      }, 300);
    };
    
    confirmBtn.onclick = () => closeModal(onConfirm);
    cancelBtn.onclick = () => closeModal(onCancel);
    
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeModal(onCancel);
      }
    };
  };

  const clearDatabase = async () => {
    showConfirmModal(
      "🗑️ Limpiar Base de Datos",
      "Esta acción eliminará <strong>TODOS</strong> los registros de la base de datos de forma permanente.<br><br>⚠️ <strong>Esta acción no se puede deshacer.</strong>",
      async () => {
        // Función que se ejecuta al confirmar
    try {
      const response = await fetch(`${API_CONFIG.ALUMBRADO.BASE_URL}/clear-all`, {
        method: "DELETE",
      });

      if (response.ok) {
            setMessage("✅ Base de datos limpiada correctamente");
        setResultados([]);
            setFiles([]);
      } else {
            setMessage("❌ Error al limpiar la base de datos");
      }
    } catch (error) {
          console.error("Error:", error);
          setMessage("❌ Error de conexión al limpiar la base de datos");
        }
      },
      () => {
        // Función que se ejecuta al cancelar
        console.log("Operación cancelada por el usuario");
      }
    );
  };

  // Función para crear modal de información/éxito
  const showInfoModal = (title, message, type = 'info') => {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      backdrop-filter: blur(4px);
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      padding: 0;
      border-radius: 15px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      overflow: hidden;
      transform: scale(0.9);
      animation: modalAppear 0.3s ease-out forwards;
    `;
    
    const colors = {
      success: { bg: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', icon: '✅' },
      error: { bg: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)', icon: '❌' },
      info: { bg: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)', icon: 'ℹ️' },
      warning: { bg: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)', icon: '⚠️' }
    };
    
    const selectedColor = colors[type] || colors.info;
    
    modalContent.innerHTML = `
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
            background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
            min-width: 100px;
          ">
            Cerrar
          </button>
        </div>
      </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    const closeBtn = document.getElementById('closeBtn');
    
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.transform = 'translateY(-2px)';
      closeBtn.style.boxShadow = '0 6px 20px rgba(108, 117, 125, 0.4)';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.transform = 'translateY(0)';
      closeBtn.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.3)';
    });
    
    const closeModal = () => {
      modalContent.style.animation = 'modalDisappear 0.3s ease-out forwards';
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 300);
    };
    
    closeBtn.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeModal();
      }
    };
  };

  const refreshData = async () => {
    setSearching(true);
    setMessage("🔄 Refrescando datos...");
    
    try {
      if (isDemoMode()) {
        const data = await demoAlumbradoService.getAllRecords();
        setResultados(data);
        setMessage(`Analizando ${data.length} registros (modo demo)...`);
        return;
      }
      
      const response = await fetch(`${API_CONFIG.ALUMBRADO.BASE_URL}/all-records`);
      const data = await response.json();
      // El backend devuelve { resultados: [...] }, extraer el array
      const resultadosArray = data.resultados || data;
      setResultados(resultadosArray);
      
      // Mostrar modal de éxito
      showInfoModal(
        "✅ Datos Actualizados",
        `Los datos se han actualizado correctamente.<br><br><strong>${resultadosArray.length}</strong> registros cargados en la base de datos.`,
        'success'
      );
      
      setMessage(`✅ Datos actualizados. ${resultadosArray.length} registros cargados.`);
    } catch (error) {
      // Mostrar modal de error
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
  }, []);

  // Debounce de la cédula para reducir llamadas a red
  useEffect(() => {
    const id = setTimeout(() => setDebouncedCedula(cedula), 400);
    return () => clearTimeout(id);
  }, [cedula]);

  // Solo cargar datos una vez al montar el componente
  useEffect(() => {
    const loadInitialData = async () => {
      // Mostrar mensaje inmediatamente sin esperar
      setMessage("Cargando datos...");
      setSearching(true);
      
      try {
        console.log("Cargando datos desde:", `${API_CONFIG.ALUMBRADO.BASE_URL}/all-records`);
        const res = await fetch(`${API_CONFIG.ALUMBRADO.BASE_URL}/all-records`);
        const data = await res.json();
        console.log("Datos recibidos:", data);
        
        // El backend puede devolver { resultados: [...] } o directamente un array
        const resultadosArray = data.resultados || data;
        console.log("Resultados procesados:", resultadosArray.length, "registros");
        console.log("Primer registro:", resultadosArray[0]);
        
        setResultados(resultadosArray);
        setMessage(`Cargados ${resultadosArray.length} registros. Use los filtros para buscar.`);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setMessage("Error cargando datos. Intente recargar la página.");
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
                onClick={() => {
                  document.getElementById('fileInputAlumbrado').click();
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
                  id="fileInputAlumbrado"
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
                               onClick={(e) => {
                                 e.stopPropagation();
                                 document.getElementById('fileInputAlumbrado').click();
                               }}
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

                  {/* Controles de paginación */}
                  {renderPagination(page, totalPages, setPage)}
                  
                  {/* Información de registros */}
                  <div className="pagination-info mt-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="text-muted">
                        Mostrando {((page - 1) * PAGE_SIZE) + 1} a {Math.min(page * PAGE_SIZE, (resultadosFiltrados || []).length)} de {(resultadosFiltrados || []).length} registros
                      </div>
                      <div className="text-muted">
                        Página {page} de {totalPages}
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
                        const response = await fetch(`${API_CONFIG.ALUMBRADO.BASE_URL}/files-path`);
                        const data = await response.json();
                        
                        if (data.absolutePath) {
                          // Crear un modal más elegante para mostrar la información
                          const modal = document.createElement('div');
                          modal.style.cssText = `
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: rgba(0,0,0,0.5);
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            z-index: 10000;
                          `;
                          
                          const modalContent = document.createElement('div');
                          modalContent.style.cssText = `
                            background: white;
                            padding: 30px;
                            border-radius: 10px;
                            max-width: 500px;
                            width: 90%;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                            font-family: Arial, sans-serif;
                          `;
                          
                          modalContent.innerHTML = `
                            <h3 style="margin: 0 0 20px 0; color: #333; text-align: center;">📁 Acceso a Carpeta de Archivos</h3>
                            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                              <strong>Ruta de la carpeta:</strong><br>
                              <code style="background: #e9ecef; padding: 8px; border-radius: 3px; display: block; margin-top: 8px; word-break: break-all;">${data.absolutePath}</code>
                            </div>
                            <div style="background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #bee5eb;">
                              <strong>💡 Instrucciones:</strong><br>
                              1. Copia la ruta de arriba (Ctrl+C)<br>
                              2. Abre el explorador de Windows<br>
                              3. Pega la ruta en la barra de direcciones (Ctrl+V)<br>
                              4. Presiona Enter
                            </div>
                            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                              <button id="copyBtn" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                                📋 Copiar Ruta
                              </button>
                              <button id="closeBtn" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                                Cerrar
                              </button>
                            </div>
                          `;
                          
                          modal.appendChild(modalContent);
                          document.body.appendChild(modal);
                          
                          // Event listeners
                          document.getElementById('copyBtn').onclick = async () => {
                            try {
                              await navigator.clipboard.writeText(data.absolutePath);
                              alert('✅ Ruta copiada al portapapeles');
                            } catch (error) {
                              // Fallback para navegadores que no soportan clipboard API
                              const textArea = document.createElement('textarea');
                              textArea.value = data.absolutePath;
                              document.body.appendChild(textArea);
                              textArea.select();
                              document.execCommand('copy');
                              document.body.removeChild(textArea);
                              alert('✅ Ruta copiada al portapapeles');
                            }
                          };
                          
                          document.getElementById('closeBtn').onclick = () => {
                            document.body.removeChild(modal);
                          };
                          
                          modal.onclick = (e) => {
                            if (e.target === modal) {
                              document.body.removeChild(modal);
                            }
                          };
                          
                          // También intentar abrir con protocolo file
                          try {
                            window.open(`file:///${data.absolutePath.replace(/\\/g, '/')}`, '_blank');
                          } catch (fileError) {
                            console.log('⚠️ No se pudo abrir directamente con protocolo file');
                          }
                        } else {
                          // Fallback: mostrar información de archivos
                          window.open(`${API_CONFIG.ALUMBRADO.BASE_URL}/files`, '_blank');
                        }
                      } catch (error) {
                        console.error('Error obteniendo ruta de carpeta:', error);
                        // Fallback: mostrar información de archivos
                        window.open(`${API_CONFIG.ALUMBRADO.BASE_URL}/files`, '_blank');
                      }
                    }}
                    title="Abrir carpeta de archivos"
                  >
                    <i className="bi bi-folder-fill"></i>
                    📂 Abrir Carpeta
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
                              link.href = `${API_CONFIG.ALUMBRADO.BASE_URL}/download/${file.name}`;
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

      </div>
    </div>
  );
}

export default MainApp;
