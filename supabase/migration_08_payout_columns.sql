-- Migration 08: Ajout des colonnes manquantes pour le suivi des envois
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS payout_method TEXT,
ADD COLUMN IF NOT EXISTS moneroo_payout_id TEXT;
