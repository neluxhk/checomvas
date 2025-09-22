// src/pages/MyDesignsPage.jsx - VERSIÓN FINAL Y COMPLETA CON TRADUCCIONES

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Importar
import { getOptimizedImageUrl } from '../utils/imageUtils.js';
import { auth, db, storage } from '../firebase/config.js';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';

// --- Componente para una tarjeta de diseño ---
const DesignCard = ({ design, handleDelete }) => {
  const { t } = useTranslation();
  const { lang } = useParams();

  // Lógica de compatibilidad para imágenes nuevas y antiguas.
  const imageUrl = design.imageFileName 
  ? getOptimizedImageUrl(design.imageFileName, '200x200', design.userId) 
  : design.imageUrl;

  // --- INICIO DE BLOQUE DE DEPURACIÓN ---
  // Este bloque nos ayudará a encontrar por qué la imagen no se muestra.
  // Puedes eliminarlo una vez que todo funcione.
  if (design.imageFileName) {
    console.log(
      `[MyDesignsPage] Depurando diseño: "${design.title}"`,
      {
        nombreArchivoFirestore: design.imageFileName,
        urlGeneradaParaMostrar: imageUrl
      }
    );
  }
  // --- FIN DE BLOQUE DE DEPURACIÓN ---

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden group">
      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
        {/* Aseguramos que si la URL es nula o indefinida, el 'src' sea una cadena vacía para evitar errores. */}
        <img src={imageUrl || ''} alt={design.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 truncate">{design.title}</h3>
        <p className="text-sm text-gray-600 mt-1 h-10 overflow-hidden">{design.description}</p>
      </div>
      <div className="p-4 bg-gray-50 flex justify-end gap-2">
          <Link to={`/${lang}/edit-design/${design.id}`} className="text-xs font-semibold text-blue-600 hover:text-blue-800">{t('my_designs_edit')}</Link>
          <button onClick={() => handleDelete(design.id)} className="text-xs font-semibold text-red-600 hover:text-red-800">{t('my_designs_delete')}</button>
      </div>
    </div>
  );
};

// --- Componente para un "slot" vacío ---
const AddDesignSlot = ({ onClick }) => {
  const { t } = useTranslation();
  return (
      <button onClick={onClick} className="flex items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="text-center">
              <span className="material-symbols-outlined text-5xl text-gray-400">add_circle</span>
              <p className="mt-2 font-semibold text-gray-600">{t('my_designs_add_new')}</p>
          </div>
      </button>
  );
};


function MyDesignsPage() {
  const { t } = useTranslation(); // 2. Inicializar
  const navigate = useNavigate();
  const { lang } = useParams();
  const [user, setUser] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Efecto para escuchar el estado de autenticación y asegurar que el usuario está logueado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate(`/${lang}/login`);
      }
    });
    return () => unsubscribe();
  }, [navigate, lang]);

  // Efecto para obtener los diseños del usuario en tiempo real desde Firestore
  // REEMPLAZA TU useEffect de onAuthStateChanged CON ESTE
useEffect(() => {
    // Esta función se ejecutará cada vez que cambie el estado de autenticación
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
            // Usuario está logueado, lo guardamos en el estado
            setUser(currentUser);
            
            // ¡NUEVA LÓGICA! AHORA QUE SABEMOS QUE HAY USUARIO, CREAMOS LA CONSULTA AQUÍ.
            const q = query(collection(db, "designs"), where("userId", "==", currentUser.uid));

            // Creamos el listener para los diseños
            const unsubscribeDesigns = onSnapshot(q, (querySnapshot) => {
                const userDesigns = [];
                querySnapshot.forEach((doc) => {
                    userDesigns.push({ id: doc.id, ...doc.data() });
                });
                setDesigns(userDesigns);
                setLoading(false);
            }, (err) => {
                console.error("Error obteniendo diseños:", err);
                setError("No se pudieron cargar tus diseños.");
                setLoading(false);
            });
            
            // Devolvemos una función de limpieza para el listener de diseños
            return () => unsubscribeDesigns();

        } else {
            // Usuario no está logueado
            setUser(null);
            setDesigns([]); // Limpiamos los diseños
            setLoading(false);
            navigate(`/${lang}/login`);
        }
    });

    // Devolvemos la función de limpieza para el listener de autenticación
    return () => unsubscribeAuth();
}, [navigate, lang]); // Las dependencias ahora son solo navigate y lang

  // Nueva función para borrar un diseño
  // VERSIÓN FINAL Y ROBUSTA DE LA FUNCIÓN DE BORRADO
// VERSIÓN FINAL Y CORREGIDA DE handleDelete
const handleDelete = async (designId) => {
    if (!window.confirm(t('my_designs_delete_confirm'))) {
      return;
    }

    try {
      setError('');
      
      const designToDelete = designs.find(d => d.id === designId);
      if (!designToDelete) throw new Error("Diseño no encontrado");

      // Borramos las imágenes de Firebase Storage
      if (designToDelete.imageFileName) {
        // LÓGICA NUEVA Y CORREGIDA
        const originalFileName = designToDelete.imageFileName;
        const baseName = originalFileName.substring(0, originalFileName.lastIndexOf('.'));
        const userId = designToDelete.userId; // Necesitamos el UID del usuario

        // CORRECCIÓN: Construimos la ruta completa, incluyendo el UID del usuario.
        const originalRef = ref(storage, `designs/${userId}/${originalFileName}`);
        const thumbRef = ref(storage, `designs/${userId}/${baseName}_200x200.webp`);
        const largeRef = ref(storage, `designs/${userId}/${baseName}_1000x1000.webp`);

        await Promise.all([
          deleteObject(originalRef).catch(e => {}),
          deleteObject(thumbRef).catch(e => {}),
          deleteObject(largeRef).catch(e => {})
        ]);
        console.log("Archivos de imagen borrados de Storage.");

      } else if (designToDelete.imageUrl) {
        // LÓGICA ANTIGUA (sin cambios, ya era correcta)
        const imageRef = ref(storage, designToDelete.imageUrl);
        await deleteObject(imageRef);
        console.log("Imagen (antigua) borrada de Storage.");
      }

      // Borramos el documento de Firestore
      await deleteDoc(doc(db, "designs", designId));
      console.log("Documento borrado de Firestore.");

    } catch (err) {
      console.error("Error al borrar el diseño:", err);
      setError("No se pudo borrar el diseño. Inténtalo de nuevo más tarde.");
    }
  };

  // Lógica para renderizar los 3 slots (con diseños o vacíos)
  const renderDesignSlots = () => {
    const slots = [];
    for (let i = 0; i < 3; i++) {
      if (i < designs.length) {
        slots.push(<DesignCard key={designs[i].id} design={designs[i]} handleDelete={handleDelete} />);
      } else {
        slots.push(<div key={`slot-${i}`} className="min-h-[280px]"><AddDesignSlot onClick={() => navigate(`/${lang}/add-design`)} /></div>);
      }
    }
    return slots;
  };

  if (loading) {
    return <div className="text-center p-10 font-semibold">{t('my_designs_loading')}</div>;
  }
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{t('my_designs_title')}</h1>
          <button onClick={() => navigate(`/${lang}/dashboard`)} className="text-sm font-semibold text-blue-600">{t('my_designs_back_to_dashboard')}</button>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
        <p className="text-gray-600 mb-6">{t('my_designs_subtitle')}</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderDesignSlots()}
        </div>
      </main>
    </div>
  );
}

export default MyDesignsPage;