// src/components/Sidebar.jsx - VERSIÓN FINAL Y COMPLETA CON SELECTOR DE IDIOMA DESPLEGABLE

import React from 'react';
import { NavLink, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth } from '../firebase/config.js';
import { signOut } from 'firebase/auth';
import LanguageSwitcher from './LanguageSwitcher'; // 1. Importamos el nuevo componente

// Componente para cada enlace de la navegación (NavLink)
const NavItem = ({ to, icon, children }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 ${
        isActive
          ? 'bg-blue-100 text-blue-600 font-semibold'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`
    }
  >
    <span className="material-symbols-outlined">{icon}</span>
    {children}
  </NavLink>
);

function Sidebar({ isSidebarOpen, setSidebarOpen }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useParams();

  React.useEffect(() => {
    if (isSidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isSidebarOpen, setSidebarOpen]);

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate(`/${lang}/login`);
    }).catch(console.error);
  };

  return (
    <>
      {isSidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 z-20 bg-black/60 transition-opacity duration-300 lg:hidden"
        ></div>
      )}
      
      <aside className={`fixed inset-y-0 left-0 z-30 flex h-full w-64 flex-col border-r bg-white transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center px-6">
          <NavLink to={`/${lang}/dashboard`} className="flex items-center gap-2 font-semibold">
            <span className="material-symbols-outlined text-blue-600">lightbulb</span>
            <span className="text-lg">CHECOMVAS</span>
          </NavLink>
        </div>
        
        <nav className="flex-1 space-y-2 p-4 font-medium">
          {/* Navegación Principal */}
          <NavItem to={`/${lang}/dashboard`} icon="dashboard">{t('sidebar_dashboard')}</NavItem>
          <NavItem to={`/${lang}/mis-disenos`} icon="design_services">{t('sidebar_my_designs')}</NavItem>
          <NavItem to={`/${lang}/explorar`} icon="search">{t('sidebar_explore')}</NavItem>
          
          {/* Botón de Acción Principal */}
          <div className="px-3 pt-4">
            <NavLink to={`/${lang}/add-design`} className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700">
              <span className="material-symbols-outlined">add_circle</span>
              {t('sidebar_upload_design')}
            </NavLink>
          </div>
          
          {/* Separador y Acciones Secundarias */}
          <div className="pt-4 mt-4 border-t">
            {/* --- ENLACE A PLANES AÑADIDO AQUÍ --- */}
            <NavItem to={`/${lang}/planes`} icon="workspace_premium">{t('sidebar_plans')}</NavItem>
            
            <NavItem to={`/${lang}/configuracion`} icon="settings">{t('sidebar_settings')}</NavItem> 
          </div>
        </nav>

        {/* =================================================================== */}
        {/*           2. INTEGRAMOS EL NUEVO SELECTOR DE IDIOMA AQUÍ            */}
        {/*           'mt-auto' lo empuja hacia el fondo.                      */}
        {/* =================================================================== */}
        <div className="p-4 mt-auto">
          <LanguageSwitcher />
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 mt-4">
            <span className="material-symbols-outlined">logout</span>
            {t('sidebar_logout')}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;