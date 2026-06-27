import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Configurazione di Vite + plugin PWA.
// Il plugin PWA genera in automatico il "service worker" che permette,
// piu avanti, di installare l'app sul telefono e farla funzionare offline.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // In sviluppo lasciamo la PWA attiva cosi possiamo gia testarla.
      devOptions: { enabled: true },
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Surf Training',
        short_name: 'Surf',
        description: 'App personale di allenamento per il surf',
        lang: 'it',
        theme_color: '#0e7490',
        background_color: '#0b1120',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
