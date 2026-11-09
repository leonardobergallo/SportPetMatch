BEGIN;

ALTER TABLE "compras"
  ADD COLUMN IF NOT EXISTS "cicloIndioId" TEXT,
  ADD COLUMN IF NOT EXISTS "enlacePagoIndio" TEXT,
  ADD COLUMN IF NOT EXISTS "operacionIndio" TEXT,
  ADD COLUMN IF NOT EXISTS "confirmadaPorId" TEXT,
  ADD COLUMN IF NOT EXISTS "enlaceEnviadoEn" TIMESTAMP(3);

ALTER TABLE "suscripciones"
  ADD COLUMN IF NOT EXISTS "pruebaIndioUsuarioId" TEXT,
  ADD COLUMN IF NOT EXISTS "avisoPruebaEn" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "compras_cicloIndioId_key"
  ON "compras" ("cicloIndioId");
CREATE UNIQUE INDEX IF NOT EXISTS "compras_operacionIndio_key"
  ON "compras" ("operacionIndio");
CREATE UNIQUE INDEX IF NOT EXISTS "suscripciones_pruebaIndioUsuarioId_key"
  ON "suscripciones" ("pruebaIndioUsuarioId");

COMMIT;
