import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom"
import { AuthProvider } from './context/AuthContext.jsx'
import { setSecurityHeaders } from './utils/security.js'
import { GoogleOAuthProvider } from '@react-oauth/google';

// Set security headers
setSecurityHeaders();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="893757339520-psp48g6oit33ar7qadu5mv0cjogaq9op.apps.googleusercontent.com">
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
)
