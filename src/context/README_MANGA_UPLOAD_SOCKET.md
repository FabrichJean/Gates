# 🔌 Manga Upload Socket Context

## Problème résolu

Après un refresh de la page, les barres de progression d'upload de mangas se figeaient et ne se mettaient plus à jour, même si l'upload continuait côté serveur.

## Solution implémentée

### Architecture avec Context Global

Au lieu de créer une connexion Socket.IO pour chaque composant `MangaUploadProgress` (potentiellement des dizaines dans la page `Mangas.tsx`), nous utilisons maintenant un **contexte global** qui partage une seule connexion Socket entre tous les composants.

### Fichiers créés/modifiés

1. **`MangaUploadSocketContext.tsx`** (NOUVEAU)
   - Provider React qui crée et maintient une connexion Socket.IO unique
   - Écoute les 4 événements: `manga:upload:start`, `manga:upload:progress`, `manga:upload:complete`, `manga:upload:error`
   - Gère un dictionnaire d'états `Record<number, MangaUploadState>` pour tous les mangas en cours d'upload
   - Système de subscribe/unsubscribe pour chaque manga
   - Polling localStorage en fallback (1s) pour la persistence après refresh
   - Auto-reconnexion avec retry infini

2. **`MangaUploadProgress.tsx`** (MODIFIÉ)
   - Simplifié pour utiliser le contexte au lieu de créer son propre socket
   - Subscribe au mangaId au montage, unsubscribe au démontage
   - Lit l'état depuis `states[mangaId]` du contexte

3. **`main.tsx`** (MODIFIÉ)
   - Wrapper l'app avec `<MangaUploadSocketProvider>`

### Avantages

✅ **Une seule connexion Socket** - Même avec 50 mangas affichés, une seule connexion WebSocket  
✅ **Performance optimale** - Pas de multiplication des listeners  
✅ **Reconnexion automatique** - Le socket se reconnecte après refresh avec retry infini  
✅ **État partagé** - Tous les composants voient le même état en temps réel  
✅ **Fallback localStorage** - Si socket échoue, le polling prend le relais  
✅ **Logs de debug** - Console logs pour suivre connexion/déconnexion/reconnexion  

### Événements Socket écoutés

```typescript
socket.on("manga:upload:start", handleUploadEvent);
socket.on("manga:upload:progress", handleUploadEvent);
socket.on("manga:upload:complete", handleUploadEvent);
socket.on("manga:upload:error", handleUploadEvent);
```

### Configuration Socket

```typescript
io(server, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity, // Retry forever
  transports: ['websocket', 'polling'],
})
```

### Usage

Les composants n'ont rien à changer:

```tsx
<MangaUploadProgress mangaId={manga.id} variant="inline" />
<MangaUploadProgress mangaId={manga.id} variant="badge" />
<MangaUploadProgress mangaId={manga.id} variant="full" />
```

Le contexte gère tout automatiquement! 🚀

### Logs de debug

Dans la console:
- 🔌 Initializing global manga upload socket...
- 🟢 Global manga upload socket connected: [socket-id]
- 🔴 Global manga upload socket disconnected: [reason]
- 🔄 Global manga upload socket reconnected after X attempts

### Test du fix

1. Ouvrir la page Mangas.tsx
2. Lancer un upload de manga
3. **Refresh la page** pendant l'upload
4. ✅ La barre de progression continue de se mettre à jour!
