// src/components/DashboardHeader.jsx

import React from 'react';

function DashboardHeader({ setSidebarOpen }) {
  return (
    // Este header solo se mostrará en pantallas pequeñas (lg:hidden)
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-6 lg:hidden">
      <button 
        onClick={() => setSidebarOpen(true)}
        className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>
      <h1 className="flex-1 text-lg font-semibold">Dashboard</h1>
    </header>
  );
}

export default DashboardHeader;