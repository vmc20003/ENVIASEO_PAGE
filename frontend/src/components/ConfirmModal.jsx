import React, { useEffect } from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({
  isOpen = false,
  onConfirm = null,
  onCancel = null,
  title = "Confirmar Acción",
  message = "¿Estás seguro?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning"
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return 'bi-exclamation-triangle';
      case 'danger':
        return 'bi-x-circle';
      case 'info':
        return 'bi-info-circle';
      case 'success':
        return 'bi-check-circle';
      default:
        return 'bi-question-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return '#ff9800';
      case 'danger':
        return '#f44336';
      case 'info':
        return '#2196f3';
      case 'success':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-icon" style={{ color: getIconColor() }}>
          <i className={`bi ${getIcon()}`}></i>
        </div>
        
        <div className="modal-content">
          <h3 className="modal-title">{title}</h3>
          <p className="modal-message">{message}</p>
        </div>
        
        <div className="modal-actions">
          <button 
            className="modal-btn cancel-btn"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`modal-btn confirm-btn ${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
