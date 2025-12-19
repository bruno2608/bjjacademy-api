-- ============================================
-- Migration: Secure Invite System
-- Adds OTP, signature, and audit fields to convites
-- ============================================

-- Add new security columns
ALTER TABLE convites
  ADD COLUMN IF NOT EXISTS otp_code varchar(6),
  ADD COLUMN IF NOT EXISTS signature varchar(64),
  ADD COLUMN IF NOT EXISTS validation_attempts integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES usuarios(id),
  ADD COLUMN IF NOT EXISTS used_by_ip varchar(45),
  ADD COLUMN IF NOT EXISTS criado_em timestamptz DEFAULT now();

-- Index for fast token+otp validation
CREATE INDEX IF NOT EXISTS idx_convites_token_otp 
  ON convites (token_hash, otp_code) 
  WHERE used_at IS NULL;

-- Index for cleanup of expired invites
CREATE INDEX IF NOT EXISTS idx_convites_expires 
  ON convites (expires_at) 
  WHERE used_at IS NULL;

-- Comment for documentation
COMMENT ON COLUMN convites.otp_code IS 'One-time password (6 digits) for link verification';
COMMENT ON COLUMN convites.signature IS 'HMAC-SHA256 signature to prevent tampering';
COMMENT ON COLUMN convites.validation_attempts IS 'Number of failed validation attempts (max 5)';
