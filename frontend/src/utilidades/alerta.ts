// Reemplazo de Alert.alert compatible con web
// react-native-web no implementa Alert.alert (queda en silencio), asi que en web
// usamos window.alert / window.confirm para que los mensajes y confirmaciones
// (cerrar sesion, eliminar evento, eliminar mascota, salir de evento, errores
// de login/registro, etc.) se vean igual que en la app nativa.

import { Alert, Platform } from 'react-native';

export interface BotonAlerta {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export function mostrarAlerta(titulo: string, mensaje?: string, botones?: BotonAlerta[]): void {
  if (Platform.OS !== 'web') {
    Alert.alert(titulo, mensaje, botones as any);
    return;
  }

  const lista = botones && botones.length > 0 ? botones : [{ text: 'OK' }];
  const textoCompleto = mensaje ? `${titulo}\n\n${mensaje}` : titulo;

  if (lista.length === 1) {
    window.alert(textoCompleto);
    lista[0].onPress?.();
    return;
  }

  const botonCancelar = lista.find((b) => b.style === 'cancel') || lista[0];
  const botonConfirmar = lista.find((b) => b !== botonCancelar) || lista[lista.length - 1];

  const confirmado = window.confirm(textoCompleto);
  if (confirmado) {
    botonConfirmar.onPress?.();
  } else {
    botonCancelar.onPress?.();
  }
}
