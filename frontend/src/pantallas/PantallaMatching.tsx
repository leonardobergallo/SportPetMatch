// Pantalla de Matching - Estilo Tinder para SportPetMatch
// Corrige el avance del stack y mejora la UX visual con imagenes de ejemplo

import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  ImageBackground,
  ImageSourcePropType,
  PanResponder,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { Avatar, Button, Card, Chip, Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { temaApp } from '../constantes/tema';
import { Coordenadas, useUbicacion } from '../contextos/ContextoUbicacion';
import { crearMatch, obtenerRecomendaciones } from '../servicios/servicioMatches';

interface UsuarioPotencial {
  id: string;
  nombre: string;
  edad: number;
  avatar: string | null;
  biografia: string;
  distancia: number;
  ubicacionCiudad: string;
  coordenadas: Coordenadas;
  intereses: string[];
  mascotas: {
    id: string;
    nombre: string;
    tipo: string;
    edad: number;
    foto: string | null;
  }[];
  esPremium: boolean;
  score?: number;
  interesesComunes?: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = Platform.OS === 'web'
  ? Math.min(SCREEN_HEIGHT * 0.66, 640)
  : SCREEN_HEIGHT * 0.76;
const SWIPE_THRESHOLD = 120;

/** Tipografia web (Plus Jakarta / Outfit), misma familia que Login/Registro/Inicio */
const fontSans = Platform.select({ web: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', default: undefined });
const fontDisplay = Platform.select({ web: '"Outfit", "Plus Jakarta Sans", system-ui, sans-serif', default: undefined });

const MATCH_SAMPLE_IMAGES: ImageSourcePropType[] = [
  require('../../assets/golden-retriever-playing.png'),
  require('../../assets/husky-running-mountain.jpg'),
  require('../../assets/labrador-playing-tennis.jpg'),
];

const PET_SAMPLE_IMAGES: ImageSourcePropType[] = [
  require('../../assets/placeholder-user.jpg'),
  require('../../assets/golden-retriever-playing.png'),
  require('../../assets/labrador-playing-tennis.jpg'),
];

function esUrlRemota(valor?: string | null): boolean {
  return !!valor && /^https?:\/\//i.test(valor);
}

function obtenerImagenFallback(index: number, opciones: ImageSourcePropType[]): ImageSourcePropType {
  return opciones[index % opciones.length];
}

function resolverImagenPrincipal(uri: string | null, index: number): ImageSourcePropType {
  return esUrlRemota(uri) ? { uri: uri as string } : obtenerImagenFallback(index, MATCH_SAMPLE_IMAGES);
}

function resolverImagenMascota(uri: string | null, index: number): ImageSourcePropType {
  return esUrlRemota(uri) ? { uri: uri as string } : obtenerImagenFallback(index, PET_SAMPLE_IMAGES);
}

export default function PantallaMatching(): JSX.Element {
  const navigation = useNavigation<any>();
  const [usuarios, setUsuarios] = useState<UsuarioPotencial[]>([]);
  const [usuarioActual, setUsuarioActual] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const { ubicacionActual, cargandoUbicacion } = useUbicacion();

  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const nextCardScale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    cargarUsuariosPotenciales();
  }, []);

  const resetAnimaciones = () => {
    pan.setValue({ x: 0, y: 0 });
    opacity.setValue(1);
    scale.setValue(1);
    nextCardScale.setValue(0.94);

    Animated.timing(nextCardScale, {
      toValue: 1,
      duration: 220,
      useNativeDriver: false,
    }).start();
  };

  const cargarUsuariosPotenciales = async () => {
    try {
      setCargando(true);
      setErrorCarga(null);
      setUsuarioActual(0);

      const recomendaciones = await obtenerRecomendaciones();
      const usuariosConvertidos: UsuarioPotencial[] = recomendaciones.map((usuario, idx) => ({
        id: usuario.id,
        nombre: usuario.nombre,
        edad: 25,
        avatar: usuario.avatar || null,
        biografia: usuario.biografia || 'Le gustan los paseos, los eventos y los encuentros con mascotas.',
        distancia: usuario.distancia || 0,
        ubicacionCiudad: usuario.ubicacionCiudad || 'Cerca tuyo',
        coordenadas: usuario.ubicacionLat && usuario.ubicacionLng
          ? { latitud: usuario.ubicacionLat, longitud: usuario.ubicacionLng }
          : { latitud: 0, longitud: 0 },
        intereses: usuario.intereses?.length ? usuario.intereses : ['paseos', 'chat', 'eventos'],
        mascotas: usuario.mascotas.map((m, mascotaIdx) => ({
          id: `${usuario.id}-mascota-${mascotaIdx}`,
          nombre: m.nombre,
          tipo: m.tipo,
          edad: 3,
          foto: m.fotos && m.fotos.length > 0 ? m.fotos[0] : null,
        })),
        esPremium: idx < 3,
        score: usuario.score,
        interesesComunes: usuario.interesesComunes,
      }));

      setUsuarios(usuariosConvertidos);
    } catch (error) {
      setUsuarios([]);
      setUsuarioActual(0);
      setErrorCarga(error instanceof Error ? error.message : 'No se pudieron cargar las recomendaciones');
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
      console.error('Error cargando usuarios:', error);
    } finally {
      setCargando(false);
    }
  };

  const avanzarStack = (usuarioId: string) => {
    const usuariosRestantes = usuarios.filter((u) => u.id !== usuarioId);
    setUsuarios(usuariosRestantes);
    setUsuarioActual(usuariosRestantes.length === 0 ? 0 : Math.min(usuarioActual, usuariosRestantes.length - 1));
    resetAnimaciones();

    if (usuariosRestantes.length === 0) {
      Alert.alert(
        'Sin mas usuarios',
        'Ya viste todas las recomendaciones por ahora.',
        [{ text: 'Buscar mas', onPress: () => cargarUsuariosPotenciales() }]
      );
    }
  };

  const navegarAlChat = (matchId: string) => {
    navigation.navigate('Matches', { openMatchId: matchId });
  };

  const enviarLike = async (usuarioId: string): Promise<boolean> => {
    try {
      const match = await crearMatch({
        usuarioMatchId: usuarioId,
      });

      if (match.estado === 'aceptado') {
        setUsuarios((prev) => prev.filter((u) => u.id !== usuarioId));
        navegarAlChat(match.id);
        return true;
      } else {
        Alert.alert(
          'Like enviado',
          'Si la otra persona tambien te da like, el chat se habilita automaticamente.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Error enviando like:', error);
      Alert.alert('Error', error.message || 'No se pudo enviar el like');
    }

    return false;
  };

  const enviarPass = async (usuarioId: string) => {
    try {
      console.log('Pass para usuario:', usuarioId);
    } catch (error) {
      console.error('Error enviando pass:', error);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    const usuario = usuarios[usuarioActual];
    if (!usuario) return;

    if (direction === 'right') {
      const abreChat = await enviarLike(usuario.id);
      if (abreChat) return;
    } else {
      await enviarPass(usuario.id);
    }

    avanzarStack(usuario.id);
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_evt, gestureState) =>
      Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5,
    onPanResponderGrant: () => {
      pan.setOffset({
        x: (pan.x as any)._value,
        y: (pan.y as any)._value,
      });
    },
    onPanResponderMove: (_evt, gestureState) => {
      pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      const newOpacity = 1 - Math.abs(gestureState.dx) / (SCREEN_WIDTH * 0.7);
      opacity.setValue(Math.max(0.5, newOpacity));
    },
    onPanResponderRelease: (_evt, gestureState) => {
      pan.flattenOffset();

      const swipeDirection =
        gestureState.dx > SWIPE_THRESHOLD
          ? 'right'
          : gestureState.dx < -SWIPE_THRESHOLD
            ? 'left'
            : null;

      if (swipeDirection) {
        const toValue = swipeDirection === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;

        Animated.parallel([
          Animated.timing(pan, {
            toValue: { x: toValue, y: gestureState.dy },
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start(() => {
          handleSwipe(swipeDirection);
        });
      } else {
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 180,
            useNativeDriver: false,
          }),
        ]).start();
      }
    },
  });

  const renderUsuarioCard = (usuario: UsuarioPotencial, index: number) => {
    if (index < usuarioActual) return null;

    const isCurrentCard = index === usuarioActual;
    const isNextCard = index === usuarioActual + 1;

    const cardStyle = isCurrentCard
      ? {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            {
              rotate: pan.x.interpolate({
                inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                outputRange: ['-18deg', '0deg', '18deg'],
              }),
            },
            { scale },
          ],
          opacity,
          zIndex: 3,
        }
      : isNextCard
        ? {
            transform: [{ scale: nextCardScale }],
            zIndex: 2,
          }
        : {
            transform: [{ scale: 0.9 }],
            zIndex: 1,
          };

    return (
      <Animated.View
        key={usuario.id}
        style={[estilos.card, cardStyle]}
        {...(isCurrentCard ? panResponder.panHandlers : {})}
      >
        <Card style={estilos.usuarioCard}>
          <ImageBackground
            source={resolverImagenPrincipal(usuario.avatar, index)}
            style={estilos.heroVisual}
            imageStyle={estilos.heroImage}
          >
            <View style={estilos.heroOverlay} />
            <View style={estilos.heroTopRow}>
              <Chip compact style={estilos.heroChip} textStyle={estilos.heroChipText}>
                {usuario.interesesComunes || 0} en comun
              </Chip>
              <Chip compact style={estilos.distanceChip} textStyle={estilos.distanceChipText}>
                {usuario.distancia.toFixed(1)} km
              </Chip>
            </View>

            <View style={estilos.heroBottom}>
              <View style={estilos.nombreEdadRow}>
                <Text variant="headlineMedium" style={estilos.nombreHero}>
                  {usuario.nombre}, {usuario.edad}
                </Text>
                {usuario.esPremium ? (
                  <MaterialIcons name="star" size={20} color="#FFD700" />
                ) : null}
              </View>
              <Text variant="bodyMedium" style={estilos.heroCiudad}>
                {usuario.ubicacionCiudad}
              </Text>
              <Text variant="bodyMedium" style={estilos.heroBio} numberOfLines={2}>
                {usuario.biografia}
              </Text>
            </View>
          </ImageBackground>

          <Card.Content style={estilos.cardContent}>
            <View style={estilos.compatibilityRow}>
              <View style={estilos.compatibilityLeft}>
                <MaterialIcons name="favorite" size={18} color={temaApp.colors.primary} />
                <Text variant="bodySmall" style={estilos.compatibilityText}>
                  {usuario.score || 0} puntos de afinidad
                </Text>
              </View>
              <Text variant="bodySmall" style={estilos.petCountText}>
                {usuario.mascotas.length} {usuario.mascotas.length === 1 ? 'mascota' : 'mascotas'}
              </Text>
            </View>

            <View style={estilos.interesesContainer}>
              {usuario.intereses.slice(0, 4).map((interes, idx) => (
                <Chip key={`${usuario.id}-${interes}-${idx}`} compact style={estilos.interesChip}>
                  {interes}
                </Chip>
              ))}
            </View>

            <View style={estilos.mascotasPanel}>
              <Text variant="titleSmall" style={estilos.mascotasTitle}>
                Fotos de ejemplo y companeros de plan
              </Text>
              <View style={estilos.mascotasList}>
                {usuario.mascotas.slice(0, 3).map((mascota, mascotaIdx) => (
                  <View key={mascota.id} style={estilos.mascotaItem}>
                    <Avatar.Image
                      size={52}
                      source={resolverImagenMascota(mascota.foto, index + mascotaIdx)}
                      style={estilos.mascotaAvatar}
                    />
                    <Text variant="bodySmall" style={estilos.mascotaNombre}>
                      {mascota.nombre}
                    </Text>
                    <Text variant="bodySmall" style={estilos.mascotaTipo}>
                      {mascota.tipo}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  if (cargando) {
    return (
      <View style={estilos.contenedorCarga}>
        <Text variant="bodyLarge">Buscando personas y mascotas compatibles...</Text>
      </View>
    );
  }

  if (usuarios.length === 0) {
    return (
      <View style={estilos.contenedorVacio}>
        <MaterialIcons name="pets" size={80} color={temaApp.colors.primary} />
        <Text variant="headlineSmall" style={estilos.textoVacio}>
          {errorCarga ? 'No se pudieron cargar las recomendaciones' : 'No hay usuarios disponibles'}
        </Text>
        <Text variant="bodyMedium" style={estilos.subtextoVacio}>
          {errorCarga || 'Completa tu perfil y volve mas tarde para ver nuevas personas cerca tuyo.'}
        </Text>
        <Button mode="contained" onPress={cargarUsuariosPotenciales} style={estilos.botonRecargar}>
          Buscar de nuevo
        </Button>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.headerUbicacion}>
        <View style={estilos.infoUbicacion}>
          <MaterialIcons name="location-on" size={16} color={temaApp.colors.primary} />
          <Text variant="bodySmall" style={estilos.textoUbicacion}>
            {cargandoUbicacion
              ? 'Obteniendo ubicacion...'
              : ubicacionActual
                ? `${ubicacionActual.ciudad}, ${ubicacionActual.provincia}`
                : 'Ubicacion no disponible'}
          </Text>
        </View>
        <Text variant="bodySmall" style={estilos.contadorUsuarios}>
          {usuarios.length} cerca
        </Text>
      </View>

      <View style={estilos.cardsContainer}>
        {(Platform.OS === 'web'
          ? usuarios.map((usuario, index) => ({ usuario, index })).filter(({ index }) => index === usuarioActual)
          : usuarios
              .map((usuario, index) => ({ usuario, index }))
              .filter(({ index }) => index === usuarioActual || index === usuarioActual + 1)
        ).map(({ usuario, index }) => renderUsuarioCard(usuario, index))}
      </View>

      <View style={estilos.botonesContainer}>
        <Button
          mode="outlined"
          onPress={() => handleSwipe('left')}
          style={estilos.botonPass}
          icon="close"
          textColor={temaApp.colors.pass}
          buttonColor="#fff"
        >
          Pasar
        </Button>
        <Button
          mode="contained"
          onPress={() => handleSwipe('right')}
          style={estilos.botonLike}
          icon="favorite"
          textColor="#fff"
          buttonColor={temaApp.colors.like}
        >
          Match
        </Button>
      </View>

      <View style={estilos.contadorContainer}>
        <Text variant="bodySmall" style={estilos.contador}>
          {Math.min(usuarioActual + 1, usuarios.length)} de {usuarios.length}
        </Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },
  headerUbicacion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EAF1',
  },
  infoUbicacion: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoUbicacion: {
    marginLeft: 5,
    color: temaApp.colors.onSurfaceVariant,
  },
  contadorUsuarios: {
    color: temaApp.colors.primary,
    fontWeight: '700',
  },
  contenedorCarga: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contenedorVacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textoVacio: {
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtextoVacio: {
    textAlign: 'center',
    color: temaApp.colors.onSurfaceVariant,
    marginBottom: 30,
  },
  botonRecargar: {
    backgroundColor: temaApp.colors.primary,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    overflow: 'hidden',
  },
  card: {
    position: 'absolute',
    width: Platform.OS === 'web' ? Math.min(SCREEN_WIDTH - 40, 930) : SCREEN_WIDTH - 40,
    height: CARD_HEIGHT,
  },
  usuarioCard: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  heroVisual: {
    height: Platform.OS === 'web' ? CARD_HEIGHT * 0.49 : CARD_HEIGHT * 0.58,
    justifyContent: 'space-between',
    padding: 18,
  },
  heroImage: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 24, 42, 0.34)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroChip: {
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  heroChipText: {
    color: '#172033',
    fontWeight: '700',
  },
  distanceChip: {
    backgroundColor: 'rgba(220, 38, 38, 0.92)',
  },
  distanceChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  heroBottom: {
    gap: 6,
  },
  nombreEdadRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nombreHero: {
    color: '#FFFFFF',
    fontWeight: '800',
    marginRight: 8,
    ...(fontDisplay ? { fontFamily: fontDisplay } : {}),
  },
  heroCiudad: {
    color: 'rgba(255,255,255,0.92)',
    fontWeight: '600',
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  heroBio: {
    color: '#FFFFFF',
    lineHeight: 20,
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'web' ? 16 : 18,
  },
  compatibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  compatibilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compatibilityText: {
    marginLeft: 6,
    color: temaApp.colors.primary,
    fontWeight: '700',
  },
  petCountText: {
    color: temaApp.colors.onSurfaceVariant,
    fontWeight: '600',
  },
  interesesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  interesChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F4ECFF',
  },
  mascotasPanel: {
    backgroundColor: '#F8F9FD',
    borderRadius: 20,
    padding: 12,
  },
  mascotasTitle: {
    marginBottom: 10,
    fontWeight: '700',
    color: temaApp.colors.onSurface,
    ...(fontDisplay ? { fontFamily: fontDisplay } : {}),
  },
  mascotasList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mascotaItem: {
    width: 82,
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  mascotaAvatar: {
    marginBottom: 6,
  },
  mascotaNombre: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  mascotaTipo: {
    fontSize: 10,
    color: temaApp.colors.onSurfaceVariant,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  botonesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 40,
  },
  botonPass: {
    borderColor: temaApp.colors.pass,
    borderWidth: 2,
    borderRadius: 30,
    paddingHorizontal: 26,
    paddingVertical: 10,
    marginRight: 12,
  },
  botonLike: {
    borderRadius: 30,
    paddingHorizontal: 26,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: temaApp.colors.like,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  contadorContainer: {
    position: 'absolute',
    top: 56,
    right: 18,
    backgroundColor: 'rgba(12, 18, 30, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  contador: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
