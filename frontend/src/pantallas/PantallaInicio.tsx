// Pantalla de Inicio de SportPetMatch
// Adaptada de la estructura con nuevos componentes y estilos

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  Image,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { Text, Avatar, Menu, Divider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

// Importar nuevos componentes UI
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Importar servicios
import { obtenerDashboard } from '@/servicios/servicioAuth';

// Importar tema y constantes
import { temaApp, espaciado, sombras } from '@/constantes/tema';
import { useAuth } from '@/contextos/ContextoAuth';

// Rutas a imágenes
const images = {
  soccer: require('../../assets/soccer-tournament-park.jpg'),
  running: require('../../assets/5k-running-race-beach.jpg'),
  tennis: require('../../assets/tennis-group-game.jpg'),
  golden: require('../../assets/golden-retriever-playing.png'),
  husky: require('../../assets/husky-running-mountain.jpg'),
  labrador: require('../../assets/labrador-playing-tennis.jpg'),
  placeholder: require('../../assets/placeholder.jpg'),
};

/**
 * Pantalla de Inicio - Feed principal de la aplicación
 * Adaptada de la estructura con el diseño moderno
 */
export default function PantallaInicio(): JSX.Element {
  const { usuario, cerrarSesion } = useAuth();
  const [refrescando, setRefrescando] = useState(false);
  const [datos, setDatos] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [mostrarMenu, setMostrarMenu] = useState(false);

  // Datos mockados basados en la estructura
  const events = [
    {
      id: 'event1',
      title: 'Torneo de Fútbol',
      location: 'Parque Central',
      date: 'Sáb, 15 Nov',
      distance: '2.5 km',
      pets: 12,
      image: images.soccer,
      matched: true,
    },
    {
      id: 'event2',
      title: 'Carrera 5K',
      location: 'Playa Negra',
      date: 'Dom, 16 Nov',
      distance: '5.2 km',
      pets: 8,
      image: images.running,
      matched: false,
    },
    {
      id: 'event3',
      title: 'Tenis en Grupo',
      location: 'Club Deportivo',
      date: 'Mié, 20 Nov',
      distance: '3.1 km',
      pets: 6,
      image: images.tennis,
      matched: false,
    },
  ];

  const matches = [
    {
      id: 'match1',
      name: 'María González',
      pet: 'Golden Retriever',
      matchDate: 'Hace 2 horas',
      image: images.golden,
    },
    {
      id: 'match2',
      name: 'Carlos Ruiz',
      pet: 'Senderismo',
      matchDate: 'Hace 4 horas',
      image: images.husky,
    },
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Usar servicio de autenticación
      const dashboardData = await obtenerDashboard();
      setDatos(dashboardData);
    } catch (error: any) {
      console.error('Error cargando datos:', error);
      // Si hay error de autenticación, los datos serán null
    } finally {
      setCargando(false);
    }
  };

  const manejarRefresh = React.useCallback(() => {
    setRefrescando(true);
    cargarDatos().finally(() => {
      setRefrescando(false);
    });
  }, []);

  const manejarCrearEvento = () => {
    console.log('Crear evento');
  };

  return (
    <View style={estilos.contenedor}>
      {/* Header */}
      <View style={estilos.header}>
        <View style={estilos.headerContent}>
          <View style={estilos.logoContainer}>
            <View style={estilos.logo}>
              <Text style={estilos.logoEmoji}>🐾</Text>
            </View>
            <Text style={estilos.titulo}>SportPetMatch</Text>
          </View>
          <Menu
            visible={mostrarMenu}
            onDismiss={() => setMostrarMenu(false)}
            anchor={
              <TouchableOpacity onPress={() => setMostrarMenu(true)} style={estilos.avatarContainer}>
                {usuario?.foto ? (
                  <Avatar.Image size={40} source={{ uri: usuario.foto }} />
                ) : (
                  <Avatar.Text size={40} label={usuario?.nombre?.charAt(0).toUpperCase() || 'U'} />
                )}
              </TouchableOpacity>
            }
          >
            <Menu.Item 
              onPress={() => {
                setMostrarMenu(false);
                console.log('Ver perfil');
              }} 
              title="Mi Perfil" 
              leadingIcon="account"
            />
            <Menu.Item 
              onPress={() => {
                setMostrarMenu(false);
                console.log('Ver configuración');
              }} 
              title="Configuración" 
              leadingIcon="cog"
            />
            <Divider />
            <Menu.Item 
              onPress={async () => {
                setMostrarMenu(false);
                await cerrarSesion();
              }} 
              title="Cerrar Sesión" 
              leadingIcon="logout"
              titleStyle={{ color: temaApp.colors.error }}
            />
          </Menu>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={estilos.scrollView}
        contentContainerStyle={estilos.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={manejarRefresh}
            colors={[temaApp.colors.primary]}
            tintColor={temaApp.colors.primary}
          />
        }
      >
        {/* Quick Actions */}
        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Acciones Rápidas</Text>
          <View style={estilos.accionesRapidas}>
            <Button
              variant="secondary"
              size="lg"
              onPress={manejarCrearEvento}
              icon="add"
              style={estilos.botonAccion}
            >
              Crear Evento
            </Button>
            <View style={estilos.buscador}>
              <MaterialIcons name="search" size={20} color={temaApp.colors.onSurfaceVariant} />
              <TextInput
                placeholder="Buscar..."
                placeholderTextColor={temaApp.colors.onSurfaceVariant}
                value={searchText}
                onChangeText={setSearchText}
                style={estilos.inputBuscar}
              />
            </View>
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={estilos.seccion}>
          <View style={estilos.headerSeccion}>
            <Text style={estilos.tituloSeccion}>Eventos Próximos</Text>
            <View style={estilos.badge}>
              <Text style={estilos.badgeTexto}>{events.length} eventos</Text>
            </View>
          </View>
          <View style={estilos.listaEventos}>
            {events.map((event) => (
              <Card key={event.id} style={estilos.cardEvento}>
                <View style={estilos.imagenContainer}>
                  <Image source={event.image} style={estilos.imagenEvento} resizeMode="cover" />
                  {event.matched && (
                    <View style={estilos.badgeMatch}>
                      <MaterialIcons name="local-fire-department" size={14} color="#FFFFFF" />
                      <Text style={estilos.badgeMatchTexto}>¡Match!</Text>
                    </View>
                  )}
                  <View style={estilos.overlayImagen}>
                    <Text style={estilos.tituloImagen}>{event.title}</Text>
                  </View>
                </View>
                <CardContent>
                  <View style={estilos.infoEvento}>
                    <View style={estilos.filaEvento}>
                      <View style={estilos.infoItem}>
                        <MaterialIcons name="place" size={14} color={temaApp.colors.primary} />
                        <Text style={estilos.textoInfo}>{event.location}</Text>
                      </View>
                      <View style={estilos.badgeDistancia}>
                        <Text style={estilos.badgeDistanciaTexto}>{event.distance}</Text>
                      </View>
                    </View>
                    <View style={estilos.filaEvento}>
                      <View style={estilos.infoItem}>
                        <MaterialIcons name="event" size={14} color={temaApp.colors.primary} />
                        <Text style={estilos.textoInfo}>{event.date}</Text>
                      </View>
                      <View style={estilos.infoItem}>
                        <MaterialIcons name="people" size={14} color={temaApp.colors.primary} />
                        <Text style={estilos.textoInfo}>{event.pets} mascotas</Text>
                      </View>
                    </View>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        </View>

        {/* Recent Matches */}
        <View style={estilos.seccion}>
          <View style={estilos.headerSeccion}>
            <Text style={estilos.tituloSeccion}>Matches Recientes</Text>
            <View style={estilos.badge}>
              <Text style={estilos.badgeTexto}>{matches.length} nuevos</Text>
            </View>
          </View>
          <View style={estilos.listaMatches}>
            {matches.map((match) => (
              <Card key={match.id} style={estilos.cardMatch}>
                <CardContent>
                  <View style={estilos.matchItem}>
                    <Image source={match.image} style={estilos.avatarMatch} />
                    <View style={estilos.matchInfo}>
                      <Text style={estilos.matchNombre}>{match.name}</Text>
                      <Text style={estilos.matchPet}>{match.pet}</Text>
                      <Text style={estilos.matchFecha}>{match.matchDate}</Text>
                    </View>
                    <MaterialIcons name="favorite" size={20} color={temaApp.colors.secondary} />
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Estilos adaptados de la estructura
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
  },
  header: {
    backgroundColor: temaApp.colors.primary,
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    ...sombras.media,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: temaApp.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombras.media,
  },
  logoEmoji: {
    fontSize: 20,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: temaApp.colors.onPrimary,
  },
  avatarContainer: {
    width: 40,
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  seccion: {
    marginBottom: 24,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    marginBottom: 12,
  },
  headerSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  accionesRapidas: {
    flexDirection: 'row',
    gap: 12,
  },
  botonAccion: {
    flex: 1,
    minHeight: 56,
  },
  buscador: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: temaApp.colors.border,
    gap: 8,
  },
  inputBuscar: {
    flex: 1,
    fontSize: 14,
    color: temaApp.colors.onSurface,
    paddingVertical: 12,
  },
  listaEventos: {
    gap: 12,
  },
  cardEvento: {
    overflow: 'hidden',
  },
  imagenContainer: {
    height: 192,
    backgroundColor: '#EDEDED',
    position: 'relative',
  },
  imagenEvento: {
    width: '100%',
    height: '100%',
  },
  overlayImagen: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
  },
  tituloImagen: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  badgeMatch: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: temaApp.colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeMatchTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoEvento: {
    gap: 8,
  },
  filaEvento: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  textoInfo: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
  },
  badgeDistancia: {
    backgroundColor: `${temaApp.colors.primary}1A`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeDistanciaTexto: {
    color: temaApp.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: `${temaApp.colors.accent}33`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTexto: {
    color: temaApp.colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  listaMatches: {
    gap: 8,
  },
  cardMatch: {
    // Estilos del card
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarMatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDEDED',
  },
  matchInfo: {
    flex: 1,
  },
  matchNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: temaApp.colors.onSurface,
  },
  matchPet: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: 2,
  },
  matchFecha: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: 2,
  },
});
