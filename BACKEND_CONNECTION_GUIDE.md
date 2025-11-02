# Guide de Connexion Frontend ↔ Backend FastAPI

## 📋 Vue d'ensemble

Ce document explique comment le frontend React (FinTest2) est connecté au backend FastAPI (backendFintest) et comment tout fonctionne ensemble.

---

## 🚀 Démarrage Rapide

### 1. Démarrer le Backend FastAPI

```bash
cd ../backendFintest
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Le backend sera disponible sur **http://localhost:8000**

Documentation Swagger: **http://localhost:8000/api/v1/docs**

### 2. Démarrer le Frontend React

```bash
cd FinTest2
npm install
npm run dev
```

Le frontend sera disponible sur **http://localhost:3000**

---

## 🔐 Credentials de Test

Utilisez ces credentials pour tester la connexion :

**Email:** `marie.jean@example.com` (ou tout autre email présent dans votre base de données)
**Mot de passe:** `MotDePasse123` (ou le mot de passe que vous avez défini lors de l'inscription)

> **Note:** Les credentials dépendent des données que vous avez créées dans votre base de données SQL Server. Vous pouvez créer un nouvel utilisateur via l'endpoint `/auth/register`.

---

## 📁 Architecture de l'Implémentation

### Services API Créés

Tous les services sont dans le dossier [`services/`](services/):

| Service | Fichier | Endpoints | Description |
|---------|---------|-----------|-------------|
| **HTTP Client** | [`httpClient.ts`](services/httpClient.ts) | - | Instance Axios configurée avec intercepteurs JWT |
| **Authentification** | [`authService.ts`](services/authService.ts) | `/auth/login`, `/auth/logout`, `/auth/refresh` | Gestion de la connexion et des tokens |
| **Utilisateur** | [`userService.ts`](services/userService.ts) | `/users/me` | Profil utilisateur connecté |
| **Dashboard** | [`dashboardService.ts`](services/dashboardService.ts) | `/dashboard/overview`, `/dashboard/complet` | Statistiques et vue d'ensemble |
| **Profil** | [`profilService.ts`](services/profilService.ts) | `/profil/` | Profil KYC complet du client |
| **Comptes** | [`comptesService.ts`](services/comptesService.ts) | `/comptes/mes-comptes`, `/comptes/{id}` | Gestion des comptes bancaires |
| **Instruments** | [`instrumentsService.ts`](services/instrumentsService.ts) | `/instruments/disponibles` | Instruments financiers disponibles |
| **Souscriptions** | [`souscriptionsService.ts`](services/souscriptionsService.ts) | `/souscriptions/mes-souscriptions` | Investissements du client |
| **Transactions** | [`transactionsService.ts`](services/transactionsService.ts) | `/transactions/mes-transactions` | Historique des transactions |

---

## 🔄 Flux d'Authentification JWT

### 1. Login

```typescript
// L'utilisateur se connecte
authService.login({ email, password })
  ↓
// Backend retourne
{
  success: true,
  tokens: {
    access_token: "eyJhbGci...",
    refresh_token: "eyJhbGci...",
    expires_in: 1800 // 30 minutes
  },
  client: { client_id, email, ... }
}
  ↓
// Frontend sauvegarde dans localStorage
localStorage.setItem('access_token', token)
localStorage.setItem('refresh_token', token)
```

### 2. Requêtes Authentifiées

```typescript
// Chaque requête ajoute automatiquement le header
headers: {
  'Authorization': `Bearer ${access_token}`
}
```

### 3. Refresh Automatique

```typescript
// Si le backend retourne 401 (token expiré)
httpClient interceptor détecte l'erreur
  ↓
// Appelle automatiquement /auth/refresh
authService.refreshToken(refresh_token)
  ↓
// Récupère un nouveau access_token
// Réessaie la requête originale
```

### 4. Déconnexion

```typescript
// L'utilisateur se déconnecte
authService.logout()
  ↓
// Appelle /auth/logout (révoque le refresh token)
  ↓
