-- Migration 03 : Ajout du module de sécurité Code PIN pour les transactions

-- 1. Ajout de la colonne pour stocker le code PIN (idéalement hashé, mais en texte clair contraint à 4 chiffres pour le MVP s'il n'y a pas de fonction de hashage pgcrypto active, nous utiliserons du bcrypt côté serveur Node.js)
ALTER TABLE public.users
ADD COLUMN transactions_pin text DEFAULT NULL;

COMMENT ON COLUMN public.users.transactions_pin IS 'Code PIN numérique crypté requis pour valider les transferts sortants.';
