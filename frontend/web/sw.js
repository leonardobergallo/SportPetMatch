// Service Worker para PWA - SportPetMatch
const CACHE_NAME = 'sportpetmatch-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
]

// Estrategia: Network First, luego Cache
const networkFirst = async (request) => {
  try {
    const networkResponse = await fetch(request, { 
      cache: 'no-cache'
    })
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch(err => {
          console.log('Error cacheando recursos:', err)
        })
      })
  )
})

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName)
            }
          })
        )
      }),
      self.clients.claim()
    ])
  )
})

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  const url = new URL(event.request.url)
  
  // Para navegación (HTML), siempre intentar red primero
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      networkFirst(event.request).catch(() => {
        return caches.match('/index.html').then(cached => {
          if (cached) return cached
          return new Response('Offline', { status: 503 })
        })
      })
    )
    return
  }

  // Para assets, network first con fallback a cache
  event.respondWith(
    networkFirst(event.request).catch(() => {
      return caches.match(event.request).then(cached => {
        if (cached) return cached
        return fetch(event.request)
      })
    })
  )
})

