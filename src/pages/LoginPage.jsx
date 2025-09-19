// src/pages/LoginPage.jsx - VERSIÓN CORREGIDA Y MULTILINGÜE

import React, { useState } from 'react'; // <-- ESTA LÍNEA ES LA CORRECCIÓN
import { useTranslation } from 'react-i18next';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  getAdditionalUserInfo
} from "firebase/auth";
import { auth } from '../firebase/config.js';
import { useNavigate, useParams } from 'react-router-dom';

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams();

  // Ahora usamos useState directamente, sin 'React.'
  const [activeTab, setActiveTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [error, setError] = useState(null);

  // ... (El resto de las funciones handleSubmit, etc., no cambian y son correctas)
  const handleLogin = (e) => {
    e.preventDefault();
    setError(null);
    signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      .then(() => {
        navigate(`/${lang}/dashboard`);
      })
      .catch(() => {
        setError("Email o contraseña incorrectos.");
      });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setError(null);
    if (signupPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
      .then(() => {
        navigate(`/${lang}/complete-profile`);
      })
      .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
          setError("Este email ya está en uso.");
        } else {
          setError("Error al crear la cuenta.");
        }
      });
  };

  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    setError(null);
    signInWithPopup(auth, provider)
      .then((result) => {
        const additionalUserInfo = getAdditionalUserInfo(result);
        if (additionalUserInfo?.isNewUser) {
          navigate(`/${lang}/complete-profile`);
        } else {
          navigate(`/${lang}/dashboard`);
        }
      })
      .catch(() => {
        setError("Hubo un problema al iniciar sesión con Google.");
      });
  };


  return (
    // ... EL CÓDIGO JSX DEL RETURN NO CAMBIA Y ES CORRECTO ...
    <div className="flex items-center justify-center min-h-screen p-4 bg-checomvas-background text-checomvas-foreground" style={{ fontFamily: "'Spline Sans', sans-serif" }}>
      <div className="w-full max-w-md mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-widest">CHECOMVAS</h1>
          <p className="text-checomvas-placeholder">{t('login_subtitle')}</p>
        </header>

        <div className="bg-checomvas-secondary p-4 sm:p-6 rounded-2xl shadow-2xl shadow-black/30">
          <div className="flex border-b border-gray-700 mb-6">
            <button onClick={() => setActiveTab('login')} className={`tab ${activeTab === 'login' ? 'active' : ''}`}>
              {t('login_tab_signin')}
            </button>
            <button onClick={() => setActiveTab('signup')} className={`tab ${activeTab === 'signup' ? 'active' : ''}`}>
              {t('login_tab_signup')}
            </button>
          </div>
          <div>
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-checomvas-placeholder">mail</span>
                  <input className="form-input pl-12" placeholder={t('login_email_placeholder')} type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-checomvas-placeholder">lock</span>
                  <input className="form-input pl-12" placeholder={t('login_password_placeholder')} type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                </div>
                <div className="text-right">
                  <a className="text-sm text-checomvas-primary hover:underline" href="#">{t('login_forgot_password')}</a>
                </div>
                <button className="btn w-full bg-checomvas-primary text-checomvas-secondary font-bold py-3 px-4 rounded-full shadow-lg shadow-checomvas-primary/20" type="submit">
                  {t('login_signin_button')}
                </button>
              </form>
            )}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4">
                 <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-checomvas-placeholder">person</span>
                    <input className="form-input pl-12" placeholder={t('signup_fullname_placeholder')} type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-checomvas-placeholder">mail</span>
                    <input className="form-input pl-12" placeholder={t('login_email_placeholder')} type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-checomvas-placeholder">lock</span>
                    <input className="form-input pl-12" placeholder={t('login_password_placeholder')} type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                  </div>
                <button className="btn w-full bg-checomvas-primary text-checomvas-secondary font-bold py-3 px-4 rounded-full shadow-lg shadow-checomvas-primary/20" type="submit">
                  {t('signup_create_account_button')}
                </button>
              </form>
            )}
            {error && <p className="text-sm text-red-500 text-center mt-4">{error}</p>}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-checomvas-placeholder">{t('login_continue_with')}</p>
          <div className="flex justify-center mt-4">
            <button 
              type="button" 
              onClick={handleGoogleSignIn} 
              className="btn bg-checomvas-secondary h-12 w-12 flex items-center justify-center rounded-full shadow-md hover:shadow-checomvas-primary/20"
              aria-label="Continuar con Google"
            >
              <img 
                className="w-6 h-6" 
                src="https://www.svgrepo.com/show/475656/google-color.svg" 
                alt="Google logo"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;