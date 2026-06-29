# BadWallet Web Dashboard

Application Angular (SPA) — Examen Design Pattern / UML L3 S2 2026  
**Marie Diagne**

---

## Prérequis

- Node.js 18+ et Angular CLI (`npm install -g @angular/cli`)
- **badwallet-api** démarré sur `http://localhost:8080`
- **payment-service** démarré sur `http://localhost:8081`

---

## Lancer l'application

```bash
npm install
ng serve
```

Ouvrir : http://localhost:4200

---

## Connexion

### Espace Agent de guichet
1. Entrer **n'importe quel numéro** (ex: `+221700000000`)
2. Sélectionner le rôle **Agent**
3. Cliquer **Se connecter**

Accès : listing portefeuilles, création, recherche client, dépôt/retrait.

### Espace Client
1. **D'abord**, aller dans l'espace Agent → copier un numéro de téléphone existant (ex: `+221770000001`)
2. Se déconnecter
3. Coller ce numéro dans le formulaire de login
4. Sélectionner le rôle **Client**
5. Cliquer **Se connecter**

Accès : dashboard avec solde, transfert, factures, historique.

> **Note** : Si la base de données est vide, lancer d'abord le seed via le fichier `test.http` du projet `design-pattern-exam` (requête 1.1).

---

## Architecture

```
src/app/
├── core/
│   ├── models/        # Interfaces TypeScript (Wallet, Facture, ...)
│   ├── services/      # WalletApiService, BillingApiService, AuthService, NotificationService
│   ├── interceptors/  # Gestion globale des erreurs HTTP
│   └── guards/        # Protection des routes par rôle (client / agent)
├── shared/
│   ├── components/    # Header, Toast, Loader
│   └── pipes/         # XofPipe (formatage devise XOF)
└── features/
    ├── login/         # Page de connexion
    ├── agent/         # Listing, création, recherche, dépôt/retrait
    └── client/        # Dashboard, transfert, factures, historique
```

---

## Branches GitFlow

Chaque fonctionnalité a été développée dans sa propre branche `feature/*` et mergée dans `develop` via `--no-ff`.
