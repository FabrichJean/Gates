// Config centralisé pour les variables d'environnement
// Ce fichier centralise toutes les variables d'environnement de l'application

interface AppConfig {
  apiUrl: string;
  authTimeout: number;
  ollama: {
    apiUrl: string;
    model: string;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'production' | 'staging';
    region?: 'cn' | 'yd';
    defaultUiLanguage?: string;
  };
  features: {
    ollamaSuggestions: boolean;
    bulkEdit: boolean;
  };
}

export const config: AppConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  authTimeout: parseInt(import.meta.env.VITE_AUTH_TIMEOUT || '3600000', 10),
  
  ollama: {
    apiUrl: import.meta.env.VITE_OLLAMA_API_URL || 'http://192.168.1.97:11434/api/generate',
    model: import.meta.env.VITE_OLLAMA_MODEL || 'dolphin3',
  },

  app: {
    name: import.meta.env.VITE_APP_NAME || 'VMS Front',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: (import.meta.env.VITE_ENVIRONMENT || 'development') as 'development' | 'production' | 'staging',
    region: (import.meta.env.VITE_REGION as 'cn' | 'yd') || undefined,
    defaultUiLanguage: import.meta.env.VITE_DEFAULT_UI_LANGUAGE || undefined,
  },

  features: {
    ollamaSuggestions: import.meta.env.VITE_FEATURE_OLLAMA_SUGGESTIONS === 'true',
    bulkEdit: import.meta.env.VITE_FEATURE_BULK_EDIT === 'true',
  },
};

// Validation au démarrage
if (!config.apiUrl) {
  console.warn('VITE_API_URL not configured');
}

if (!config.ollama.apiUrl) {
  console.warn('VITE_OLLAMA_API_URL not configured');
}

export default config;
