// src/App.jsx - VERSIÓN FINAL CON ARQUITECTURA DE LAYOUTS PÚBLICO Y PRIVADO

import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Outlet, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// --- Importación de Layouts y Componentes de Seguridad ---
import PublicLayout from './components/PublicLayout';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DesignDetailPage from './pages/DesignDetailPage';

// --- Importación de Páginas ---
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import PublicProfilePage from './pages/PublicProfilePage';
import LoginPage from './pages/LoginPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import DashboardPage from './pages/DashboardPage';
import MyDesignsPage from './pages/MyDesignsPage';
import DesignFormPage from './pages/DesignFormPage';
import SettingsPage from './pages/SettingsPage';
import InboxPage from './pages/InboxPage';
import PlansPage from './pages/PlansPage';

// --- Componentes Auxiliares de Ruteo e Idioma (Sin cambios) ---
const RedirectToLang = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const userLang = i18n.language.split('-')[0] || 'es';
  React.useEffect(() => {
    navigate(`/${userLang}`, { replace: true });
  }, [navigate, userLang]);
  return null;
};

// En App.jsx

const LanguageLayout = () => {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  
  // LA CORRECCIÓN ESTÁ AQUÍ:
  // Comparamos solo la primera parte del código de idioma (ej: 'es' de 'es-ES')
  const isLanguageReady = i18n.language.split('-')[0] === lang;

  React.useEffect(() => {
    if (!isLanguageReady) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n, isLanguageReady]);

  if (!isLanguageReady) {
    // Es posible que el texto de carga no se vea si no tiene un fondo.
    // Podríamos añadir un fondo aquí para que sea visible.
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold p-8 text-center">Cargando...</h1>
      </div>
    );
  }
  
  return <Outlet />;
};

// --- Componente Principal de la Aplicación ---
// Aquí definimos la estructura de todas las rutas de nuestra PWA.
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta inicial que redirige al idioma del navegador */}
        <Route path="/" element={<RedirectToLang />} />

        {/* Ruta base que gestiona el idioma (p. ej. /es, /en) */}
        <Route path="/:lang" element={<LanguageLayout />}>
          
          {/* =================================================================== */}
          {/*                   RUTAS PÚBLICAS                                  */}
          {/* Todas las páginas aquí dentro usarán el PublicLayout.             */}
          {/* =================================================================== */}
          <Route element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="explorar" element={<ExplorePage />} />
            <Route path="planes" element={<PlansPage />} />
            <Route path="diseno/:designId" element={<DesignDetailPage />} />
            
            {/* --- LA RUTA QUE FALTABA, AÑADIDA AQUÍ --- */}
            <Route path="perfil/:userId" element={<PublicProfilePage />} />

            {/* Futuras rutas públicas irían aquí, por ejemplo: */}
            {/* <Route path="diseñadores" element={<DesignersPage />} /> */}
          </Route>
          
          {/* =================================================================== */}
          {/*                 RUTAS DE AUTENTICACIÓN                            */}
          {/* Estas páginas no tienen layout para ocupar toda la pantalla.      */}
          {/* =================================================================== */}
          <Route path="login" element={<LoginPage />} />
          <Route path="complete-profile" element={<CompleteProfilePage />} />
          
          {/* =================================================================== */}
          {/*                   RUTAS PRIVADAS (PROTEGIDAS)                     */}
          {/* Protegidas por <ProtectedRoute> y con el <DashboardLayout>.     */}
          {/* =================================================================== */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="mis-disenos" element={<MyDesignsPage />} />
              <Route path="add-design" element={<DesignFormPage />} />
              <Route path="edit-design/:designId" element={<DesignFormPage />} />
              <Route path="mensajes" element={<InboxPage />} />
              <Route path="configuracion" element={<SettingsPage />} />
            </Route>
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
