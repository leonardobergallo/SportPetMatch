// Pantalla de Matches de SportPetMatch
// Conversaciones con usuarios que han hecho match

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  Badge,
  Searchbar,
  FAB,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { temaApp, espaciado, sombras } from '../constantes/tema';
import { RootStackParamList, TabParamList } from '../navegacion/NavegacionPrincipal';
import { useAuth } from '../contextos/ContextoAuth';
import { obtenerMisMatches, Match } from '../servicios/servicioMatches';
import {
  obtenerMensajes,
  obtenerMensajesNoLeidos,
  Mensaje,
  MensajesNoLeidos,
} from '../servicios/servicioMensajes';
import { mostrarAlerta } from '@/utilidades/alerta';

type MatchesScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type MatchesScreenRouteProp = RouteProp<TabParamList, 'Matches'>;

/** Tipografia web (Plus Jakarta / Outfit), misma familia que el resto de la app en web */
const fontSans = Platform.select({ web: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', default: undefined });
const fontDisplay = Platform.select({ web: '"Outfit", "Plus Jakarta Sans", system-ui, sans-serif', default: undefined });

interface Conversacion {
  match: Match;
  otroUsuario: {
    id: string;
    nombre: string;
    avatar: string | null;
  };
  ultimoMensaje: Mensaje | null;
  noLeidos: number;
  esNuevoMatch: boolean;
}

export default function PantallaMatches(): JSX.Element {
  const navigation = useNavigation<MatchesScreenNavigationProp>();
  const route = useRoute<MatchesScreenRouteProp>();
  const { usuario } = useAuth();
  const matchAbiertoRef = useRef<string | null>(null);

  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState<MensajesNoLeidos[]>([]);

  useEffect(() => {
    cargarDatos({ mostrarError: true });
  }, []);

  useEffect(() => {
    const openMatchId = route.params?.openMatchId;

    if (!openMatchId || cargando || matchAbiertoRef.current === openMatchId) {
      return;
    }

    const conversacion = conversaciones.find((item) => item.match.id === openMatchId);
    if (conversacion) {
      matchAbiertoRef.current = openMatchId;
      navigation.navigate('Chat', { matchId: openMatchId });
    }
  }, [route.params?.openMatchId, cargando, conversaciones, navigation]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!cargando && !refrescando) {
        cargarDatos({ mostrarError: false });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [cargando, refrescando, mensajesNoLeidos.length]);

  const cargarDatos = async ({ mostrarError = false }: { mostrarError?: boolean } = {}) => {
    try {
      setCargando(true);
      const noLeidos = await cargarMensajesNoLeidos();
      await cargarMatches(noLeidos);
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      const mensaje = error?.message || '';

      if (
        mostrarError &&
        !mensaje.includes('Demasiadas solicitudes') &&
        !mensaje.includes('Error de conexion')
      ) {
        mostrarAlerta('Error', 'No se pudieron cargar las conversaciones');
      }
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const cargarMatches = async (noLeidosActuales: MensajesNoLeidos[] = mensajesNoLeidos) => {
    try {
      const matches = await obtenerMisMatches();
      const noLeidosPorMatch = new Map(
        noLeidosActuales.map((item) => [item.matchId, item.noLeidos])
      );

      const matchesAceptados = matches.filter((match) => match.estado === 'aceptado');

      const matchesUnicos = matchesAceptados.reduce((acc, match) => {
        const parUsuarios = [match.usuario.id, match.usuarioMatch.id].sort().join('-');
        const existe = acc.find((actual) => {
          const parExistente = [actual.usuario.id, actual.usuarioMatch.id].sort().join('-');
          return parExistente === parUsuarios;
        });

        if (!existe) {
          acc.push(match);
        }

        return acc;
      }, [] as Match[]);

      const conversacionesData = await Promise.all(
        matchesUnicos.map(async (match) => {
          const otroUsuario =
            match.usuarioId === usuario?.id ? match.usuarioMatch : match.usuario;

          let ultimoMensaje: Mensaje | null = null;
          try {
            const mensajes = await obtenerMensajes(match.id);
            if (mensajes.length > 0) {
              ultimoMensaje = mensajes[mensajes.length - 1];
            }
          } catch (error) {
            console.error('Error obteniendo mensajes:', error);
          }

          const fechaMatch = new Date(match.fechaMatch);
          const ahora = new Date();
          const horasDesdeMatch = (ahora.getTime() - fechaMatch.getTime()) / (1000 * 60 * 60);
          const esNuevoMatch = horasDesdeMatch < 24 && match.estado === 'aceptado';

          return {
            match,
            otroUsuario,
            ultimoMensaje,
            noLeidos: noLeidosPorMatch.get(match.id) || 0,
            esNuevoMatch,
          };
        })
      );

      conversacionesData.sort((a, b) => {
        if (a.noLeidos > 0 && b.noLeidos === 0) return -1;
        if (a.noLeidos === 0 && b.noLeidos > 0) return 1;
        if (a.ultimoMensaje && b.ultimoMensaje) {
          return (
            new Date(b.ultimoMensaje.createdAt).getTime() -
            new Date(a.ultimoMensaje.createdAt).getTime()
          );
        }
        if (a.ultimoMensaje) return -1;
        if (b.ultimoMensaje) return 1;
        return new Date(b.match.fechaMatch).getTime() - new Date(a.match.fechaMatch).getTime();
      });

      setConversaciones(conversacionesData);
    } catch (error) {
      console.error('Error cargando matches:', error);
      throw error;
    }
  };

  const cargarMensajesNoLeidos = async (): Promise<MensajesNoLeidos[]> => {
    try {
      const noLeidos = await obtenerMensajesNoLeidos();
      setMensajesNoLeidos(noLeidos);

      setConversaciones((prev) =>
        prev.map((conv) => {
          const noLeidosMatch = noLeidos.find((item) => item.matchId === conv.match.id);
          return {
            ...conv,
            noLeidos: noLeidosMatch?.noLeidos || 0,
          };
        })
      );

      return noLeidos;
    } catch (error) {
      console.error('Error cargando mensajes no leidos:', error);
      return [];
    }
  };

  const manejarRefresh = () => {
    setRefrescando(true);
    cargarDatos({ mostrarError: true });
  };

  const conversacionesFiltradas = conversaciones.filter((conv) =>
    conv.otroUsuario.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const formatearTiempo = (fecha: string | Date): string => {
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const ahora = new Date();
    const diferencia = ahora.getTime() - fechaObj.getTime();
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `${minutos}m`;
    if (horas < 24) return `${horas}h`;
    if (dias < 7) return `${dias}d`;
    return fechaObj.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const abrirChat = (conversacion: Conversacion) => {
    navigation.navigate('Chat', { matchId: conversacion.match.id });
  };

  const verDetalleMatch = (matchId: string) => {
    navigation.navigate('DetalleMatch', { matchId });
  };

  const irAMatching = () => {
    navigation.navigate('Matching');
  };

  const renderizarConversacion = ({ item }: { item: Conversacion }) => (
    <TouchableOpacity
      style={estilos.conversacionItem}
      onPress={() => abrirChat(item)}
      onLongPress={() => verDetalleMatch(item.match.id)}
      activeOpacity={0.7}
    >
      <Card
        style={[
          estilos.tarjetaConversacion,
          item.esNuevoMatch && estilos.nuevoMatch,
        ]}
      >
        <Card.Content style={estilos.contenidoConversacion}>
          <View style={estilos.avatarContainer}>
            {item.otroUsuario.avatar ? (
              <Avatar.Image size={60} source={{ uri: item.otroUsuario.avatar }} />
            ) : (
              <Avatar.Text
                size={60}
                label={item.otroUsuario.nombre.charAt(0).toUpperCase()}
              />
            )}
            {item.esNuevoMatch && <Badge style={estilos.badgeNuevo}>NUEVO</Badge>}
            {item.noLeidos > 0 && (
              <Badge style={estilos.badgeNoLeidos}>{item.noLeidos}</Badge>
            )}
          </View>

          <View style={estilos.infoConversacion}>
            <View style={estilos.headerConversacion}>
              <Text variant="titleMedium" style={estilos.nombreUsuario}>
                {item.otroUsuario.nombre}
              </Text>
              {item.ultimoMensaje && (
                <Text variant="bodySmall" style={estilos.tiempo}>
                  {formatearTiempo(item.ultimoMensaje.createdAt)}
                </Text>
              )}
            </View>

            {item.match.eventoPropuesto && (
              <View style={estilos.detallesUsuario}>
                <Text variant="bodySmall" style={estilos.eventoPropuesto}>
                  {`Evento: ${item.match.eventoPropuesto.titulo}`}
                </Text>
              </View>
            )}

            {item.ultimoMensaje ? (
              <View style={estilos.ultimoMensajeContainer}>
                <Text
                  variant="bodyMedium"
                  style={[
                    estilos.ultimoMensaje,
                    item.noLeidos > 0 && estilos.mensajeNoLeido,
                  ]}
                  numberOfLines={1}
                >
                  {item.ultimoMensaje.contenido}
                </Text>
              </View>
            ) : (
              <View style={estilos.ultimoMensajeContainer}>
                <Text variant="bodySmall" style={estilos.mensajeInicial}>
                  {item.match.mensajeInicial || 'Match realizado'}
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (cargando) {
    return (
      <View style={estilos.contenedorCarga}>
        <ActivityIndicator size="large" color={temaApp.colors.primary} />
        <Text style={estilos.textoCarga}>Cargando conversaciones...</Text>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <Searchbar
        placeholder="Buscar conversaciones..."
        onChangeText={setBusqueda}
        value={busqueda}
        style={estilos.barraBusqueda}
        icon="magnify"
        clearIcon="close"
      />

      <FlatList
        data={conversacionesFiltradas}
        renderItem={renderizarConversacion}
        keyExtractor={(item) => item.match.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={estilos.listaConversaciones}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={manejarRefresh}
            colors={[temaApp.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={estilos.contenedorVacio}>
            <MaterialIcons
              name="chat-bubble-outline"
              size={80}
              color={temaApp.colors.onSurfaceVariant}
            />
            <Text variant="headlineSmall" style={estilos.textoVacio}>
              Sin conversaciones
            </Text>
            <Text variant="bodyMedium" style={estilos.subtextoVacio}>
              Comienza a hacer matches para chatear.
            </Text>
          </View>
        }
      />

      <FAB
        icon="heart"
        style={[estilos.fab, { backgroundColor: temaApp.colors.like }]}
        color="#FFFFFF"
        onPress={irAMatching}
        label="Encontrar matches"
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
  },
  contenedorCarga: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: temaApp.colors.background,
  },
  textoCarga: {
    marginTop: espaciado.md,
    color: temaApp.colors.onSurfaceVariant,
  },
  barraBusqueda: {
    margin: espaciado.md,
    elevation: 2,
  },
  listaConversaciones: {
    paddingHorizontal: espaciado.md,
    paddingBottom: 100,
    ...(Platform.OS === 'web' ? { paddingHorizontal: 32, paddingTop: 12 } : {}),
  },
  conversacionItem: {
    marginBottom: espaciado.sm,
  },
  tarjetaConversacion: {
    ...sombras.media,
    borderRadius: 16,
  },
  nuevoMatch: {
    borderWidth: 2,
    borderColor: temaApp.colors.primary,
  },
  contenidoConversacion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: espaciado.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: espaciado.md,
  },
  badgeNuevo: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: temaApp.colors.primary,
  },
  badgeNoLeidos: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: temaApp.colors.error,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoConversacion: {
    flex: 1,
  },
  headerConversacion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: espaciado.xs,
  },
  nombreUsuario: {
    fontWeight: '600',
    color: temaApp.colors.onSurface,
    ...(fontDisplay ? { fontFamily: fontDisplay } : {}),
  },
  tiempo: {
    color: temaApp.colors.onSurfaceVariant,
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  detallesUsuario: {
    marginBottom: espaciado.xs,
  },
  eventoPropuesto: {
    color: temaApp.colors.primary,
  },
  ultimoMensajeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ultimoMensaje: {
    flex: 1,
    color: temaApp.colors.onSurfaceVariant,
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  mensajeNoLeido: {
    fontWeight: '600',
    color: temaApp.colors.onSurface,
  },
  mensajeInicial: {
    color: temaApp.colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  contenedorVacio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: espaciado.xl * 2,
  },
  textoVacio: {
    marginTop: espaciado.lg,
    color: temaApp.colors.onSurfaceVariant,
  },
  subtextoVacio: {
    marginTop: espaciado.sm,
    color: temaApp.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: espaciado.lg,
    bottom: espaciado.lg,
    backgroundColor: temaApp.colors.primary,
  },
});
