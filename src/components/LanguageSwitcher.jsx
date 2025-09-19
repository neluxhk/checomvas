// src/components/LanguageSwitcher.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Lista de idiomas soportados. Cuando quieras añadir más, solo tienes que tocar aquí.
const LANGUAGES = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' }, // Chino
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { lang, '*': path } = useParams();
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const changeLanguage = (newLangCode) => {
    i18n.changeLanguage(newLangCode);
    navigate(`/${newLangCode}/${path || ''}`);
    setIsOpen(false);
  };

  // Efecto para cerrar el menú si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLanguage = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
      >
        <span className="material-symbols-outlined text-lg">language</span>
        {currentLanguage.name}
        <span className={`material-symbols-outlined text-lg transition-transform ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 w-full min-w-max rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
          {LANGUAGES.map(({ code, name }) => (
            <button
              key={code}
              onClick={() => changeLanguage(code)}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;