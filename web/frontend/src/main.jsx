/**
 * ============================================================================
 * FILE: web/frontend/src/main.jsx
 * ============================================================================
 * FUNGSI UTAMA:
 * Titik awal (Entry Point) eksekusi React 18 di browser.
 * Menginjeksi root virtual DOM ke dalam elemen `<div id="root">` di `index.html`.
 * Membungkus seluruh aplikasi dengan `BrowserRouter`, `AuthProvider`, `NotificationProvider`, dan `ThemeProvider`.
 * ============================================================================
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
