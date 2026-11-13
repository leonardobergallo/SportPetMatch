// HTML compartido para el mapa de recorrido con Leaflet + OpenStreetMap.
export interface PuntoMapa {
  latitud: number;
  longitud: number;
}

export function generarHtmlRecorrido(puntos: PuntoMapa[]): string {
  const coordenadas = puntos.map((p) => [p.latitud, p.longitud]);
  const centro = coordenadas.length ? coordenadas[coordenadas.length - 1] : [-31.6333, -60.7];
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>html,body,#map{height:100%;margin:0;background:#eef3ee}</style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const puntos = ${JSON.stringify(coordenadas)};
    const map = L.map('map', { zoomControl: true }).setView(${JSON.stringify(centro)}, 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    if (puntos.length > 0) {
      const linea = L.polyline(puntos, { color: '#ff7900', weight: 5, opacity: 0.9 }).addTo(map);
      L.marker(puntos[puntos.length - 1]).addTo(map);
      if (puntos.length > 1) map.fitBounds(linea.getBounds(), { padding: [28, 28] });
    }
  </script>
</body>
</html>`;
}
