// src/firebase/config.js
// VERSIÓN SEGURA Y PROFESIONAL

// Paso 1: Importamos las funciones necesarias de la librería de Firebase.
// 'initializeApp' es para establecer la conexión inicial.
// 'getAuth' es para obtener el servicio de autenticación.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Paso 2: Creamos el objeto de configuración.
// En lugar de escribir las claves directamente, leemos las variables
// de entorno que Vite nos proporciona de forma segura a través de `import.meta.env`.
// Estas variables las hemos definido en nuestro archivo .env.local.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: "checomvas-app.firebasestorage.app",
  //storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Paso 3: Inicializamos la aplicación de Firebase con nuestra configuración.
// Esto crea la conexión principal con nuestro backend.
const app = initializeApp(firebaseConfig);

// Paso 4: Obtenemos una referencia al servicio de autenticación y la exportamos.
// Al exportar 'auth', podemos importarlo y usarlo en cualquier
// otro archivo de nuestro proyecto, como en LoginPage.jsx, para
// registrar o iniciar sesión de usuarios.
export const auth = getAuth(app);

// Si en el futuro usáramos la base de datos Firestore, añadiríamos aquí:
// import { getFirestore } from "firebase/firestore";
// export const db = getFirestore(app);

// ===================================================================
// NUEVO PASO 2: Obtenemos una referencia al servicio de Firestore y la exportamos.
// La llamamos 'db' por convención (database). Ahora podemos importarla
// desde cualquier parte de nuestra app para leer o escribir datos.
export const db = getFirestore(app);
// ===================================================================
export const storage = getStorage(app);
