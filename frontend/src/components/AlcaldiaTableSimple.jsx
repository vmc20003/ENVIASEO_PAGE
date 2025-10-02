import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import SimpleTable from './SimpleTable';
import Pagination from './Pagination';
import FileUpload from './FileUpload';
import ConfirmModal from './ConfirmModal';
import './AlcaldiaTableSimple.css';

const AlcaldiaTableSimple = ({ 
  data = [], 
  externalLoading = false, 
  pagination = null, 
  onPageChange = null,
  onRefresh = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showExtraHoursOnly, setShowExtraHoursOnly] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);

  // Función para cargar datos de archivos existentes
  const handleLoadData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔄 [Alcaldía] Cargando datos de archivos existentes...');
      const response = await fetch('http://localhost:5002/all-records?getAll=true');
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ [Alcaldía] Datos cargados:', result);
        setUploadMessage('✅ Datos cargados correctamente desde archivos');
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error('Error al cargar datos');
      }
    } catch (error) {
      console.error('❌ [Alcaldía] Error cargando datos:', error);
      setUploadMessage('❌ Error al cargar datos de archivos');
    } finally {
      setLoading(false);
      setTimeout(() => setUploadMessage(''), 3000);
    }
  }, [onRefresh]);

  // Función para subir archivo individual
  const handleUploadFile = useCallback(async (fileName) => {
    setLoading(true);
    try {
      console.log('📤 [Alcaldía] Procesando archivo individual:', fileName);
      
      // En lugar de enviar el archivo, vamos a procesar los datos del archivo existente
      const response = await fetch(`http://localhost:5002/records-by-file/${encodeURIComponent(fileName)}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ [Alcaldía] Archivo procesado correctamente:', result);
        setUploadMessage(`✅ Archivo ${fileName} procesado correctamente`);
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error('Error al procesar archivo');
      }
    } catch (error) {
      console.error('❌ [Alcaldía] Error procesando archivo:', error);
      setUploadMessage(`❌ Error al procesar archivo ${fileName}`);
    } finally {
      setLoading(false);
      setTimeout(() => setUploadMessage(''), 3000);
    }
  }, [onRefresh]);

  // Procesar datos de alcaldía
  const processAlcaldiaData = useCallback((rawData) => {
    if (!Array.isArray(rawData)) return [];

    const finalData = [];
    const groupedByPersonAndDate = new Map();

    // Primera pasada: Agrupar registros por persona y fecha para calcular check-in/out
    rawData.forEach(record => {
      const cedula = record.personNo || record.cedula || '';
      const fecha = record.time ? record.time.split(' ')[0] : '';
      const key = `${cedula}-${fecha}`;

      if (!groupedByPersonAndDate.has(key)) {
        groupedByPersonAndDate.set(key, {
          nombre: record.firstName || record.nombre || '',
          apellido: record.lastName || record.apellido || '',
          cedula: cedula,
          fecha: fecha,
          registros: []
        });
      }
      groupedByPersonAndDate.get(key).registros.push({
        hora: record.time ? record.time.split(' ')[1] : '',
        tipo: record.attendanceType || record.tipo_asistencia || '',
        horaOriginal: record.time // Guardar la hora original para ordenamiento
      });
    });

    // Segunda pasada: Procesar cada grupo para determinar check-in/out y calcular horas
    groupedByPersonAndDate.forEach(personGroup => {
      // Ordenar registros por hora
      personGroup.registros.sort((a, b) => {
        const timeA = a.hora.split(':').map(Number);
        const timeB = b.hora.split(':').map(Number);
        return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
      });

      let checkInTime = 'N/A';
      let checkOutTime = 'N/A';
      let hasExtraHours = false;
      let horasTrabajadas = 'N/A';
      let horasExtra = '0.0';

      // Encontrar el primer Check In y el último Check Out
      const firstCheckIn = personGroup.registros.find(r => r.tipo.toLowerCase().includes('in'));
      const lastCheckOut = personGroup.registros.slice().reverse().find(r => r.tipo.toLowerCase().includes('out'));

      if (firstCheckIn) checkInTime = firstCheckIn.hora;
      if (lastCheckOut) checkOutTime = lastCheckOut.hora;

      // Si hay un par completo (Check In y Check Out), calcular horas
      if (checkInTime !== 'N/A' && checkOutTime !== 'N/A') {
        const [h1, m1] = checkInTime.split(':').map(Number);
        const [h2, m2] = checkOutTime.split(':').map(Number);
        let diff = h2 + m2 / 60 - (h1 + m1 / 60);
        if (diff < 0) diff += 24; // Manejar casos donde el checkout es al día siguiente
        horasTrabajadas = diff.toFixed(1);
        horasExtra = Math.max(0, diff - 8).toFixed(1);
        hasExtraHours = parseFloat(horasExtra) > 0;
      }

      // Agregar UNA SOLA FILA por persona y fecha
      finalData.push({
        nombre: personGroup.nombre,
        apellido: personGroup.apellido,
        cedula: personGroup.cedula,
        fecha: personGroup.fecha,
        horaCheckIn: checkInTime,
        horaCheckOut: checkOutTime,
        horasTrabajadas: horasTrabajadas,
        horasExtra: horasExtra,
        hasExtraHours: hasExtraHours
      });
    });

    // Ordenar todos los registros finales por fecha y luego por hora de check-in
    finalData.sort((a, b) => {
      const dateA = new Date(`${a.fecha}T${a.horaCheckIn}`);
      const dateB = new Date(`${b.fecha}T${b.horaCheckIn}`);
      return dateA.getTime() - dateB.getTime();
    });

    return finalData;
  }, []);

  // Datos procesados
  const processedData = useMemo(() => processAlcaldiaData(data), [data, processAlcaldiaData]);

  // Filtrar datos optimizado
  const filteredData = useMemo(() => {
    let filtered = processedData;

    // Filtro por término de búsqueda (optimizado)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(record => {
        const nombre = (record.nombre || '').toLowerCase();
        const apellido = (record.apellido || '').toLowerCase();
        const cedula = (record.cedula || '').toLowerCase();
        
        return nombre.includes(term) || 
               apellido.includes(term) || 
               cedula.includes(term) ||
               `${nombre} ${apellido}`.includes(term);
      });
    }

    // Filtro por horas extra
    if (showExtraHoursOnly) {
      filtered = filtered.filter(record => record.hasExtraHours);
    }

    return filtered;
  }, [processedData, searchTerm, showExtraHoursOnly]);

  // Manejar cambio de búsqueda - SOLO LOCAL, SIN BACKEND
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // NO llamamos onPageChange - la búsqueda es completamente local
  }, []);

  // Manejar toggle de horas extra
  const handleExtraHoursToggle = useCallback(() => {
    setShowExtraHoursOnly(!showExtraHoursOnly);
    if (onPageChange) {
      onPageChange(1, searchTerm);
    }
  }, [showExtraHoursOnly, searchTerm, onPageChange]);

  // Manejar limpieza de base de datos
  const handleClearData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5002/clear-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Base de datos limpiada:', result);
        setUploadMessage('✅ Base de datos limpiada correctamente');
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error('Error al limpiar base de datos');
      }
    } catch (error) {
      console.error('❌ Error al limpiar base de datos:', error);
      setUploadMessage('❌ Error al limpiar base de datos');
    } finally {
      setLoading(false);
      setTimeout(() => setUploadMessage(''), 3000);
    }
  }, [onRefresh]);

  // Cargar lista de archivos
  const loadFiles = useCallback(async () => {
    setFilesLoading(true);
    try {
      const response = await fetch('http://localhost:5002/files');
      if (response.ok) {
        const result = await response.json();
        setFiles(result.files || []);
      } else {
        throw new Error('Error al cargar archivos');
      }
    } catch (error) {
      console.error('Error cargando archivos:', error);
      setUploadMessage('❌ Error al cargar archivos');
    } finally {
      setFilesLoading(false);
    }
  }, []);

  // Manejar subida de archivo
  const handleFileUpload = useCallback(async (file) => {
    setUploadLoading(true);
    setUploadMessage('Subiendo archivo...');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:5002/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Archivo subido correctamente:', result);
        setUploadMessage('✅ Archivo subido correctamente');
        await loadFiles(); // Recargar lista de archivos
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error('Error al subir archivo');
      }
    } catch (error) {
      console.error('❌ Error al subir archivo:', error);
      setUploadMessage('❌ Error al subir archivo');
    } finally {
      setUploadLoading(false);
      setTimeout(() => setUploadMessage(''), 3000);
    }
  }, [onRefresh, loadFiles]);

  // Manejar apertura del explorador
  const handleOpenExplorer = useCallback(async () => {
    const folderPath = 'C:\\Users\\Usuario\\Documents\\PAGINAS\\ENVIASEO_PAGE_ORIGINAL\\backend-alcaldia\\uploads_excel';
    
    try {
      // Intentar copiar la ruta al portapapeles
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(folderPath);
        
        // Mostrar mensaje de éxito con instrucciones
        const message = `✅ Ruta copiada al portapapeles!\n\n📁 ${folderPath}\n\n🚀 Para abrir la carpeta:\n1. Presiona Windows + E\n2. Presiona Ctrl + V en la barra de direcciones\n3. Presiona Enter\n\nO simplemente presiona Windows + R, pega (Ctrl + V) y presiona Enter.`;
        
        alert(message);
      } else {
        // Fallback si no se puede usar el portapapeles
        const message = `📁 Para abrir la carpeta de archivos:\n\n1. Presiona Windows + E (abre el explorador)\n2. Copia esta ruta en la barra de direcciones:\n\n${folderPath}\n\n3. Presiona Enter\n\nO presiona Windows + R, pega la ruta y presiona Enter.`;
        alert(message);
      }
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
      // Fallback con instrucciones
      const message = `📁 Para abrir la carpeta de archivos:\n\n1. Presiona Windows + E (abre el explorador)\n2. Copia esta ruta en la barra de direcciones:\n\n${folderPath}\n\n3. Presiona Enter\n\nO presiona Windows + R, pega la ruta y presiona Enter.`;
      alert(message);
    }
  }, []);

  // Manejar confirmación
  const handleConfirm = useCallback(() => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  }, [confirmAction]);

  // Manejar cancelación
  const handleCancel = useCallback(() => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  }, []);

  // Mostrar modal de confirmación para limpiar datos
  const showClearConfirm = useCallback(() => {
    setConfirmAction(() => handleClearData);
    setShowConfirmModal(true);
  }, [handleClearData]);

  // Eliminar archivo
  const handleDeleteFile = useCallback(async (fileId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5002/files/${fileId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setUploadMessage('✅ Archivo eliminado correctamente');
        await loadFiles(); // Recargar lista de archivos
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error('Error al eliminar archivo');
      }
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      setUploadMessage('❌ Error al eliminar archivo');
    } finally {
      setLoading(false);
      setTimeout(() => setUploadMessage(''), 3000);
    }
  }, [loadFiles, onRefresh]);

  // Mostrar modal de confirmación para eliminar archivo
  const showDeleteFileConfirm = useCallback((fileId) => {
    setConfirmAction(() => () => handleDeleteFile(fileId));
    setShowConfirmModal(true);
  }, [handleDeleteFile]);

  // Cargar archivos al montar el componente
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Columnas de la tabla
  const columns = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'apellido', label: 'Apellido', sortable: true },
    { key: 'cedula', label: 'Cédula', sortable: true },
    { key: 'fecha', label: 'Fecha', sortable: true },
    { key: 'horaCheckIn', label: 'Check In', sortable: true },
    { key: 'horaCheckOut', label: 'Check Out', sortable: true },
    { key: 'horasTrabajadas', label: 'Horas Trabajadas', sortable: true },
    { key: 'horasExtra', label: 'Horas Extra', sortable: true }
  ];

  return (
    <div className="alcaldia-table-simple">
      <div className="main-content">
        {/* Sección de subir archivo */}
        <div className="upload-section">
          <div className="section-header">
            <h3>Subir Nuevo Archivo</h3>
            <p>Selecciona un archivo Excel para procesar los datos de asistencia</p>
          </div>
          
          <FileUpload
            onUpload={handleFileUpload}
            loading={uploadLoading || loading || externalLoading}
            disabled={loading || externalLoading}
          />
          
          {uploadMessage && (
            <div className={`upload-message ${uploadMessage.includes('✅') ? 'success' : 'error'}`}>
              {uploadMessage}
            </div>
          )}

          {/* Botones de administración */}
          <div className="upload-admin-buttons">
            <button 
              className="btn-clear-database"
              onClick={showClearConfirm}
              disabled={loading || externalLoading}
            >
              <i className="bi bi-trash"></i>
              Limpiar Base de Datos
            </button>
            
            <button 
              className="btn-open-explorer"
              onClick={handleOpenExplorer}
              disabled={loading || externalLoading}
            >
              <i className="bi bi-folder-open"></i>
              Abrir Carpeta
            </button>
          </div>
        </div>

        {/* Sección de gestión de archivos */}
        <div className="files-section">
          <div className="section-header">
            <h3>Archivos Cargados</h3>
            <p>Gestiona los archivos Excel que has subido al sistema</p>
          </div>
          
          {filesLoading ? (
            <div className="files-loading">
              <i className="bi bi-hourglass-split"></i>
              <span>Cargando archivos...</span>
            </div>
          ) : files.length > 0 ? (
            <div className="files-list">
              {files.map((file, index) => (
                <div key={file.id || index} className="file-item">
                  <div className="file-info">
                    <i className="bi bi-file-excel"></i>
                    <div className="file-details">
                      <span className="file-name">{file.originalName || file.filename}</span>
                      <div className="file-meta">
                        <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <span className="file-date">{new Date(file.mtime).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button 
                      className="btn-upload-file"
                      onClick={() => handleUploadFile(file.originalName || file.filename)}
                      disabled={loading || externalLoading}
                      title="Subir archivo"
                    >
                      <i className="bi bi-upload"></i>
                    </button>
                    <button 
                      className="btn-delete-file"
                      onClick={() => showDeleteFileConfirm(file.id)}
                      disabled={loading || externalLoading}
                      title="Eliminar archivo"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="files-empty">
              <i className="bi bi-folder-x"></i>
              <span>No hay archivos cargados</span>
            </div>
          )}
        </div>
        <div className="controls-section">
          <div className="search-controls">
            <div className="search-input-group">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o cédula..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
                disabled={loading || externalLoading}
              />
            </div>
            
            <div className="filter-controls">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showExtraHoursOnly}
                  onChange={handleExtraHoursToggle}
                  disabled={loading || externalLoading}
                />
                <span className="checkmark"></span>
                Mostrar solo horas extra
              </label>
            </div>
          </div>
        </div>

        {/* Tabla de datos */}
        <div className="table-section">
          <SimpleTable
            data={filteredData}
            columns={columns}
            loading={loading || externalLoading}
            emptyMessage="No hay registros de asistencia disponibles"
          />
        </div>

        {/* Paginación */}
        {filteredData.length > 0 && pagination && !searchTerm.trim() && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalRecords={pagination.totalRecords}
            limit={pagination.limit}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            onPageChange={onPageChange}
            loading={loading || externalLoading}
          />
        )}
        
        {/* Información cuando hay búsqueda activa */}
        {searchTerm.trim() && (
          <div className="search-results-info">
            <div className="search-info-card">
              <i className="bi bi-search"></i>
              <span>
                Mostrando todos los registros para "{searchTerm}" ({filteredData.length} resultados)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title="Confirmar Acción"
        message="¿Estás seguro de que deseas limpiar la base de datos? Esta acción no se puede deshacer."
        confirmText="Sí, Limpiar"
        cancelText="Cancelar"
        type="warning"
      />
    </div>
  );
};

export default AlcaldiaTableSimple;
