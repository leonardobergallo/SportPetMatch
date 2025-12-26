// Utilidades para PWA - SportPetMatch

/**
 * Registra el Service Worker para habilitar funcionalidades PWA
 */
export const registerServiceWorker = () => {
  if (typeof window === 'undefined') {
    return
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration.scope)
          
          // Verificar actualizaciones periódicamente
          registration.update()
          
          // Escuchar actualizaciones del Service Worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 Nueva versión del Service Worker disponible')
                  // Aquí podrías mostrar una notificación al usuario
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('❌ Error al registrar Service Worker:', error)
        })
    })
  } else {
    console.warn('⚠️ Service Workers no están soportados en este navegador')
  }
}

/**
 * Detecta si la app está instalada como PWA
 */
export const isInstalled = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  )
}

/**
 * Solicita al usuario que instale la PWA
 */
export const promptInstall = async (): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return false
  }

  const deferredPrompt = (window as any).deferredPrompt
  if (!deferredPrompt) {
    return false
  }

  try {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    ;(window as any).deferredPrompt = null
    return outcome === 'accepted'
  } catch (error) {
    console.error('Error al mostrar prompt de instalación:', error)
    return false
  }
}

/**
 * Verifica si el navegador soporta instalación de PWA
 */
export const canInstall = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }

  return !!(window as any).deferredPrompt || isIOS()
}

/**
 * Detecta si el dispositivo es iOS
 */
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }

  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

/**
 * Detecta si el dispositivo es Android
 */
export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }

  return /Android/.test(navigator.userAgent)
}

