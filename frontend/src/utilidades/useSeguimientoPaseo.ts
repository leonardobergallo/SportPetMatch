// Hook de seguimiento GPS para un paseo en curso.
// Envía la ubicación del teléfono del paseador mientras la pantalla está activa.
import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

interface PuntoActual {
  latitud: number;
  longitud: number;
  precision?: number | null;
  fecha: string;
}

interface Opciones {
  paseoId: string | null;
  activo: boolean;
  onPunto: (latitud: number, longitud: number, precision?: number | null) => Promise<void>;
}

export function useSeguimientoPaseo({ paseoId, activo, onPunto }: Opciones) {
  const onPuntoRef = useRef(onPunto);
  onPuntoRef.current = onPunto;
  const [ultimo, setUltimo] = useState<PuntoActual | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [iniciando, setIniciando] = useState(false);

  useEffect(() => {
    if (!activo || !paseoId) return;
    let cancelado = false;
    let suscripcion: any = null;
    setError(null);
    setIniciando(true);

    (async () => {
      try {
        const permiso = await Location.requestForegroundPermissionsAsync();
        if (permiso.status !== 'granted') {
          if (!cancelado) setError('Necesitamos permiso de ubicación para compartir el recorrido.');
          return;
        }
        suscripcion = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 8000,
            distanceInterval: 10,
          },
          (ubicacion) => {
            if (cancelado) return;
            const punto = {
              latitud: ubicacion.coords.latitude,
              longitud: ubicacion.coords.longitude,
              precision: ubicacion.coords.accuracy,
              fecha: new Date().toISOString(),
            };
            setUltimo(punto);
            onPuntoRef
              .current(punto.latitud, punto.longitud, punto.precision)
              .catch(() => {
                // El servidor puede limitar la frecuencia; no cortamos el seguimiento.
              });
          }
        );
      } catch (e: any) {
        if (!cancelado) setError(e?.message || 'No pudimos iniciar el GPS.');
      } finally {
        if (!cancelado) setIniciando(false);
      }
    })();

    return () => {
      cancelado = true;
      if (suscripcion?.remove) suscripcion.remove();
    };
  }, [activo, paseoId]);

  return { ultimo, error, iniciando };
}
