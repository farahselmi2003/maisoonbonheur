# Maison Bonheur

## Description du projet
Maison Bonheur est une application web de vente de parfums, permettant aux utilisateurs de parcourir un catalogue, filtrer et trier les produits, gérer leur panier, s’inscrire, se connecter, consulter leur profil, et passer commande. L’application propose également des fonctionnalités de wishlist, gestion des adresses et suivi des commandes.

## Technologies utilisées
- Angular 20
- TypeScript
- SCSS
- JSON Server (API simulée)
- RxJS

## Instructions d’installation et de lancement
1. **Cloner le projet**
   ```bash
   git clone <url-du-repo>
   ```
2. **Installer les dépendances**
   ```bash
   cd maison-bonheur
   npm install
   ```
3. **Lancer le serveur JSON (API)**
   ```bash
   npx json-server --watch db.json --port 3000
   ```
4. **Lancer l’application Angular**
   ```bash
   ng serve --open
   ```

## Structure du projet
```
maison-bonheur/
├── src/
│   ├── app/
│   │   ├── components/        # Composants réutilisables (header, footer, etc.)
│   │   ├── pages/             # Pages principales (catalog, login, register, cart, etc.)
│   │   ├── services/          # Services (API, authentification, etc.)
│   │   ├── pipes/             # Filtres personnalisés
│   │   ├── core/              # Logique centrale
│   │   └── user/              # Gestion utilisateur
│   ├── assets/                # Images et ressources statiques
│   ├── environments/          # Configuration d’environnement
│   └── styles.scss            # Styles globaux
├── db.json                    # Base de données simulée pour JSON Server
├── angular.json               # Configuration Angular
├── package.json               # Dépendances et scripts
└── README.md                  # Documentation
```

## Fonctionnalités implémentées
- Parcours et filtrage du catalogue de parfums
- Affichage des détails d’un produit
- Authentification (connexion, inscription)
- Gestion du panier et passage de commande
- Wishlist (liste de souhaits)
- Profil utilisateur (consultation et modification via AuthService)
- Navigation entre les pages
- Persistance de session utilisateur via localStorage
- Interaction avec une API simulée (JSON Server)
- Interface responsive et moderne

## Gestion du profil utilisateur
- Les données du profil sont gérées via le service `AuthService`.
- Le composant `ProfileComponent` utilise `AuthService` pour afficher et modifier les informations de l’utilisateur connecté (nom, prénom, email, adresse).
- Les modifications du profil sont persistées dans le localStorage et synchronisées dans toute l’application.

## Sécurité et persistance
- La session utilisateur est conservée dans le localStorage pour permettre une reconnexion automatique.
- Les routes sensibles (profil, commandes, adresses) sont protégées par un guard d’authentification.

---
Pour toute question ou amélioration, contactez l’équipe de développement.