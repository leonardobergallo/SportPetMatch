import { registerRootComponent } from 'expo';
import App from './App';

// Registrar Service Worker para PWA (solo en web)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  import('./src/utilidades/pwa').then(({ registerServiceWorker }) => {
    registerServiceWorker();
  });
}

registerRootComponent(App);


