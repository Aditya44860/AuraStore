import React from 'react'
import ReactDOM from 'react-dom/client'

// --- Console Sanitizer: Silencing internal library deprecation warnings ---
const originalWarn = console.warn;
console.warn = (...args) => {
  const msg = args[0] || '';
  // Ignore specific Three.js deprecation spam from internal loops
  if (typeof msg === 'string' && (
      msg.includes('THREE.Clock: This module has been deprecated') ||
      msg.includes('THREE.WebGLShadowMap: PCFSoftShadowMap has been deprecated')
  )) return;
  originalWarn(...args);
};
// -------------------------------------------------------------------------
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { ChatProvider } from './context/ChatContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <CartProvider>
      <ChatProvider>
        <App />
      </ChatProvider>
    </CartProvider>
  </AuthProvider>
)
