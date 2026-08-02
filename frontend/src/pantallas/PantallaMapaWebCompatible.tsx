// Pantalla de Mapa Web Compatible con React Native Maps
// Versión optimizada para funcionar tanto en web como en móvil

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
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
  ActivityIndicator,
  Divider
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUbicacion } from '../contextos/ContextoUbicacion';
import { participarEnEvento } from '../servicios/servicioEventos';
import { mostrarAlerta } from '@/utilidades/alerta';

// Importar MapView condicionalmente solo cuando esté disponible
let MapView: any = null;
let Marker: any = null;

// Solo intentar importar en dispositivos móviles y cuando el módulo esté disponible
const initializeMapComponents = () => {
  // Temporalmente deshabilitado hasta resolver problemas de compatibilidad
  return false;
  
  /* if (Platform.OS !== 'web') {
    try {
      // Usar require dinámico para evitar errores de bundling en web
      const mapModule = require('react-native-maps');
      MapView = mapModule.default || mapModule;
      Marker = mapModule.Marker;
      return true;
    } catch (error) {
      console.warn('React Native Maps no disponible, usando vista simplificada:', error instanceof Error ? error.message : 'Error desconocido');
      return false;
    }
  }
  return false; */
};

// Inicializar componentes de mapa
const isMapAvailable = initializeMapComponents();

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

// Componente de Vista de Mapa Simplificada (Web Compatible)
const VistaMapaWebCompatible = ({ coordenadas, usuarios, eventos, onItemPress }: any) => {
  // Siempre usar vista simplificada para máxima compatibilidad
  return (
    <View style={styles.mapaSimulado}>
      <View style={styles.ubicacionActual}>
        <MaterialIcons name="my-location" size={24} color="#2196F3" />
        <Text variant="bodyMedium" style={styles.coordenadasTexto}>
          Tu ubicación: {coordenadas.latitud.toFixed(4)}, {coordenadas.longitud.toFixed(4)}
        </Text>
        <Text variant="bodySmall">Santa Fe Capital</Text>
      </View>
      
      <Divider style={styles.divider} />
      
      <View style={styles.listaContainer}>
        <Text variant="titleMedium" style={styles.seccionTitulo}>
          👥 Usuarios Cercanos ({usuarios.length})
        </Text>
        
        {usuarios.map((usuario: UsuarioMapa) => (
          <List.Item
            key={usuario.id}
            title={usuario.nombre}
            description={`${usuario.edad} años - ${usuario.ubicacionCiudad}`}
            left={(props) => <List.Icon {...props} icon="account" />}
            right={(props) => (
              <View style={styles.distanciaContainer}>
                <Text variant="bodySmall">
                  {calcularDistanciaDisplay(coordenadas, usuario)}
                </Text>
                <MaterialIcons name="place" size={16} color="#666" />
              </View>
            )}
            style={styles.listItem}
            onPress={() => onItemPress('usuario', usuario)}
          />
        ))}
        
        <Divider style={styles.divider} />
        
        <Text variant="titleMedium" style={styles.seccionTitulo}>
          📅 Eventos pet-friendly ({eventos.length})
        </Text>
        
        {eventos.map((evento: EventoMapa) => (
          <List.Item
            key={evento.id}
            title={evento.titulo}
            description={`${evento.tipo} - ${new Date(evento.fechaInicio).toLocaleDateString('es-AR')}`}
            left={(props) => <List.Icon {...props} icon="calendar" />}
            right={(props) => (
              <View style={styles.distanciaContainer}>
                <Text variant="bodySmall">
                  {calcularDistanciaDisplay(coordenadas, evento)}
                </Text>
                <Text variant="bodySmall">
                  {evento.participantes}/{evento.maxParticipantes}
                </Text>
              </View>
            )}
            style={styles.listItem}
            onPress={() => onItemPress('evento', evento)}
          />
        ))}
      </View>
    </View>
  );
};

// Función auxiliar para calcular distancia
const calcularDistanciaDisplay = (coordenadas: any, item: any) => {
  const R = 6371;
  const dLat = (item.ubicacionLat - coordenadas.latitud) * Math.PI / 180;
  const dLon = (item.ubicacionLng - coordenadas.longitud) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coordenadas.latitud * Math.PI / 180) * Math.cos(item.ubicacionLat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distancia = R * c;
  
  return distancia < 1 
    ? `${Math.round(distancia * 1000)}m`
    : `${distancia.toFixed(1)}km`;
};

export default function PantallaMapaWebCompatible() {
  const navigation = useNavigation();
  const { ubicacionActual, coordenadas } = useUbicacion();
  
  // Estados para datos del mapa
  const [usuarios, setUsuarios] = useState<UsuarioMapa[]>([]);
  const [eventos, setEventos] = useState<EventoMapa[]>([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados para dialogs
  const [dialogVisible, setDialogVisible] = useState(false);
  const [elementoSeleccionado, setElementoSeleccionado] = useState<any>(null);
  const [tipoElemento, setTipoElemento] = useState<'usuario' | 'evento' | null>(null);

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
      mostrarAlerta('Error', 'No se pudieron cargar los datos del mapa');
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
    mostrarAlerta('Chat', 'Funcionalidad de chat próximamente');
  };

  const unirseEvento = async () => {
    if (!elementoSeleccionado?.id) return;
    try {
      await participarEnEvento(elementoSeleccionado.id);
      cerrarDialog();
      mostrarAlerta('¡Listo!', 'Te has unido al evento exitosamente');
      cargarDatosCercanos();
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message ||
        error?.message ||
        'No se pudo unir al evento';
      mostrarAlerta('Aviso', mensaje);
    }
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

      <View style={styles.contenidoContainer}>
        <VistaMapaWebCompatible
          coordenadas={coordenadas}
          usuarios={usuarios}
          eventos={eventos}
          onItemPress={manejarPresionMarcador}
        />
        
        {/* Información de ubicación actual */}
        <Card style={styles.infoUbicacion}>
          <Card.Content>
            <Text variant="bodySmall">
              📍 {ubicacionActual?.ciudad || 'Santa Fe'}, {ubicacionActual?.provincia || 'Santa Fe'}
            </Text>
          </Card.Content>
        </Card>
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
          mostrarAlerta('Crear Evento', 'Funcionalidad próximamente');
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
  contenidoContainer: {
    flex: 1,
  },
  mapaContainer: {
    flex: 1,
  },
  mapa: {
    flex: 1,
  },
  mapaSimulado: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  ubicacionActual: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  coordenadasTexto: {
    marginLeft: 8,
    flex: 1,
  },
  listaContainer: {
    flex: 1,
  },
  seccionTitulo: {
    marginVertical: 16,
    fontWeight: 'bold',
  },
  listItem: {
    backgroundColor: '#fff',
    marginVertical: 4,
    borderRadius: 8,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  distanciaContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  divider: {
    marginVertical: 8,
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
