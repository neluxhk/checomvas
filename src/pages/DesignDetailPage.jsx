// src/pages/DesignDetailPage.jsx - VERSIÓN FINAL, RESPONSIVA Y SIN FISURAS

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase/config.js';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getOptimizedImageUrl } from '../utils/imageUtils.js';

function DesignDetailPage() {
  const { t } = useTranslation();
  const { designId, lang } = useParams();
  const navigate = useNavigate();
  const [design, setDesign] = useState(null);
  const [designer, setDesigner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados del formulario
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorMessage, setVisitorMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchDesignAndDesigner = async () => {
        setLoading(true);
        try {
            const designDocRef = doc(db, "designs", designId);
            const designDocSnap = await getDoc(designDocRef);

            if (designDocSnap.exists()) {
                const designData = { id: designDocSnap.id, ...designDocSnap.data() };
                setDesign(designData);

                if (designData.userId) {
                    const designerDocRef = doc(db, "users", designData.userId);
                    const designerDocSnap = await getDoc(designerDocRef);
                    if (designerDocSnap.exists()) {
                        setDesigner(designerDocSnap.data());
                    }
                }
            } else {
                setError(t('design_detail_not_found'));
            }
        } catch (err) {
            setError(t('design_detail_loading_error'));
            console.error("Error fetching data:", err);
        }
        setLoading(false);
    };
    fetchDesignAndDesigner();
  }, [designId, t]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!visitorName || !visitorEmail || !visitorMessage) {
      setFormError(t('error_all_fields_required'));
      return;
    }
    setFormLoading(true);
    setFormError('');
    setFormSuccess(false);

    try {
      await addDoc(collection(db, "contactRequests"), {
        designerId: design.userId,
        designId: design.id,
        designTitle: design.title,
        visitorName,
        visitorEmail,
        visitorMessage,
        isRead: false,
        createdAt: serverTimestamp(),
      });
      
      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
        setVisitorName('');
        setVisitorEmail('');
        setVisitorMessage('');
      }, 5000); // Resetea el formulario después de 5 segundos
      
    } catch (err) {
      setFormError(t('error_sending_message'));
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><p className="text-lg font-semibold">{t('design_detail_loading')}</p></div>;
  }
  if (error) {
    return <div className="flex justify-center items-center h-screen"><p className="text-lg font-semibold text-red-600">{error}</p></div>;
  }
  if (!design) {
    return null;
  }

  const displayImageUrl = design.imageFileName
    ? getOptimizedImageUrl(design.imageFileName, '1000x1000', design.userId)
    : design.imageUrl;

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-12">
          
          {/* --- COLUMNA IZQUIERDA (IMAGEN) --- */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
              <img 
                src={displayImageUrl || ''} 
                alt={design.title} 
                className="w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* --- COLUMNA DERECHA (CONTENIDO Y FORMULARIO) --- */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-8 space-y-8">
              
              {/* Bloque de Título y Diseñador */}
              <div className="bg-white p-6 rounded-xl shadow-lg border">
                <h1 className="text-3xl font-bold text-gray-900">{design.title}</h1>
                {designer && (
                  <Link to={`/${lang}/perfil/${designer.uid}`} className="flex items-center mt-4 group">
                    <img alt={designer.fullName} className="w-12 h-12 rounded-full mr-4 object-cover" src={designer.logoUrl || 'https://via.placeholder.com/150'} />
                    <div>
                      <p className="font-semibold text-gray-800 group-hover:text-blue-600">{designer.fullName}</p>
                      <p className="text-sm text-gray-500">{t(`roles.${designer.role}`, designer.role)}</p>
                    </div>
                  </Link>
                )}
              </div>

              
                            {/* Bloque de Descripción - VERSIÓN CORREGIDA */}
              <div className="bg-white p-6 rounded-xl shadow-lg border">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{t('design_detail_description_title')}</h2>
                {/* AÑADIDO: 'break-words' fuerza el ajuste de línea */}
                <div className="prose prose-sm max-w-none text-gray-600 break-words">
                  <p className="break-words">{design.description}</p>
                </div>
              </div>

              {/* Bloque de Formulario de Contacto */}
              <div className="bg-white p-6 rounded-xl shadow-lg border">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('design_detail_contact_title')}</h2>
                {formSuccess ? (
                  <div className="text-center py-8 text-green-600">
                    <span className="material-symbols-outlined text-5xl">check_circle</span>
                    <p className="font-semibold mt-2">{t('design_detail_form_success_title')}</p>
                    <p className="text-sm text-gray-500">{t('design_detail_form_success_subtitle')}</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="text-sm font-medium text-gray-700">{t('design_detail_form_name')}</label>
                      <input type="text" id="name" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label htmlFor="email" className="text-sm font-medium text-gray-700">{t('design_detail_form_email')}</label>
                      <input type="email" id="email" value={visitorEmail} onChange={(e) => setVisitorEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label htmlFor="message" className="text-sm font-medium text-gray-700">{t('design_detail_form_message')}</label>
                      <textarea id="message" rows="4" value={visitorMessage} onChange={(e) => setVisitorMessage(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required></textarea>
                    </div>
                    {formError && <p className="text-sm text-red-600 text-center">{formError}</p>}
                    <button disabled={formLoading} type="submit" className="w-full rounded-lg bg-blue-600 px-5 py-3 text-base font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                      {formLoading ? t('design_detail_form_sending_button') : t('design_detail_form_send_button')}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DesignDetailPage;