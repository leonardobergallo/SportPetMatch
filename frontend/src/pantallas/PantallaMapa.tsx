import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, ScrollView, TouchableOpacity, Image } from 'react-native';
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
  IconButton,
  List,
  Divider,
  ActivityIndicator
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUbicacion } from '../contextos/ContextoUbicacion';

// Clave de Google Maps
const GOOGLE_MAPS_API_KEY = 'AIzaSyCeUPMP3dmgyP_yJZLZjsCZPmZUrU5lFPg';

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

// Componente simple de vista de mapa (sin mapa real por ahora)
const VistaMapa = ({ coordenadas, usuarios, eventos, onItemPress }: {
  coordenadas: any;
  usuarios: UsuarioMapa[];
  eventos: EventoMapa[];
  onItemPress: (tipo: 'usuario' | 'evento', item: any) => void;
}) => {
  
  console.log('Platform.OS:', Platform.OS);
  
  // SIEMPRE usar Google Maps embebido (forzar mapa)
  // if (Platform.OS === 'web') {
  if (true) {
    // Generar marcadores para Google Maps
    const marcadores = [
      {
        id: 'current',
        lat: coordenadas.latitud,
        lng: coordenadas.longitud,
        label: 'Tú',
        icon: 'blue'
      },
      ...usuarios.map((u, idx) => ({
        id: `usuario-${u.id}`,
        lat: u.ubicacionLat,
        lng: u.ubicacionLng,
        label: u.nombre,
        icon: 'green'
      })),
      ...eventos.map((e, idx) => ({
        id: `evento-${e.id}`,
        lat: e.ubicacionLat,
        lng: e.ubicacionLng,
        label: e.titulo,
        icon: 'red'
      }))
    ];

    // Generar HTML para Google Maps
    const markersStr = marcadores.map(m => 
      `&markers=color:${m.icon}|label:${m.label.charAt(0)}|${m.lat},${m.lng}`
    ).join('');

    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coordenadas.latitud},${coordenadas.longitud}&zoom=13&size=600x400&key=${GOOGLE_MAPS_API_KEY}${markersStr}`;
    console.log('Google Maps URL:', mapUrl);

    return (
      <View style={styles.mapaContainer}>
        <View style={styles.mapaSimulado}>
          <Image 
            source={{ uri: mapUrl }} 
            style={styles.mapaImagen} 
            resizeMode="cover"
          />
        </View>
        
        <ScrollView style={styles.listaContainer}>
          <Text variant="titleMedium" style={styles.seccionTitulo}>
            👥 Usuarios Cercanos ({usuarios.length})
          </Text>
          
          {usuarios.map((usuario) => (
            <TouchableOpacity
              key={usuario.id}
              onPress={() => onItemPress('usuario', usuario)}
            >
              <List.Item
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
              />
            </TouchableOpacity>
          ))}
          
          <Divider style={styles.divider} />
          
          <Text variant="titleMedium" style={styles.seccionTitulo}>
            🏃‍♂️ Eventos Deportivos ({eventos.length})
          </Text>
          
          {eventos.map((evento) => (
            <TouchableOpacity
              key={evento.id}
              onPress={() => onItemPress('evento', evento)}
            >
              <List.Item
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
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }
  
  // Para móvil, usar vista simplificada
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
      
      <ScrollView style={styles.listaContainer}>
        <Text variant="titleMedium" style={styles.seccionTitulo}>
          👥 Usuarios Cercanos ({usuarios.length})
        </Text>
        
        {usuarios.map((usuario) => (
          <TouchableOpacity
            key={usuario.id}
            onPress={() => onItemPress('usuario', usuario)}
          >
            <List.Item
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
            />
          </TouchableOpacity>
        ))}
        
        <Divider style={styles.divider} />
        
        <Text variant="titleMedium" style={styles.seccionTitulo}>
          🏃‍♂️ Eventos Deportivos ({eventos.length})
        </Text>
        
        {eventos.map((evento) => (
          <TouchableOpacity
            key={evento.id}
            onPress={() => onItemPress('evento', evento)}
          >
            <List.Item
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
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
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

export default function PantallaMapa() {
  const navigation = useNavigation();
  const { ubicacionActual, coordenadas, calcularDistancia } = useUbicacion();
  
  console.log('PantallaMapa - Platform:', Platform.OS);
  console.log('PantallaMapa - coordenadas:', coordenadas);
  
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
      
      // Por ahora usamos datos de prueba locales
      // TODO: Conectar con la API real
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
          titulo: 'Running matutino en Costanera',
          tipo: 'correr',
          fechaInicio: '2025-11-01T07:00:00',
          ubicacionLat: -31.6280,
          ubicacionLng: -60.6900,
          participantes: 8,
          maxParticipantes: 15
        },
        {
          id: '2',
          titulo: 'Yoga con mascotas en Parque Sur',
          tipo: 'yoga',
          fechaInicio: '2025-11-02T09:00:00',
          ubicacionLat: -31.6450,
          ubicacionLng: -60.6950,
          participantes: 5,
          maxParticipantes: 10
        },
        {
          id: '3',
          titulo: 'Caminata en Laguna Setúbal',
          tipo: 'caminar',
          fechaInicio: '2025-11-03T17:00:00',
          ubicacionLat: -31.6200,
          ubicacionLng: -60.6800,
          participantes: 12,
          maxParticipantes: 20
        },
        {
          id: '4',
          titulo: 'Ciclismo por Boulevard Gálvez',
          tipo: 'ciclismo',
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
      console.error('Error cargando datos del mapa:', error);
    } finally {
      setCargando(false);
    }
  };

  const manejarPresionMarcador = (tipo: 'usuario' | 'evento', elemento: any) => {
    setTipoElemento(tipo);
    setElementoSeleccionado(elemento);
    setDialogVisible(true);
  };

  const calcularDistanciaElemento = (elemento: UsuarioMapa | EventoMapa) => {
    if (!coordenadas || !elemento.ubicacionLat || !elemento.ubicacionLng) return 'N/A';
    
    const distancia = calcularDistancia(
      { latitud: coordenadas.latitud, longitud: coordenadas.longitud },
      { latitud: elemento.ubicacionLat, longitud: elemento.ubicacionLng }
    );
    
    return distancia < 1 
      ? `${Math.round(distancia * 1000)}m`
      : `${distancia.toFixed(1)}km`;
  };

  const { width, height } = Dimensions.get('window');

  if (!coordenadas) {
    return (
      <Surface style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Mapa de SportPetMatch" />
        </Appbar.Header>
        <View style={styles.centeredContainer}>
          <ActivityIndicator animating={true} size="large" />
          <Text style={{ marginTop: 16 }}>
            {ubicacionActual ? 'Cargando mapa...' : 'Configurando ubicación por defecto...'}
          </Text>
          <Text variant="bodySmall" style={{ marginTop: 8, textAlign: 'center' }}>
            Usando Santa Fe Capital como ubicación inicial
          </Text>
        </View>
      </Surface>
    );
  }

  return (
    <Surface style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Mapa de SportPetMatch" />
        <Appbar.Action 
          icon="refresh" 
          onPress={cargarDatosCercanos}
          disabled={cargando}
        />
      </Appbar.Header>

      <View style={styles.mapaContainer}>
        <VistaMapa
          coordenadas={coordenadas}
          usuarios={usuarios}
          eventos={eventos}
          onItemPress={manejarPresionMarcador}
        />
        
        {/* Controles flotantes */}
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
      </View>

      {/* Dialog de información */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>
            {tipoElemento === 'usuario' ? 'Usuario' : 'Evento'}
          </Dialog.Title>
          <Dialog.Content>
            {elementoSeleccionado && (
              <Card style={styles.dialogCard}>
                <Card.Content>
                  {tipoElemento === 'usuario' ? (
                    <>
                      <Text variant="headlineSmall">{elementoSeleccionado.nombre}</Text>
                      <Text variant="bodyMedium">{elementoSeleccionado.edad} años</Text>
                      <Text variant="bodySmall">{elementoSeleccionado.ubicacionCiudad}</Text>
                      <Text variant="bodySmall">
                        Distancia: {calcularDistanciaElemento(elementoSeleccionado)}
                      </Text>
                      <View style={styles.mascotasContainer}>
                        <Text variant="bodySmall" style={styles.mascotasTitle}>Mascotas:</Text>
                        {elementoSeleccionado.mascotas?.map((mascota: string, index: number) => (
                          <Chip key={index} compact style={styles.mascotaChip}>
                            {mascota}
                          </Chip>
                        ))}
                      </View>
                    </>
                  ) : (
                    <>
                      <Text variant="headlineSmall">{elementoSeleccionado.titulo}</Text>
                      <Text variant="bodyMedium">Tipo: {elementoSeleccionado.tipo}</Text>
                      <Text variant="bodySmall">
                        Fecha: {new Date(elementoSeleccionado.fechaInicio).toLocaleDateString('es-AR')}
                      </Text>
                      <Text variant="bodySmall">
                        Hora: {new Date(elementoSeleccionado.fechaInicio).toLocaleTimeString('es-AR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                      <Text variant="bodySmall">
                        Participantes: {elementoSeleccionado.participantes}/{elementoSeleccionado.maxParticipantes}
                      </Text>
                      <Text variant="bodySmall">
                        Distancia: {calcularDistanciaElemento(elementoSeleccionado)}
                      </Text>
                    </>
                  )}
                </Card.Content>
              </Card>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cerrar</Button>
            <Button mode="contained" onPress={() => {
              setDialogVisible(false);
              // TODO: Navegar a perfil de usuario o detalles de evento
            }}>
              Ver más
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* FAB para crear nuevo evento */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          // TODO: Navegar a crear evento
          console.log('Crear nuevo evento');
        }}
      />
    </Surface>
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
  },
  mapaContainer: {
    flex: 1,
    position: 'relative',
  },
  mapaSimulado: {
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  mapaImagen: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  ubicacionActual: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  coordenadasTexto: {
    marginTop: 8,
    fontFamily: 'monospace',
  },
  listaContainer: {
    flex: 1,
  },
  seccionTitulo: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    marginBottom: 4,
  },
  listItem: {
    backgroundColor: 'white',
    marginBottom: 1,
  },
  distanciaContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  divider: {
    marginVertical: 8,
  },
  controlesFlotantes: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'column',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  dialogCard: {
    marginBottom: 16,
  },
  mascotasContainer: {
    marginTop: 8,
  },
  mascotasTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mascotaChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});