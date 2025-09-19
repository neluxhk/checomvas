// src/components/Modal.jsx

import React, { useEffect } from 'react';

function Modal({ isOpen, onClose, title, children }) {
  // Efecto para evitar el scroll del fondo cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Limpiamos el efecto cuando el componente se desmonta
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // Fondo oscuro (overlay)
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose} // Cierra el modal si se hace clic en el fondo
    >
      {/* Contenedor del modal */}
      <div 
        className="relative w-full max-w-lg bg-white rounded-lg shadow-xl p-6 m-4"
        onClick={(e) => e.stopPropagation()} // Evita que se cierre al hacer clic dentro del modal
      >
        {/* Header del modal */}
        <div className="flex items-start justify-between pb-4 border-b rounded-t">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button 
            type="button" 
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
            <span className="sr-only">Cerrar modal</span>
          </button>
        </div>
        {/* Contenido del modal (aquí irá nuestra guía) */}
        <div className="pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;