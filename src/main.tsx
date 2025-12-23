// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { MangaUploadSocketProvider } from './context/MangaUploadSocketContext.tsx'
import { MangasProvider } from './context/MangasContext.tsx'
import { AudiosProvider } from './context/AudiosContext.tsx'
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById('root')!).render(
    <AuthProvider >
      <MangaUploadSocketProvider>
        <MangasProvider>
          <AudiosProvider>
            <App />
          </AudiosProvider>
        </MangasProvider>
      </MangaUploadSocketProvider>
    </AuthProvider>
)