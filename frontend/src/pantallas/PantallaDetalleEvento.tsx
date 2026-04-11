// Pantalla de Detalle de Evento - SportPetMatch
// Muestra información completa de un evento pet-friendly

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Avatar,
  Chip,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Importar servicios y tema
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import {
  obtenerEvento,
  participarEnEvento,
  salirDeEvento,
  eliminarEvento,
  Evento,
} from '../servicios/servicioEventos';
import { temaApp, espaciado, sombras } from '../constantes/tema';
import { useAuth } from '../contextos/ContextoAuth';

type DetalleEventoRouteProp = RouteProp<RootStackParamList, 'DetalleEvento'>;
type DetalleEventoNavigationProp = StackNavigationProp<RootStackParamList, 'DetalleEvento'>;

// Imágenes de eventos
const imagenesEventos: Record<string, any> = {
  golden: require('../../assets/golden-retriever-playing.png'),
  husky: require('../../assets/husky-running-mountain.jpg'),
  labrador: require('../../assets/labrador-playing-tennis.jpg'),
  default: require('../../assets/golden-retriever-playing.png'),
};

function resolverImagenEvento(evento: Evento): any {
  if (evento.imagenUrl && (/^https?:\/\//i.test(evento.imagenUrl) || /^data:image\//i.test(evento.imagenUrl))) {
    return { uri: evento.imagenUrl };
  }

  const tipoLower = evento.tipo.toLowerCase();
  if (tipoLower.includes('parque') || tipoLower.includes('encuentro')) {
    return imagenesEventos.golden;
  }
  if (tipoLower.includes('paseo') || tipoLower.includes('caminata')) {
    return imagenesEventos.husky;
  }
  if (tipoLower.includes('cafe') || tipoLower.includes('merienda')) {
    return imagenesEventos.labrador;
  }
  return imagenesEventos.default;
}

/**
 * Pantalla de Detalle de Evento
 */
export default function PantallaDetalleEvento(): JSX.Element {
  const navigation = useNavigation<DetalleEventoNavigationProp>();
  const route = useRoute<DetalleEventoRouteProp>();
  const { eventoId } = route.params;
  const { usuario, estaAutenticado } = useAuth();

  const [evento, setEvento] = useState<Evento | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [esParticipante, setEsParticipante] = useState(false);

  useEffect(() => {
    cargarEvento();
  }, [eventoId]);

  /**
   * Cargar información del evento
   */
  const cargarEvento = async () => {
    try {
      setCargando(true);
      const datosEvento = await obtenerEvento(eventoId);
      setEvento(datosEvento);
      
      // Verificar si el usuario es participante
      setEsParticipante(!!(estaAutenticado && usuario && datosEvento.participantesIds?.includes(usuario.id)));
    } catch (error: any) {
      console.error('Error cargando evento:', error);
      Alert.alert('Error', 'No se pudo cargar la información del evento');
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
    cargarEvento();
  };

  /**
   * Participar en el evento
   */
  const manejarParticipar = async () => {
    if (!estaAutenticado) {
      Alert.alert('Autenticación requerida', 'Debes iniciar sesión para participar en eventos');
      return;
    }

    if (evento && usuario && evento.organizadorId === usuario.id) {
      Alert.alert('Este es tu evento', 'Como organizador no necesitas unirte como participante.');
      return;
    }

    try {
      setProcesando(true);
      await participarEnEvento(eventoId);
      Alert.alert('¡Éxito!', 'Te has unido al evento exitosamente');
      cargarEvento();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo unir al evento');
    } finally {
      setProcesando(false);
    }
  };

  /**
   * Salir del evento
   */
  const manejarSalir = async () => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que quieres salir de este evento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcesando(true);
              await salirDeEvento(eventoId);
              Alert.alert('Éxito', 'Has salido del evento');
              cargarEvento();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo salir del evento');
            } finally {
              setProcesando(false);
            }
          },
        },
      ]
    );
  };

  /**
   * Eliminar evento (solo si es organizador)
   */
  const manejarEliminar = async () => {
    if (!evento || !usuario || evento.organizadorId !== usuario.id) {
      return;
    }

    Alert.alert(
      'Eliminar Evento',
      '¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcesando(true);
              await eliminarEvento(eventoId);
              Alert.alert('Éxito', 'Evento eliminado exitosamente');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudo eliminar el evento');
            } finally {
              setProcesando(false);
            }
          },
        },
      ]
    );
  };

  /**
   * Formatear fecha completa
   */
  const formatearFecha = (fecha: string): string => {
    const date = new Date(fecha);
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return `${dias[date.getDay()]}, ${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
  };

  /**
   * Formatear hora
   */
  const formatearHora = (fecha: string): string => {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  /**
   * Obtener nivel de dificultad en texto
   */
  const obtenerNivelDificultad = (nivel: number): string => {
    const niveles = ['Muy relajado', 'Relajado', 'Intermedio', 'Activo', 'Muy activo'];
    return niveles[nivel - 1] || 'Desconocido';
  };

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color={temaApp.colors.primary} />
        <Text style={estilos.textoCarga}>Cargando evento...</Text>
      </View>
    );
  }

  if (!evento) {
    return (
      <View style={estilos.centrado}>
        <MaterialIcons name="error-outline" size={60} color={temaApp.colors.error} />
        <Text style={estilos.textoError}>No se pudo cargar el evento</Text>
        <Button onPress={cargarEvento} style={estilos.botonReintentar}>
          Reintentar
        </Button>
      </View>
    );
  }

  const esOrganizador = estaAutenticado && usuario && evento.organizadorId === usuario.id;
  const puedeParticipar = estaAutenticado && !esOrganizador && !esParticipante;
  const cuposDisponibles =
    evento.maxParticipantes && evento.participantesCount
      ? evento.maxParticipantes - evento.participantesCount
      : null;

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
      {/* Imagen del evento */}
      <View style={estilos.imagenContainer}>
        <Image
          source={resolverImagenEvento(evento)}
          style={estilos.imagenEvento}
          resizeMode="cover"
        />
        {evento.esPremium && (
          <View style={estilos.badgePremium}>
            <MaterialIcons name="star" size={16} color="#FFD700" />
            <Text style={estilos.badgePremiumTexto}>Premium</Text>
          </View>
        )}
        {evento.esPetFriendly && (
          <View style={estilos.badgePet}>
            <Text style={estilos.badgePetTexto}>🐾 Pet Friendly</Text>
          </View>
        )}
      </View>

      {/* Información principal */}
      <Card style={estilos.card}>
        <Card.Content>
          <Text style={estilos.titulo}>{evento.titulo}</Text>
          <Text style={estilos.descripcion}>{evento.descripcion}</Text>

          <Divider style={estilos.divisor} />

          {/* Información del evento */}
          <View style={estilos.infoContainer}>
            <View style={estilos.infoItem}>
              <MaterialIcons name="event" size={20} color={temaApp.colors.primary} />
              <View style={estilos.infoTextoContainer}>
                <Text style={estilos.infoLabel}>Fecha</Text>
                <Text style={estilos.infoValor}>{formatearFecha(evento.fechaInicio)}</Text>
                <Text style={estilos.infoSubtexto}>{formatearHora(evento.fechaInicio)}</Text>
              </View>
            </View>

            {evento.duracion && (
              <View style={estilos.infoItem}>
                <MaterialIcons name="schedule" size={20} color={temaApp.colors.primary} />
                <View style={estilos.infoTextoContainer}>
                  <Text style={estilos.infoLabel}>Duración</Text>
                  <Text style={estilos.infoValor}>{evento.duracion} minutos</Text>
                </View>
              </View>
            )}

            <View style={estilos.infoItem}>
              <MaterialIcons name="pets" size={20} color={temaApp.colors.primary} />
              <View style={estilos.infoTextoContainer}>
                <Text style={estilos.infoLabel}>Ritmo sugerido</Text>
                <Text style={estilos.infoValor}>
                  {obtenerNivelDificultad(evento.nivelDificultad)}
                </Text>
              </View>
            </View>

            <View style={estilos.infoItem}>
              <MaterialIcons name="people" size={20} color={temaApp.colors.primary} />
              <View style={estilos.infoTextoContainer}>
                <Text style={estilos.infoLabel}>Participantes</Text>
                <Text style={estilos.infoValor}>
                  {evento.participantesCount || 0}
                  {evento.maxParticipantes ? ` / ${evento.maxParticipantes}` : ''}
                </Text>
                {cuposDisponibles !== null && cuposDisponibles > 0 && (
                  <Text style={estilos.infoSubtexto}>
                    {cuposDisponibles} cupos disponibles
                  </Text>
                )}
              </View>
            </View>

            {evento.precio && evento.precio > 0 && (
              <View style={estilos.infoItem}>
                <MaterialIcons name="attach-money" size={20} color={temaApp.colors.primary} />
                <View style={estilos.infoTextoContainer}>
                  <Text style={estilos.infoLabel}>Precio</Text>
                  <Text style={estilos.infoValor}>${evento.precio}</Text>
                </View>
              </View>
            )}
          </View>

          <Divider style={estilos.divisor} />

          {/* Organizador */}
          {evento.organizador && (
            <View style={estilos.organizadorContainer}>
              <Text style={estilos.organizadorLabel}>Organizado por:</Text>
              <View style={estilos.organizadorInfo}>
                <Avatar.Image
                  size={40}
                  source={{
                    uri: evento.organizador.avatar || 'https://via.placeholder.com/40',
                  }}
                />
                <Text style={estilos.organizadorNombre}>{evento.organizador.nombre}</Text>
              </View>
            </View>
          )}

          {/* Botones de acción */}
          <View style={estilos.botonesContainer}>
            {esOrganizador ? (
              <Button
                mode="outlined"
                onPress={manejarEliminar}
                disabled={procesando}
                icon="delete"
                textColor={temaApp.colors.error}
                style={estilos.botonEliminar}
              >
                Eliminar Evento
              </Button>
            ) : esParticipante ? (
              <Button
                mode="outlined"
                onPress={manejarSalir}
                disabled={procesando}
                icon="exit-to-app"
                style={estilos.botonSalir}
              >
                Salir del Evento
              </Button>
            ) : puedeParticipar ? (
              <Button
                mode="contained"
                onPress={manejarParticipar}
                disabled={procesando || (cuposDisponibles !== null && cuposDisponibles === 0)}
                icon="person-add"
                style={estilos.botonParticipar}
              >
                {procesando ? 'Procesando...' : 'Unirse al Evento'}
              </Button>
            ) : null}

            {!estaAutenticado && (
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Login')}
                style={estilos.botonParticipar}
              >
                Inicia Sesión para Participar
              </Button>
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
  imagenContainer: {
    height: 250,
    position: 'relative',
  },
  imagenEvento: {
    width: '100%',
    height: '100%',
  },
  badgePremium: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgePremiumTexto: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  badgePet: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: temaApp.colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgePetTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    margin: espaciado.md,
    ...sombras.media,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.sm,
  },
  descripcion: {
    fontSize: 16,
    color: temaApp.colors.onSurfaceVariant,
    lineHeight: 24,
    marginBottom: espaciado.md,
  },
  divisor: {
    marginVertical: espaciado.md,
  },
  infoContainer: {
    gap: espaciado.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espaciado.md,
  },
  infoTextoContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    textTransform: 'uppercase',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValor: {
    fontSize: 16,
    color: temaApp.colors.onSurface,
    fontWeight: '600',
  },
  infoSubtexto: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: 2,
  },
  organizadorContainer: {
    marginTop: espaciado.sm,
  },
  organizadorLabel: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    textTransform: 'uppercase',
    fontWeight: '500',
    marginBottom: espaciado.sm,
  },
  organizadorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
  },
  organizadorNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: temaApp.colors.onSurface,
  },
  botonesContainer: {
    marginTop: espaciado.lg,
    gap: espaciado.sm,
  },
  botonParticipar: {
    marginTop: espaciado.sm,
  },
  botonSalir: {
    marginTop: espaciado.sm,
  },
  botonEliminar: {
    marginTop: espaciado.sm,
  },
});

