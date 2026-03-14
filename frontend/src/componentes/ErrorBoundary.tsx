/**
 * Error boundary global: captura errores de render y muestra una pantalla de fallo
 * en lugar de pantalla en blanco. Incluye botón para reintentar.
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { temaApp } from '../constantes/tema';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  reiniciar = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return (
        <View style={estilos.contenedor}>
          <Text style={estilos.emoji}>😕</Text>
          <Text style={estilos.titulo}>Algo salió mal</Text>
          <Text style={estilos.mensaje}>
            La app encontró un error inesperado. Podés intentar de nuevo.
          </Text>
          <Button
            mode="contained"
            onPress={this.reiniciar}
            style={estilos.boton}
          >
            Reintentar
          </Button>
        </View>
      );
    }
    return this.props.children;
  }
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: temaApp.colors.onBackground,
    marginBottom: 8,
    textAlign: 'center',
  },
  mensaje: {
    fontSize: 16,
    color: temaApp.colors.onBackground,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 24,
  },
  boton: {
    minWidth: 160,
  },
});
