-- Migration 05 : Ajout du rôle super_admin
-- L'erreur "violates check constraint" vient de cette ligne initiale dans schema.sql :
-- role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'))

-- 1. Supprimer l'ancienne contrainte CHECK sur les rôles qui limite à 'user' ou 'admin' seulement
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Ajouter la nouvelle contrainte qui inclut 'super_admin'
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'super_admin'));

-- 3. Mettre à jour la documentation (commentaire de colonne)
COMMENT ON COLUMN public.users.role IS 'Rôle de l''utilisateur : user, admin, super_admin';
