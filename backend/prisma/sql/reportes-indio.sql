BEGIN;

CREATE TABLE IF NOT EXISTS "reporte_envios" (
  "id" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "fecha" TEXT NOT NULL,
  "enviadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ok" BOOLEAN NOT NULL DEFAULT true,
  "detalle" TEXT,
  CONSTRAINT "reporte_envios_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "reporte_envios_tipo_fecha_key" ON "reporte_envios"("tipo", "fecha");

COMMIT;
