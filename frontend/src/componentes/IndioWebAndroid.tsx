import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import WebView, { WebViewNavigation } from 'react-native-webview';
import type { AndroidWebViewProps } from 'react-native-webview/lib/WebViewTypes';
import Constants from 'expo-constants';

import { getAPIBaseURL } from '../utilidades/config';

// El paquete expone tipos combinados de iOS/Android/Windows; esta pantalla solo usa Android.
const AndroidWebView = WebView as unknown as React.ComponentType<AndroidWebViewProps & React.RefAttributes<WebView>>;

const INDIO_URL = 'https://indio.com.ar/app.html?app=1';
const INDIO_HOST = /^https:\/\/(?:www\.)?indio\.com\.ar(?:[/:?#]|$)/i;
// La ficha pública todavía devuelve 404 porque la app sigue en prueba cerrada.
// Este es el mismo enlace de respaldo que devuelve /api/app/version.
const PLAY_STORE_URL = 'https://play.google.com/apps/testing/com.it360.indio';
const VERSION_TIMEOUT_MS = 8000;
const FORCE_APP_MODE = `
  (function () {
    function showApp() {
      if (document.body) document.body.classList.add('expo-show-app');
    }
    showApp();
    var observer = new MutationObserver(showApp);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () {
      showApp();
      observer.disconnect();
    }, 10000);
  })();
  true;
`;

interface ConfigVersionAndroid {
  minVersionCode: number;
  latestVersionCode: number;
  updateUrl: string;
  webUrl: string;
  message: string;
}

type EstadoArranque = 'chequeando' | 'listo' | 'actualizar';

const CONFIG_VERSION_INICIAL: ConfigVersionAndroid = {
  minVersionCode: 0,
  latestVersionCode: 0,
  updateUrl: PLAY_STORE_URL,
  webUrl: INDIO_URL,
  message: 'Actualizá Indio para seguir usando la app.',
};

function obtenerVersionCode(): number {
  const nativo = Number.parseInt(String(Constants.nativeBuildVersion || ''), 10);
  if (Number.isFinite(nativo) && nativo > 0) return nativo;

  const configurado = Number(Constants.expoConfig?.android?.versionCode || 0);
  return Number.isFinite(configurado) && configurado > 0 ? configurado : 0;
}

function urlVersionApp(): string {
  const base = getAPIBaseURL();
  const api = /^https?:\/\//i.test(base)
    ? base.replace(/\/+$/, '')
    : 'https://indio.com.ar/api';
  return `${api}/app/version`;
}

export default function IndioWebAndroid() {
  const webView = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loadKey, setLoadKey] = useState(0);
  const [estado, setEstado] = useState<EstadoArranque>('chequeando');
  const [configVersion, setConfigVersion] = useState<ConfigVersionAndroid>(CONFIG_VERSION_INICIAL);

  useEffect(() => {
    const versionCode = obtenerVersionCode();
    if (!versionCode) {
      setEstado('listo');
      return;
    }

    let cancelado = false;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), VERSION_TIMEOUT_MS);

    fetch(`${urlVersionApp()}?platform=android&versionCode=${versionCode}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (cancelado) return;
        const android = data?.android;
        if (!android) {
          setEstado('listo');
          return;
        }

        const minVersionCode = Number(android.minVersionCode) || 0;
        if (minVersionCode > versionCode) {
          setConfigVersion({
            minVersionCode,
            latestVersionCode: Number(android.latestVersionCode) || 0,
            updateUrl: android.updateUrl || PLAY_STORE_URL,
            webUrl: android.webUrl || INDIO_URL,
            message: android.message || CONFIG_VERSION_INICIAL.message,
          });
          setEstado('actualizar');
          return;
        }

        setEstado('listo');
      })
      .catch(() => {
        // Si la API no responde, la app sigue funcionando: no bloqueamos el acceso.
        if (!cancelado) setEstado('listo');
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      cancelado = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!canGoBack) return false;
      webView.current?.goBack();
      return true;
    });
    return () => subscription.remove();
  }, [canGoBack]);

  const abrirEnlace = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const handleNavigation = (navigation: WebViewNavigation) => {
    setCanGoBack(navigation.canGoBack);
  };

  const handleRequest = ({ url }: { url: string }) => {
    if (INDIO_HOST.test(url) || url === 'about:blank') return true;
    if (/^(https?:|mailto:|tel:)/i.test(url)) {
      abrirEnlace(url);
    }
    return false;
  };

  if (estado === 'chequeando') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Cargando Indio...</Text>
      </View>
    );
  }

  if (estado === 'actualizar') {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Actualización necesaria</Text>
        <Text style={styles.message}>{configVersion.message}</Text>
        <TouchableOpacity
          style={styles.primary}
          onPress={() => abrirEnlace(configVersion.updateUrl)}
        >
          <Text style={styles.primaryText}>Actualizar en Play Store</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondary}
          onPress={() => abrirEnlace(configVersion.webUrl)}
        >
          <Text style={styles.secondaryText}>Usar la versión web</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AndroidWebView
        key={loadKey}
        ref={webView}
        source={{ uri: INDIO_URL }}
        injectedJavaScriptBeforeContentLoaded={FORCE_APP_MODE}
        originWhitelist={['https://*']}
        javaScriptEnabled
        domStorageEnabled
        geolocationEnabled
        androidLayerType="software"
        setSupportMultipleWindows={false}
        mixedContentMode="never"
        onNavigationStateChange={handleNavigation}
        onShouldStartLoadWithRequest={handleRequest}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#2E7D32" />
          </View>
        )}
        renderError={() => (
          <View style={styles.center}>
            <Text style={styles.message}>No se pudo abrir Indio. Revisá tu conexión.</Text>
            <TouchableOpacity style={styles.primary} onPress={() => setLoadKey((key) => key + 1)}>
              <Text style={styles.primaryText}>Reintentar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondary} onPress={() => abrirEnlace(INDIO_URL)}>
              <Text style={styles.secondaryText}>Abrir en el navegador</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#ffffff' },
  loadingText: { marginTop: 12, color: '#455A64', fontSize: 15 },
  title: { color: '#102333', fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  message: { color: '#37474F', fontSize: 16, lineHeight: 23, textAlign: 'center', marginBottom: 24 },
  primary: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
    minWidth: 220,
    alignItems: 'center',
  },
  primaryText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  secondary: { paddingHorizontal: 20, paddingVertical: 14, marginTop: 4 },
  secondaryText: { color: '#173F41', fontSize: 15, fontWeight: '600', textAlign: 'center' },
});
