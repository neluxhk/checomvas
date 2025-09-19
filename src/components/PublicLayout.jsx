// src/components/PublicLayout.jsx - VERSIÓN FINAL Y COMPLETA CON ESTADO DE LOGIN

import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../firebase/config.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import LanguageSwitcher from './LanguageSwitcher';

const NavItem = ({ to, icon, label }) => (
    <NavLink 
      to={to} 
      end={to.endsWith('/es') || to.endsWith('/en') || to.endsWith('/')}
      className={({ isActive }) => 
        `flex flex-col items-center justify-center gap-1 transition-colors hover:text-public-primary/80 ${
          isActive ? 'text-public-primary' : 'text-text-secondary'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className="material-symbols-outlined !font-light text-3xl">{icon}</span>
          <p className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
            {label}
          </p>
        </>
      )}
    </NavLink>
);

function PublicLayout() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { lang } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      setIsMenuOpen(false);
      navigate(`/${lang}/login`);
    }).catch(console.error);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col justify-between bg-public-secondary">
      <div className="flex-grow">
        <header className="sticky top-0 z-20 bg-public-secondary/80 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4 container mx-auto">
            <h1 className="text-text-primary text-xl font-bold tracking-tight">CHECOMVAS</h1>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex h-10 w-10 items-center justify-center rounded-full text-text-primary">
              <span className="material-symbols-outlined text-3xl">menu</span>
            </button>
          </div>
        </header>
        
        {isMenuOpen && (
          <div className="absolute top-16 left-0 w-full bg-white shadow-lg z-10 p-4">
            <nav className="flex flex-col space-y-2 container mx-auto">
              {currentUser && userProfile ? (
                // --- VISTA PARA USUARIO LOGUEADO ---
                <>
                  <div className="px-2 py-2">
                    <p className="font-semibold text-gray-800">{t('dashboard_welcome', { name: userProfile.fullName.split(' ')[0] })}</p>
                    <p className="text-sm text-gray-500">{t(`roles.${userProfile.role}`, userProfile.role)}</p>
                  </div>
                  <NavLink to={`/${lang}/dashboard`} onClick={() => setIsMenuOpen(false)} className="font-semibold text-gray-700 hover:text-blue-600 py-2">
                    {t('sidebar_dashboard')}
                  </NavLink>
                  <button onClick={handleLogout} className="text-left font-semibold text-red-600 hover:text-red-800 py-2">
                    {t('sidebar_logout')}
                  </button>
                </>
              ) : (
                // --- VISTA PARA VISITANTE ---
                <>
                  <NavLink to={`/${lang}/login`} onClick={() => setIsMenuOpen(false)} className="font-semibold text-gray-700 hover:text-blue-600 py-2">
                    {t('login_tab_signin')}
                  </NavLink>
                  <NavLink to={`/${lang}/explorar`} onClick={() => setIsMenuOpen(false)} className="font-semibold text-gray-700 hover:text-blue-600 py-2">
                    {t('sidebar_explore')}
                  </NavLink>
                </>
              )}

              <div className="border-t pt-4 mt-2">
                <LanguageSwitcher closeMenu={() => setIsMenuOpen(false)} />
              </div>
            </nav>
          </div>
        )}

        <main className="container mx-auto">
          <Outlet />
        </main>
      </div>
      <footer className="sticky bottom-0 z-10 border-t border-gray-200 bg-public-secondary/90 backdrop-blur-sm">
        <nav className="flex items-center justify-around px-4 py-2">
            <NavItem to={`/${lang}`} icon="home" label="Inicio" />
            <NavItem to={`/${lang}/diseñadores`} icon="group" label="Diseñadores" />
            <NavItem to={`/${lang}/explorar`} icon="explore" label="Explorar" />
            <NavItem to={`/${lang}/contacto`} icon="email" label="Contacto" />
        </nav>
      </footer>
    </div>
  );
}

export default PublicLayout;