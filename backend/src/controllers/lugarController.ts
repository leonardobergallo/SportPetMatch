// Controlador de Lugares pet friendly - Indio
// Lista lugares recomendados por zona y permite recibir sugerencias de la comunidad.

import { Request, Response } from 'express';
import prisma from '../utilidades/prisma';

const CATEGORIAS_VALIDAS = [
  'parque',
  'plaza',
  'paseo',
  'cafeteria',
  'restaurante',
  'bar',
  'veterinaria',
  'pet_shop',
  'alojamiento',
  'playa',
  'otro',
];

function normalizarSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function distanciaKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * GET /api/lugares
 * Filtros: provincia, ciudad, categoria, buscar, lat, lng, radio (km), limit, offset
 */
export const obtenerLugares = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      provincia,
      ciudad,
      categoria,
      buscar,
      lat,
      lng,
      radio = '50',
      limit = '100',
      offset = '0',
    } = req.query;

    const where: any = { isActive: true };

    if (provincia) {
      where.provincia = { equals: String(provincia), mode: 'insensitive' };
    }
    if (ciudad) {
      where.ciudad = { equals: String(ciudad), mode: 'insensitive' };
    }
    if (categoria && categoria !== 'todos') {
      where.categoria = String(categoria);
    }
    if (buscar) {
      where.OR = [
        { nombre: { contains: String(buscar), mode: 'insensitive' } },
        { descripcion: { contains: String(buscar), mode: 'insensitive' } },
        { direccion: { contains: String(buscar), mode: 'insensitive' } },
      ];
    }

    const lugares = await prisma.lugarPetFriendly.findMany({
      where,
      orderBy: [
        { destacado: 'desc' },
        { verificado: 'desc' },
        { recomendaciones: 'desc' },
        { nombre: 'asc' },
      ],
    });

    const latNum = Number(lat);
    const lngNum = Number(lng);
    const radioNum = Number(radio);

    let resultados: any[] = lugares;

    if (Number.isFinite(latNum) && Number.isFinite(lngNum)) {
      resultados = lugares
        .map((lugar) => ({
          ...lugar,
          distanciaKm: Number(distanciaKm(latNum, lngNum, lugar.latitud, lugar.longitud).toFixed(2)),
        }))
        .filter((lugar) => !Number.isFinite(radioNum) || radioNum <= 0 || lugar.distanciaKm <= radioNum)
        .sort((a, b) => a.distanciaKm - b.distanciaKm);
    }

    const limitNum = Math.min(Math.max(parseInt(String(limit), 10) || 100, 1), 200);
    const offsetNum = Math.max(parseInt(String(offset), 10) || 0, 0);
    const total = resultados.length;
    const pagina = resultados.slice(offsetNum, offsetNum + limitNum);

    const zonas = await prisma.lugarPetFriendly.findMany({
      where: { isActive: true },
      select: { provincia: true, ciudad: true },
      distinct: ['provincia', 'ciudad'],
      orderBy: [{ provincia: 'asc' }, { ciudad: 'asc' }],
    });

    res.json({
      success: true,
      data: {
        lugares: pagina,
        total,
        zonas,
      },
    });
  } catch (error) {
    console.error('Error obteniendo lugares pet friendly:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los lugares pet friendly',
    });
  }
};

/**
 * GET /api/lugares/:id
 * Acepta ID o slug.
 */
export const obtenerLugar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const lugar = await prisma.lugarPetFriendly.findFirst({
      where: {
        isActive: true,
        OR: [{ id }, { slug: id }],
      },
    });

    if (!lugar) {
      res.status(404).json({
        success: false,
        message: 'Lugar no encontrado',
      });
      return;
    }

    res.json({
      success: true,
      data: lugar,
    });
  } catch (error) {
    console.error('Error obteniendo lugar pet friendly:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el lugar',
    });
  }
};

/**
 * POST /api/lugares/sugerencias
 * Recibe una sugerencia de la comunidad. Queda pendiente de verificacion.
 */
export const sugerirLugar = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      nombre,
      descripcion,
      categoria,
      direccion,
      ciudad,
      provincia,
      pais,
      latitud,
      longitud,
      telefono,
      web,
      instagram,
      zonaPetFriendly,
      requiereCorrea,
      aguaParaMascotas,
    } = req.body;

    if (!nombre || !ciudad || !provincia) {
      res.status(400).json({
        success: false,
        message: 'El nombre, la ciudad y la provincia son obligatorios',
      });
      return;
    }

    const categoriaFinal = CATEGORIAS_VALIDAS.includes(categoria) ? categoria : 'otro';
    const latNum = Number(latitud);
    const lngNum = Number(longitud);

    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      res.status(400).json({
        success: false,
        message: 'La ubicacion del lugar es obligatoria',
      });
      return;
    }

    const slugBase = normalizarSlug(nombre) || 'lugar';
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    const lugar = await prisma.lugarPetFriendly.create({
      data: {
        slug,
        nombre,
        descripcion: descripcion || null,
        categoria: categoriaFinal,
        direccion: direccion || null,
        ciudad,
        provincia,
        pais: pais || 'Argentina',
        latitud: latNum,
        longitud: lngNum,
        telefono: telefono || null,
        web: web || null,
        instagram: instagram || null,
        fotos: [],
        permitePerros: true,
        zonaPetFriendly: zonaPetFriendly || 'exterior',
        requiereCorrea: requiereCorrea !== false,
        aguaParaMascotas: Boolean(aguaParaMascotas),
        verificado: false,
        destacado: false,
        fuente: 'comunidad',
        recomendaciones: 0,
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Gracias. Ya aparece como dato de la comunidad; lo vamos a verificar.',
      data: lugar,
    });
  } catch (error) {
    console.error('Error creando sugerencia de lugar:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar la sugerencia',
    });
  }
};
