-- ============================================================
-- Add the notifications_enabled column to school_settings
-- Run this ONCE in the Supabase SQL editor.
-- ============================================================

ALTER TABLE public.school_settings
ADD COLUMN IF NOT EXISTS notifications_enabled boolean NOT NULL DEFAULT true;

-- backfill any existing rows that somehow lack a value.
UPDATE public.school_settings
SET notifications_enabled = true
WHERE notifications_enabled IS NULL;
