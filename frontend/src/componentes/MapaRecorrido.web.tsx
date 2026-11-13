// Mapa de recorrido para web usando Leaflet + OpenStreetMap.
import React from 'react';
import { PuntoMapa, generarHtmlRecorrido } from './mapaRecorridoHtml';

interface Props {
  puntos: PuntoMapa[];
  height?: number;
}

export default function MapaRecorrido({ puntos, height = 260 }: Props): JSX.Element {
  const html = generarHtmlRecorrido(puntos);
  return (
    // @ts-ignore iframe funciona en web
    <iframe
      title="Recorrido del paseo"
      srcDoc={html}
      style={{ width: '100%', height, border: 0, borderRadius: 14, display: 'block' }}
    />
  );
}
