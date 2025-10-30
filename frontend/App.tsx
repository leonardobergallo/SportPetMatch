// Punto de entrada mínimo para forzar render en web
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaView } from 'react-native';
import PantallaInicio from './src/pantallas/PantallaInicio';

export default function App(): JSX.Element {
  return (
    <PaperProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <PantallaInicio />
      </SafeAreaView>
    </PaperProvider>
  );
}