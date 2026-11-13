// Mapa de recorrido para Android/iOS usando WebView + Leaflet.
import React from 'react';
import { WebView } from 'react-native-webview';
import { PuntoMapa, generarHtmlRecorrido } from './mapaRecorridoHtml';

interface Props {
  puntos: PuntoMapa[];
  height?: number;
}

export default function MapaRecorrido({ puntos, height = 260 }: Props): JSX.Element {
  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: generarHtmlRecorrido(puntos) }}
      style={{ height, borderRadius: 14, overflow: 'hidden' }}
      javaScriptEnabled
      domStorageEnabled
      scrollEnabled={false}
    />
  );
}