// Nettoie le localStorage
localStorage.removeItem('access_token')
localStorage.removeItem('refresh_token')
```

---

## 📊 Mapping Pages ↔ Endpoints Backend

| Page Frontend | Composant | Données Utilisées | Endpoints Backend | Vue SQL Backend |
|---------------|-----------|-------------------|-------------------|-----------------|
| **Dashboard** | `DashboardPage.tsx` | Portfolio, Transactions, Investissements | `/dashboard/complet` | `vw_Dashboard_Overview`, `vw_Dashboard_DernieresTransactions`, `vw_Dashboard_InvestissementsActifs`, `vw_StatistiquesMensuelles` |
| **Transactions** | `TransactionsPage.tsx` | Historique complet | `/transactions/mes-transactions` | `vw_HistoriqueTransactions` |
| **Investissements** | `InvestmentsPage.tsx` | Souscriptions | `/souscriptions/mes-souscriptions` | `vw_MesInvestissements` |
| **Mes Comptes** | `AccountsPage.tsx` | Comptes | `/comptes/mes-comptes` | `vw_MesComptes` |
| **Profil KYC** | `ProfilePage.tsx` | Profil client | `/profil/` | `vw_ProfilClient` |
| **Nouvel Ordre** | `NewOrderPage.tsx` | Instruments disponibles | `/instruments/disponibles` | - |
| **Header** | `Header.tsx` | Comptes pour switch | `/comptes/mes-comptes` | `vw_ComptesAccessibles` |

---

## 🎯 AuthContext - Le Coeur de l'Application

Le fichier [`contexts/AuthContext.tsx`](contexts/AuthContext.tsx) a été complètement refactorisé pour utiliser les vrais appels API.

### Fonctionnalités

1. **Authentification JWT**
   - Login avec `authService.login()`
   - Logout avec `authService.logout()`
   - Refresh automatique des tokens

2. **Chargement des Données**
   ```typescript
   const loadInitialData = async () => {
     // Charge l'utilisateur
     const currentUser = await userService.getCurrentUser();

     // Charge les comptes
     const accounts = await comptesService.getMesComptes('ACTIF');

     // Charge le dashboard complet
     const overview = await dashboardService.getOverview();
     const subscriptions = await souscriptionsService.getMesSouscriptions();
     const transactions = await transactionsService.getMesTransactions();
     // ...
   }
   ```

3. **Gestion Multi-Comptes**
   - Switch entre différents comptes
   - Rechargement automatique des données lors du changement

4. **Auto-Déconnexion**
   - Déconnexion automatique après 15 minutes d'inactivité
   - Reset du timer à chaque activité utilisateur

### Utilisation dans les Composants

```typescript
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const {
    portfolio,           // Données du portefeuille
    transactions,        // Liste des transactions
    subscriptions,       // Liste des investissements
    accounts,            // Liste des comptes
    instruments,         // Instruments disponibles
    isLoadingData,       // État de chargement
    error,               // Erreur éventuelle
    login,               // Fonction de connexion
    logout,              // Fonction de déconnexion
    switchAccount,       // Changer de compte
    refreshData          // Recharger les données
  } = useAuth();

  // Utiliser les données...
}
```

---

## 🔧 Configuration

### Variables d'Environnement

Fichier [`.env`](.env):

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### CORS Backend

Assurez-vous que le backend autorise `http://localhost:3000` dans la configuration CORS :

```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔄 Conversion des Données Backend → Frontend

Le `AuthContext` contient des fonctions de conversion pour transformer les données du backend (format SQL/Python) vers le format TypeScript attendu par les composants React.

### Exemples de Conversion

#### Subscription
```typescript
// Backend: SouscriptionID, MontantInvesti, ValeurActuelle...
// Frontend: subscriptionId, investedAmount, currentValue...

const convertSubscription = (sub: any): Subscription => ({
  subscriptionId: sub.SouscriptionID,
  accountId: sub.CompteID,
  investedAmount: sub.MontantInvesti,
  currentValue: sub.ValeurActuelle,
  // ...
});
```

#### Transaction
```typescript
// Backend: TransactionID, TypeTransaction, DateCreation...
// Frontend: transactionId, transactionType, creationDate...

