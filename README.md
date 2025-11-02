# Profin Bank - Application d'Investissement

Application bancaire moderne pour la gestion d'investissements en obligations et instruments financiers, construite avec React 19 + TypeScript et connectée à un backend FastAPI.

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ et npm
- Backend FastAPI démarré sur `http://localhost:8000`
- Base de données SQL Server configurée

### Installation & Démarrage

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env si nécessaire

# Démarrer l'application en mode développement
npm run dev
```

L'application sera disponible sur **http://localhost:3000**

## 📋 Fonctionnalités

- **Authentification JWT** - Connexion sécurisée avec refresh automatique des tokens
- **Dashboard** - Vue d'ensemble du portefeuille avec graphiques
- **Investissements** - Gestion des souscriptions aux instruments financiers
- **Transactions** - Historique complet des opérations (dépôts, retraits, investissements)
- **Comptes** - Gestion multi-comptes (INVESTISSEMENT, CASH, EPARGNE)
- **Profil KYC** - Informations client complètes
- **Nouvel Ordre** - Création de nouvelles souscriptions
- **Chat IA** - Assistant virtuel (Gemini) pour répondre aux questions

## 🏗️ Architecture

### Frontend

- **React 19.2.0** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Graphiques
- **Axios** - Client HTTP
- **Context API** - Gestion d'état

### Backend

- **FastAPI** (Python)
- **SQL Server Azure** - Base de données
- **SQLAlchemy** - ORM
- **JWT** - Authentification
- **Vues SQL** optimisées pour les requêtes

## 📁 Structure du Projet

```
FinTest2/
├── components/           # Composants réutilisables
│   ├── Card.tsx
│   ├── ChatWidget.tsx
│   ├── Header.tsx
│   ├── Layout.tsx
│   ├── Sidebar.tsx
│   └── icons.tsx
├── contexts/            # Context API
│   └── AuthContext.tsx  # Gestion authentification et données
├── hooks/               # Custom hooks
│   └── useAuth.ts
├── pages/               # Pages de l'application
│   ├── DashboardPage.tsx
│   ├── TransactionsPage.tsx
│   ├── InvestmentsPage.tsx
│   ├── AccountsPage.tsx
│   ├── ProfilePage.tsx
│   ├── NewOrderPage.tsx
│   └── LoginPage.tsx
├── services/            # Services API
│   ├── httpClient.ts         # Instance Axios + intercepteurs
│   ├── authService.ts        # Authentification
│   ├── userService.ts        # Utilisateur
│   ├── dashboardService.ts   # Dashboard
│   ├── profilService.ts      # Profil
│   ├── comptesService.ts     # Comptes
│   ├── instrumentsService.ts # Instruments
│   ├── souscriptionsService.ts # Souscriptions
│   ├── transactionsService.ts  # Transactions
│   └── geminiService.ts      # Chat IA (mocké)
├── data/                # Données mockées (legacy)
│   └── mock.ts
├── types.ts             # Définitions TypeScript
├── App.tsx              # Composant racine
├── index.tsx            # Point d'entrée
├── .env                 # Variables d'environnement
└── vite.config.ts       # Configuration Vite
```

## 🔗 Connexion au Backend

Le frontend communique avec le backend FastAPI via 8 services API qui mappent les endpoints REST et les vues SQL.

### Configuration

Fichier `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Endpoints Utilisés

| Page | Endpoint Backend | Vue SQL |
|------|------------------|---------|
| Dashboard | `/dashboard/complet` | `vw_Dashboard_Overview`, `vw_Dashboard_DernieresTransactions`, `vw_Dashboard_InvestissementsActifs` |
| Transactions | `/transactions/mes-transactions` | `vw_HistoriqueTransactions` |
| Investissements | `/souscriptions/mes-souscriptions` | `vw_MesInvestissements` |
| Comptes | `/comptes/mes-comptes` | `vw_MesComptes` |
| Profil | `/profil/` | `vw_ProfilClient` |

**Documentation complète:** Voir [BACKEND_CONNECTION_GUIDE.md](BACKEND_CONNECTION_GUIDE.md)

## 🔐 Authentification

### Flux JWT

1. **Login** → Récupération des tokens (access + refresh)
2. **Requêtes** → Header `Authorization: Bearer {token}`
3. **Expiration** → Refresh automatique transparent
4. **Logout** → Révocation du refresh token

### Credentials de Test

```
Email: marie.jean@example.com
Mot de passe: MotDePasse123
```

_(Ou tout autre utilisateur créé dans votre base de données)_

## 🎨 Pages de l'Application

### 1. Dashboard
- Vue d'ensemble du portefeuille
- Graphique d'évolution sur 12 mois
- Statistiques clés (valeur totale, rendement, souscriptions actives)
- Dernières transactions
- Investissements actifs

