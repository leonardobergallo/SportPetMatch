BEGIN;

CREATE TABLE IF NOT EXISTS "paseos" (
  "id" TEXT NOT NULL,
  "duenoId" TEXT NOT NULL,
  "paseadorId" TEXT,
  "mascotaId" TEXT NOT NULL,
  "estado" TEXT NOT NULL DEFAULT 'pendiente',
  "fechaProgramada" TIMESTAMP(3) NOT NULL,
  "duracionMin" INTEGER NOT NULL DEFAULT 30,
  "direccion" TEXT,
  "notas" TEXT,
  "precioHora" INTEGER,
  "inicioEn" TIMESTAMP(3),
  "finEn" TIMESTAMP(3),
  "distanciaKm" DOUBLE PRECISION,
  "duracionRealMin" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "paseos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "paseo_puntos" (
  "id" TEXT NOT NULL,
  "paseoId" TEXT NOT NULL,
  "latitud" DOUBLE PRECISION NOT NULL,
  "longitud" DOUBLE PRECISION NOT NULL,
  "precision" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "paseo_puntos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "paseos_duenoId_estado_fechaProgramada_idx" ON "paseos"("duenoId", "estado", "fechaProgramada");
CREATE INDEX IF NOT EXISTS "paseos_paseadorId_estado_fechaProgramada_idx" ON "paseos"("paseadorId", "estado", "fechaProgramada");
CREATE INDEX IF NOT EXISTS "paseo_puntos_paseoId_createdAt_idx" ON "paseo_puntos"("paseoId", "createdAt");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'paseos_duenoId_fkey') THEN
    ALTER TABLE "paseos" ADD CONSTRAINT "paseos_duenoId_fkey"
      FOREIGN KEY ("duenoId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'paseos_paseadorId_fkey') THEN
    ALTER TABLE "paseos" ADD CONSTRAINT "paseos_paseadorId_fkey"
      FOREIGN KEY ("paseadorId") REFERENCES "paseadores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'paseos_mascotaId_fkey') THEN
    ALTER TABLE "paseos" ADD CONSTRAINT "paseos_mascotaId_fkey"
      FOREIGN KEY ("mascotaId") REFERENCES "mascotas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'paseo_puntos_paseoId_fkey') THEN
    ALTER TABLE "paseo_puntos" ADD CONSTRAINT "paseo_puntos_paseoId_fkey"
      FOREIGN KEY ("paseoId") REFERENCES "paseos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

COMMIT;
