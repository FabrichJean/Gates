// Exemples d'utilisation du système de variables d'environnement

import config from '../config/environment';

// ============================================
// 1. Exemples basiques
// ============================================

// Accéder à l'URL API
console.log('API URL:', config.apiUrl);
// Output: API URL: http://localhost:3000/api

// Accéder à la configuration Ollama
console.log('Ollama URL:', config.ollama.apiUrl);
console.log('Ollama Model:', config.ollama.model);
// Output: Ollama URL: http://192.168.1.97:11434/api/generate
// Output: Ollama Model: dolphin3

// Vérifier l'environnement
if (config.app.environment === 'production') {
  console.log('Running in production mode');
} else {
  console.log('Running in development mode');
}

// ============================================
// 2. Utilisation dans les hooks
// ============================================

// Example: Hook personnalisé pour les appels API
function useCustomApi() {
  const fetchData = async (endpoint: string) => {
    const url = `${config.apiUrl}${endpoint}`;
    const response = await fetch(url);
    return response.json();
  };

  return { fetchData };
}

// ============================================
// 3. Feature flags
// ============================================

function SuggestionFeature() {
  if (!config.features.ollamaSuggestions) {
    return null; // Feature est désactivée
  }

  // Afficher le composant de suggestions
  return 'Suggestion Feature Enabled';
}

// ============================================
// 4. Configuration conditionnelle
// ============================================

// Par exemple, configurer différents timeouts selon l'environnement
const fetchTimeout = config.app.environment === 'production' ? 30000 : 60000;

// ============================================
// 5. Appels à l'API Ollama
// ============================================

async function generateOllamaSuggestion(prompt: string) {
  if (!config.features.ollamaSuggestions) {
    throw new Error('Ollama suggestions are disabled');
  }

  const response = await fetch(config.ollama.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.ollama.model,
      prompt: prompt,
      stream: false,
    }),
  });

  return response.json();
}

// ============================================
// 6. Configuration de la session
// ============================================

// Utiliser le timeout d'authentification
const sessionTimeout = config.authTimeout; // en millisecondes
setTimeout(() => {
  console.log('Session expired');
}, sessionTimeout);

// ============================================
// 7. Accès aux informations de l'app
// ============================================

console.log(`${config.app.name} v${config.app.version}`);
console.log(`Environment: ${config.app.environment}`);

// ============================================
// 8. Pattern: Configuration par environnement
// ============================================

const API_ENDPOINTS = {
  users: '/users',
  posts: '/posts',
  suggestions: '/suggestions',
} as const;

function getFullUrl(endpoint: keyof typeof API_ENDPOINTS) {
  return `${config.apiUrl}${API_ENDPOINTS[endpoint]}`;
}

// Utilisation
const usersUrl = getFullUrl('users'); // http://localhost:3000/api/users
const postsUrl = getFullUrl('posts'); // http://localhost:3000/api/posts

// ============================================
// 9. Validation à la première utilisation
// ============================================

function validateConfig() {
  const errors: string[] = [];

  if (!config.apiUrl) {
    errors.push('VITE_API_URL is not configured');
  }

  if (config.features.ollamaSuggestions && !config.ollama.apiUrl) {
    errors.push('VITE_OLLAMA_API_URL is not configured but Ollama suggestions are enabled');
  }

  if (errors.length > 0) {
    console.error('Configuration errors:', errors);
    return false;
  }

  return true;
}

// Appeler au démarrage de l'app
if (!validateConfig()) {
  // Arrêter l'application ou afficher une alerte
}

// ============================================
// 10. Exemple complet: Composant avec config
// ============================================

function AppInitializer() {
  const initializeApp = async () => {
    console.log(`Initializing ${config.app.name} in ${config.app.environment} mode`);

    // Charger les paramètres depuis l'API
    const settings = await fetch(`${config.apiUrl}/settings`);
    const data = await settings.json();

    // Configurer Ollama si activé
    if (config.features.ollamaSuggestions) {
      console.log(`Ollama available at ${config.ollama.apiUrl}`);
      // Test de connexion à Ollama
      try {
        const testResponse = await fetch(config.ollama.apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: config.ollama.model,
            prompt: 'test',
            stream: false,
          }),
        });
        if (testResponse.ok) {
          console.log('✓ Ollama is accessible');
        }
      } catch (err) {
        console.warn('⚠ Ollama is not accessible');
      }
    }

    return data;
  };

  return initializeApp();
}

export {
  useCustomApi,
  generateOllamaSuggestion,
  AppInitializer,
  validateConfig,
};
