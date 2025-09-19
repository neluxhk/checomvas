// src/i18next.js - VERSIÓN FINAL Y OPTIMIZADA

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  // 1. Usa HttpApi para cargar las traducciones desde archivos JSON.
  //    Esto es más eficiente que tenerlas todas en el código.
  .use(HttpApi)
  
  // 2. Usa LanguageDetector para detectar el idioma del usuario.
  .use(LanguageDetector)
  
  // 3. Integra i18next con React.
  .use(initReactI18next)
  
  // 4. Inicializa la configuración.
  .init({
    // Idiomas que vamos a soportar.
    // El orden importa para la detección si no se encuentra un idioma exacto.
    supportedLngs: ['en', 'es', 'zh'],
    
    // Idioma por defecto si la detección falla o el idioma no está soportado.
    fallbackLng: 'en',
    
    // AÑADIDO: NAMESPACE POR DEFECTO. Ayuda a i18next a encontrar las claves.
    ns: ['translation'],
    defaultNS: 'translation',
    
    // Configuración para el detector de idioma.
    detection: {
      // Le decimos en qué orden buscar el idioma.
      // 'path' es el más importante para nosotros, ya que lee la URL (ej: /es/).
      order: ['path', 'cookie', 'localStorage', 'htmlTag', 'navigator'],
      
      // Guardamos el idioma seleccionado en una cookie para recordarlo.
      caches: ['cookie'],
    },
    
    // Configuración para el HttpApi.
    backend: {
      // Le decimos dónde encontrar nuestros "diccionarios" JSON.
      // {{lng}} es una variable que i18next reemplazará por 'es', 'en', etc.
      loadPath: '/locales/{{lng}}/translation.json',
    },
    
    // Opciones para la integración con React.
    react: {
      // Desactivamos Suspense para evitar complejidades innecesarias al principio.
      useSuspense: false,
      // AÑADIDO: BINDING. Asegura que los componentes se re-rendericen
      // cuando el archivo de idioma termine de cargarse.
      bindI18n: 'languageChanged',
    },

    // Opcional: activa los logs de i18next en la consola para depuración.
    // Ponlo en 'false' cuando lances a producción.
    debug: true, 
  });

export default i18n;