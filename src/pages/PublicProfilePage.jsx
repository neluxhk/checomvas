// src/pages/PublicProfilePage.jsx - VERSIÓN FINAL Y COMPLETA

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase/config.js';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';

// Tarjeta de diseño para la galería del perfil
const ProfileDesignCard = ({ design }) => (
    <Link className="group" to={`/es/diseno/${design.id}`}>
        <div className="overflow-hidden rounded-lg shadow-md transition-shadow duration-300 group-hover:shadow-xl">
            <div className="w-full bg-cover bg-center aspect-square transition-transform duration-300 group-hover:scale-105" style={{ backgroundImage: `url(${design.imageUrl})` }} />
        </div>
        <div className="pt-3">
            <h3 className="text-text-primary font-semibold leading-tight truncate">{design.title}</h3>
        </div>
    </Link>
);

function PublicProfilePage() {
  const { userId } = useParams(); // Obtenemos el ID del usuario de la URL
  const [profile, setProfile] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dentro de tu componente PublicProfilePage

useEffect(() => {
    // Función auxiliar para actualizar o crear meta tags
    const updateMeta = (name, content) => {
        let element = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
        if (!element) {
            element = document.createElement('meta');
            if (name.startsWith('og:')) {
                element.setAttribute('property', name);
            } else {
                element.setAttribute('name', name);
            }
            document.head.appendChild(element);
        }
        element.setAttribute('content', content);
    };

    if (!userId) {
      setLoading(false);
      setError("No se ha especificado un perfil de usuario.");
      return;
    }

    const fetchProfileAndDesigns = async () => {
      setLoading(true);
      setError('');
      try {
        const profileDocRef = doc(db, "users", userId);
        const docSnap = await getDoc(profileDocRef);

        if (docSnap.exists() && docSnap.data().isPublic) {
          const profileData = docSnap.data();
          setProfile(profileData);

          // --- INICIO DE LA LÓGICA DE SEO ---
          const seoTitle = `${profileData.fullName} - ${profileData.role} | Checomvas`;
          const seoDescription = `Perfil de ${profileData.fullName}, ${profileData.role} en Checomvas. Descubre sus proyectos de iluminación y contacta.`;
          
          document.title = seoTitle;
          updateMeta('description', seoDescription);
          updateMeta('og:title', seoTitle);
          updateMeta('og:description', seoDescription);
          updateMeta('og:image', profileData.logoUrl || 'URL_IMAGEN_POR_DEFECTO_SI_NO_TIENE_LOGO.jpg');
          updateMeta('og:url', window.location.href);
          // --- FIN DE LA LÓGICA DE SEO ---

          const designsQuery = query(collection(db, "designs"), where("userId", "==", userId));
          const unsubscribe = onSnapshot(designsQuery, (snapshot) => {
            const userDesigns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setDesigns(userDesigns);
          });
          // Idealmente, deberíamos retornar `unsubscribe` para limpiarlo
        } else {
          setError("Este perfil no existe o es privado.");
        }
      } catch (err) {
        setError("Error al cargar el perfil.");
        console.error("Error fetching profile:", err);
      }
      setLoading(false);
    };

    fetchProfileAndDesigns();
    
    // Función de limpieza para restaurar los meta tags
    return () => {
        document.title = 'Checomvas - Plataforma para Diseñadores de Iluminación';
        updateMeta('description', 'Conecta con diseñadores y fabricantes, explora proyectos innovadores y da vida a tus ideas.');
    };
}, [userId]);

  if (loading) {
    return <div className="p-6 text-center font-semibold">Cargando perfil...</div>;
  }

  if (error) {
    return <div className="p-6 text-center font-semibold text-red-500">{error}</div>;
  }

  if (!profile) {
    return null; // No renderizar nada si no hay perfil
  }

  return (
    <div className="p-4 md:p-6">
      {/* --- SECCIÓN DE HEADER DEL PERFIL --- */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-cover bg-center flex-shrink-0 border-4 border-white shadow-xl" style={{ backgroundImage: `url(${profile.logoUrl || 'https://via.placeholder.com/150'})` }}></div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary">{profile.fullName}</h1>
          <p className="text-lg text-blue-600 font-semibold mt-1">{profile.role}</p>
          <p className="text-md text-text-secondary mt-2">{profile.company}</p>
          <p className="text-sm text-gray-500 mt-1">{profile.city}, {profile.country}</p>
        </div>
      </div>

      {/* --- SECCIÓN DE GALERÍA DE DISEÑOS --- */}
      <div className="max-w-4xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Diseños</h2>
        {designs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {designs.map(design => (
              <ProfileDesignCard key={design.id} design={design} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="font-semibold text-gray-500">Este diseñador aún no ha publicado ningún diseño.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicProfilePage;