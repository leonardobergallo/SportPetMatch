import React from 'react';
import { Platform } from 'react-native';

import IndioWebAndroid from './src/componentes/IndioWebAndroid';

// Android es un contenedor web. No cargamos la aplicación React Native completa
// en esa plataforma: varios de sus módulos no se usan allí y cualquier error de
// inicialización impediría que la WebView llegue a mostrarse.
const AppCompleta: React.ComponentType | null =
  Platform.OS === 'android' ? null : require('./AppCompleta').default;

export default function App() {
  if (Platform.OS === 'android') {
    return <IndioWebAndroid />;
  }

  if (!AppCompleta) return null;
  return <AppCompleta />;
}
