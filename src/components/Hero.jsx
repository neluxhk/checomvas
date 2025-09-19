// src/components/Hero.jsx

import React from 'react';
// ===================================================================
//           1. IMPORTAMOS 'Link' de react-router-dom
// ===================================================================
import { Link } from 'react-router-dom';
import heroImage from '../assets/quarrybay.jpg'; 

function Hero() {
  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.5) 100%), url(${heroImage})`,
  };

  return (
    <div className="relative">
      <div
        className="flex min-h-[60vh] flex-col gap-6 bg-cover bg-center bg-no-repeat items-center justify-center p-8 text-center"
        style={heroStyle}
      >
        <h1 className="text-white text-6xl font-black leading-tight tracking-tighter md:text-8xl">
          CHECOMVAS
        </h1>
        <p className="text-white/90 text-lg font-light md:text-xl max-w-2xl">
          Conecta con los mejores diseñadores y fabricantes de iluminación del mundo. Descubre diseños innovadores y da vida a tus proyectos.
        </p>
        
        {/* ====================================================== */}
        {/*   2. REEMPLAZAMOS <button> por el componente <Link>    */}
        {/*   y le añadimos la propiedad 'to' para que navegue.     */}
        {/* ====================================================== */}
        <Link 
          to="/es/explorar"
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-blue-600 text-white text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-blue-500/50 transition-transform duration-200 hover:scale-105"
        >
          <span className="truncate">Explorar Diseños</span>
        </Link>
        
      </div>
    </div>
  );
}

export default Hero;