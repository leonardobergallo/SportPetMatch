// Pantalla de Matches de SportPetMatch
// Conversaciones con usuarios que han hecho match

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { temaApp, espaciado, sombras } from '../constantes/tema';
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import { useAuth } from '../contextos/ContextoAuth';
import { obtenerMisMatches, Match } from '../servicios/servicioMatches';
import {
  obtenerMensajes,
  obtenerMensajesNoLeidos,
  Mensaje,
  MensajesNoLeidos,
} from '../servicios/servicioMensajes';

type MatchesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Tipo para la conversación con información completa
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
  const { usuario } = useAuth();

  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState<MensajesNoLeidos[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  // Auto-refrescar cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (!cargando && !refrescando) {
        cargarDatos();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [cargando, refrescando]);

  /**
   * Cargar datos de matches y mensajes
   */
  const cargarDatos = async () => {
    try {
      setCargando(true);
      await Promise.all([cargarMatches(), cargarMensajesNoLeidos()]);
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar las conversaciones');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  /**
   * Cargar matches y construir conversaciones
   */
  const cargarMatches = async () => {
    try {
      const matches = await obtenerMisMatches();

      // Construir conversaciones con información del otro usuario y último mensaje
      const conversacionesData = await Promise.all(
        matches.map(async (match) => {
          // Determinar quién es el otro usuario
          const otroUsuario =
            match.usuarioId === usuario?.id
              ? match.usuarioMatch
              : match.usuario;

          // Obtener último mensaje del match
          let ultimoMensaje: Mensaje | null = null;
          try {
            const mensajes = await obtenerMensajes(match.id);
            if (mensajes.length > 0) {
              ultimoMensaje = mensajes[mensajes.length - 1];
            }
          } catch (error) {
            console.error('Error obteniendo mensajes:', error);
          }

          // Determinar si es un match nuevo (creado en las últimas 24 horas)
          const fechaMatch = new Date(match.fechaMatch);
          const ahora = new Date();
          const horasDesdeMatch = (ahora.getTime() - fechaMatch.getTime()) / (1000 * 60 * 60);
          const esNuevoMatch = horasDesdeMatch < 24 && match.estado === 'aceptado';

          return {
            match,
            otroUsuario,
            ultimoMensaje,
            noLeidos: 0, // Se actualizará con mensajesNoLeidos
            esNuevoMatch,
          };
        })
      );

      // Ordenar conversaciones: primero las que tienen mensajes no leídos, luego por fecha del último mensaje
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
        return (
          new Date(b.match.fechaMatch).getTime() -
          new Date(a.match.fechaMatch).getTime()
        );
      });

      setConversaciones(conversacionesData);
    } catch (error) {
      console.error('Error cargando matches:', error);
      throw error;
    }
  };

  /**
   * Cargar mensajes no leídos
   */
  const cargarMensajesNoLeidos = async () => {
    try {
      const noLeidos = await obtenerMensajesNoLeidos();
      setMensajesNoLeidos(noLeidos);

      // Actualizar conversaciones con cantidad de mensajes no leídos
      setConversaciones((prev) =>
        prev.map((conv) => {
          const noLeidosMatch = noLeidos.find((n) => n.matchId === conv.match.id);
          return {
            ...conv,
            noLeidos: noLeidosMatch?.noLeidos || 0,
          };
        })
      );
    } catch (error) {
      console.error('Error cargando mensajes no leídos:', error);
    }
  };

  /**
   * Manejar refresh manual
   */
  const manejarRefresh = () => {
    setRefrescando(true);
    cargarDatos();
  };

  /**
   * Filtrar conversaciones por búsqueda
   */
  const conversacionesFiltradas = conversaciones.filter((conv) =>
    conv.otroUsuario.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  /**
   * Formatear tiempo relativo
   */
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

  /**
   * Abrir chat con usuario
   */
  const abrirChat = (conversacion: Conversacion) => {
    navigation.navigate('Chat', { matchId: conversacion.match.id });
  };

  /**
   * Ir a pantalla de matching
   */
  const irAMatching = () => {
    // Navegar a la pantalla de matching
    // TODO: Implementar navegación cuando esté disponible
    Alert.alert('Matching', 'Navegar a la pantalla de matching');
  };

  /**
   * Renderizar elemento de conversación
   */
  const renderizarConversacion = ({ item }: { item: Conversacion }) => (
    <TouchableOpacity
      style={estilos.conversacionItem}
      onPress={() => abrirChat(item)}
      activeOpacity={0.7}
    >
      <Card
        style={[
          estilos.tarjetaConversacion,
          item.esNuevoMatch && estilos.nuevoMatch,
        ]}
      >
        <Card.Content style={estilos.contenidoConversacion}>
          {/* Avatar del usuario */}
          <View style={estilos.avatarContainer}>
            {item.otroUsuario.avatar ? (
              <Avatar.Image
                size={60}
                source={{ uri: item.otroUsuario.avatar }}
              />
            ) : (
              <Avatar.Text
                size={60}
                label={item.otroUsuario.nombre.charAt(0).toUpperCase()}
              />
            )}
            {item.esNuevoMatch && (
              <Badge style={estilos.badgeNuevo}>NUEVO</Badge>
            )}
            {item.noLeidos > 0 && (
              <Badge style={estilos.badgeNoLeidos}>{item.noLeidos}</Badge>
            )}
          </View>

          {/* Información de la conversación */}
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
                  📅 {item.match.eventoPropuesto.titulo}
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
      {/* Barra de búsqueda */}
      <Searchbar
        placeholder="Buscar conversaciones..."
        onChangeText={setBusqueda}
        value={busqueda}
        style={estilos.barraBusqueda}
        icon="search"
        clearIcon="close"
      />

      {/* Lista de conversaciones */}
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
              ¡Comienza a hacer matches para chatear!
            </Text>
          </View>
        }
      />

      {/* FAB para ir a matching */}
      <FAB
        icon="favorite"
        style={estilos.fab}
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
    paddingBottom: 100, // Espacio para el FAB
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
  },
  tiempo: {
    color: temaApp.colors.onSurfaceVariant,
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