### 2. Mes Comptes
- Liste des comptes (INVESTISSEMENT, CASH, EPARGNE)
- Solde total et disponible
- Statut du compte

### 3. Mes Investissements
- Liste des souscriptions
- Filtres par statut (ACTIVE, MATURE, RACHETEE)
- Détails: montant investi, valeur actuelle, taux, maturité
- Barre de progression vers la maturité

### 4. Transactions
- Historique complet
- Recherche et filtres (type, statut)
- Pagination
- Vue tableau (desktop) / cartes (mobile)

### 5. Profil KYC
- Informations personnelles
- Adresse
- Profil investisseur
- Édition du profil

### 6. Nouvel Ordre
- Liste des instruments disponibles
- Création de nouvelle souscription
- Montant minimum respecté

## 📱 Responsive Design

L'application est entièrement responsive avec :
- **Mobile-first** approach
- Sidebar overlay sur mobile
- Tableaux transformés en cartes sur mobile
- Header adaptatif

## 🛡️ Sécurité

- **JWT** avec refresh automatique
- **Tokens** stockés dans localStorage
- **Auto-déconnexion** après 15 minutes d'inactivité
- **Validation** côté client et serveur
- **HTTPS** recommandé en production

## 🧪 Développement

### Commandes Disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

### Structure de l'État Global (AuthContext)

```typescript
{
  loggedInUser: User | null,        // Utilisateur connecté
  authUser: AuthUser | null,        // Infos d'auth JWT
  portfolio: Portfolio | null,      // Données du portefeuille
  dashboardOverview: DashboardOverview | null,
  subscriptions: Subscription[],    // Liste des investissements
  transactions: Transaction[],      // Liste des transactions
  accounts: ClientAccount[],        // Liste des comptes
  instruments: Instrument[],        // Instruments disponibles
  isLoadingData: boolean,           // État de chargement
  error: string | null,             // Erreur éventuelle
  login: (email, password) => Promise<void>,
  logout: () => Promise<void>,
  switchAccount: (accountId) => void,
  refreshData: () => Promise<void>
}
```

## 🌐 APIs Tierces

### Gemini AI (Optionnel)

Pour activer le chat IA :

1. Obtenir une clé API sur https://ai.google.dev/
2. Ajouter dans `.env`:
   ```
   VITE_GEMINI_API_KEY=your_key_here
   ```
3. Décommenter le code dans `services/geminiService.ts`

## 📊 Technologies Utilisées

- **React 19.2.0** - Framework UI
- **TypeScript 5.8.2** - Typage statique
- **Vite 6.2.0** - Build tool ultra-rapide
- **Axios** - Client HTTP
- **Recharts** - Graphiques
- **Tailwind CSS** - Styling (via CDN)
- **Google Fonts** - Police Inter

## 🚢 Déploiement

### Build de Production

```bash
npm run build
```

Le build sera dans le dossier `dist/`.

### Variables d'Environnement de Production

```env
VITE_API_BASE_URL=https://your-production-api.com/api/v1
VITE_GEMINI_API_KEY=your_production_key
```

## 📝 TODO / Améliorations Futures

- [ ] Ajouter React Router pour de vrais URLs
- [ ] Implémenter TanStack Query pour le cache des données
- [ ] Ajouter des tests unitaires (Vitest)
- [ ] Ajouter des tests E2E (Playwright)
- [ ] Implémenter un mode hors ligne (PWA)
- [ ] Ajouter des notifications push
- [ ] Implémenter l'export CSV/PDF des transactions
- [ ] Ajouter un thème sombre
- [ ] Internationalisation (i18n)

## 🐛 Résolution de Problèmes

### Le backend ne répond pas

1. Vérifiez que le backend est démarré sur le port 8000
2. Vérifiez la configuration CORS du backend
3. Consultez les logs du serveur FastAPI

### Erreur 401 Unauthorized

1. Vérifiez que vous êtes connecté
2. Vérifiez que les tokens ne sont pas expirés
3. Essayez de vous déconnecter et reconnecter

### Données ne se chargent pas

1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs dans l'onglet Network
3. Vérifiez que la base de données est accessible

## 📄 Licence

Ce projet est à usage privé.

## 👥 Contributeurs

- Frontend: Développé avec Claude Code
- Backend: FastAPI avec vues SQL optimisées

## 📞 Support

Pour toute question, consultez:
- [BACKEND_CONNECTION_GUIDE.md](BACKEND_CONNECTION_GUIDE.md) - Guide de connexion détaillé
- Documentation Swagger du backend: http://localhost:8000/api/v1/docs

---

**Version:** 1.0.0
**Dernière mise à jour:** 2025-11-02
