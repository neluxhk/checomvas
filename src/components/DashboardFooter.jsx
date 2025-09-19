// src/components/DashboardFooter.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';

const NavItem = ({ to, icon, label }) => (
    <NavLink to={to} className={({ isActive }) => `flex flex-col items-center justify-center gap-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
        <span className="material-symbols-outlined text-3xl">{icon}</span>
        <p className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</p>
    </NavLink>
);

function DashboardFooter() {
  // Este footer SÍ debe aparecer en pantallas grandes,
  // ya que tu nuevo diseño de dashboard es principalmente móvil.
  return (
    <footer className="bg-white/80 backdrop-blur-sm sticky bottom-0 z-10 border-t border-gray-200">
      <nav className="flex justify-around items-center h-20 container mx-auto px-4">
        <NavItem to="/es/dashboard" icon="dashboard" label="Dashboard" />
        <NavItem to="/es/mis-disenos" icon="lightbulb" label="Diseños" />
        <NavItem to="#" icon="bar_chart" label="Estadísticas" />
        <NavItem to="/es/complete-profile" icon="person" label="Perfil" />
      </nav>
    </footer>
  );
}

export default DashboardFooter;