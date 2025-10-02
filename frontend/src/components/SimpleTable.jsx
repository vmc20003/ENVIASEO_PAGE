import React, { useState, useCallback, useMemo } from 'react';
import './SimpleTable.css';

const SimpleTable = ({ 
  data = [], 
  columns = [], 
  loading = false, 
  emptyMessage = "No hay datos disponibles",
  sortable = true 
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = useCallback((key) => {
    if (!sortable) return;
    
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  }, [sortable]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  if (loading) {
    return (
      <div className="table-loading">
        <div className="loading-spinner">
          <i className="bi bi-hourglass-split"></i>
        </div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <div className="table-empty">
        <div className="empty-icon">
          <i className="bi bi-inbox"></i>
        </div>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="simple-table-container">
      <div className="table-wrapper">
        <table className="simple-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className={`table-header ${column.sortable && sortable ? 'sortable' : ''}`}
                  onClick={() => column.sortable && sortable && handleSort(column.key)}
                >
                  <div className="header-content">
                    <span>{column.label}</span>
                    {column.sortable && sortable && (
                      <div className="sort-indicators">
                        <i 
                          className={`bi bi-chevron-up ${sortConfig.key === column.key && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        ></i>
                        <i 
                          className={`bi bi-chevron-down ${sortConfig.key === column.key && sortConfig.direction === 'desc' ? 'active' : ''}`}
                        ></i>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={index} className="table-row">
                {columns.map((column) => (
                  <td key={column.key} className="table-cell">
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SimpleTable;
