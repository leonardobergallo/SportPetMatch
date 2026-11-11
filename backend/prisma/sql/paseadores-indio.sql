BEGIN;

CREATE TABLE IF NOT EXISTS "paseadores" (
  "id" TEXT NOT NULL,
  "usuarioId" TEXT NOT NULL,
  "telefono" TEXT NOT NULL,
  "ciudad" TEXT NOT NULL,
  "zona" TEXT,
  "experiencia" TEXT,
  "precioHora" INTEGER,
  "disponibilidad" TEXT,
  "mensaje" TEXT,
  "estado" TEXT NOT NULL DEFAULT 'pendiente',
  "motivoRechazo" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "paseadores_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "paseadores_usuarioId_key" ON "paseadores"("usuarioId");
CREATE INDEX IF NOT EXISTS "paseadores_estado_createdAt_idx" ON "paseadores"("estado", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'paseadores_usuarioId_fkey'
  ) THEN
    ALTER TABLE "paseadores"
      ADD CONSTRAINT "paseadores_usuarioId_fkey"
      FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

COMMIT;
