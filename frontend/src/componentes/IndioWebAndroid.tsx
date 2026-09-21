import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import WebView, { WebViewNavigation } from 'react-native-webview';
import type { AndroidWebViewProps } from 'react-native-webview/lib/WebViewTypes';

// El paquete expone tipos combinados de iOS/Android/Windows; esta pantalla solo usa Android.
const AndroidWebView = WebView as unknown as React.ComponentType<AndroidWebViewProps & React.RefAttributes<WebView>>;

const INDIO_URL = 'https://indio.com.ar/app.html?app=1';
const INDIO_HOST = /^https:\/\/(?:www\.)?indio\.com\.ar(?:[/:?#]|$)/i;

export default function IndioWebAndroid() {
  const webView = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!canGoBack) return false;
      webView.current?.goBack();
      return true;
    });
    return () => subscription.remove();
  }, [canGoBack]);

  const handleNavigation = (navigation: WebViewNavigation) => {
    setCanGoBack(navigation.canGoBack);
  };

  const handleRequest = ({ url }: { url: string }) => {
    if (INDIO_HOST.test(url) || url === 'about:blank') return true;
    if (/^(https?:|mailto:|tel:)/i.test(url)) {
      Linking.openURL(url).catch(() => {});
    }
    return false;
  };

  return (
    <View style={styles.container}>
      <AndroidWebView
        key={loadKey}
        ref={webView}
        source={{ uri: INDIO_URL }}
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
            <TouchableOpacity style={styles.retry} onPress={() => setLoadKey((key) => key + 1)}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  message: { color: '#212121', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  retry: { backgroundColor: '#FF6F00', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  retryText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
