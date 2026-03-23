import { registerRootComponent } from 'expo';
import App from './App';

// Registrar PWA solo donde tenga sentido; en desarrollo el helper limpia SW viejos y no registra uno nuevo.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  import('./src/utilidades/pwa').then(({ registerServiceWorker }) => {
    registerServiceWorker();
  });
}

registerRootComponent(App);

