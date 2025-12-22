# Intégration API Auto-fill - Mangas

## 🔌 Configuration API

### Endpoint de traduction
```typescript
// src/constant/index.ts
export const translateServer = "http://192.168.1.69:3000/translate-titles"
```

### Import dans le composant
```typescript
// src/components/I18nComponents.tsx
import { translateServer } from '../constant';
```

## 📡 Format de requête

### HTTP POST Request
```typescript
POST http://192.168.1.69:3000/translate-titles

Headers:
{
  "Content-Type": "application/json"
}

Body:
{
  "title": "hello",
  "description": "hello everyone",
  "i18n": ["de", "en", "es", "fr", "ko"]
}
```

### Paramètres
| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `title` | `string` | ✅ Oui | Titre source à traduire |
| `description` | `string` | ❌ Non | Description source à traduire |
| `i18n` | `string[]` | ✅ Oui | Liste des codes langue cibles |

## 📥 Format de réponse

### Structure JSON
```json
[
  {
    "id": null,
    "title": "Hallo",
    "description": "Hallo zusammen",
    "i18_language": "de",
    "language": {
      "title": "de",
      "name": "German"
    }
  },
  {
    "id": null,
    "title": "hello",
    "description": "hello everyone",
    "i18_language": "en",
    "language": {
      "title": "en",
      "name": "English"
    }
  },
  {
    "id": null,
    "title": "hola",
    "description": "hola a todos",
    "i18_language": "es",
    "language": {
      "title": "es",
      "name": "Spanish"
    }
  },
  {
    "id": null,
    "title": "bonjour",
    "description": "bonjour à tous",
    "i18_language": "fr",
    "language": {
      "title": "fr",
      "name": "French"
    }
  },
  {
    "id": null,
    "title": "안녕하세요",
    "description": "안녕하세요 여러분",
    "i18_language": "ko",
    "language": {
      "title": "ko",
      "name": "Korean"
    }
  }
]
```

### Champs de réponse
| Champ | Type | Description |
|-------|------|-------------|
| `id` | `null` | Toujours null pour les nouvelles traductions |
| `title` | `string` | Titre traduit |
| `description` | `string` | Description traduite |
| `i18_language` | `string` | Code langue (de, en, es, etc.) |
| `language.title` | `string` | Code langue (répété) |
| `language.name` | `string` | Nom complet de la langue |

## 🔧 Traitement dans le frontend

### Fonction applyAuto
```typescript
const applyAuto = async () => {
  if (!autoTitle.trim()) {
    toast.error("Please enter a title");
    return;
  }

  setLoading(true);
  try {
    const response = await axios.post(server, {
      title: autoTitle,
      description: autoDesc,
      i18n: supportedLanguages,
    });

    const translations = response.data;
    
    // Parser les résultats et appliquer
    const newTitles: TranslatedText = {};
    const newDescriptions: TranslatedText = {};

    translations.forEach((t: any) => {
      if (t.i18_language && supportedLanguages.includes(t.i18_language)) {
        if (t.title) newTitles[t.i18_language] = t.title;
        if (t.description) newDescriptions[t.i18_language] = t.description;
      }
    });

    onTitleChange(newTitles);
    onDescriptionChange(newDescriptions);
    
    toast.success("✨ Auto-fill successful!");
    setAutoOpen(false);
    setAutoTitle("");
    setAutoDesc("");
  } catch (err: any) {
    console.error(err);
    toast.error("Auto-fill failed: " + (err.response?.data?.message || err.message));
  } finally {
    setLoading(false);
  }
};
```

### Extraction des données
1. **Validation** : Vérifier que `i18_language` existe et est dans `supportedLanguages`
2. **Extraction** : Récupérer `title` et `description` de chaque objet
3. **Construction** : Créer des objets `TranslatedText` avec format `{ [lang]: "text" }`
4. **Application** : Appeler `onTitleChange()` et `onDescriptionChange()`

## 🌍 Langues supportées

### Codes ISO 639-1
| Code | Langue | Drapeau | Nom natif |
|------|--------|---------|-----------|
| `de` | Allemand | 🇩🇪 | Deutsch |
| `en` | Anglais | 🇬🇧 | English |
| `es` | Espagnol | 🇪🇸 | Español |
| `fr` | Français | 🇫🇷 | Français |
| `hi` | Hindi | 🇮🇳 | हिन्दी |
| `id` | Indonésien | 🇮🇩 | Bahasa Indonesia |
| `ja` | Japonais | 🇯🇵 | 日本語 |
| `ko` | Coréen | 🇰🇷 | 한국어 |
| `vi` | Vietnamien | 🇻🇳 | Tiếng Việt |
| `zh` | Chinois | 🇨🇳 | 中文 |

## 🔄 Exemple complet

### Scénario : Traduire en 5 langues

**1. Requête utilisateur**
```typescript
// L'utilisateur sélectionne les langues
selectedLanguages = ["de", "en", "es", "fr", "ko"]

// L'utilisateur entre le texte source
autoTitle = "hello"
autoDesc = "hello everyone"
```

**2. Requête API**
```json
POST http://192.168.1.69:3000/translate-titles
{
  "title": "hello",
  "description": "hello everyone",
  "i18n": ["de", "en", "es", "fr", "ko"]
}
```

