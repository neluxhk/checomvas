// src/pages/CompleteProfilePage.jsx - VERSIÓN FINAL Y CORREGIDA

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth, db, storage } from '../firebase/config.js';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from 'firebase/auth';

function CompleteProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams();

  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [professionalEmail, setProfessionalEmail] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [role, setRole] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [portfolioFile, setPortfolioFile] = useState(null);
  const [portfolioName, setPortfolioName] = useState('');
  const [existingPortfolioUrl, setExistingPortfolioUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const countriesList = useMemo(() => {
    const countriesObject = t('countries', { returnObjects: true }) || {};
    return Object.entries(countriesObject).sort(([, a], [, b]) => a.localeCompare(b));
  }, [t]);

  const { rolesProjectKeys, rolesBusinessKeys, rolesObject } = useMemo(() => {
    const rolesObj = t('roles', { returnObjects: true }) || {};
    const roleKeys = Object.keys(rolesObj);
    return {
      rolesProjectKeys: roleKeys.slice(0, 6),
      rolesBusinessKeys: roleKeys.slice(6),
      rolesObject: rolesObj,
    };
  }, [t]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setProfessionalEmail(user.email);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFullName(data.fullName || '');
          setCompany(data.company || '');
          setCity(data.city || '');
          setCountry(data.country || '');
          setRole(data.role || '');
          setLogoPreview(data.logoUrl || '');
          if (data.portfolioUrl) {
            setExistingPortfolioUrl(data.portfolioUrl);
            try {
              const url = new URL(data.portfolioUrl);
              const path = decodeURIComponent(url.pathname);
              const fileName = path.substring(path.lastIndexOf('/') + 1);
              setPortfolioName(fileName);
            } catch (e) {
              setPortfolioName(t('profile_form_pdf_attached'));
            }
          }
        }
      } else {
        // CORRECCIÓN 1: Usar comillas invertidas (`) en lugar de barras (/)
        navigate(`/${lang}/login`);
      }
    });
    return () => unsubscribe();
  }, [navigate, lang, t]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handlePortfolioChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    if (file.type !== 'application/pdf') {
      setError(t('profile_error_pdf_format'));
      e.target.value = null;
      return;
    }
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setError(`${t('profile_error_pdf_size')} (${(file.size / 1024 / 1024).toFixed(1)} MB).`);
      e.target.value = null;
      return;
    }
    setPortfolioFile(file);
    setPortfolioName(file.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    if (!fullName || !city || !country || !role) {
      setError(t('error_all_fields_required'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      let logoUrl = logoPreview;
      if (logoFile) {
        const logoRef = ref(storage, `logos/${user.uid}/${logoFile.name}`);
        // CORRECCIÓN 2: El segundo argumento debe ser el archivo, no la referencia
        const snapshot = await uploadBytes(logoRef, logoFile);
        logoUrl = await getDownloadURL(snapshot.ref);
      }
      
      let portfolioUrl = existingPortfolioUrl;
      if (portfolioFile) {
        const portfolioRef = ref(storage, `portfolios/${user.uid}/${portfolioFile.name}`);
        const snapshot = await uploadBytes(portfolioRef, portfolioFile);
        portfolioUrl = await getDownloadURL(snapshot.ref);
      }

      const userProfileData = {
        uid: user.uid,
        fullName,
        company: company || '',
        professionalEmail,
        city,
        country,
        role,
        logoUrl: logoUrl,
        portfolioUrl: portfolioUrl,
      };
      
      await setDoc(doc(db, "users", user.uid), userProfileData, { merge: true });
      
      // CORRECCIÓN 3: Usar comillas invertidas (`) en lugar de barras (/)
      navigate(`/${lang}/dashboard`);
      
    } catch (err) {
      setError(t('error_generic_save_profile'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col justify-between overflow-x-hidden bg-gray-50" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="flex-grow">
        <header className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-sm">
          <div className="flex items-center p-4">
            <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full text-slate-800">
              <span className="material-symbols-outlined"> arrow_back </span>
            </button>
            <h1 className="flex-1 text-center text-lg font-bold text-slate-800">{t('complete_profile_title')}</h1>
            <div className="w-10"></div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm">
            <div>
                <label className="text-sm font-medium text-slate-700">{t('profile_form_logo_label')}</label>
                <div className="mt-2 flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {logoPreview ? (
                            <img src={logoPreview} alt="Vista previa del logo" className="h-full w-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-4xl text-gray-400">add_a_photo</span>
                        )}
                    </div>
                    <input type="file" id="logo-upload" onChange={handleLogoChange} accept="image/png, image/jpeg, image/webp" className="hidden" />
                    <label htmlFor="logo-upload" className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        {t('profile_form_upload_image')}
                    </label>
                </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="fullName">{t('profile_form_fullname')}</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-100 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500" id="fullName" type="text" required />
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="company">{t('profile_form_company')}</label>
              <input value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-100 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500" id="company" type="text" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="email">{t('profile_form_pro_email')}</label>
              <input value={professionalEmail} readOnly className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-200 p-3 shadow-sm text-gray-500 cursor-not-allowed" id="email" type="email" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="city">{t('profile_form_city')}</label>
                    <input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-100 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500" id="city" type="text" required />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700" htmlFor="country">{t('profile_form_country')}</label>
                    <select id="country" value={country} onChange={(e) => setCountry(e.target.value)} required className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-100 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                        <option value="" disabled>{t('profile_form_country_select')}</option>
                        {countriesList.map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                    </select>
                </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="role">{t('profile_form_role')}</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block w-full appearance-none rounded-lg border-gray-300 bg-gray-100 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500" id="role" required>
                <option value="" disabled>{t('profile_form_role_select')}</option>
                <optgroup label={t('profile_form_role_group_project')}>
                  {rolesProjectKeys.map(key => <option key={key} value={key}>{rolesObject[key]}</option>)}
                </optgroup>
                <optgroup label={t('profile_form_role_group_business')}>
                  {rolesBusinessKeys.map(key => <option key={key} value={key}>{rolesObject[key]}</option>)}
                </optgroup>
              </select>
            </div>
            
            <div className="border-t pt-6">
              <label className="text-sm font-medium text-slate-700">{t('profile_form_pdf_label')}</label>
              <p className="text-xs text-gray-500 mt-1 mb-2">{t('profile_form_pdf_subtitle')}</p>
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  id="portfolio-upload" 
                  onChange={handlePortfolioChange} 
                  accept="application/pdf" 
                  className="hidden" 
                />
                <label 
                  htmlFor="portfolio-upload" 
                  className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  {t('profile_form_pdf_select_button')}
                </label>
                {portfolioName && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="material-symbols-outlined text-green-600">check_circle</span>
                    <span className="truncate max-w-[150px] sm:max-w-xs" title={portfolioName}>
                      {portfolioName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            
            <div className="pt-4">
              <button disabled={loading} className="w-full rounded-full bg-[#0680f9] px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition-transform duration-200 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" type="submit">
                {loading ? t('profile_form_saving_button') : t('profile_form_save_button')}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default CompleteProfilePage;