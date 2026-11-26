// Botón de Google para web usando Google Identity Services.
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';

interface Props {
  onToken: (idToken: string) => void;
  onError: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const clientId =
  Constants.expoConfig?.extra?.googleWebClientId ||
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  '';

// La app Android es un WebView: Google bloquea el OAuth dentro de WebViews,
// así que el botón de Google solo se muestra en navegadores de verdad.
const enWebView =
  typeof window !== 'undefined' && !!(window as { ReactNativeWebView?: unknown }).ReactNativeWebView;

export default function BotonGoogle({ onToken, onError, disabled, loading }: Props): JSX.Element {
  const onTokenRef = useRef(onToken);
  const onErrorRef = useRef(onError);
  onTokenRef.current = onToken;
  onErrorRef.current = onError;

  useEffect(() => {
    if (typeof window === 'undefined' || !clientId || clientId.startsWith('tu_')) return;
    let cancelado = false;

    const inicializar = () => {
      if (cancelado || !window.google?.accounts?.id) return;
      const contenedor = document.getElementById('indio-google-button');
      if (!contenedor) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        locale: 'es',
        callback: (respuesta: { credential?: string }) => {
          if (respuesta?.credential) onTokenRef.current(respuesta.credential);
          else onErrorRef.current('No pudimos obtener la cuenta de Google.');
        },
      });
      contenedor.innerHTML = '';
      window.google.accounts.id.renderButton(contenedor, {
        theme: 'filled_blue',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        width: 320,
        logo_alignment: 'left',
      });
    };

    const existente = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existente) {
      if (window.google?.accounts?.id) inicializar();
      else existente.addEventListener('load', inicializar);
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = inicializar;
      document.head.appendChild(script);
    }

    return () => {
      cancelado = true;
    };
  }, []);

  if (enWebView) {
    return (
      <View style={estilos.aviso}>
        <Text style={estilos.avisoTitulo}>Google no está disponible dentro de la app</Text>
        <Text style={estilos.avisoTexto}>
          Iniciá sesión con tu email y contraseña. Si querés usar Google, abrí
          indio.com.ar en Chrome.
        </Text>
      </View>
    );
  }

  if (!clientId || clientId.startsWith('tu_')) {
    return (
      <Pressable
        onPress={() => onError('Google todavía no está configurado. Probá más tarde.')}
        style={[estilos.boton, estilos.deshabilitado]}
        accessibilityRole="button"
        accessibilityLabel="Continuar con Google"
      >
        <Text style={estilos.texto}>Continuar con Google</Text>
      </Pressable>
    );
  }

  if (loading) {
    return (
      <View style={estilos.cargando}>
        <ActivityIndicator color="#4285F4" />
      </View>
    );
  }

  return (
    <View style={estilos.envoltorio}>
      <View nativeID="indio-google-button" style={estilos.contenedor} />
      <Text style={estilos.ayuda}>
        Si el botón no abre, permití las ventanas emergentes para indio.com.ar.
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  aviso: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    padding: 14,
    marginBottom: 10,
  },
  avisoTitulo: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  avisoTexto: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  envoltorio: {
    alignItems: 'center',
    marginBottom: 10,
  },
  contenedor: {
    width: 320,
    minHeight: 44,
    alignSelf: 'center',
  },
  ayuda: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 320,
  },
  cargando: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  boton: {
    backgroundColor: '#4285F4',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  deshabilitado: { opacity: 0.6 },
  texto: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
