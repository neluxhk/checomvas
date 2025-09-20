// src/pages/SettingsPage.jsx - VERSIÓN FINAL CON CAMBIO DE CONTRASEÑA

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth } from '../firebase/config.js';
import { onAuthStateChanged, updatePassword } from 'firebase/auth';

function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams();

  const [currentUser, setCurrentUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Nos aseguramos de tener siempre el usuario actual
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        navigate(`/${lang}/login`);
      }
    });
    return () => unsubscribe();
  }, [navigate, lang]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 1. Verificación de contraseñas
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden."); // Futuro: traducir
      return;
    }
    if (newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres."); // Futuro: traducir
      return;
    }

    setLoading(true);

    try {
      // 2. Llamada a Firebase para actualizar la contraseña
      await updatePassword(currentUser, newPassword);
      
      setSuccess("¡Contraseña actualizada con éxito!"); // Futuro: traducir
      setNewPassword('');
      setConfirmPassword('');

    } catch (error) {
      console.error("Error al actualizar la contraseña:", error);
      // Firebase puede requerir re-autenticación si el login no es reciente
      if (error.code === 'auth/requires-recent-login') {
        setError("Esta operación es sensible y requiere que inicies sesión de nuevo. Por favor, cierra la sesión y vuelve a entrar antes de cambiar la contraseña."); // Futuro: traducir
      } else {
        setError("Hubo un error al actualizar la contraseña."); // Futuro: traducir
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
        {t('sidebar_settings')}
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Cambiar Contraseña</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password"className="block text-sm font-medium text-gray-700">
              Nueva Contraseña
            </label>
            <input 
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="confirm-password"className="block text-sm font-medium text-gray-700">
              Confirmar Nueva Contraseña
            </label>
            <input 
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingsPage;