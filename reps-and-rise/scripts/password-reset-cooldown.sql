-- =====================================================
-- Supabase password reset cooldown support
-- =====================================================
--
-- This script creates a table and a helper function to enforce
-- per-email cooldowns before sending password reset requests.
-- It is safe to call from the client via a Supabase RPC.
--
-- Usage:
-- 1. Run this script in the Supabase SQL editor for your project.
-- 2. In your app, call the `can_request_password_reset` RPC before
--    calling `supabase.auth.resetPasswordForEmail(...)`.
-- =====================================================

-- Create a table to track password reset requests.
CREATE TABLE IF NOT EXISTS public.password_reset_requests (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add an index to make email lookups fast when checking cooldowns.
CREATE INDEX IF NOT EXISTS password_reset_requests_email_idx
ON public.password_reset_requests (lower(email));

-- Create a function that checks cooldown status and records the request.
CREATE OR REPLACE FUNCTION public.can_request_password_reset(
  p_email TEXT,
  p_cooldown_seconds INT DEFAULT 300
)
RETURNS TABLE (allowed BOOLEAN, retry_seconds INT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  normalized_email TEXT := lower(trim(p_email));
  last_request TIMESTAMPTZ;
  cooldown_interval INTERVAL := make_interval(secs => p_cooldown_seconds);
BEGIN
  IF normalized_email = '' THEN
    allowed := false;
    retry_seconds := p_cooldown_seconds;
    RETURN;
  END IF;

  SELECT max(created_at)
    INTO last_request
    FROM public.password_reset_requests
   WHERE lower(email) = normalized_email;

  IF last_request IS NOT NULL AND now() < last_request + cooldown_interval THEN
    allowed := false;
    retry_seconds := ceil(extract(epoch FROM (last_request + cooldown_interval - now())));
    RETURN;
  END IF;

  INSERT INTO public.password_reset_requests (email)
  VALUES (normalized_email);

  allowed := true;
  retry_seconds := 0;
  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.can_request_password_reset(TEXT, INT) TO anon, authenticated;
