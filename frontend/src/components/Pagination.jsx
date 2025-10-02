import React, { useCallback } from 'react';
import './Pagination.css';

const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  totalRecords = 0, 
  limit = 10,
  startIndex = 0,
  endIndex = 0,
  onPageChange = null,
  loading = false 
}) => {
  const handlePageChange = useCallback((page) => {
    if (onPageChange && !loading && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  }, [onPageChange, loading, totalPages]);

  const handlePrevious = useCallback(() => {
    handlePageChange(currentPage - 1);
  }, [handlePageChange, currentPage]);

  const handleNext = useCallback(() => {
    handlePageChange(currentPage + 1);
  }, [handlePageChange, currentPage]);

  const getPageNumbers = useCallback(() => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span>
          Mostrando {startIndex + 1} - {endIndex} de {totalRecords} registros
        </span>
      </div>
      
      <div className="pagination-controls">
        <button 
          className="pagination-btn prev-btn"
          onClick={handlePrevious}
          disabled={currentPage === 1 || loading}
        >
          <i className="bi bi-chevron-left"></i>
          Anterior
        </button>
        
        <div className="page-numbers">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="page-ellipsis">...</span>
              ) : (
                <button
                  className={`page-btn ${page === currentPage ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                  disabled={loading}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <button 
          className="pagination-btn next-btn"
          onClick={handleNext}
          disabled={currentPage === totalPages || loading}
        >
          Siguiente
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
      
      <div className="pagination-summary">
        <span>Página {currentPage} de {totalPages}</span>
      </div>
    </div>
  );
};

export default Pagination;
