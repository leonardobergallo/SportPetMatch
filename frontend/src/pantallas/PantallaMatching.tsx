// Pantalla de Matching - Estilo Tinder para SportPetMatch
// Permite hacer swipe entre usuarios y sus mascotas para crear conexiones

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  PanResponder,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Avatar,
  Chip,
  IconButton,
  Surface
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

// Importar tema y contexto de ubicación
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { temaApp } from '../constantes/tema';
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import { useUbicacion, formatearDistancia, Coordenadas } from '../contextos/ContextoUbicacion';
import { obtenerRecomendaciones, crearMatch, UsuarioRecomendado } from '../servicios/servicioMatches';

type MatchingScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Tipos para usuarios potenciales
interface UsuarioPotencial {
  id: string;
  nombre: string;
  edad: number;
  avatar: string;
  biografia: string;
  distancia: number; // km
  ubicacionCiudad: string;
  coordenadas: Coordenadas; // Añadir coordenadas reales
  intereses: string[];
  mascotas: {
    id: string;
    nombre: string;
    tipo: string;
    edad: number;
    foto: string;
  }[];
  esPremium: boolean;
  score?: number;
  interesesComunes?: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = Platform.OS === 'web'
  ? Math.min(SCREEN_HEIGHT * 0.64, 620)
  : SCREEN_HEIGHT * 0.75;
const SWIPE_THRESHOLD = 120;

/**
 * Pantalla principal de matching tipo Tinder
 * Permite hacer swipe en usuarios para crear matches
 */
export default function PantallaMatching(): JSX.Element {
  const navigation = useNavigation<MatchingScreenNavigationProp>();
  const [usuarios, setUsuarios] = useState<UsuarioPotencial[]>([]);
  const [usuarioActual, setUsuarioActual] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  
  // Usar contexto de ubicación
  const { 
    ubicacionActual, 
    coordenadas, 
    calcularDistancia, 
    solicitarPermisos,
    permisoUbicacion,
    cargandoUbicacion 
  } = useUbicacion();
  
  // Animaciones para el swipe
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const nextCardScale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Cargar usuarios potenciales al iniciar
  useEffect(() => {
    cargarUsuariosPotenciales();
  }, []);

  /**
   * Carga usuarios potenciales desde el backend
   */
  const cargarUsuariosPotenciales = async () => {
    try {
      setCargando(true);
      setErrorCarga(null);
      setUsuarioActual(0);

      const recomendaciones = await obtenerRecomendaciones();
      const usuariosConvertidos = recomendaciones.map((usuario, idx) => ({
        id: usuario.id,
        nombre: usuario.nombre,
        edad: 25, // TODO: Agregar edad al backend
        avatar: usuario.avatar || 'https://via.placeholder.com/400',
        biografia: usuario.biografia || 'Sin biografía',
        distancia: usuario.distancia || 0,
        ubicacionCiudad: usuario.ubicacionCiudad || 'Desconocida',
        coordenadas: usuario.ubicacionLat && usuario.ubicacionLng
          ? { latitud: usuario.ubicacionLat, longitud: usuario.ubicacionLng }
          : { latitud: 0, longitud: 0 },
        intereses: usuario.intereses,
        mascotas: usuario.mascotas.map((m, mascotaIdx) => ({
          id: `${usuario.id}-mascota-${mascotaIdx}`,
          nombre: m.nombre,
          tipo: m.tipo,
          edad: 3, // TODO: Agregar edad al backend
          foto: m.fotos && m.fotos.length > 0 ? m.fotos[0] : 'https://via.placeholder.com/300'
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

  /**
   * Configuración del PanResponder para manejar gestos de swipe
   */
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
    },
    
    onPanResponderGrant: () => {
      pan.setOffset({
        x: (pan.x as any)._value,
        y: (pan.y as any)._value,
      });
    },
    
    onPanResponderMove: (evt, gestureState) => {
      pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      
      // Calcular rotación y opacidad basada en la posición X
      const rotation = gestureState.dx * 0.1;
      const newOpacity = 1 - Math.abs(gestureState.dx) / (SCREEN_WIDTH * 0.7);
      
      opacity.setValue(Math.max(0.5, newOpacity));
    },
    
    onPanResponderRelease: (evt, gestureState) => {
      pan.flattenOffset();
      
      const swipeDirection = gestureState.dx > SWIPE_THRESHOLD ? 'right' : 
                           gestureState.dx < -SWIPE_THRESHOLD ? 'left' : null;
      
      if (swipeDirection) {
        // Animación de salida
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
          })
        ]).start(() => {
          handleSwipe(swipeDirection);
        });
      } else {
        // Volver a la posición original
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          })
        ]).start();
      }
    },
  });

  /**
   * Maneja el resultado del swipe
   */
  const handleSwipe = async (direction: 'left' | 'right') => {
    const usuario = usuarios[usuarioActual];
    
    if (direction === 'right') {
      // Like - enviar match al backend
      await enviarLike(usuario.id);
    } else {
      // Pass - registrar rechazo
      await enviarPass(usuario.id);
    }
    
    // Pasar al siguiente usuario
    siguienteUsuario();
  };

  /**
   * Envía un like al backend
   */
  const enviarLike = async (usuarioId: string) => {
    try {
      const match = await crearMatch({
        usuarioMatchId: usuarioId,
      });
      
      // Eliminar el usuario de la lista de recomendaciones para evitar duplicados
      setUsuarios(prev => prev.filter(u => u.id !== usuarioId));
      
      // Si el match fue aceptado (ambos se gustaron), mostrar alerta
      if (match.estado === 'aceptado') {
        Alert.alert(
          '🎉 ¡Es un Match!',
          `¡Ambos se han gustado! Ahora pueden empezar a chatear.`,
          [
            { text: 'Genial!' },
            {
              text: 'Ir al Chat',
              onPress: () => {
                navigation.navigate('Chat', { matchId: match.id });
              },
            },
          ]
        );
      } else {
        // Match pendiente - mostrar mensaje informativo
        Alert.alert(
          'Like enviado',
          'Has enviado un like. Si la otra persona también te da like, será un match.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('Error enviando like:', error);
      // Si el error es que ya existe un match, eliminar el usuario de la lista igualmente
      if (error.message?.includes('Ya existe un match') || error.response?.status === 409) {
        setUsuarios(prev => prev.filter(u => u.id !== usuarioId));
      }
      Alert.alert('Error', error.message || 'No se pudo enviar el like');
    }
  };

  /**
   * Envía un pass al backend (no hacer match)
   */
  const enviarPass = async (usuarioId: string) => {
    // Eliminar el usuario de la lista de recomendaciones
    setUsuarios(prev => prev.filter(u => u.id !== usuarioId));
    try {
      // Un pass simplemente no crea un match, no necesitamos llamar a la API
      // Solo continuamos al siguiente usuario
      console.log('Pass para usuario:', usuarioId);
    } catch (error) {
      console.error('Error enviando pass:', error);
    }
  };

  /**
   * Avanza al siguiente usuario
   */
  const siguienteUsuario = () => {
    if (usuarioActual < usuarios.length - 1) {
      setUsuarioActual(usuarioActual + 1);
      
      // Reset animaciones
      pan.setValue({ x: 0, y: 0 });
      opacity.setValue(1);
      scale.setValue(1);
      nextCardScale.setValue(0.9);
      
      // Animar siguiente card
      Animated.timing(nextCardScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      // No hay más usuarios
      Alert.alert(
        'Sin más usuarios',
        'Has visto todos los usuarios disponibles. ¡Intenta más tarde!',
        [{ text: 'OK', onPress: () => cargarUsuariosPotenciales() }]
      );
      setUsuarioActual(0);
    }
  };

  /**
   * Renderiza una card de usuario
   */
  const renderUsuarioCard = (usuario: UsuarioPotencial, index: number) => {
    if (index < usuarioActual) return null;
    
    const isCurrentCard = index === usuarioActual;
    const isNextCard = index === usuarioActual + 1;
    
    const cardStyle = isCurrentCard ? {
      transform: [
        { translateX: pan.x },
        { translateY: pan.y },
        { rotate: pan.x.interpolate({
          inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          outputRange: ['-30deg', '0deg', '30deg'],
        }) },
        { scale },
      ],
      opacity,
      zIndex: 3,
    } : isNextCard ? {
      transform: [{ scale: nextCardScale }],
      zIndex: 2,
    } : {
      transform: [{ scale: 0.8 }],
      zIndex: 1,
    };
    
    return (
      <Animated.View
        key={usuario.id}
        style={[estilos.card, cardStyle]}
        {...(isCurrentCard ? panResponder.panHandlers : {})}
      >
        <Card style={estilos.usuarioCard}>
          <Card.Cover 
            source={{ uri: usuario.avatar }} 
            style={estilos.avatar}
          />
          <Card.Content style={estilos.cardContent}>
            {/* Header con nombre y premium */}
            <View style={estilos.headerCard}>
              <View style={estilos.nombreContainer}>
                <MaterialIcons name="pets" size={20} color={temaApp.colors.primary} />
                <Text variant="bodySmall" style={estilos.mascotaCount}>
                  {usuario.mascotas.length} {usuario.mascotas.length === 1 ? 'mascota' : 'mascotas'}
                </Text>
              </View>
              <Chip mode="outlined" compact style={estilos.distanciaChip}>
                📍 {usuario.distancia.toFixed(1)} km
              </Chip>
            </View>
            
            {/* Nombre y edad */}
            <View style={estilos.nombreEdadContainer}>
              <Text variant="headlineSmall" style={estilos.nombre}>
                {usuario.nombre}, {usuario.edad}
              </Text>
              {usuario.esPremium && (
                <MaterialIcons name="star" size={20} color="#FFD700" />
              )}
            </View>
            
            {/* Biografía */}
            <Text variant="bodyMedium" style={estilos.biografia} numberOfLines={3}>
              {usuario.biografia}
            </Text>
            
            {/* Intereses */}
            <View style={estilos.interesesContainer}>
              {usuario.intereses.slice(0, 3).map((interes, idx) => (
                <Chip 
                  key={idx} 
                  mode="outlined" 
                  compact 
                  style={estilos.interesChip}
                >
                  {interes}
                </Chip>
              ))}
            </View>
            
            {/* Mascotas */}
            <View style={estilos.mascotasContainer}>
              <Text variant="titleSmall" style={estilos.mascotasTitle}>
                🐾 Sus mascotas:
              </Text>
              <View style={estilos.mascotasList}>
                {usuario.mascotas.map((mascota) => (
                  <View key={mascota.id} style={estilos.mascotaItem}>
                    <Avatar.Image 
                      size={40} 
                      source={{ uri: mascota.foto }}
                      style={estilos.mascotaAvatar}
                    />
                    <Text variant="bodySmall" style={estilos.mascotaNombre}>
                      {mascota.nombre} ({mascota.tipo})
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
        <Text variant="bodyLarge">Buscando personas increíbles cerca tuyo... 🔍</Text>
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
          {errorCarga
            ? errorCarga
            : 'Completa tu perfil y vuelve más tarde para ver nuevas personas cerca tuyo.'}
        </Text>
        <Button 
          mode="contained" 
          onPress={cargarUsuariosPotenciales}
          style={estilos.botonRecargar}
        >
          Buscar de nuevo
        </Button>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      {/* Header con información de ubicación */}
      <View style={estilos.headerUbicacion}>
        <View style={estilos.infoUbicacion}>
          <MaterialIcons name="location-on" size={16} color={temaApp.colors.primary} />
          <Text variant="bodySmall" style={estilos.textoUbicacion}>
            {cargandoUbicacion 
              ? 'Obteniendo ubicación...' 
              : ubicacionActual 
                ? `${ubicacionActual.ciudad}, ${ubicacionActual.provincia}`
                : 'Ubicación no disponible'
            }
          </Text>
        </View>
        <Text variant="bodySmall" style={estilos.contadorUsuarios}>
          {usuarios.length > 0 ? `${usuarios.length} usuarios cerca` : 'Sin usuarios'}
        </Text>
      </View>
      
      {/* Stack de cards */}
      <View style={estilos.cardsContainer}>
        {(Platform.OS === 'web'
          ? usuarios
              .map((usuario, index) => ({ usuario, index }))
              .filter(({ index }) => index === usuarioActual)
          : usuarios
              .map((usuario, index) => ({ usuario, index }))
              .filter(({ index }) => index === usuarioActual || index === usuarioActual + 1)
        ).map(({ usuario, index }) => renderUsuarioCard(usuario, index))}
      </View>
      
      {/* Botones de acción */}
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
      
      {/* Contador de usuarios */}
      <View style={estilos.contadorContainer}>
        <Text variant="bodySmall" style={estilos.contador}>
          {usuarioActual + 1} de {usuarios.length}
        </Text>
      </View>
    </View>
  );
}

// Estilos de la pantalla
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
  },
  headerUbicacion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: temaApp.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: temaApp.colors.border,
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
    fontWeight: '600',
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
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  card: {
    position: 'absolute',
    width: Platform.OS === 'web' ? Math.min(SCREEN_WIDTH - 40, 940) : SCREEN_WIDTH - 40,
    height: CARD_HEIGHT,
  },
  usuarioCard: {
    flex: 1,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatar: {
    height: Platform.OS === 'web' ? CARD_HEIGHT * 0.44 : CARD_HEIGHT * 0.56,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'web' ? 12 : 16,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nombreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nombre: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  distanciaChip: {
    backgroundColor: temaApp.colors.primaryContainer,
  },
  biografia: {
    marginBottom: 12,
    color: temaApp.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  interesesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  interesChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  mascotasContainer: {
    marginTop: 4,
  },
  mascotasTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  mascotasList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mascotaItem: {
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  mascotaAvatar: {
    marginBottom: 4,
  },
  mascotaNombre: {
    fontSize: 10,
    textAlign: 'center',
  },
  botonesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 40,
    gap: 20,
  },
  botonAccion: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginHorizontal: 10,
  },
  nombreEdadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mascotaCount: {
    marginLeft: 6,
    color: temaApp.colors.primary,
    fontWeight: '600',
  },
  botonPass: {
    borderColor: temaApp.colors.pass,
    borderWidth: 2,
    borderRadius: 30,
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  botonRecargar: {
    backgroundColor: '#9E9E9E',
  },
  botonLike: {
    backgroundColor: temaApp.colors.like,
    borderRadius: 30,
    paddingHorizontal: 30,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: temaApp.colors.like,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  contadorContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  contador: {
    color: '#fff',
    fontSize: 12,
  },
});
