// Pantalla de Eventos de SportPetMatch
// Lista de eventos deportivos disponibles

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { temaApp, espaciado, sombras } from '../constantes/tema';

export default function PantallaEventos(): JSX.Element {
  return (
    <View style={estilos.contenedor}>
      <Card style={estilos.tarjeta}>
        <Card.Content>
          <Text variant="headlineSmall">Eventos</Text>
          <Text variant="bodyMedium">Lista de eventos en desarrollo...</Text>
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
