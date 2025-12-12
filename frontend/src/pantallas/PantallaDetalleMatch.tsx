// Pantalla de Detalle de Match - SportPetMatch
// Muestra información completa de un match y permite iniciar chat

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Avatar,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Importar servicios y tema
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import { obtenerMisMatches, Match } from '../servicios/servicioMatches';
import { temaApp, espaciado, sombras } from '../constantes/tema';
import { useAuth } from '../contextos/ContextoAuth';

type DetalleMatchRouteProp = RouteProp<RootStackParamList, 'DetalleMatch'>;
type DetalleMatchNavigationProp = StackNavigationProp<RootStackParamList, 'DetalleMatch'>;

/**
 * Pantalla de Detalle de Match
 */
export default function PantallaDetalleMatch(): JSX.Element {
  const navigation = useNavigation<DetalleMatchNavigationProp>();
  const route = useRoute<DetalleMatchRouteProp>();
  const { matchId } = route.params;
  const { usuario } = useAuth();

  const [match, setMatch] = useState<Match | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  useEffect(() => {
    cargarMatch();
  }, [matchId]);

  /**
   * Cargar información del match
   */
  const cargarMatch = async () => {
    try {
      setCargando(true);
      const matches = await obtenerMisMatches();
      const matchEncontrado = matches.find((m) => m.id === matchId);
      
      if (!matchEncontrado) {
        Alert.alert('Error', 'Match no encontrado');
        navigation.goBack();
        return;
      }
      
      setMatch(matchEncontrado);
    } catch (error: any) {
      console.error('Error cargando match:', error);
      Alert.alert('Error', 'No se pudo cargar la información del match');
      navigation.goBack();
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  /**
   * Manejar refresh
   */
  const manejarRefresh = () => {
    setRefrescando(true);
    cargarMatch();
  };

  /**
   * Navegar al chat
   */
  const navegarAlChat = () => {
    if (match) {
      navigation.navigate('Chat', { matchId: match.id });
    }
  };

  /**
   * Obtener el otro usuario del match
   */
  const obtenerOtroUsuario = () => {
    if (!match || !usuario) return null;
    return match.usuarioId === usuario.id ? match.usuarioMatch : match.usuario;
  };

  /**
   * Formatear fecha
   */
  const formatearFecha = (fecha: string): string => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Obtener color del estado
   */
  const obtenerColorEstado = (estado: string): string => {
    switch (estado) {
      case 'aceptado':
        return temaApp.colors.primary;
      case 'rechazado':
        return temaApp.colors.error;
      default:
        return temaApp.colors.onSurfaceVariant;
    }
  };

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color={temaApp.colors.primary} />
        <Text style={estilos.textoCarga}>Cargando match...</Text>
      </View>
    );
  }

  if (!match) {
    return (
      <View style={estilos.centrado}>
        <MaterialIcons name="error-outline" size={60} color={temaApp.colors.error} />
        <Text style={estilos.textoError}>No se pudo cargar el match</Text>
        <Button onPress={cargarMatch} style={estilos.botonReintentar}>
          Reintentar
        </Button>
      </View>
    );
  }

  const otroUsuario = obtenerOtroUsuario();
  const esAceptado = match.estado === 'aceptado';

  return (
    <ScrollView
      style={estilos.contenedor}
      contentContainerStyle={estilos.scrollContent}
      showsVerticalScrollIndicator={true}
      refreshControl={
        <RefreshControl
          refreshing={refrescando}
          onRefresh={manejarRefresh}
          colors={[temaApp.colors.primary]}
        />
      }
    >
      {/* Información del match */}
      <Card style={estilos.card}>
        <Card.Content>
          <View style={estilos.header}>
            <View style={estilos.estadoContainer}>
              <View
                style={[
                  estilos.estadoBadge,
                  { backgroundColor: obtenerColorEstado(match.estado) },
                ]}
              >
                <Text style={estilos.estadoTexto}>
                  {match.estado.charAt(0).toUpperCase() + match.estado.slice(1)}
                </Text>
              </View>
            </View>
            <Text style={estilos.fecha}>{formatearFecha(match.fechaMatch)}</Text>
          </View>

          <Divider style={estilos.divisor} />

          {/* Información del otro usuario */}
          {otroUsuario && (
            <View style={estilos.usuarioContainer}>
              <Text style={estilos.seccionTitulo}>Match con:</Text>
              <View style={estilos.usuarioInfo}>
                <Avatar.Image
                  size={80}
                  source={{
                    uri: otroUsuario.avatar || 'https://via.placeholder.com/80',
                  }}
                />
                <View style={estilos.usuarioDetalles}>
                  <Text style={estilos.usuarioNombre}>{otroUsuario.nombre}</Text>
                  {otroUsuario.ubicacionCiudad && (
                    <View style={estilos.ubicacionContainer}>
                      <MaterialIcons
                        name="place"
                        size={16}
                        color={temaApp.colors.onSurfaceVariant}
                      />
                      <Text style={estilos.ubicacion}>{otroUsuario.ubicacionCiudad}</Text>
                    </View>
                  )}
                  {otroUsuario.distancia !== null && otroUsuario.distancia !== undefined && (
                    <Text style={estilos.distancia}>
                      A {otroUsuario.distancia.toFixed(1)} km de distancia
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Mensaje inicial */}
          {match.mensajeInicial && (
            <View style={estilos.mensajeContainer}>
              <Text style={estilos.seccionTitulo}>Mensaje Inicial</Text>
              <Card style={estilos.mensajeCard}>
                <Card.Content>
                  <Text style={estilos.mensajeTexto}>{match.mensajeInicial}</Text>
                </Card.Content>
              </Card>
            </View>
          )}

          {/* Evento propuesto */}
          {match.eventoPropuesto && (
            <View style={estilos.eventoContainer}>
              <Text style={estilos.seccionTitulo}>Evento Propuesto</Text>
              <Card style={estilos.eventoCard}>
                <Card.Content>
                  <Text style={estilos.eventoTitulo}>{match.eventoPropuesto.titulo}</Text>
                  <Text style={estilos.eventoDescripcion} numberOfLines={2}>
                    {match.eventoPropuesto.descripcion}
                  </Text>
                  <View style={estilos.eventoInfo}>
                    <MaterialIcons
                      name="event"
                      size={16}
                      color={temaApp.colors.primary}
                    />
                    <Text style={estilos.eventoFecha}>
                      {new Date(match.eventoPropuesto.fechaInicio).toLocaleDateString('es-ES')}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </View>
          )}

          {/* Botones de acción */}
          <View style={estilos.botonesContainer}>
            {esAceptado ? (
              <Button
                mode="contained"
                onPress={navegarAlChat}
                icon="message"
                style={estilos.botonChat}
              >
                Iniciar Chat
              </Button>
            ) : (
              <Text style={estilos.textoEspera}>
                Esperando respuesta del otro usuario...
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
  },
  scrollContent: {
    padding: espaciado.md,
    paddingBottom: 150, // Espacio al final para asegurar scroll completo
    flexGrow: 1,
    minHeight: '100%', // Asegura que el contenido pueda hacer scroll
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: espaciado.xl,
  },
  textoCarga: {
    marginTop: espaciado.md,
    fontSize: 16,
    color: temaApp.colors.onSurfaceVariant,
  },
  textoError: {
    marginTop: espaciado.md,
    fontSize: 18,
    fontWeight: '600',
    color: temaApp.colors.error,
    textAlign: 'center',
  },
  botonReintentar: {
    marginTop: espaciado.md,
  },
  card: {
    margin: espaciado.md,
    ...sombras.media,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: espaciado.md,
  },
  estadoContainer: {
    flex: 1,
  },
  estadoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.xs,
    borderRadius: 16,
  },
  estadoTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  fecha: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
  },
  divisor: {
    marginVertical: espaciado.md,
  },
  usuarioContainer: {
    marginBottom: espaciado.lg,
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.md,
  },
  usuarioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
  },
  usuarioDetalles: {
    flex: 1,
  },
  usuarioNombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.xs,
  },
  ubicacionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: espaciado.xs,
  },
  ubicacion: {
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
  },
  distancia: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
  },
  mensajeContainer: {
    marginBottom: espaciado.lg,
  },
  mensajeCard: {
    backgroundColor: temaApp.colors.surfaceVariant || '#F5F5F5',
  },
  mensajeTexto: {
    fontSize: 14,
    color: temaApp.colors.onSurface,
    lineHeight: 20,
  },
  eventoContainer: {
    marginBottom: espaciado.lg,
  },
  eventoCard: {
    backgroundColor: temaApp.colors.surfaceVariant || '#F5F5F5',
  },
  eventoTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.xs,
  },
  eventoDescripcion: {
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
    marginBottom: espaciado.sm,
  },
  eventoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventoFecha: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
  },
  botonesContainer: {
    marginTop: espaciado.xl,
  },
  botonChat: {
    marginTop: espaciado.md,
  },
  textoEspera: {
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: espaciado.md,
  },
});

