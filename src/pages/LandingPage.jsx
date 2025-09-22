// src/pages/LandingPage.jsx - VERSIÓN FINAL CON ENLACES DE DISEÑO DINÁMICOS

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase/config.js';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import heroImage from '../assets/quarrybay.jpg';
import { Link, useParams } from 'react-router-dom'; // 1. Importamos useParams
import { getOptimizedImageUrl } from '../utils/imageUtils.js';

// --- Componente Hero (sin cambios) ---
const Hero = () => {
  const { t } = useTranslation();
  return (
    <div className="relative">
        <div 
            className="flex min-h-[60vh] flex-col gap-6 items-center justify-center p-8 text-center bg-cover bg-center" 
            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${heroImage})` }}
        >
            <h1 className="text-white text-5xl md:text-7xl font-black tracking-tighter">{t('landing_hero_title')}</h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl">{t('landing_hero_subtitle')}</p>
        </div>
    </div>
  );
};

// --- Componente "Recién Incorporado" ---
const RecentDesigns = () => {
  const { t } = useTranslation();
  const { lang } = useParams();
  const [recentDesigns, setRecentDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
        collection(db, "designs"), 
        where("public", "==", true), 
        orderBy("createdAt", "desc"), 
        limit(4)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const designs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentDesigns(designs);
      setLoading(false);
    }, (error) => {
      console.error("Error al obtener diseños recientes:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <section className="py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10 text-text-primary">{t('landing_recent_title')}</h2>
        
        {loading ? (
          <p className="text-center text-text-secondary">Cargando los últimos diseños...</p>
        ) : recentDesigns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentDesigns.map(design => {
              // Lógica de compatibilidad para la URL de la imagen
              const imageUrl = design.imageFileName 
                ? getOptimizedImageUrl(design.imageFileName, '200x200', design.userId) 
                : design.imageUrl;

              return (
                <Link to={`/${lang}/diseno/${design.id}`} key={design.id} className="bg-white rounded-xl shadow-md overflow-hidden group transition-transform duration-300 hover:-translate-y-1">
                  <div 
                    className="w-full h-48 bg-gray-100 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${imageUrl || ''})` }}
                  ></div>
                  <div className="p-4">
                    <p className="font-semibold truncate text-text-primary">{design.title}</p>
                    <p className="text-sm text-text-secondary line-clamp-2 break-words">{design.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-text-secondary">Todavía no hay diseños públicos. ¡Sé el primero en subir uno!</p>
        )}
      </div>
    </section>
  );
};

// --- Componente "Cómo Funciona" (sin cambios) ---
const HowItWorks = () => {
  const { t } = useTranslation();
  const steps = [
    { icon: "person_add", title: t('landing_step1_title'), description: t('landing_step1_desc') },
    { icon: "lightbulb", title: t('landing_step2_title'), description: t('landing_step2_desc') },
    { icon: "handshake", title: t('landing_step3_title'), description: t('landing_step3_desc') }
  ];

  return (
    <section className="py-12 md:py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary">{t('landing_howitworks_title')}</h2>
          <p className="mt-4 text-lg text-text-secondary">{t('landing_howitworks_subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {steps.map(step => (
            <div key={step.title} className="flex flex-col items-center">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 text-blue-600 mb-4">
                <span className="material-symbols-outlined text-4xl">{step.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">{step.title}</h3>
              <p className="text-text-secondary">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

function LandingPage() {
  return (
    <>
      <title>Checomvas - Conectando a Diseñadores de Iluminación</title>
      <meta name="description" content="La plataforma para conectar con los mejores diseñadores y fabricantes de productos iluminación." />
      
      <Hero />
      <RecentDesigns />
      <HowItWorks />
    </>
  );
}

export default LandingPage;