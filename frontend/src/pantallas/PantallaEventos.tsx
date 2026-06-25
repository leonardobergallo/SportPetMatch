// Pantalla de Eventos de SportPetMatch
// Adaptada con nuevos componentes y servicios API

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  Pressable,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Importar componentes UI
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Importar servicios y tema
import { obtenerEventos, Evento, participarEnEvento } from '@/servicios/servicioEventos';
import { temaApp, espaciado, sombras } from '@/constantes/tema';
import { RootStackParamList } from '@/navegacion/NavegacionPrincipal';
import { useAuth } from '@/contextos/ContextoAuth';

type EventosScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Imágenes de eventos
const imagenesEventos: Record<string, any> = {
  golden: require('../../assets/golden-retriever-playing.png'),
  husky: require('../../assets/husky-running-mountain.jpg'),
  labrador: require('../../assets/labrador-playing-tennis.jpg'),
  default: require('../../assets/golden-retriever-playing.png'),
};

/**
 * Pantalla de Eventos - Lista de eventos pet-friendly
 */
export default function PantallaEventos(): JSX.Element {
  const navigation = useNavigation<EventosScreenNavigationProp>();
  const { estaAutenticado, usuario } = useAuth();

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);

  useEffect(() => {
    cargarEventos();
  }, [filtroTipo]);

  /**
   * Cargar eventos desde la API
   */
  const cargarEventos = async () => {
    try {
      setCargando(true);
      const datosEventos = await obtenerEventos(
        filtroTipo ? { tipo: filtroTipo } : undefined
      );
      setEventos(datosEventos);
    } catch (error: any) {
      console.error('Error cargando eventos:', error);
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
    cargarEventos();
  };

  /**
   * Obtener imagen del evento según su tipo
   */
  const obtenerImagenEvento = (tipo: string): any => {
    const tipoLower = tipo.toLowerCase();
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
  };

  const resolverImagenEvento = (evento: Evento): any => {
    if (evento.imagenUrl && (/^https?:\/\//i.test(evento.imagenUrl) || /^data:image\//i.test(evento.imagenUrl))) {
      return { uri: evento.imagenUrl };
    }
    return obtenerImagenEvento(evento.tipo);
  };

  /**
   * Formatear fecha
   */
  const formatearFecha = (fecha: string): string => {
    const date = new Date(fecha);
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${dias[date.getDay()]}, ${date.getDate()} ${meses[date.getMonth()]}`;
  };

  /**
   * Manejar participación en evento
   */
  const manejarParticipar = async (eventoId: string) => {
    if (!estaAutenticado) {
      Alert.alert('Autenticación requerida', 'Debes iniciar sesión para participar en eventos');
      return;
    }

    const evento = eventos.find((item) => item.id === eventoId);
    if (evento && usuario && evento.organizadorId === usuario.id) {
      Alert.alert('Este es tu evento', 'Como organizador no necesitas unirte como participante.');
      return;
    }

    try {
      await participarEnEvento(eventoId);
      Alert.alert('¡Éxito!', 'Te has unido al evento exitosamente');
      cargarEventos(); // Recargar eventos
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message ||
        error?.message ||
        'No se pudo unir al evento';
      Alert.alert('Aviso', mensaje);
    }
  };

  /**
   * Navegar a detalle de evento
   */
  const navegarADetalle = (eventoId: string) => {
    navigation.navigate('DetalleEvento', { eventoId });
  };

  /**
   * Navegar a crear evento
   */
  const navegarACrearEvento = () => {
    if (!estaAutenticado) {
      Alert.alert('Autenticación requerida', 'Debes iniciar sesión para crear eventos');
      return;
    }
    navigation.navigate('CrearEvento');
  };

  if (cargando && eventos.length === 0) {
    return (
      <View style={estilos.centrado}>
        <Text>Cargando eventos...</Text>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      {/* Header con filtros y botón crear */}
      <View style={estilos.header}>
        <View style={estilos.filtrosContainer}>
          <TouchableOpacity
            style={[estilos.filtroChip, !filtroTipo && estilos.filtroChipActivo]}
            onPress={() => setFiltroTipo(null)}
          >
            <Text style={[estilos.filtroTexto, !filtroTipo && estilos.filtroTextoActivo]}>
              Todos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[estilos.filtroChip, filtroTipo === 'paseo' && estilos.filtroChipActivo]}
            onPress={() => setFiltroTipo('paseo')}
          >
            <Text style={[estilos.filtroTexto, filtroTipo === 'paseo' && estilos.filtroTextoActivo]}>
              Paseos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[estilos.filtroChip, filtroTipo === 'parque' && estilos.filtroChipActivo]}
            onPress={() => setFiltroTipo('parque')}
          >
            <Text style={[estilos.filtroTexto, filtroTipo === 'parque' && estilos.filtroTextoActivo]}>
              Parques
            </Text>
          </TouchableOpacity>
        </View>
        {estaAutenticado && (
          <Button
            variant="secondary"
            size="sm"
            icon="add"
            onPress={navegarACrearEvento}
          >
            Crear
          </Button>
        )}
      </View>

      {/* Lista de eventos */}
      <ScrollView
        style={estilos.scrollView}
        contentContainerStyle={estilos.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={manejarRefresh}
            colors={[temaApp.colors.primary]}
          />
        }
      >
        {eventos.length === 0 ? (
          <View style={estilos.vacio}>
            <MaterialIcons name="event-busy" size={60} color={temaApp.colors.onSurfaceVariant} />
            <Text style={estilos.textoVacio}>No hay eventos disponibles</Text>
            <Text style={estilos.subtextoVacio}>
              {filtroTipo ? 'Intenta cambiar el filtro' : 'Crea el primer evento!'}
            </Text>
          </View>
        ) : (
          eventos.map((evento) => (
            <Card key={evento.id} style={estilos.cardEvento}>
              <Pressable
                onPress={() => navegarADetalle(evento.id)}
                style={estilos.cardPressable}
              >
                <View style={estilos.imagenContainer}>
                  <Image
                    source={resolverImagenEvento(evento)}
                    style={estilos.imagenEvento}
                    resizeMode="cover"
                  />
                  {evento.esPremium && (
                    <View style={estilos.badgePremium}>
                      <MaterialIcons name="star" size={14} color="#FFD700" />
                      <Text style={estilos.badgePremiumTexto}>Premium</Text>
                    </View>
                  )}
                  {evento.esPetFriendly && (
                    <View style={estilos.badgePet}>
                      <Text style={estilos.badgePetTexto}>🐾 Pet Friendly</Text>
                    </View>
                  )}
                </View>
                <CardContent>
                  <Text style={estilos.tituloEvento}>{evento.titulo}</Text>
                  <Text style={estilos.descripcionEvento} numberOfLines={2}>
                    {evento.descripcion}
                  </Text>
                  <View style={estilos.infoEvento}>
                    <View style={estilos.infoItem}>
                      <MaterialIcons name="event" size={16} color={temaApp.colors.primary} />
                      <Text style={estilos.infoTexto}>{formatearFecha(evento.fechaInicio)}</Text>
                    </View>
                    <View style={estilos.infoItem}>
                      <MaterialIcons name="people" size={16} color={temaApp.colors.primary} />
                      <Text style={estilos.infoTexto}>
                        {evento.participantesCount || 0} participantes
                      </Text>
                    </View>
                  </View>
                </CardContent>
              </Pressable>
              {estaAutenticado && (
                <View style={estilos.footerAcciones}>
                  <Button
                    variant="default"
                    size="sm"
                    onPress={() => manejarParticipar(evento.id)}
                    style={estilos.botonParticipar}
                  >
                    Unirse
                  </Button>
                </View>
              )}
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: espaciado.md,
    backgroundColor: temaApp.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: temaApp.colors.border,
  },
  filtrosContainer: {
    flexDirection: 'row',
    gap: espaciado.sm,
    flex: 1,
  },
  filtroChip: {
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
    borderRadius: 20,
    backgroundColor: temaApp.colors.muted || '#EDEDED',
    borderWidth: 1,
    borderColor: temaApp.colors.border,
  },
  filtroChipActivo: {
    backgroundColor: temaApp.colors.primary,
    borderColor: temaApp.colors.primary,
  },
  filtroTexto: {
    fontSize: 14,
    color: temaApp.colors.onSurface,
  },
  filtroTextoActivo: {
    color: temaApp.colors.onPrimary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 80,
  },
  cardEvento: {
    marginBottom: 12,
    overflow: 'hidden',
    ...sombras.media,
  },
  cardPressable: {
    width: '100%',
  },
  imagenContainer: {
    height: 180,
    position: 'relative',
    overflow: 'hidden',
  },
  imagenEvento: {
    width: '100%',
    height: '100%',
  },
  badgePremium: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePremiumTexto: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  badgePet: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: temaApp.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePetTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tituloEvento: {
    fontSize: 16,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    marginBottom: 4,
  },
  descripcionEvento: {
    fontSize: 13,
    color: temaApp.colors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 8,
  },
  infoEvento: {
    flexDirection: 'row',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoTexto: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
  },
  botonParticipar: {
    width: '100%',
  },
  footerAcciones: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 4,
  },
  vacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: espaciado.xl,
  },
  textoVacio: {
    fontSize: 18,
    fontWeight: '600',
    color: temaApp.colors.onSurface,
    marginTop: espaciado.md,
  },
  subtextoVacio: {
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: espaciado.sm,
    textAlign: 'center',
  },
});
