import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/design-system.css';
import './EnviaseoTable.css';

const EnviaseoTable = ({
  data,
  title,
  loading = false,
  emptyMessage = "No hay datos disponibles"
}) => {
  if (loading) {
    return (
      <div className="enviaseo-table-loading">
        <div className="enviaseo-loading-spinner"></div>
        <h3>Cargando datos...</h3>
        <p>Procesando información de control de acceso</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="enviaseo-table-empty">
        <div className="enviaseo-empty-icon">
          <i className="bi bi-shield-check"></i>
        </div>
        <h3>{emptyMessage}</h3>
        <p>No se encontraron registros de control de acceso. Sube un archivo Excel para comenzar.</p>
      </div>
    );
  }

  return (
    <div className="enviaseo-table-container">
      {/* Header */}
      <div className="enviaseo-table-header">
        <h2 className="enviaseo-table-title">
          <i className="bi bi-shield-check me-2"></i>
          {title}
        </h2>
        <div className="enviaseo-record-count">
          <i className="bi bi-list-ul me-1"></i>
          {data.length} registros
        </div>
      </div>

      {/* Tabla de datos */}
      <div className="enviaseo-table-wrapper">
        <table className="enviaseo-table">
          <thead>
            <tr>
              <th><i className="bi bi-person"></i>Nombre</th>
              <th><i className="bi bi-person"></i>Apellido</th>
              <th><i className="bi bi-card-text"></i>Cédula</th>
              <th><i className="bi bi-calendar"></i>Fecha</th>
              <th><i className="bi bi-clock"></i>Hora</th>
              <th><i className="bi bi-clock-history"></i>Horas</th>
              <th><i className="bi bi-plus-circle"></i>Extra</th>
            </tr>
          </thead>
          <tbody>
            {data.map((record, index) => (
              <tr 
                key={index} 
                className={index % 2 === 0 ? 'enviaseo-even-row' : 'enviaseo-odd-row'}
              >
                <td className="enviaseo-nombre">{record.nombre || record.firstName || '-'}</td>
                <td className="enviaseo-apellido">{record.apellido || record.lastName || '-'}</td>
                <td className="enviaseo-cedula">{record.cedula || record.personNo || '-'}</td>
                <td className="enviaseo-fecha">{record.fecha || '-'}</td>
                <td className="enviaseo-hora">{record.hora || '-'}</td>
                <td className="enviaseo-horas">{record.horasTrabajadas || record.horas || '-'}</td>
                <td className="enviaseo-extra">
                  {record.horasExtra && record.horasExtra > 0 ? (
                    <span className="enviaseo-extra-badge">
                      +{record.horasExtra}h
                    </span>
                  ) : (
                    <span className="enviaseo-no-extra">Sin extra</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EnviaseoTable;

