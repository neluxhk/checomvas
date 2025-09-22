// src/utils/imageUtils.js

// 1. URL base de tu bucket de Firebase Storage.
// Esta URL es la correcta para tu proyecto 'checomvas-app'.
const BUCKET_URL = "https://storage.googleapis.com/checomvas-app.firebasestorage.app";

/**
 * Genera la URL para una imagen optimizada.
 * @param {string} fileName - El nombre original del archivo (ej: "mi-diseno.png").
 * @param {string} size - El tamaño deseado (ej: "200x200" o "1000x1000").
 * @param {string} folder - La carpeta donde está la imagen original ('designs' o 'logos').
 * @returns {string} La URL completa de la imagen optimizada.
 */
// VERSIÓN FINAL Y CORRECTA
export const getOptimizedImageUrl = (fileName, size, userId, folder = 'designs') => {
  if (!fileName || !userId) {
    return "https://via.placeholder.com/200";
  }

  const lastDotIndex = fileName.lastIndexOf('.');
  const nameWithoutExtension = lastDotIndex === -1 ? fileName : fileName.substring(0, lastDotIndex);
  
  const newFileName = `${nameWithoutExtension}_${size}.webp`;

  // ¡CORRECCIÓN CLAVE! AÑADIMOS EL userId A LA RUTA
  return `${BUCKET_URL}/${folder}/${userId}/${newFileName}`;
};