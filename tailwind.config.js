/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 1. AÑADIMOS LA NUEVA FAMILIA DE FUENTES
      fontFamily: {
        // Hacemos que 'Manrope' sea la fuente por defecto para todo el sitio.
        // Las otras son "fallbacks" si Manrope no carga.
        sans: ['Manrope', 'Noto Sans', 'sans-serif'],
      },

      // 2. FUSIONAMOS TODOS LOS COLORES
      colors: {
        // --- Colores para el Dashboard (Parte Privada) ---
        'checomvas-primary': '#F8D344',
        'checomvas-primary-hover': '#eac435',
        'checomvas-secondary': '#0D1B2A',
        'checomvas-foreground': '#E0E1DD',
        'checomvas-background': '#030712',
        'checomvas-input': '#1a2738',
        'checomvas-placeholder': '#778da9',

        // --- Colores para la Galería (Parte Pública) ---
        'public-primary': '#067ff9',
        'public-secondary': '#F8F9FA',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
      }
    },
  },
  plugins: [],
}