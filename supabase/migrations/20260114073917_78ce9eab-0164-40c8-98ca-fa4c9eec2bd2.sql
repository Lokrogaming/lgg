-- Add is_pinned column to servers table
ALTER TABLE public.servers ADD COLUMN is_pinned boolean DEFAULT false;