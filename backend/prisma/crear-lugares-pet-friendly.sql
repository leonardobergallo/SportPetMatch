BEGIN;

SELECT pg_advisory_xact_lock(hashtext('indio:lugares_pet_friendly'));

-- CreateTable
CREATE TABLE IF NOT EXISTS "lugares_pet_friendly" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" TEXT NOT NULL,
    "direccion" TEXT,
    "ciudad" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "pais" TEXT NOT NULL DEFAULT 'Argentina',
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "telefono" TEXT,
    "web" TEXT,
    "instagram" TEXT,
    "horarios" JSONB,
    "fotos" TEXT[],
    "permitePerros" BOOLEAN NOT NULL DEFAULT true,
    "zonaPetFriendly" TEXT NOT NULL DEFAULT 'exterior',
    "requiereCorrea" BOOLEAN NOT NULL DEFAULT true,
    "aguaParaMascotas" BOOLEAN NOT NULL DEFAULT false,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "fuente" TEXT NOT NULL DEFAULT 'manual',
    "osmId" TEXT,
    "recomendaciones" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lugares_pet_friendly_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "lugares_pet_friendly_slug_key" ON "lugares_pet_friendly"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "lugares_pet_friendly_provincia_ciudad_idx" ON "lugares_pet_friendly"("provincia", "ciudad");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "lugares_pet_friendly_latitud_longitud_idx" ON "lugares_pet_friendly"("latitud", "longitud");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "lugares_pet_friendly_categoria_idx" ON "lugares_pet_friendly"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "lugares_pet_friendly_fuente_osmId_key" ON "lugares_pet_friendly"("fuente", "osmId");

COMMIT;
