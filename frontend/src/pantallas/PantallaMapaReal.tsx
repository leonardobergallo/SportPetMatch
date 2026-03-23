// Pantalla de Mapa Real con React Native Maps
// TEMPORALMENTE DESHABILITADA - Problemas de compatibilidad resueltos en PantallaMapaWebCompatible
// Esta pantalla será reactivada cuando se resuelvan los problemas de dependencias

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, Alert } from 'react-native';
// import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from 'react-native-maps';
import { 
  Surface, 
  Appbar, 
  FAB, 
  Portal, 
  Dialog, 
  Button,
  Text,
  Card,
  Chip,
  List,
  ActivityIndicator
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUbicacion } from '../contextos/ContextoUbicacion';

// Tipos para los datos del mapa
interface UsuarioMapa {
  id: string;
  nombre: string;
  edad: number;
  ubicacionLat: number;
  ubicacionLng: number;
  ubicacionCiudad: string;
  mascotas: string[];
}

interface EventoMapa {
  id: string;
  titulo: string;
  tipo: string;
  fechaInicio: string;
  ubicacionLat: number;
  ubicacionLng: number;
  participantes: number;
  maxParticipantes: number;
}

export default function PantallaMapaReal() {
  const navigation = useNavigation();
  const { ubicacionActual, coordenadas, calcularDistancia } = useUbicacion();
  
  // Estados para datos del mapa
  const [usuarios, setUsuarios] = useState<UsuarioMapa[]>([]);
  const [eventos, setEventos] = useState<EventoMapa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mapaListo, setMapaListo] = useState(false);
  
  // Estados para dialogs
  const [dialogVisible, setDialogVisible] = useState(false);
  const [elementoSeleccionado, setElementoSeleccionado] = useState<any>(null);
  const [tipoElemento, setTipoElemento] = useState<'usuario' | 'evento' | null>(null);

  // Configuración del mapa
  const { width, height } = Dimensions.get('window');
  const ASPECT_RATIO = width / height;
  const LATITUDE_DELTA = 0.0922;
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  // Region inicial del mapa (Santa Fe Capital)
  const regionInicial = {
    latitude: coordenadas?.latitud || -31.6333,
    longitude: coordenadas?.longitud || -60.7,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  };

  // Cargar datos de usuarios y eventos cercanos
  useEffect(() => {
    cargarDatosCercanos();
  }, [coordenadas]);

  const cargarDatosCercanos = async () => {
    try {
      setCargando(true);
      
      // Datos de prueba para Santa Fe
      const usuariosPrueba = [
        {
          id: '1',
          nombre: 'María González',
          edad: 28,
          ubicacionLat: -31.6307,
          ubicacionLng: -60.6950,
          ubicacionCiudad: 'Centro, Santa Fe',
          mascotas: ['Golden Retriever', 'Gato Persa']
        },
        {
          id: '2',
          nombre: 'Carlos Rodríguez',
          edad: 32,
          ubicacionLat: -31.6240,
          ubicacionLng: -60.7080,
          ubicacionCiudad: 'Candioti Sur, Santa Fe',
          mascotas: ['Labrador', 'Beagle']
        },
        {
          id: '3',
          nombre: 'Ana Silva',
          edad: 25,
          ubicacionLat: -31.6420,
          ubicacionLng: -60.6850,
          ubicacionCiudad: 'Barranquitas, Santa Fe',
          mascotas: ['Border Collie']
        },
        {
          id: '4',
          nombre: 'Juan Pérez',
          edad: 30,
          ubicacionLat: -31.6180,
          ubicacionLng: -60.7120,
          ubicacionCiudad: 'Guadalupe Norte, Santa Fe',
          mascotas: ['Pastor Alemán']
        }
      ];

      const eventosPrueba = [
        {
          id: '1',
          titulo: 'Paseo matutino en Costanera',
          tipo: 'paseo',
          fechaInicio: '2025-11-01T07:00:00',
          ubicacionLat: -31.6280,
          ubicacionLng: -60.6900,
          participantes: 8,
          maxParticipantes: 15
        },
        {
          id: '2',
          titulo: 'Encuentro en Parque Sur',
          tipo: 'parque',
          fechaInicio: '2025-11-02T09:00:00',
          ubicacionLat: -31.6450,
          ubicacionLng: -60.6950,
          participantes: 5,
          maxParticipantes: 10
        },
        {
          id: '3',
          titulo: 'Caminata en Laguna Setúbal',
          tipo: 'caminata',
          fechaInicio: '2025-11-03T17:00:00',
          ubicacionLat: -31.6200,
          ubicacionLng: -60.6800,
          participantes: 12,
          maxParticipantes: 20
        },
        {
          id: '4',
          titulo: 'Merienda pet-friendly por Boulevard Gálvez',
          tipo: 'merienda',
          fechaInicio: '2025-11-04T08:00:00',
          ubicacionLat: -31.6350,
          ubicacionLng: -60.7000,
          participantes: 6,
          maxParticipantes: 12
        }
      ];

      setUsuarios(usuariosPrueba);
      setEventos(eventosPrueba);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del mapa');
    } finally {
      setCargando(false);
    }
  };

  const manejarPresionMarcador = (tipo: 'usuario' | 'evento', elemento: any) => {
    setTipoElemento(tipo);
    setElementoSeleccionado(elemento);
    setDialogVisible(true);
  };

  const cerrarDialog = () => {
    setDialogVisible(false);
    setElementoSeleccionado(null);
    setTipoElemento(null);
  };

  const abrirChat = () => {
    cerrarDialog();
    // TODO: Navegar al chat
    Alert.alert('Chat', 'Funcionalidad de chat próximamente');
  };

  const unirseEvento = () => {
    cerrarDialog();
    // TODO: Implementar unirse a evento
    Alert.alert('Evento', 'Te has unido al evento');
  };

  // Mostrar pantalla de carga si no hay coordenadas
  if (!coordenadas) {
    return (
      <Surface style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Mapa de Indio" />
        </Appbar.Header>
        <View style={styles.centeredContainer}>
          <ActivityIndicator animating={true} size="large" />
          <Text style={{ marginTop: 16 }}>
            {ubicacionActual ? 'Cargando mapa...' : 'Configurando ubicación...'}
          </Text>
          <Text variant="bodySmall" style={{ marginTop: 8, textAlign: 'center' }}>
            Usando Santa Fe Capital como ubicación inicial
          </Text>
        </View>
      </Surface>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Mapa de Indio" />
        <Appbar.Action 
          icon="refresh" 
          onPress={cargarDatosCercanos}
          disabled={cargando}
        />
      </Appbar.Header>

      <View style={styles.mapaContainer}>
        {/* MapView temporalmente deshabilitado - react-native-maps no compatible */}
        <View style={styles.mapa}>
          <View style={styles.centeredContainer}>
            <MaterialIcons name="map" size={64} color="#666" />
            <Text variant="headlineMedium" style={{ marginTop: 16, textAlign: 'center' }}>
              Mapa Real No Disponible
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 8, textAlign: 'center', paddingHorizontal: 20 }}>
              Esta pantalla está temporalmente deshabilitada debido a problemas de compatibilidad con react-native-maps.
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 8, textAlign: 'center', paddingHorizontal: 20 }}>
              Por favor usa la pantalla de mapa simplificada disponible desde el menú principal.
            </Text>
            <Button 
              mode="contained" 
              onPress={() => navigation.goBack()}
              style={{ marginTop: 20 }}
            >
              Volver
            </Button>
          </View>
        </View>
        
        {/* Comentado: MapView y Marcadores originales
        <MapView
          style={styles.mapa}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
          initialRegion={regionInicial}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
          zoomEnabled={true}
          scrollEnabled={true}
          onMapReady={() => setMapaListo(true)}
        >
          {usuarios.map((usuario) => (
            <Marker
              key={`usuario-${usuario.id}`}
              coordinate={{
                latitude: usuario.ubicacionLat,
                longitude: usuario.ubicacionLng,
              }}
              title={usuario.nombre}
              description={`${usuario.edad} años - ${usuario.mascotas.join(', ')}`}
              onPress={() => manejarPresionMarcador('usuario', usuario)}
            >
              <View style={styles.marcadorUsuario}>
                <MaterialIcons name="person" size={24} color="#fff" />
              </View>
            </Marker>
          ))}

          {eventos.map((evento) => (
            <Marker
              key={`evento-${evento.id}`}
              coordinate={{
                latitude: evento.ubicacionLat,
                longitude: evento.ubicacionLng,
              }}
              title={evento.titulo}
              description={`${evento.tipo} - ${new Date(evento.fechaInicio).toLocaleDateString('es-AR')}`}
              onPress={() => manejarPresionMarcador('evento', evento)}
            >
              <View style={styles.marcadorEvento}>
                <MaterialIcons name="event" size={24} color="#fff" />
              </View>
            </Marker>
          ))}
        </MapView>
        */}
        
        {/* Controles flotantes - temporalmente deshabilitados */}
        {/* 
        <View style={styles.controlesFlotantes}>
          <Chip 
            icon="account-group" 
            mode="outlined"
            style={styles.chip}
          >
            {usuarios.length} usuarios
          </Chip>
          <Chip 
            icon="calendar" 
            mode="outlined"
            style={styles.chip}
          >
            {eventos.length} eventos
          </Chip>
        </View>

        <Card style={styles.infoUbicacion}>
          <Card.Content>
            <Text variant="bodySmall">
              📍 {ubicacionActual?.ciudad || 'Santa Fe'}, {ubicacionActual?.provincia || 'Santa Fe'}
            </Text>
          </Card.Content>
        </Card>
        */}
      </View>

      {/* Dialog de información */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={cerrarDialog}>
          <Dialog.Title>
            {tipoElemento === 'usuario' ? 'Usuario' : 'Evento'}
          </Dialog.Title>
          <Dialog.Content>
            {elementoSeleccionado && tipoElemento === 'usuario' && (
              <View>
                <Text variant="headlineSmall">{elementoSeleccionado.nombre}</Text>
                <Text variant="bodyMedium">{elementoSeleccionado.edad} años</Text>
                <Text variant="bodyMedium">📍 {elementoSeleccionado.ubicacionCiudad}</Text>
                <Text variant="bodyMedium">🐕 {elementoSeleccionado.mascotas.join(', ')}</Text>
              </View>
            )}
            {elementoSeleccionado && tipoElemento === 'evento' && (
              <View>
                <Text variant="headlineSmall">{elementoSeleccionado.titulo}</Text>
                <Text variant="bodyMedium">🏃‍♂️ {elementoSeleccionado.tipo}</Text>
                <Text variant="bodyMedium">
                  📅 {new Date(elementoSeleccionado.fechaInicio).toLocaleDateString('es-AR')} a las{' '}
                  {new Date(elementoSeleccionado.fechaInicio).toLocaleTimeString('es-AR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
                <Text variant="bodyMedium">
                  👥 {elementoSeleccionado.participantes}/{elementoSeleccionado.maxParticipantes} participantes
                </Text>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={cerrarDialog}>Cancelar</Button>
            {tipoElemento === 'usuario' && (
              <Button onPress={abrirChat}>Chatear</Button>
            )}
            {tipoElemento === 'evento' && (
              <Button onPress={unirseEvento}>Unirse</Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* FAB para crear evento */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {
          // TODO: Navegar a crear evento
          Alert.alert('Crear Evento', 'Funcionalidad próximamente');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapaContainer: {
    flex: 1,
  },
  mapa: {
    flex: 1,
  },
  marcadorUsuario: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  marcadorEvento: {
    backgroundColor: '#FF5722',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  controlesFlotantes: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'column',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  infoUbicacion: {
    position: 'absolute',
    bottom: 80,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ea',
  },
});
