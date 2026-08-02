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
  TouchableOpacity,
  Platform
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '@/navegacion/NavegacionPrincipal';

// Importar nuevos componentes UI
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AdBanner from '@/componentes/AdBanner';

// Importar servicios
import { obtenerDashboard } from '@/servicios/servicioAuth';
import { obtenerEventos, Evento } from '@/servicios/servicioEventos';

// Importar tema y constantes
import { temaApp, espaciado, sombras } from '@/constantes/tema';
import { useAuth } from '@/contextos/ContextoAuth';

// Rutas a imágenes
const images = {
  placeholder: require('../../assets/placeholder.jpg'),
};

type InicioScreenNavigationProp = StackNavigationProp<RootStackParamList> & BottomTabNavigationProp<TabParamList>;

/** Tipografia web (Plus Jakarta / Outfit), misma familia que Login y Registro */
const fontSans = Platform.select({ web: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', default: undefined });
const fontDisplay = Platform.select({ web: '"Outfit", "Plus Jakarta Sans", system-ui, sans-serif', default: undefined });

/**
 * Pantalla de Inicio - Feed principal de la aplicación
 * Adaptada de la estructura con el diseño moderno
 */
export default function PantallaInicio(): JSX.Element {
  const navigation = useNavigation<InicioScreenNavigationProp>();
  const { usuario, estaAutenticado } = useAuth();
  const [refrescando, setRefrescando] = useState(false);
  const [datos, setDatos] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [eventos, setEventos] = useState<Evento[]>([]);

  const matches = [
    {
      id: 'match1',
      name: 'María González',
      pet: 'Golden Retriever',
      matchDate: 'Quiere ir a un parque este finde',
      image: images.placeholder,
    },
    {
      id: 'match2',
      name: 'Carlos Ruiz',
      pet: 'Husky',
      matchDate: 'Busca compartir una salida pet-friendly',
      image: images.placeholder,
    },
  ];

  useEffect(() => {
    cargarDatos();
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      const data = await obtenerEventos({ limit: 3 });
      setEventos(data);
    } catch (error: any) {
      console.error('Error cargando eventos:', error);
    }
  };

  const cargarDatos = async () => {
    try {
      const dashboardData = await obtenerDashboard();
      setDatos(dashboardData);
    } catch (error: any) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const manejarRefresh = React.useCallback(() => {
    setRefrescando(true);
    Promise.all([cargarDatos(), cargarEventos()]).finally(() => {
      setRefrescando(false);
    });
  }, []);

  const manejarCrearEvento = () => {
    if (!estaAutenticado) {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('CrearEvento');
  };

  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${dias[fecha.getUTCDay()]}, ${fecha.getUTCDate()} ${meses[fecha.getUTCMonth()]}`;
  };

  return (
    <View style={estilos.contenedor}>
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
            <Text style={estilos.tituloSeccion}>Eventos Pet-Friendly</Text>
            <View style={estilos.badge}>
              <Text style={estilos.badgeTexto}>{eventos.length} eventos</Text>
            </View>
          </View>
          <View style={estilos.listaEventos}>
            {eventos.map((evento) => (
              <Card key={evento.id} style={estilos.cardEvento}>
                <View style={estilos.imagenContainer}>
                  <Image source={images.placeholder} style={estilos.imagenEvento} resizeMode="cover" />
                  {evento.esPetFriendly && (
                    <View style={estilos.badgeMatch}>
                      <MaterialIcons name="pets" size={14} color="#FFFFFF" />
                      <Text style={estilos.badgeMatchTexto}>Pet Friendly</Text>
                    </View>
                  )}
                  <View style={estilos.overlayImagen}>
                    <Text style={estilos.tituloImagen}>{evento.titulo}</Text>
                  </View>
                </View>
                <CardContent>
                  <View style={estilos.infoEvento}>
                    <View style={estilos.filaEvento}>
                      <View style={estilos.infoItem}>
                        <MaterialIcons name="category" size={14} color={temaApp.colors.primary} />
                        <Text style={estilos.textoInfo}>{evento.tipo}</Text>
                      </View>
                      <View style={estilos.badgeDistancia}>
                        <Text style={estilos.badgeDistanciaTexto}>
                          {evento.esPremium ? 'Premium' : 'Gratis'}
                        </Text>
                      </View>
                    </View>
                    <View style={estilos.filaEvento}>
                      <View style={estilos.infoItem}>
                        <MaterialIcons name="event" size={14} color={temaApp.colors.primary} />
                        <Text style={estilos.textoInfo}>{formatearFecha(evento.fechaInicio)}</Text>
                      </View>
                      <View style={estilos.infoItem}>
                        <MaterialIcons name="people" size={14} color={temaApp.colors.primary} />
                        <Text style={estilos.textoInfo}>{evento.participantesCount || 0} participantes</Text>
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
                    <MaterialIcons name="favorite" size={20} color={temaApp.colors.like} />
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        </View>

        <AdBanner minHeight={50} />
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
    ...(Platform.OS === 'web' ? { maxWidth: 1100, width: '100%', alignSelf: 'center', paddingTop: 24 } : {}),
  },
  seccion: {
    marginBottom: 24,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    marginBottom: 12,
    ...(fontDisplay ? { fontFamily: fontDisplay } : {}),
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
    ...(Platform.OS === 'web' ? { borderRadius: 16 } : {}),
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
    ...(fontDisplay ? { fontFamily: fontDisplay } : {}),
  },
  badgeMatch: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: temaApp.colors.match,
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
    ...(fontSans ? { fontFamily: fontSans } : {}),
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
    ...(fontSans ? { fontFamily: fontSans } : {}),
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
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  listaMatches: {
    gap: 8,
  },
  cardMatch: {
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
    ...(fontDisplay ? { fontFamily: fontDisplay } : {}),
  },
  matchPet: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: 2,
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  matchFecha: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: 2,
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
});