const convertTransaction = (tx: any): Transaction => ({
  transactionId: tx.TransactionID,
  transactionType: tx.TypeTransaction,
  creationDate: tx.DateCreation,
  // ...
});
```

Ces conversions garantissent la compatibilité avec les composants React existants sans avoir à les modifier.

---

## 🛠️ Gestion des Erreurs

### Types d'Erreurs Gérées

1. **Erreurs d'Authentification (401)**
   - Token expiré → Refresh automatique
   - Refresh échoué → Déconnexion et redirection

2. **Erreurs de Permissions (403)**
   - Message d'erreur affiché à l'utilisateur
   - Empêche les actions non autorisées

3. **Erreurs Réseau**
   - Détection de perte de connexion
   - Messages d'erreur appropriés

4. **Erreurs Serveur (500)**
   - Capture et affichage de messages d'erreur
   - Logs pour le débogage

### Affichage des Erreurs

```typescript
const { error } = useAuth();

{error && (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
    {error}
  </div>
)}
```

---

## 📝 Types TypeScript

Tous les types sont définis dans [`types.ts`](types.ts) et correspondent aux schémas du backend :

- `AuthUser` - Utilisateur authentifié
- `ClientProfil` - Profil client complet
- `DashboardOverview` - Vue d'ensemble du dashboard
- `Subscription` - Souscription/Investissement
- `Transaction` - Transaction financière
- `ClientAccount` - Compte bancaire
- `Instrument` - Instrument financier

---

## 🧪 Tests de Connexion

### 1. Vérifier que le Backend est Démarré

```bash
curl http://localhost:8000/api/v1/docs
```

Vous devriez voir la documentation Swagger.

### 2. Tester l'Authentification

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"marie.jean@example.com","password":"MotDePasse123"}'
```

Vous devriez recevoir un token JWT.

### 3. Tester le Frontend

1. Ouvrir **http://localhost:3000**
2. Se connecter avec les credentials
3. Vérifier que le dashboard s'affiche avec les vraies données
4. Ouvrir la console du navigateur (F12) pour voir les appels API

---

## 🔍 Débogage

### Voir les Appels API

Ouvrez les DevTools du navigateur (F12) → Onglet **Network** pour voir tous les appels HTTP.

### Voir les Tokens

```javascript
// Dans la console du navigateur
console.log('Access Token:', localStorage.getItem('access_token'));
console.log('Refresh Token:', localStorage.getItem('refresh_token'));
console.log('User:', localStorage.getItem('user'));
```

### Logs Backend

Vérifiez les logs de Uvicorn dans le terminal où vous avez lancé le backend.

---

## ⚠️ Points Importants

1. **CORS**
   - Le backend doit autoriser `http://localhost:3000`
   - Credentials doivent être activés

2. **Base de Données**
   - Assurez-vous que la base de données SQL Server est accessible
   - Vérifiez que les vues SQL sont créées

3. **Tokens JWT**
   - Les tokens expirent après 30 minutes
   - Le refresh est automatique mais nécessite un refresh token valide

4. **Données de Test**
   - Créez des utilisateurs de test via `/auth/register`
   - Ou utilisez les données mockées dans votre base de données

---

## 📚 Ressources

- **Backend API Docs**: http://localhost:8000/api/v1/docs
- **Frontend**: http://localhost:3000
- **Documentation FastAPI**: https://fastapi.tiangolo.com/
- **Documentation React**: https://react.dev/
- **Documentation Axios**: https://axios-http.com/

---

## 🎉 Félicitations !

Votre frontend React est maintenant entièrement connecté au backend FastAPI. Toutes les pages utilisent les vraies données provenant de votre base de données SQL Server via les endpoints FastAPI et les vues SQL que vous avez créées.

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez que le backend est bien démarré
2. Vérifiez les logs dans la console du navigateur
3. Vérifiez les logs du serveur FastAPI
4. Vérifiez que la base de données est accessible
5. Vérifiez la configuration CORS

---

**Dernière mise à jour:** 2025-11-02
