# Test API Auto-fill

## 🧪 Script de test rapide

### Test avec curl
```bash
# Test basique avec 5 langues
curl -X POST http://192.168.1.69:3000/translate-titles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Amazing Manga",
    "description": "This is an epic story about adventure and friendship",
    "i18n": ["de", "en", "es", "fr", "ko"]
  }' | jq
```

### Test avec toutes les langues
```bash
# Test avec les 10 langues supportées
curl -X POST http://192.168.1.69:3000/translate-titles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Dragon Quest",
    "description": "An epic journey to save the world",
    "i18n": ["de", "en", "es", "fr", "hi", "id", "ja", "ko", "vi", "zh"]
  }' | jq
```

### Test sans description
```bash
# Test avec titre seulement
curl -X POST http://192.168.1.69:3000/translate-titles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "One Piece",
    "description": "",
    "i18n": ["en", "fr", "ja"]
  }' | jq
```

## 📊 Résultats attendus

### Exemple de réponse réussie
```json
{
  "success": true,
  "translations": [
    {
      "id": null,
      "title": "Mon Manga Incroyable",
      "description": "C'est une histoire épique sur l'aventure et l'amitié",
      "i18_language": "fr",
      "language": {
        "title": "fr",
        "name": "French"
      }
    }
    // ... autres traductions
  ]
}
```

### Vérifications à effectuer
- ✅ Tous les codes langue demandés sont présents
- ✅ Les titres sont traduits correctement
- ✅ Les descriptions sont traduites correctement
- ✅ Le format JSON est valide
- ✅ Les champs `i18_language` correspondent aux codes demandés
- ✅ Temps de réponse < 5 secondes

## 🎯 Checklist de validation

### Frontend
- [ ] Le bouton **[✨ Auto]** s'affiche bien
- [ ] Le clic ouvre le modal
- [ ] Les champs titre/description sont présents
- [ ] L'URL du serveur est pré-remplie correctement
- [ ] Les langues cibles sont affichées avec drapeaux
- [ ] Le loader s'affiche pendant la requête
- [ ] Les onglets se remplissent après la réponse
- [ ] Le badge de complétion passe à 100%
- [ ] Un toast de succès s'affiche
- [ ] Le modal se ferme automatiquement

### API
- [ ] Le serveur est accessible sur le port 3000
- [ ] L'endpoint `/translate-titles` répond
- [ ] Le format de requête est accepté
- [ ] La réponse est au bon format JSON
- [ ] Toutes les langues demandées sont traduites
- [ ] Les traductions sont de bonne qualité
- [ ] Pas d'erreurs dans les logs serveur

### Gestion d'erreurs
- [ ] Titre vide → Message d'erreur affiché
- [ ] Serveur down → Message d'erreur réseau
- [ ] Timeout → Message d'erreur timeout
- [ ] Format invalide → Gestion gracieuse

## 🔍 Debug

### Console browser (F12)
```javascript
// Vérifier la requête
// Network tab → XHR → translate-titles
// Request:
{
  title: "...",
  description: "...",
  i18n: ["en", "fr", ...]
}

// Response:
[
  { i18_language: "en", title: "...", ... },
  { i18_language: "fr", title: "...", ... }
]
```

### Logs serveur
```bash
# Vérifier les logs du serveur de traduction
tail -f /var/log/translate-server.log

# Ou si Docker
docker logs -f translate-container
```

## 🐛 Problèmes courants

### "Auto-fill failed: Network Error"
**Cause** : Serveur inaccessible
**Solution** :
```bash
# Vérifier que le serveur tourne
curl http://192.168.1.69:3000/health

# Vérifier le firewall
sudo ufw status

# Redémarrer le serveur
pm2 restart translate-server
```

### "Please enter a title"
**Cause** : Champ titre vide
**Solution** : Entrer un titre avant de cliquer sur Appliquer

### Les traductions ne s'affichent pas
**Cause** : Format de réponse incorrect
**Solution** : Vérifier que l'API retourne bien un tableau avec `i18_language`, `title`, `description`

### Certaines langues manquantes
**Cause** : Serveur ne supporte pas toutes les langues
**Solution** : Vérifier la configuration du serveur de traduction

## 📈 Monitoring

### Métriques à surveiller
- **Temps de réponse** : Doit être < 5s pour 5 langues
- **Taux d'erreur** : Doit être < 1%
- **Taux de succès** : Doit être > 99%
- **Langues traduites** : Toutes les langues demandées

### Alertes
```bash
# Si temps de réponse > 10s
alert: TranslateServerSlow
expr: translate_request_duration_seconds > 10

# Si taux d'erreur > 5%
alert: TranslateServerErrors
expr: rate(translate_errors_total[5m]) > 0.05
```

---

**Testé le** : 23/12/2024  
**Statut** : ✅ Fonctionnel  
**Note** : API retourne le format attendu
