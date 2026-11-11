// Botón de Google para Android/iOS usando expo-auth-session.
import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import Constants from 'expo-constants';
import * as Google from 'expo-auth-session/providers/google';

interface Props {
  onToken: (idToken: string) => void;
  onError: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

const webClientId =
  Constants.expoConfig?.extra?.googleWebClientId ||
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  '';
const androidClientId =
  Constants.expoConfig?.extra?.googleAndroidClientId ||
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
  '';

export default function BotonGoogle({ onToken, onError, disabled, loading }: Props): JSX.Element {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: webClientId || undefined,
    androidClientId: androidClientId || undefined,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      const idToken = response.params?.id_token || response.authentication?.idToken;
      if (idToken) onToken(idToken);
      else onError('Google no devolvió un token válido. Intentá de nuevo.');
    } else if (response.type === 'error') {
      onError('No pudimos iniciar sesión con Google.');
    }
  }, [response, onToken, onError]);

  const presionar = async () => {
    if (!webClientId && !androidClientId) {
      onError('Google todavía no está configurado. Probá más tarde.');
      return;
    }
    if (!request) {
      onError('Google todavía no está listo. Probá de nuevo en unos segundos.');
      return;
    }
    await promptAsync();
  };

  return (
    <Pressable
      onPress={presionar}
      disabled={disabled || loading}
      style={[estilos.boton, (disabled || loading) && estilos.deshabilitado]}
      accessibilityRole="button"
      accessibilityLabel="Continuar con Google"
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={estilos.texto}>Continuar con Google</Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
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
