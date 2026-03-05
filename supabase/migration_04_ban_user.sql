-- Migration 04 : Ajout du système de bannissement utilisateur
ALTER TABLE public.users
ADD COLUMN is_banned boolean DEFAULT false NOT NULL;

COMMENT ON COLUMN public.users.is_banned IS 'Indique si l''utilisateur est banni de la plateforme. S''il l''est, il ne peut plus envoyer d''argent.';

-- Mettre à jour la Row Level Security (RLS) pour ne filtrer que les utilisateurs non bannis 
-- Note : pour l'instant (MVP), un utilisateur banni peut toujours se connecter pour voir ses transferts échoués,
-- c'est le backend (transfer.controller.ts) qui l'empêchera d'effectuer de nouveaux transferts.