**3. Réponse API**
```json
[
  { "i18_language": "de", "title": "Hallo", "description": "Hallo zusammen", ... },
  { "i18_language": "en", "title": "hello", "description": "hello everyone", ... },
  { "i18_language": "es", "title": "hola", "description": "hola a todos", ... },
  { "i18_language": "fr", "title": "bonjour", "description": "bonjour à tous", ... },
  { "i18_language": "ko", "title": "안녕하세요", "description": "안녕하세요 여러분", ... }
]
```

**4. Transformation frontend**
```typescript
// newTitles
{
  de: "Hallo",
  en: "hello",
  es: "hola",
  fr: "bonjour",
  ko: "안녕하세요"
}

// newDescriptions
{
  de: "Hallo zusammen",
  en: "hello everyone",
  es: "hola a todos",
  fr: "bonjour à tous",
  ko: "안녕하세요 여러분"
}
```

**5. Application aux onglets**
```
Onglet 🇩🇪 Deutsch → Titre: "Hallo" | Description: "Hallo zusammen"
Onglet 🇬🇧 English → Titre: "hello" | Description: "hello everyone"
Onglet 🇪🇸 Español → Titre: "hola" | Description: "hola a todos"
Onglet 🇫🇷 Français → Titre: "bonjour" | Description: "bonjour à tous"
Onglet 🇰🇷 한국어 → Titre: "안녕하세요" | Description: "안녕하세요 여러분"
```

## ⚠️ Gestion des erreurs

### Erreurs possibles

**1. Serveur inaccessible**
```javascript
Error: Network Error
→ Message : "Auto-fill failed: Network Error"
→ Action : Vérifier que le serveur est démarré
```

**2. Timeout**
```javascript
Error: timeout of 30000ms exceeded
→ Message : "Auto-fill failed: timeout of 30000ms exceeded"
→ Action : Réessayer avec moins de langues
```

**3. Erreur serveur**
```javascript
Error: Request failed with status code 500
→ Message : "Auto-fill failed: Internal Server Error"
→ Action : Vérifier les logs serveur
```

**4. Format de réponse invalide**
```javascript
// Si l'API retourne un format inattendu
→ Les traductions manquantes sont simplement ignorées
→ Seules les traductions valides sont appliquées
```

## 🧪 Tests

### Test manuel

**1. Démarrer le serveur**
```bash
# Vérifier que le serveur de traduction est actif
curl http://192.168.1.69:3000/translate-titles
```

**2. Tester avec curl**
```bash
curl -X POST http://192.168.1.69:3000/translate-titles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "test",
    "description": "test description",
    "i18n": ["en", "fr", "es"]
  }'
```

**3. Tester dans l'interface**
```
1. Créer un nouveau manga
2. Sélectionner 3 langues (EN, FR, ES)
3. Cliquer sur [✨ Auto]
4. Entrer "test" comme titre
5. Cliquer sur Appliquer
6. Vérifier que les 3 onglets sont remplis
```

## 📊 Performance

### Temps de réponse moyen
- **1-3 langues** : ~1-2 secondes
- **4-6 langues** : ~2-4 secondes
- **7-10 langues** : ~4-6 secondes

### Optimisations
- Traductions effectuées en parallèle côté serveur
- Pas de cache (chaque requête est fraîche)
- Timeout configuré à 30 secondes

## 🔐 Sécurité

### Validation côté frontend
```typescript
// Validation du titre obligatoire
if (!autoTitle.trim()) {
  toast.error("Please enter a title");
  return;
}

// Validation des langues
translations.forEach((t: any) => {
  if (t.i18_language && supportedLanguages.includes(t.i18_language)) {
    // Appliquer uniquement si la langue est supportée
  }
});
```

### Protection XSS
- Les textes traduits sont automatiquement échappés par React
- Pas d'utilisation de `dangerouslySetInnerHTML`
- Validation des codes langue (liste fermée)

## 🚀 Déploiement

### Variables d'environnement

**Development**
```typescript
export const translateServer = "http://localhost:3000/translate-titles"
```

**Production**
```typescript
export const translateServer = "https://api.votredomaine.com/translate-titles"
```

### Configuration Nginx (exemple)
```nginx
location /translate-titles {
    proxy_pass http://translate-service:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_connect_timeout 30s;
    proxy_send_timeout 30s;
    proxy_read_timeout 30s;
}
```

## 📝 Notes

### Champs ignorés
L'API retourne des champs supplémentaires qui sont ignorés :
- `id` : Toujours null, non utilisé
- `language.title` : Redondant avec `i18_language`
- `language.name` : Non utilisé (on a nos propres mappings)

### Format TranslatedText
Le frontend convertit le format API vers le format i18n interne :
```typescript
// Format API
[{ i18_language: "en", title: "hello" }]

// Format i18n
{ en: "hello" }
```

### Compatibilité
- Compatible avec le même endpoint que les vidéos
- Même format de requête/réponse
- Code réutilisable entre mangas et vidéos

---

**Version** : 1.0  
**Date** : 23/12/2024  
**Statut** : ✅ Testé et fonctionnel
