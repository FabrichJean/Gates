import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from 'react-toastify/unstyled'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider >
      <App />
      <ToastContainer />
    </AuthProvider>
  </StrictMode>
)