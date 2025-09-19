// src/components/DashboardLayout.jsx - VERSIÓN FINAL Y COMPLETA CON LAYOUT FLEXBOX

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import DashboardHeader from './DashboardHeader.jsx';

function DashboardLayout() {
  // Estado para controlar si la sidebar está abierta en la vista móvil
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    // CONTENEDOR PRINCIPAL:
    // - Usa 'flex' para alinear los hijos (Sidebar y Contenido) horizontalmente.
    // - 'min-h-screen' asegura que ocupe al menos toda la altura de la pantalla.
    // - 'w-full' asegura que ocupe todo el ancho.
    <div className="flex min-h-screen w-full bg-gray-50">
      
      {/* HIJO 1: La Sidebar.
          - Se le pasa el estado y la función para controlar su visibilidad en móvil. */}
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* HIJO 2: El Contenido Principal.
          - 'flex-1' es la clave: le dice a este div que crezca y ocupe todo el
            espacio horizontal restante que no ocupa la Sidebar.
          - 'flex-col' hace que sus propios hijos (Header y Main) se apilen verticalmente.
          - 'lg:ml-64' es el ajuste crucial para escritorio. Le añade un margen izquierdo
            de 256px (el ancho de la sidebar, w-64) SOLO en pantallas grandes (lg),
            dejando el espacio perfecto para que la sidebar fija sea visible. */}
      <div className="flex flex-1 flex-col lg:ml-64">

        {/* El header que solo es visible en móvil para mostrar el botón de menú */}
        <DashboardHeader setSidebarOpen={setSidebarOpen} />
        
        {/* El área de contenido principal donde se renderizarán las páginas */}
        <main className="flex-1 p-4 sm:p-6">
          <Outlet /> 
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;