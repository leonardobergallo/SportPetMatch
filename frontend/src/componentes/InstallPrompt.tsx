import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { isInstalled, isIOS, promptInstall } from '../utilidades/pwa';

/**
 * Componente que muestra un banner para invitar a instalar la PWA
 * Solo se muestra si la app no está instalada y el navegador soporta instalación
 */
export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    // No mostrar si ya está instalada
    if (isInstalled()) {
      return;
    }

    // Detectar iOS
    const iOS = isIOS();
    setIsIOSDevice(iOS);

    // Para iOS, verificar si el usuario ya descartó el prompt recientemente
    if (iOS) {
      const dismissedTime = localStorage.getItem('installPromptDismissed');
      const oneHourAgo = Date.now() - 60 * 60 * 1000;

      if (!dismissedTime || parseInt(dismissedTime) < oneHourAgo) {
        setShowPrompt(true);
      }
    }

    // Para Android/Desktop, escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOSDevice) {
      // En iOS, solo mostrar instrucciones
      return;
    }

    const installed = await promptInstall();
    if (installed) {
      setShowPrompt(false);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  if (isInstalled() || !showPrompt) {
    return null;
  }

  // Solo renderizar en web
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <View style={styles.content}>
          <Text style={styles.title}>Instalar App</Text>
          <Text style={styles.description}>
            {isIOSDevice
              ? 'Toca el botón compartir 📤 y selecciona "Agregar a pantalla de inicio"'
              : 'Instala la app para acceso rápido desde tu pantalla de inicio'}
          </Text>
        </View>
        <View style={styles.actions}>
          {!isIOSDevice && (
            <TouchableOpacity style={styles.installButton} onPress={handleInstall}>
              <Text style={styles.installButtonText}>Instalar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'fixed' as any,
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 50,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  banner: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    maxWidth: 500,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  installButton: {
    backgroundColor: '#6200ea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  installButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#999999',
    fontSize: 18,
    fontWeight: 'bold',
  },
});


