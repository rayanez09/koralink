# KoraLink - MVP Web App

KoraLink est une plateforme fintech d'envoi d'argent international entre pays africains. L'application agit comme une surcouche technologique gérant l'expérience utilisateur, l'architecture et la sécurité, tandis que le prestataire de paiement (Moneroo) gère les fonds en marque blanche.

Ce socle technique est scalable, sécurisé (Next.js 14, Supabase, RLS) et conçu pour évoluer vers de multiples fournisseurs.

## Fonctionnalités MVP
- **Landing Page** professionnelle.
- **Authentification** complète via Supabase.
- **Dashboard Utilisateur** avec calcul de frais, récapitulatif des transferts, limites (journalières/mensuelles) et module de création de transfert.
- **Dashboard Admin** pour le suivi de la plateforme (sans RLS).
- **Service Moneroo Abstrait** avec gestion Webhook mockée.
- **Sécurité et Audit** : Rate limiting API, historiques persistants (`audit_logs`), Row-Level-Security strict.

## Prérequis

1. Node.js (>= 20.x conseillé)
2. Un compte [Supabase](https://supabase.com/) actif.

## Configuration & Installation

### 1. Cloner et Installer les dépendances
```bash
git clone <repository_url>
cd KoraLink
npm install
```

### 2. Configuration de la base de données (Supabase)
Connectez-vous à votre projet Supabase, naviguez vers le "SQL Editor" et exécutez le script SQL fourni dans le projet :
`supabase/schema.sql`

Ce script va créer les tables (`users`, `transactions`, `notifications`, `audit_logs`), configurer les RLS, et créer un trigger pour copier automatiquement les nouveaux inscrits dans la table `users`.

### 3. Variables d'environnement
Copiez le fichier d'exemple et remplissez-le avec vos clés (issues des "API Settings" et "Database" de Supabase) :
```bash
cp .env.example .env.local
```

### Exécution du projet localement
```bash
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000).

---

## Architecture

* **`app/`** : Pages Next.js App Router (Client et Serveur).
* **`components/`** : Composants UI réutilisables (Button, Input...).
* **`controllers/`** : Orchestre la validation et les règles de gestion (comme `transfer.controller.ts`).
* **`services/`** : Logique de communication avec des API externes (ex: Moneroo). Il comprend l'interface abstraite `payment-provider.interface.ts`.
* **`lib/`** : Utilitaires et singletons, notamment `supabase/client.ts`, `supabase/server.ts`, `supabase/admin.ts`.
* **`middleware.ts`** : Sécurité côté routeur (Redirection, vérification Admin Server-Side).

## Évolutivité : Intégrer l'API réelle Moneroo

Dans sa version initiale, **le service Moneroo est mocké**. Pour passer à l'API réelle :

1. Modifiez la fonction `initializeTransfer` dans `src/services/moneroo.service.ts` pour faire l'appel POST HTTP vers Moneroo (ex: `https://api.moneroo.io/v1/payouts/initialize`).
2. Implémentez la vérification cryptographique dans `verifyWebhookSignature` en utilisant `process.env.MONEROO_WEBHOOK_SECRET` et la librairie `crypto` (HMAC SHA-256).
3. Connectez le Webhook `/api/webhook/moneroo` dans l'interface développeur de Moneroo pour que les callbacks puissent atteindre votre serveur de production.

Le reste de l'application, du `TransferController` jusqu'aux vues, n'a pas besoin d'être modifié car il repose sur l'interface abstraite.

---
🚀 *KoraLink, le futur du transfert panafricain.*
