/**
 * Espacio para publicidad (AdMob).
 * Para mostrar banners reales: crea cuenta en AdMob, obtén los IDs,
 * instala react-native-google-mobile-ads y haz un development build (EAS).
 * Ver docs/ADMOB.md
 */
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { temaApp } from '../constantes/tema';

const ADMOB_BANNER_ID = process.env.EXPO_PUBLIC_ADMOB_BANNER_ID;

interface AdBannerProps {
  /** Altura mínima del bloque (evita saltos de layout) */
  minHeight?: number;
}

export default function AdBanner({ minHeight = 50 }: Readonly<AdBannerProps>): JSX.Element | null {
  // En web no mostramos banner (PWA suele no usar AdMob)
  if (Platform.OS === 'web') {
    return null;
  }

  // Cuando tengas AdMob configurado con react-native-google-mobile-ads,
  // aquí puedes renderizar <BannerAd unitId={ADMOB_BANNER_ID} ... />
  const tieneAdMob = Boolean(ADMOB_BANNER_ID);

  return (
    <View style={[estilos.contenedor, { minHeight }]}>
      {tieneAdMob ? (
        <Text style={estilos.placeholder}>Publicidad (configura react-native-google-mobile-ads)</Text>
      ) : (
        <Text style={estilos.placeholder}>Espacio publicitario</Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    backgroundColor: temaApp.colors.surfaceVariant || '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  placeholder: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant || '#666',
  },
});
