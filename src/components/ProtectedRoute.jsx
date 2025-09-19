// src/components/ProtectedRoute.jsx

import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config.js';

function ProtectedRoute() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Usamos onAuthStateChanged para escuchar el estado del usuario en tiempo real
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Limpiamos el "oyente" cuando el componente se desmonta
    return () => unsubscribe();
  }, []);

  // Mientras comprobamos si hay un usuario, mostramos un mensaje de carga
  if (loading) {
    return <div>Verificando autenticación...</div>;
  }

  // Si no hay usuario, redirigimos a la página de login.
  // `replace` evita que el usuario pueda volver atrás en el historial del navegador.
  if (!user) {
    return <Navigate to="/es/login" replace />;
  }

  // Si hay un usuario, mostramos la página solicitada (Dashboard, Mis Diseños, etc.)
  return <Outlet />;
}

export default ProtectedRoute;