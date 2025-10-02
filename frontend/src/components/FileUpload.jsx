import React, { useState, useCallback } from 'react';
import './FileUpload.css';

const FileUpload = ({ onUpload, loading = false, disabled = false }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = useCallback((selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        selectedFile.type === 'application/vnd.ms-excel') {
      setFile(selectedFile);
    } else {
      alert('Por favor selecciona un archivo Excel válido (.xlsx o .xls)');
    }
  }, []);

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleUpload = useCallback(() => {
    console.log('🔍 FileUpload: handleUpload llamado');
    console.log('🔍 FileUpload: file =', file);
    console.log('🔍 FileUpload: onUpload =', onUpload);
    console.log('🔍 FileUpload: loading =', loading);
    console.log('🔍 FileUpload: disabled =', disabled);
    
    if (file && onUpload) {
      console.log('🔍 FileUpload: Llamando onUpload con archivo:', file.name);
      onUpload(file);
      setFile(null);
      // Limpiar el input
      const fileInput = document.getElementById('fileInput');
      if (fileInput) fileInput.value = '';
    } else {
      console.log('🔍 FileUpload: No se puede subir - file:', !!file, 'onUpload:', !!onUpload);
    }
  }, [file, onUpload, loading, disabled]);

  const handleSelectFile = useCallback(() => {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.click();
    }
  }, []);

  return (
    <div className="file-upload-container">
      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${loading || disabled ? 'disabled' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="upload-icon">
            <i className="bi bi-cloud-upload"></i>
          </div>
          <div className="upload-text">
            <h4>Arrastra tu archivo Excel aquí</h4>
            <p>o</p>
            <button 
              type="button"
              className="select-file-btn"
              onClick={handleSelectFile}
              disabled={loading || disabled}
            >
              Seleccionar Archivo
            </button>
          </div>
          <div className="upload-subtitle">
            <p>Formatos soportados: .xlsx, .xls</p>
          </div>
        </div>
        
        {/* Input oculto */}
        <input
          id="fileInput"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="file-input"
          disabled={loading || disabled}
        />
      </div>

      {file && (
        <div className="file-preview">
          <div className="file-info">
            <i className="bi bi-file-excel"></i>
            <div className="file-details">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
          <button 
            className="upload-btn"
            onClick={handleUpload}
            disabled={loading || disabled}
          >
            {loading ? (
              <>
                <i className="bi bi-hourglass-split"></i>
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
      )}
    </div>
  );
};

export default FileUpload;
