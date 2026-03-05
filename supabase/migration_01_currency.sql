-- Migration 01 : Ajout des informations de destinataire
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS recipient_name TEXT NOT NULL DEFAULT 'Inconnu';

-- On enlève la contrainte CHECK sur le montant minimum si elle existe (car en XOF les montants sont plus grands)
ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS transactions_amount_sent_check;
