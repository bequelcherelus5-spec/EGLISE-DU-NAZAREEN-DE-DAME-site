# Plan d'implémentation : Nettoyage des Médias & Mise à jour du Favicon

Ce plan décrit les actions précises pour répondre à vos deux demandes confirmées :
1. **Nettoyer tous les médias d'exemple** pour que la page Média et le Secrétariat démarrent 100 % vierges (seuls vos futurs ajouts s'afficheront).
2. **Définir le logo officiel de l'en-tête** (`regenerated_image_1792011564270.x-icon`) comme favicon universel et forcer l'actualisation dans les navigateurs.

---

## 1. Suppression intégrale des médias d'exemple

### Fichiers ciblés :
- `src/services/mediaService.ts`
- `src/pages/Media.tsx`
- `src/pages/Secretariat.tsx`

### Modifications détaillées :
1. **Vider le tableau d'initialisation** :
   - Remplacer `INITIAL_CHURCH_MEDIA` par une liste vide `[]`.
   - Modifier la méthode `getAllMedia()` pour qu'elle ne réinjecte aucun média d'exemple en cas de cache vide ou d'absence de données Supabase.
2. **Nettoyage automatique du cache navigateur (`localStorage`)** :
   - Ajouter une migration/purge automatique de la clé `dame_church_media_v1` : tout ancien élément d'exemple généré lors des tests sera automatiquement purgé dès le premier chargement du site.
   - Si la table Supabase `media_items` ne contient rien, la page affichera un état d'attente soigné et chaleureux : *"Aucun média publié pour le moment. Utilisez le Secrétariat pour ajouter des vidéos, audios ou photos."* avec un bouton d'accès direct au Secrétariat.

---

## 2. Définition du Logo de l'en-tête comme Favicon Officiel

### Fichiers ciblés :
- `/public/favicon.ico`
- `/public/favicon.png`
- `/public/apple-touch-icon.png`
- `index.html`

### Modifications détaillées :
1. **Copie et remplacement des fichiers d'icône** :
   - Remplacer le contenu de `/public/favicon.ico`, `/public/favicon.png`, et `/public/apple-touch-icon.png` par l'image exacte du logo de l'en-tête (`src/assets/images/regenerated_image_1792011564270.x-icon`).
2. **Mise à jour de `index.html` avec casse-cache (Cache Busting)** :
   - Les navigateurs (Chrome, Safari, Firefox, Edge) ont tendance à mettre en cache agressivement l'ancien `favicon.ico`.
   - Configurer explicitement dans `<head>` :
     ```html
     <link rel="icon" type="image/x-icon" href="/favicon.ico?v=2" />
     <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png?v=2" />
     <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2" />
     ```
   - Supprimer tout lien résiduel vers des fichiers SVG ou anciens placeholders qui pourraient prévaloir sur le logo.

---

## 3. Validation et Tests

- Exécution de `lint_applet` pour garantir l'absence totale d'erreurs TypeScript.
- Exécution de `compile_applet` pour valider la génération du build Vite.
- Vérification visuelle que la page `/media` est propre et prête à recevoir vos publications depuis le Secrétariat, et que le favicon s'affiche correctement sur l'onglet du navigateur.
