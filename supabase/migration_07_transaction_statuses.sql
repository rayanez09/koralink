-- Migration 07: Update transaction status constraint to support two-step flow
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_status_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_status_check 
CHECK (status IN ('awaiting_payment', 'payout_pending', 'pending', 'success', 'failed'));
