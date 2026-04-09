// Types pour les variables d'environnement
// Ce fichier fournit les types stricts pour l'autocomplétion IDE

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VITE_API_URL?: string;
      VITE_AUTH_TIMEOUT?: string;
      VITE_OLLAMA_API_URL?: string;
      VITE_OLLAMA_MODEL?: string;
      VITE_APP_NAME?: string;
      VITE_APP_VERSION?: string;
      VITE_ENVIRONMENT?: 'development' | 'production' | 'staging';
      VITE_FEATURE_OLLAMA_SUGGESTIONS?: string;
      VITE_FEATURE_BULK_EDIT?: string;
    }
  }

  interface ImportMeta {
    readonly env: {
      readonly VITE_API_URL: string;
      readonly VITE_AUTH_TIMEOUT: string;
      readonly VITE_OLLAMA_API_URL: string;
      readonly VITE_OLLAMA_MODEL: string;
      readonly VITE_APP_NAME: string;
      readonly VITE_APP_VERSION: string;
      readonly VITE_ENVIRONMENT: string;
      readonly VITE_FEATURE_OLLAMA_SUGGESTIONS: string;
      readonly VITE_FEATURE_BULK_EDIT: string;
    };
  }
}

export {};
