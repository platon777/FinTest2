# ProFin Core Console

Frontend React/Vite de la plateforme d’investissement ProFin. L’interface est conçue comme une console opérationnelle neuve : lecture patrimoniale, investissements, opérations maker/checker, comptes, maturités et profil.

## Lancer avec le compose complet

Depuis le dossier backend :

```powershell
cd C:\Users\Lenovo\Documents\GitHub\backend_FinTest
docker compose up -d --build
```

Accès :

- Frontend : http://localhost:3000
- API : http://localhost:8000/docs
- PostgreSQL : localhost:55431

Le conteneur frontend sert l’application avec Nginx et proxyfie `/api/*` vers le service FastAPI `api`. Aucun réglage CORS supplémentaire n’est nécessaire dans le navigateur.

## Développement local

```powershell
npm.cmd install
$env:VITE_API_BASE_URL="http://localhost:8000/api/v1"
npm.cmd run dev
```

Le frontend propose des accès de démonstration directement sur l’écran de connexion. Les identifiants et les scénarios sont documentés dans [DEMO_CREDENTIALS.md](../backend_FinTest/DEMO_CREDENTIALS.md).

## Parcours couverts

- connexion et déconnexion JWT ;
- vue consolidée du portefeuille, liquidités et activité récente ;
- consultation des instruments et souscription ;
- rachat d’une position ;
- dépôt, retrait et transfert ;
- validation ou rejet maker/checker avec motif ;
- contrôle des maturités ;
- ouverture de compte ;
- mise à jour du profil KYC.

Le système respecte le contrat du backend. L’IA, Redis, VPN et les connecteurs externes restent volontairement hors prototype.
