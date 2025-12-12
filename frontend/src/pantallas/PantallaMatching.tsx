// Pantalla de Matching - Estilo Tinder para SportPetMatch
// Permite hacer swipe entre usuarios y sus mascotas para crear conexiones

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  PanResponder,
  Animated,
  Alert 
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
const CARD_HEIGHT = SCREEN_HEIGHT * 0.75;
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
      
      // Intentar cargar de la API
      try {
        const recomendaciones = await obtenerRecomendaciones();
        
        if (recomendaciones && recomendaciones.length > 0) {
          // Convertir UsuarioRecomendado a UsuarioPotencial
          const usuariosConvertidos = recomendaciones.map(usuario => ({
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
            mascotas: usuario.mascotas.map((m, idx) => ({
              id: `m${idx}`,
              nombre: m.nombre,
              tipo: m.tipo,
              edad: 3, // TODO: Agregar edad al backend
              foto: m.fotos && m.fotos.length > 0 ? m.fotos[0] : 'https://via.placeholder.com/300'
            })),
            esPremium: false,
            score: usuario.score,
            interesesComunes: usuario.interesesComunes,
          }));
          
          setUsuarios(usuariosConvertidos);
          setCargando(false);
          return;
        }
      } catch (error) {
        console.log('Error cargando recomendaciones de API, usando datos mock:', error);
        // Continuar con datos mock si falla la API
      }
      
      // Fallback: usar datos mock con geolocalización
      let usuariosMock: UsuarioPotencial[] = [
        {
          id: '1',
          nombre: 'María González',
          edad: 28,
          avatar: 'https://picsum.photos/400/400?random=1',
          biografia: 'Amo correr con mi Golden Retriever todas las mañanas. Buscando compañía para aventuras!',
          distancia: 2.5,
          ubicacionCiudad: 'Buenos Aires',
          coordenadas: { latitud: -34.6118, longitud: -58.3960 }, // Palermo
          intereses: ['correr', 'senderismo', 'yoga'],
          mascotas: [
            {
              id: 'm1',
              nombre: 'Max',
              tipo: 'Perro',
              edad: 3,
              foto: 'https://picsum.photos/300/300?random=11'
            }
          ],
          esPremium: true
        },
        {
          id: '2',
          nombre: 'Carlos Silva',
          edad: 32,
          avatar: 'https://picsum.photos/400/400?random=2',
          biografia: 'Ciclista urbano con mi Border Collie. Los fines de semana exploramos nuevas rutas en la ciudad.',
          distancia: 1.2,
          ubicacionCiudad: 'Buenos Aires',
          coordenadas: { latitud: -34.6033, longitud: -58.3816 }, // Centro
          intereses: ['ciclismo', 'explorar'],
          mascotas: [
            {
              id: 'm2',
              nombre: 'Luna',
              tipo: 'Perro',
              edad: 2,
              foto: 'https://picsum.photos/300/300?random=12'
            }
          ],
          esPremium: false
        },
        {
          id: '3',
          nombre: 'Ana Ruiz',
          edad: 25,
          avatar: 'https://picsum.photos/400/400?random=3',
          biografia: 'Estudiante de veterinaria. Mi gata Mimi y yo buscamos grupos tranquilos para caminar.',
          distancia: 4.1,
          ubicacionCiudad: 'Buenos Aires',
          coordenadas: { latitud: -34.6158, longitud: -58.3731 }, // Recoleta
          intereses: ['caminar', 'naturaleza'],
          mascotas: [
            {
              id: 'm3',
              nombre: 'Mimi',
              tipo: 'Gato',
              edad: 1,
              foto: 'https://picsum.photos/300/300?random=13'
            }
          ],
          esPremium: false
        },
        {
          id: '4',
          nombre: 'Diego Martín',
          edad: 30,
          avatar: 'https://picsum.photos/400/400?random=4',
          biografia: 'Entrenador personal que ama el fútbol. Mi Husky y yo organizamos entrenamientos grupales.',
          distancia: 3.8,
          ubicacionCiudad: 'Buenos Aires',
          coordenadas: { latitud: -34.6092, longitud: -58.3734 }, // Belgrano
          intereses: ['futbol', 'entrenamientos'],
          mascotas: [
            {
              id: 'm4',
              nombre: 'Thor',
              tipo: 'Perro',
              edad: 4,
              foto: 'https://picsum.photos/300/300?random=14'
            }
          ],
          esPremium: true
        }
      ];

      // Calcular distancias reales si tenemos coordenadas del usuario
      if (coordenadas) {
        usuariosMock = usuariosMock.map(usuario => ({
          ...usuario,
          distancia: calcularDistancia(coordenadas, usuario.coordenadas)
        }));
        
        // Ordenar por distancia (más cercanos primero)
        usuariosMock.sort((a, b) => a.distancia - b.distancia);
      }

      setUsuarios(usuariosMock);
    } catch (error) {
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
      }
    } catch (error: any) {
      console.error('Error enviando like:', error);
      Alert.alert('Error', error.message || 'No se pudo enviar el like');
    }
  };

  /**
   * Envía un pass al backend (no hacer match)
   */
  const enviarPass = async (usuarioId: string) => {
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
    } : isNextCard ? {
      transform: [{ scale: nextCardScale }],
    } : {
      transform: [{ scale: 0.8 }],
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
          No hay usuarios disponibles
        </Text>
        <Text variant="bodyMedium" style={estilos.subtextoVacio}>
          Intenta ampliar tu radio de búsqueda o vuelve más tarde
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
        {usuarios.map((usuario, index) => renderUsuarioCard(usuario, index))}
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
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
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
    height: CARD_HEIGHT * 0.6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardContent: {
    flex: 1,
    padding: 16,
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
    marginTop: 8,
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
    paddingVertical: 30,
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