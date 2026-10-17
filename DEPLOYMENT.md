# Guide Officiel de Déploiement et Sauvegarde — Église du Nazaréen de Damé (Haïti)

**Nom Officiel :** ÉGLISE DU NAZARÉEN DE DAMÉ  
**Devise :** « Sainteté à l’Éternel »  
**Adresse :** 3ème Section Damé, Commune de Môle-Saint-Nicolas, Département du Nord-Ouest, Haïti  
**Fondée en :** 1979 par Saurel ALCINÉ  
**Pasteur Titulaire :** Bequel CHERELUS (depuis 2003)  
**Téléphone :** +509 48596089  
**Email :** eglisedunazareendedame@gmail.com  
**Domaine Officiel :** https://www.eglisedunazareendedame.org  
**YouTube :** https://youtube.com/@eglisedunazareendame  
**Facebook :** https://www.facebook.com/profile.php?id=61586834645549  

---

## 1. Architecture du Projet

- **Frontend :** React 19 + TypeScript + Tailwind CSS v4
- **Backend & API Proxy :** Express (`server.ts`) / Cloudflare Worker (`cloudflare/worker.js`)
- **Base de Données :** Supabase (PostgreSQL avec Row Level Security)
- **Système Newsletter :** Brevo API (Sendinblue) — Clé API stockée strictement côté serveur
- **SEO & Référencement :** Balises Open Graph, Twitter Cards, Schema.org `Church` / `ReligiousOrganization`, `sitemap.xml`, `robots.txt`

---

## 2. Variables d'Environnement (`.env`)

```env
# URL Officielle de l'application
APP_URL="https://www.eglisedunazareendedame.org"

# Backend Supabase
VITE_SUPABASE_URL="https://votre-projet.supabase.co"
VITE_SUPABASE_ANON_KEY="votre_cle_anon_publique"

# Configuration Brevo (Sendinblue) — CÔTÉ SERVEUR UNIQUEMENT
BREVO_API_KEY="xkeysib-votre-cle-secrete-brevo"
BREVO_SENDER_EMAIL="eglisedunazareendedame@gmail.com"
BREVO_SENDER_NAME="Église du Nazaréen de Damé"
BREVO_LIST_ID="2"

# Clé Secrète Admin
ADMIN_SECURITY_KEY="nazareen-dame-secret-2026"
PORT=3000
```

---

## 3. Schéma Supabase & Base de Données

Le fichier SQL complet se trouve dans `/supabase/schema.sql` (également téléchargeable depuis l'Espace Secrétariat).

Tables incluses :
- `profiles`
- `ministries` (Les 7 ministères)
- `events` (Cultes et conférences)
- `projects` (dont CDEJ HA 0926 Compassion International)
- `project_statistics`
- `media` (Prédications, Vidéos, Podcasts, Photos)
- `posts`
- `newsletter_subscribers`
- `newsletter_campaigns`
- `brevo_settings`
- `members` (Registre paroissial de Damé)
- `game_scores` (Jeux bibliques)

Toutes les tables disposent de **Row Level Security (RLS)** activé avec politiques sécurisées.

---

## 4. Déploiement sur Cloudflare

### Hébergement Cloudflare Pages :
1. Connectez le dépôt Git à Cloudflare Pages.
2. Définissez la commande de build : `npm run build`
3. Définissez le dossier de sortie : `dist`

### Fonction Worker Brevo & API :
Le script prêt à l'emploi se trouve dans `cloudflare/worker.js` avec la configuration `cloudflare/wrangler.toml`.
Pour injecter la clé secrète Brevo en production sans fuite frontend :
```bash
npx wrangler secret put BREVO_API_KEY
```

### Domaine personnalisé Cloudflare :
Dans la console Cloudflare DNS de votre domaine `eglisedunazareendedame.org` :
- `CNAME @ eglise-nazareen-dame.pages.dev` (Proxy activé)
- `CNAME www eglise-nazareen-dame.pages.dev` (Proxy activé)
- Activez **Always Use HTTPS** et **Automatic HTTPS Rewrites**.

---

## 5. Espace Secrétariat & Administration

- Accès : `/secretariat`
- Mot de passe officiel par défaut : `dame1979`
- Fonctionnalités :
  - Configuration sécurisée de l'API Brevo avec test de connexion instantané
  - Newsletter Manager (abonnés, campagnes, envoi avec Brevo, aperçu)
  - Gestion du projet CDEJ HA 0926 Compassion International
  - Gestion des cultes et réunions
  - Registre des membres de l'Église
  - Organisation des dossiers d'images
  - Téléchargement du schéma SQL
