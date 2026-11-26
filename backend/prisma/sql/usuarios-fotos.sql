-- Galería de fotos del perfil de usuario (Tinder-like).
-- Idempotente: se ejecuta en cada arranque del VPS.
ALTER TABLE "usuarios"
  ADD COLUMN IF NOT EXISTS "fotos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
