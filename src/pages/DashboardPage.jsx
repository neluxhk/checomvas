// src/pages/DashboardPage.jsx - VERSIÓN FINAL, COMPLETA Y MULTILINGÜE

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Importamos el hook de traducción
import { auth, db } from '../firebase/config.js';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { getOptimizedImageUrl } from '../utils/imageUtils.js';


// --- WIDGET DE PERFIL ---
const ProfileCard = ({ profile }) => {
  const { t } = useTranslation();
  const { lang } = useParams();
  return (
    <section>
        <h2 className="text-xl md:text-2xl font-bold px-2 pb-4 text-gray-800">{t('dashboard_profile_title')}</h2>
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-md shadow-gray-200/50">
            <div className="flex-1">
                <p className="text-gray-800 text-lg font-bold">{profile.fullName}</p>
                <p className="text-gray-500 text-sm">{profile.role}</p>
                <Link to={`/${lang}/complete-profile`} className="mt-4 flex items-center justify-center rounded-lg h-10 px-4 bg-blue-600 text-white gap-2 text-sm font-medium w-fit transition-transform active:scale-95 hover:bg-blue-700">
                    <span className="material-symbols-outlined text-base">edit</span>
                    <span>{t('dashboard_edit_profile')}</span>
                </Link>
            </div>
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-cover bg-center flex-shrink-0 border-4 border-white shadow-lg" style={{ backgroundImage: `url(${profile.logoUrl || 'https://via.placeholder.com/150'})` }}></div>
        </div>
    </section>
  );
};

// --- WIDGET DE DISEÑOS ---
const DesignsSection = ({ designs }) => {
  const { t } = useTranslation();
  const { lang } = useParams();
  return (
    <section>
        <div className="flex justify-between items-center px-2 pb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">{t('dashboard_designs_title')}</h2>
            <Link to={`/${lang}/mis-disenos`} className="text-sm font-medium text-blue-600 flex items-center gap-1 hover:underline">
                {t('dashboard_view_all')} <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
        </div>
        <div className="space-y-4">
            {designs.length > 0 ? (
              designs.slice(0, 2).map(design => <DesignListItem key={design.id} design={design} />)
            ) : (
              <p className="text-gray-500 text-sm px-2">Aún no tienes diseños.</p>
            )}
            {designs.length < 3 && <AddDesignCard />}
        </div>
    </section>
  );
};

// --- COMPONENTE CORREGIDO Y FINAL ---
const DesignListItem = ({ design }) => {
  const { t } = useTranslation();
  const { lang } = useParams();

  // PASO 1: Importa la función de optimización al principio del archivo.
  // import { getOptimizedImageUrl } from '../utils/imageUtils.js';
  
  // PASO 2: Lógica de compatibilidad para mostrar la imagen correcta.
  const imageUrl = design.imageFileName 
    ? getOptimizedImageUrl(design.imageFileName, '200x200', design.userId) 
    : design.imageUrl;

  return (
    <div className="flex items-stretch gap-4 rounded-2xl bg-white p-4 shadow-md shadow-gray-200/50">
        {/* PASO 3: Se usa la nueva 'imageUrl' y se añade un color de fondo por si la imagen tarda en cargar */}
        <div className="w-24 h-24 bg-gray-100 bg-cover bg-center rounded-lg flex-shrink-0" style={{ backgroundImage: `url(${imageUrl || ''})` }}></div>
        
        <div className="flex flex-col justify-between flex-1 min-w-0">
            <div>
                <p className="text-gray-800 font-bold truncate">{design.title}</p>
                {/* PASO 4: Se añade 'break-words' para que el texto nunca se desborde */}
                <p className="text-gray-500 text-sm mt-1 line-clamp-2 break-words">{design.description}</p>
            </div>
            <Link to={`/${lang}/edit-design/${design.id}`} className="text-blue-600 font-medium text-sm self-end flex items-center gap-1 hover:underline">
                {t('dashboard_manage')} <span className="material-symbols-outlined text-lg">chevron_right</span>
            </Link>
        </div>
    </div>
  );
};

const AddDesignCard = () => {
  const { t } = useTranslation();
  const { lang } = useParams();
  return (
    <Link to={`/${lang}/add-design`} className="flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 h-28 flex-col gap-1 cursor-pointer hover:bg-gray-100 hover:border-blue-500 transition-colors">
        <span className="material-symbols-outlined text-3xl">add_circle</span>
        <p className="font-medium text-sm">{t('dashboard_add_new_design')}</p>
    </Link>
  );
};

// --- WIDGET DE NOTIFICACIONES ---
const NotificationsWidget = ({ requests }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams();
  const unreadCount = requests.filter(req => !req.isRead).length;

  return (
    <section>
        <h2 className="text-xl md:text-2xl font-bold px-2 pb-4 text-gray-800">{t('dashboard_messages_title')}</h2>
        <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col h-full">
            <div className="flex-grow flex flex-col items-center justify-center text-center py-4">
                <span className={`material-symbols-outlined text-6xl transition-colors ${unreadCount > 0 ? 'text-blue-500' : 'text-gray-400'}`}>
                    {unreadCount > 0 ? 'mark_email_unread' : 'drafts'}
                </span>
                <p className="mt-2 font-bold text-2xl text-gray-800">
                    {t('dashboard_new_messages', { count: unreadCount })}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                    {t('dashboard_total_requests', { count: requests.length })}
                </p>
            </div>
            <button 
                onClick={() => navigate(`/${lang}/mensajes`)}
                className="w-full rounded-lg bg-gray-200 px-5 py-3 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-300 mt-auto transition-colors"
            >
                {t('dashboard_view_all_messages')}
            </button>
        </div>
    </section>
  );
};


function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        let unsubscribeDesigns, unsubscribeRequests;
        const profileDocRef = doc(db, "users", user.uid);
        getDoc(profileDocRef).then(docSnap => {
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            navigate('/es/complete-profile');
          }
        }).catch(err => {
          console.error("Error obteniendo perfil:", err);
          setLoading(false);
        });

        const designsQuery = query(collection(db, "designs"), where("userId", "==", user.uid));
        unsubscribeDesigns = onSnapshot(designsQuery, (snapshot) => {
          setDesigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const requestsQuery = query(collection(db, "contactRequests"), where("designerId", "==", user.uid), orderBy("createdAt", "desc"));
        unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
          const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setContactRequests(requests);
          setLoading(false);
        });

        return () => {
          if (unsubscribeDesigns) unsubscribeDesigns();
          if (unsubscribeRequests) unsubscribeRequests();
        };

      } else {
        navigate('/es/login');
      }
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  if (loading || !userProfile) {
    return (
        <div className="flex items-center justify-center h-full p-6">
            <p className="font-semibold text-gray-500">Cargando tu dashboard...</p>
        </div>
    );
  }

  return (
    <div className="space-y-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {t('dashboard_welcome', { name: userProfile.fullName.split(' ')[0] })}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 space-y-8 lg:space-y-0">
            <div className="lg:col-span-2 space-y-8">
                <ProfileCard profile={userProfile} />
                <NotificationsWidget requests={contactRequests} />
            </div>
            <div className="lg:col-span-1">
                <DesignsSection designs={designs} />
            </div>
        </div>
    </div>
  );
}

export default DashboardPage;