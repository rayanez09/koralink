-- Migration 06 : Vérification du numéro de téléphone
-- Ajoute un booléen pour savoir si le client a validé son numéro via OTP SMS.

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.users.phone_verified IS 'Statut de vérification OTP du numéro de téléphone. Indispensable pour transférer.';

-- Si on veut marquer les comptes Super Admin existants ou développeurs comme déjà vérifiés pour faciliter les tests :
UPDATE public.users SET phone_verified = TRUE WHERE role IN ('admin', 'super_admin');
