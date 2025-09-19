// src/pages/DesignFormPage.jsx - VERSIÓN FINAL Y COMPLETA CON VALIDACIÓN DE IMAGEN

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth, db, storage } from '../firebase/config.js';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from 'firebase/auth';
import Modal from '../components/Modal';

const CATEGORIES = ["Downlight", "Linear", "Spotlight", "Pendant", "Wall Washer", "Gobo", "Otro"];
const APPLICATIONS = ["Hotel", "Retail", "Oficina", "Residencial", "Exterior", "Restaurante", "Museo"];
const STYLES = ["Contemporáneo", "Minimalista", "Industrial", "Clásico", "Moderno", "Otro"];

// --- Componente para el contenido de la guía de imágenes ---
const ImageGuideContent = () => {
    const { t } = useTranslation();
    return (
        <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
            <p className="font-semibold">{t('guide_objective')}</p>
            <div>
                <h4 className="font-bold text-base text-gray-800 mb-2">{t('guide_format_title')}</h4>
                <ul className="list-disc list-inside space-y-1">
                    <li><span className="font-semibold">{t('guide_format_reco')}:</span> .webp (o .jpg optimizado).</li>
                    <li><span className="font-semibold">{t('guide_format_res')}:</span> 1600px de ancho.</li>
                    <li><span className="font-semibold">{t('guide_format_weight')}:</span> ≤ 500 KB (máximo 2 MB).</li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-base text-gray-800 mb-2">{t('guide_not_allowed_title')}</h4>
                <ul className="list-disc list-inside space-y-1 text-red-600">
                    <li>{t('guide_not_allowed_logos')}</li>
                    <li>{t('guide_not_allowed_watermarks')}</li>
                    <li>{t('guide_not_allowed_blurry')}</li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-base text-gray-800 mb-2">{t('guide_tip_title')}</h4>
                <p>{t('guide_tip_content')}</p>
            </div>
        </div>
    );
};


function DesignFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { designId, lang } = useParams();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [category, setCategory] = useState('');
  const [applications, setApplications] = useState([]);
  const [style, setStyle] = useState('');
  const [tags, setTags] = useState('');
  const [country, setCountry] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate(`/${lang}/login`);
      }
    });
    return () => unsubscribe();
  }, [navigate, lang]);
  
  useEffect(() => {
    const fetchDesignData = async () => {
      if (designId) {
        setLoading(true);
        const docRef = doc(db, "designs", designId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.title);
          setDescription(data.description);
          setImagePreview(data.imageUrl);
          setCategory(data.category || '');
          setApplications(data.applications || []);
          setStyle(data.style || '');
          setTags((data.tags || []).join(', '));
          setCountry(data.country || '');
          setIsPublic(data.public !== undefined ? data.public : true);
        } else { setError("Este diseño no existe."); }
        setLoading(false);
      }
    };
    fetchDesignData();
  }, [designId]);

  const handleApplicationChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setApplications(prev => [...prev, value]);
    } else {
      setApplications(prev => prev.filter(app => app !== value));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageFile(null);
      setImagePreview('');
      return;
    }
    setError('');
    const allowedTypes = ['image/jpeg', 'image/webp', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError("Formato no válido. Sube .jpg, .webp o .png.");
      e.target.value = null;
      return;
    }
    const maxSizeInBytes = 2 * 1024 * 1024; // 2 MB
    if (file.size > maxSizeInBytes) {
      setError(`La imagen es muy pesada (${(file.size / 1024 / 1024).toFixed(1)} MB). El máximo es 2 MB.`);
      e.target.value = null;
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const image = new Image();
      image.src = event.target.result;
      image.onload = () => {
        if (image.width > 1600) {
          setError(`La imagen es muy ancha (${image.width}px). El máximo es 1600px.`);
          e.target.value = null;
        } else {
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
        }
      };
      image.onerror = () => {
        setError("No se pudo leer el archivo de imagen.");
        e.target.value = null;
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    if (!title || !description || !category || !style || !country) {
      setError("Por favor, completa todos los campos obligatorios.");
      return;
    }
    if (!designId && !imageFile) {
      setError("Por favor, sube una imagen.");
      return;
    }
    setLoading(true);
    setError('');

    try {
      let imageUrl = imagePreview;
      if (imageFile) {
        const storageRef = ref(storage, `designs/${user.uid}/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }
      
      const tagsArray = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag);

      const designData = {
        userId: user.uid,
        title,
        description,
        imageUrl,
        category,
        applications,
        style,
        tags: tagsArray,
        country,
        public: isPublic,
      };

      if (designId) {
        const docRef = doc(db, "designs", designId);
        await updateDoc(docRef, { ...designData, updatedAt: new Date() });
      } else {
        await addDoc(collection(db, "designs"), { ...designData, createdAt: new Date() });
      }
      navigate(`/${lang}/mis-disenos`);
    } catch (err) {
      setError("Hubo un error al guardar el diseño.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen" style={{ fontFamily: "'Manrope', sans-serif" }}>
        <header className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm border-b">
          <div className="flex items-center p-4 max-w-4xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full text-slate-800">
              <span className="material-symbols-outlined"> arrow_back </span>
            </button>
            <h1 className="flex-1 text-center text-lg font-bold text-slate-800">
              {designId ? t('design_form_edit_title') : t('design_form_add_title')}
            </h1>
            <div className="w-10"></div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">{t('design_form_image_label')}</label>
                <button 
                  type="button" 
                  onClick={() => setIsGuideOpen(true)} 
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">help_outline</span>
                  {t('guide_button_text')}
                </button>
              </div>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div className="text-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Vista previa" className="mx-auto h-48 w-auto rounded-md object-contain" />
                  ) : (
                    <span className="material-symbols-outlined text-6xl text-gray-300">image</span>
                  )}
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500">
                      <span>{imagePreview ? t('design_form_change_image') : t('design_form_upload_file')}</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" />
                    </label>
                    {!imagePreview && <p className="pl-1">{t('design_form_drag_drop')}</p>}
                  </div>
                  <p className="text-xs leading-5 text-gray-600">{t('design_form_image_types')}</p>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">{t('design_form_title_label')}</label>
              <div className="mt-2">
                <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="block w-full rounded-md border-gray-300 p-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">{t('design_form_description_label')}</label>
              <div className="mt-2">
                <textarea id="description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} className="block w-full rounded-md border-gray-300 p-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500" required></textarea>
              </div>
            </div>
            
            <div className="border-t pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900">{t('design_form_category_label')}</label>
                <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="" disabled>Selecciona...</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="style" className="block text-sm font-medium leading-6 text-gray-900">{t('design_form_style_label')}</label>
                <select id="style" value={style} onChange={(e) => setStyle(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option value="" disabled>Selecciona...</option>
                  {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">{t('design_form_applications_label')}</label>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {APPLICATIONS.map(app => (
                  <div key={app} className="flex items-center">
                    <input id={`app-${app}`} type="checkbox" value={app} checked={applications.includes(app)} onChange={handleApplicationChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor={`app-${app}`} className="ml-2 block text-sm text-gray-900">{app}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="tags" className="block text-sm font-medium leading-6 text-gray-900">{t('design_form_tags_label')}</label>
                <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder={t('design_form_tags_placeholder')} />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">{t('design_form_country_label')}</label>
                <input type="text" id="country" value={country} onChange={(e) => setCountry(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Ej: España" />
              </div>
            </div>
            
            <div className="border-t pt-6">
              <div className="relative flex items-start">
                <div className="flex h-6 items-center">
                  <input id="isPublic" type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label htmlFor="isPublic" className="font-medium text-gray-900">{t('design_form_public_label')}</label>
                  <p className="text-gray-500">{t('design_form_public_description')}</p>
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <div className="pt-4">
              <button disabled={loading} type="submit" className="w-full rounded-full bg-[#0680f9] px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition-transform duration-200 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? t('design_form_saving_button') : (designId ? t('design_form_save_changes_button') : t('design_form_save_button'))}
              </button>
            </div>
          </form>
        </main>
      </div>
      
      <Modal 
        isOpen={isGuideOpen} 
        onClose={() => setIsGuideOpen(false)} 
        title={t('guide_title')}
      >
        <ImageGuideContent />
      </Modal>
    </>
  );
}

export default DesignFormPage;