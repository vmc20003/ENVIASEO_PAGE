import React, { useState, useEffect } from 'react';
// import fondo from './fondo.jpg';

const PAGE_SIZE = 10;

function App() {
  const [file, setFile] = useState(null);
  const [digits, setDigits] = useState('');
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);
  const [files, setFiles] = useState([]);
  const [cedula, setCedula] = useState('');
  const [resultados, setResultados] = useState([]);

  const handleFileChange = e => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setMessage('Subiendo archivo...');
    await fetch('http://localhost:4000/upload', {
      method: 'POST',
      body: formData
    });
    setMessage('Archivo subido. Ahora puedes buscar.');
    fetchFiles();
  };

  useEffect(() => {
    const fetchResultados = async () => {
      if (cedula.length === 0) {
        setResultados([]);
        setPage(1);
        return;
      }
      setMessage('Buscando...');
      const res = await fetch(`http://localhost:4000/buscar/${cedula}`);
      const data = await res.json();
      setResultados(data);
      setPage(1);
      setMessage('');
    };
    fetchResultados();
  }, [cedula]);

  // Obtener archivos subidos
  const fetchFiles = () => {
    fetch('http://localhost:4000/files')
      .then(res => res.json())
      .then(data => setFiles(data));
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Función para buscar usando un archivo ya subido
  const handleSearchFile = async (filename) => {
    setMessage('Procesando archivo seleccionado...');
    await fetch(`http://localhost:4000/process/${filename}`, { method: 'POST' });
    setMessage('Archivo procesado. Ahora puedes buscar.');
  };

  // Función para eliminar archivo
  const handleDeleteFile = async (filename) => {
    if (!window.confirm('¿Seguro que deseas eliminar este archivo?')) return;
    await fetch(`http://localhost:4000/files/${filename}`, { method: 'DELETE' });
    fetchFiles();
  };

  // Paginación
  const totalPages = Math.ceil(results.length / PAGE_SIZE);
  const paginatedResults = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="app-bg min-vh-100 d-flex flex-column align-items-center justify-content-center py-4 position-relative" style={{
      background: `url(/fondo.jpg) center center / cover no-repeat fixed`,
      minHeight: '100vh'
    }}>
      {/* Flores decorativas, sin interferir con el logo */}
      {/* (Eliminadas todas las flores) */}
      {/* Logo grande arriba a la izquierda, no fijo */}
      <div style={{position: 'absolute', top: '10px', left: '40px', zIndex: 10}}>
        <img src="/logo_enviaseo.png" alt="Logo" style={{height: '140px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 8px #0001', padding: '8px'}} />
      </div>
      <div className="d-flex flex-column align-items-center w-100" style={{zIndex: 1}}>
        {/* Margen superior grande para evitar superposición */}
        <div style={{height: '100px'}}></div>
        <div className="bg-white bg-opacity-95 rounded-4 shadow-lg p-4 w-100 d-flex flex-column align-items-center justify-content-center" style={{maxWidth: '700px', border: '4px solid #81c784', position: 'relative', zIndex: 1, marginTop: '40px'}}>
          <h2 className="fs-3 fw-bold text-warning mb-3 text-center">Subir archivo de asistencia</h2>
          <div className="mb-3 w-100 d-flex justify-content-center">
            <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="form-control form-control-lg" style={{maxWidth: '400px'}} />
          </div>
          <button onClick={handleUpload} className="btn btn-success btn-lg mb-4 w-100 shadow-sm">
            <i className="bi bi-upload me-2"></i> Subir archivo
          </button>
          <div className="mb-3 d-flex align-items-center w-100 justify-content-center">
            <input
              type="text"
              maxLength={15}
              placeholder="Cédula"
              value={cedula}
              onChange={e => setCedula(e.target.value.replace(/\D/, ''))}
              className="form-control form-control-lg me-3 shadow-sm"
              style={{maxWidth: '250px'}}
            />
            <span className="text-muted">(Ingresa la cédula completa)</span>
          </div>
          {message && <div className="alert alert-info text-center w-100">{message}</div>}
          <div className="table-responsive w-100 d-flex justify-content-center">
            <table className="table table-bordered table-hover align-middle mt-3 shadow-sm text-center" style={{maxWidth: '700px', margin: '0 auto', background: 'rgba(255,255,255,0.7)'}}>
              <thead className="table-success" style={{background: '#e0e0e0'}}>
                <tr style={{background: '#e0e0e0'}}>
                  <th className="text-center">Nombre</th>
                  <th className="text-center">Apellido</th>
                  <th className="text-center">Cédula</th>
                  <th className="text-center">Punto de Acceso</th>
                  <th className="text-center">Tipo de Asistencia</th>
                </tr>
              </thead>
              <tbody style={{background: 'rgba(255,255,255,0.7)'}}>
                {paginatedResults.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-muted">No hay resultados para mostrar.</td></tr>
                ) : (
                  paginatedResults.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.nombre}</td>
                      <td>{row.apellido}</td>
                      <td>{row.cedula}</td>
                      <td>{row.punto_acceso}</td>
                      <td>{row.tipo_asistencia}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Paginación */}
          {totalPages > 1 && (
            <nav aria-label="Paginación de resultados" className="mt-3">
              <ul className="pagination justify-content-center">
                <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page - 1)}>&laquo;</button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i} className={`page-item${page === i + 1 ? ' active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page + 1)}>&raquo;</button>
                </li>
              </ul>
            </nav>
          )}
          {/* Archivos subidos */}
          <div className="w-100 mt-5 d-flex flex-column align-items-center justify-content-center">
            <h3 className="fs-5 fw-bold text-success mb-3 text-center">Archivos subidos</h3>
            <div className="table-responsive d-flex justify-content-center">
              <table className="table table-striped table-bordered shadow-sm text-center" style={{maxWidth: '600px', margin: '0 auto', background: 'rgba(255,255,255,0.7)'}}>
                <thead className="table-info" style={{background: '#FFA726'}}>
                  <tr style={{background: '#FFA726'}}>
                    <th style={{background: '#FFA726', color: '#000'}}>Nombre del archivo</th>
                    <th style={{background: '#FFA726', color: '#000'}}>Fecha de subida</th>
                    <th style={{background: '#FFA726', color: '#000'}}>Acciones</th>
                  </tr>
                </thead>
                <tbody style={{background: 'rgba(255,255,255,0.7)'}}>
                  {files.length === 0 ? (
                    <tr style={{background: 'rgba(255,255,255,0.7)'}}>
                      <td colSpan={3} className="text-center text-muted" style={{background: 'rgba(255,255,255,0.7)'}}>No hay archivos subidos.</td>
                    </tr>
                  ) : (
                    files.map((file, idx) => (
                      <tr key={idx} style={{background: 'rgba(255,255,255,0.7)'}}>
                        <td style={{background: 'rgba(255,255,255,0.7)'}}>{file.name}</td>
                        <td style={{background: 'rgba(255,255,255,0.7)'}}>{new Date(file.mtime).toLocaleString()}</td>
                        <td style={{background: 'rgba(255,255,255,0.7)'}}>
                          <a href={`http://localhost:4000/files/${file.name}`} className="btn btn-outline-primary btn-sm me-2" download>
                            Descargar
                          </a>
                          <button className="btn btn-outline-success btn-sm me-2" onClick={() => handleSearchFile(file.name)}>
                            Usar para buscar
                          </button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteFile(file.name)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 