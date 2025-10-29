// Pantalla de Mascotas de SportPetMatch
// Gestión de mascotas del usuario

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { temaApp, espaciado, sombras } from '../constantes/tema';

export default function PantallaMascotas(): JSX.Element {
  return (
    <View style={estilos.contenedor}>
      <Card style={estilos.tarjeta}>
        <Card.Content>
          <Text variant="headlineSmall">Mis Mascotas</Text>
          <Text variant="bodyMedium">Gestión de mascotas en desarrollo...</Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
    padding: espaciado.lg,
  },
  tarjeta: {
    ...sombras.media,
  },
});
