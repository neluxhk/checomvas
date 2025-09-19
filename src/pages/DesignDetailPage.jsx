// src/pages/DesignDetailPage.jsx - VERSIÓN FINAL, COMPLETA Y MULTILINGÜE

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Importar
import { db } from '../firebase/config.js';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

function DesignDetailPage() {
  const { t } = useTranslation(); // 2. Inicializar
  const { designId, lang } = useParams();
  const navigate = useNavigate();
  const [design, setDesign] = useState(null);
  const [designer, setDesigner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorMessage, setVisitorMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
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

    const fetchDesignAndDesigner = async () => {
        setLoading(true);
        try {
            if (!designId) {
                setError("ID de diseño no proporcionado.");
                setLoading(false);
                return;
            }
            
            const designDocRef = doc(db, "designs", designId);
            const designDocSnap = await getDoc(designDocRef);

            if (designDocSnap.exists()) {
                const designData = { id: designDocSnap.id, ...designDocSnap.data() };
                setDesign(designData);

                document.title = `${designData.title} - Checomvas`;
                updateMeta('description', designData.description.substring(0, 160));
                updateMeta('og:title', `${designData.title} - Checomvas`);
                updateMeta('og:description', designData.description.substring(0, 160));
                updateMeta('og:image', designData.imageUrl);
                updateMeta('og:url', window.location.href);

                if (designData.userId) {
                    const designerDocRef = doc(db, "users", designData.userId);
                    const designerDocSnap = await getDoc(designerDocRef);
                    if (designerDocSnap.exists()) {
                        setDesigner(designerDocSnap.data());
                    } else {
                        console.warn("No se encontró el perfil para el diseñador.");
                    }
                }
            } else {
                setError("No se encontró el diseño solicitado.");
            }
        } catch (err) {
            setError("Error al cargar los datos.");
            console.error("Error fetching data:", err);
        }
        setLoading(false);
    };

    fetchDesignAndDesigner();

    return () => {
        document.title = 'Checomvas - Plataforma para Diseñadores de Iluminación';
        updateMeta('description', 'Conecta con diseñadores y fabricantes, explora proyectos innovadores y da vida a tus ideas.');
    };
  }, [designId]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!visitorName || !visitorEmail || !visitorMessage) {
      setFormError("Por favor, completa todos los campos del formulario.");
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
        navigate(`/${lang}/explorar`);
      }, 3000);
      
    } catch (err) {
      setFormError("No se pudo enviar tu mensaje.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-10 font-semibold text-gray-500">{t('design_detail_loading')}</div>;
  }
  if (error) {
    return <div className="text-center p-10 font-semibold text-red-600">{error}</div>;
  }
  if (!design) {
    return <div className="text-center p-10 font-semibold text-gray-500">{t('design_detail_not_found')}</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <img src={design.imageUrl} alt={design.title} className="w-full h-auto max-h-[70vh] object-contain" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary">{design.title}</h1>
            
            {designer && (
              <Link to={`/${lang}/perfil/${designer.uid}`} className="inline-block mt-6 group">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-cover bg-center border-2 border-white shadow-md" style={{backgroundImage: `url(${designer.logoUrl || 'https://via.placeholder.com/150'})`}}></div>
                  <div>
                    <p className="font-bold text-text-primary group-hover:text-blue-600 transition-colors">{designer.fullName}</p>
                    {/* Traducimos el rol del diseñador */}
                    <p className="text-sm text-text-secondary">{t(`roles.${designer.role}`, designer.role)}</p>
                  </div>
                </div>
              </Link>
            )}

            <p className="text-lg text-text-secondary mt-6 whitespace-pre-wrap">{design.description}</p>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-text-primary mb-4">{t('design_detail_contact_title')}</h2>
              
              {formSuccess ? (
                <div className="text-center py-8 text-green-600 flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-5xl">check_circle</span>
                  <p className="font-semibold mt-2">{t('design_detail_form_success_title')}</p>
                  <p className="text-sm text-gray-500">{t('design_detail_form_success_subtitle')}</p>
                  <p className="text-xs text-gray-400 mt-4">{t('design_detail_form_redirecting')}</p>
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
    </div>
  );
}

export default DesignDetailPage;