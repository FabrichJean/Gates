// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { I18nProvider } from './context/I18nProvider';
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById('root')!).render(
    <AuthProvider >
        <I18nProvider>
          <App />
        </I18nProvider>
    </AuthProvider>
)