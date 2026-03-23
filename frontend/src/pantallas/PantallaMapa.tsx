// Pantalla de Mapa - SportPetMatch
// Mapa interactivo con Google Maps (web y móvil)

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, ScrollView, TouchableOpacity, Linking, Dimensions } from 'react-native';
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
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUbicacion } from '../contextos/ContextoUbicacion';
import { temaApp, espaciado } from '../constantes/tema';

// Coordenadas de Santa Fe Capital, Argentina (por defecto)
const SANTA_FE_CAPITAL = {
  latitud: -31.6333,
  longitud: -60.7,
};

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

// Componente de Mapa con OpenStreetMap (sin API key requerida)
const VistaMapaSimple = ({ coordenadas, usuarios, eventos, onItemPress }: {
  coordenadas: { latitud: number; longitud: number };
  usuarios: UsuarioMapa[];
  eventos: EventoMapa[];
  onItemPress: (tipo: 'usuario' | 'evento', item: any) => void;
}) => {
  // URL de OpenStreetMap (gratis, sin API key)
  
  // En web, usar OpenStreetMap con marcadores visuales
  if (Platform.OS === 'web') {
    // Calcular bounding box para incluir todos los puntos
    const todasLasLatitudes = [coordenadas.latitud, ...usuarios.map(u => u.ubicacionLat), ...eventos.map(e => e.ubicacionLat)];
    const todasLasLongitudes = [coordenadas.longitud, ...usuarios.map(u => u.ubicacionLng), ...eventos.map(e => e.ubicacionLng)];
    
    const minLat = Math.min(...todasLasLatitudes);
    const maxLat = Math.max(...todasLasLatitudes);
    const minLng = Math.min(...todasLasLongitudes);
    const maxLng = Math.max(...todasLasLongitudes);
    
    // Agregar padding al bounding box
    const latPadding = (maxLat - minLat) * 0.1 || 0.01;
    const lngPadding = (maxLng - minLng) * 0.1 || 0.01;
    
    const bbox = `${minLng - lngPadding},${minLat - latPadding},${maxLng + lngPadding},${maxLat + latPadding}`;
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
    
    // URL para abrir en Google Maps con todos los marcadores
    const todosLosPuntos = [
      `${coordenadas.latitud},${coordenadas.longitud}`,
      ...usuarios.map(u => `${u.ubicacionLat},${u.ubicacionLng}`),
      ...eventos.map(e => `${e.ubicacionLat},${e.ubicacionLng}`),
    ];
    const googleMapsUrl = `https://www.google.com/maps/dir/${todosLosPuntos.join('/')}`;
    
    // Calcular posiciones relativas para los marcadores visuales
    const { width: mapWidth, height: mapHeight } = Dimensions.get('window');
    const mapContainerWidth = mapWidth - (espaciado.md * 2); // Ancho del contenedor del mapa
    const mapContainerHeight = 400; // Altura del iframe
    
    const calcularPosicion = (lat: number, lng: number) => {
      const latRange = maxLat - minLat + (latPadding * 2);
      const lngRange = maxLng - minLng + (lngPadding * 2);
      const latPercent = ((lat - (minLat - latPadding)) / latRange);
      const lngPercent = ((lng - (minLng - lngPadding)) / lngRange);
      
      // Convertir porcentajes a píxeles
      const top = (1 - latPercent) * mapContainerHeight;
      const left = lngPercent * mapContainerWidth;
      
      return { top, left };
    };
    
    return (
      <View style={styles.mapaContainer}>
        <View style={styles.mapaWebContainer}>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS === 'web' && typeof window !== 'undefined') {
                window.open(googleMapsUrl, '_blank');
              } else {
                Linking.openURL(googleMapsUrl);
              }
            }}
            activeOpacity={0.9}
            style={styles.mapaClickable}
          >
            {/* @ts-ignore - iframe funciona en web */}
            <iframe
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: 8 }}
              loading="lazy"
              src={mapUrl}
              title="Mapa de Indio"
            />
            {/* Marcadores visuales superpuestos */}
            <View style={styles.marcadoresOverlay}>
              {/* Tu ubicación */}
              <TouchableOpacity
                style={[styles.marcadorVisual, styles.marcadorAzul, calcularPosicion(coordenadas.latitud, coordenadas.longitud)]}
                onPress={() => onItemPress('usuario', { id: 'current', nombre: 'Tu ubicación', ubicacionLat: coordenadas.latitud, ubicacionLng: coordenadas.longitud })}
              >
                <MaterialIcons name="my-location" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              
              {/* Usuarios */}
              {usuarios.map((usuario) => (
                <TouchableOpacity
                  key={usuario.id}
                  style={[styles.marcadorVisual, styles.marcadorVerde, calcularPosicion(usuario.ubicacionLat, usuario.ubicacionLng)]}
                  onPress={() => onItemPress('usuario', usuario)}
                >
                  <MaterialIcons name="person" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              ))}
              
              {/* Eventos */}
              {eventos.map((evento) => (
                <TouchableOpacity
                  key={evento.id}
                  style={[styles.marcadorVisual, styles.marcadorRojo, calcularPosicion(evento.ubicacionLat, evento.ubicacionLng)]}
                  onPress={() => onItemPress('evento', evento)}
                >
                  <MaterialIcons name="event" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.mapaOverlayWeb}>
              <MaterialIcons name="open-in-new" size={20} color="#FFFFFF" />
              <Text style={styles.mapaOverlayTextoWeb}>
                Toca para ver en Google Maps
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.leyendaContainer}>
          <View style={styles.leyendaItem}>
            <View style={[styles.leyendaColor, { backgroundColor: '#2196F3' }]} />
            <Text style={styles.leyendaTexto}>Tu ubicación</Text>
          </View>
          <View style={styles.leyendaItem}>
            <View style={[styles.leyendaColor, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.leyendaTexto}>Usuarios ({usuarios.length})</Text>
          </View>
          <View style={styles.leyendaItem}>
            <View style={[styles.leyendaColor, { backgroundColor: '#F44336' }]} />
            <Text style={styles.leyendaTexto}>Eventos ({eventos.length})</Text>
          </View>
        </View>
        <ScrollView style={styles.listaContainer}>
          <ListaUsuariosYEventos
            usuarios={usuarios}
            eventos={eventos}
            coordenadas={coordenadas}
            onItemPress={onItemPress}
          />
        </ScrollView>
      </View>
    );
  }

  // En móvil, mostrar vista con marcadores visuales y botón para abrir en Google Maps
  return (
    <View style={styles.mapaContainer}>
      <View style={styles.mapaPlaceholderContainer}>
        <View style={styles.mapaPlaceholder}>
          <MaterialIcons name="map" size={64} color={temaApp.colors.primary} />
          <Text style={styles.mapaPlaceholderTitulo}>Mapa de Indio</Text>
          <Text style={styles.mapaPlaceholderTexto}>
            Ubicación: Santa Fe Capital, Argentina
          </Text>
          
          {/* Mostrar marcadores visuales */}
          <View style={styles.marcadoresContainer}>
            <View style={styles.marcadorItem}>
              <View style={[styles.marcadorPunto, { backgroundColor: '#2196F3' }]} />
              <Text style={styles.marcadorTexto}>Tu ubicación</Text>
            </View>
            {usuarios.length > 0 && (
              <View style={styles.marcadorItem}>
                <View style={[styles.marcadorPunto, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.marcadorTexto}>{usuarios.length} usuarios cercanos</Text>
              </View>
            )}
            {eventos.length > 0 && (
              <View style={styles.marcadorItem}>
                <View style={[styles.marcadorPunto, { backgroundColor: '#F44336' }]} />
                <Text style={styles.marcadorTexto}>{eventos.length} eventos cercanos</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            onPress={() => {
              // Abrir Google Maps en la app nativa con todos los marcadores
              const marcadoresUrl = [
                `${coordenadas.latitud},${coordenadas.longitud}`,
                ...usuarios.map(u => `${u.ubicacionLat},${u.ubicacionLng}`),
                ...eventos.map(e => `${e.ubicacionLat},${e.ubicacionLng}`),
              ].join('/');
              const url = `https://www.google.com/maps/dir/${marcadoresUrl}`;
              Linking.openURL(url).catch(err => console.error('Error abriendo Google Maps:', err));
            }}
            activeOpacity={0.8}
            style={styles.mapaPlaceholderBoton}
          >
            <MaterialIcons name="open-in-new" size={20} color="#FFFFFF" />
            <Text style={styles.mapaPlaceholderBotonTexto}>
              Ver en Google Maps
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.listaContainer}>
        <ListaUsuariosYEventos
          usuarios={usuarios}
          eventos={eventos}
          coordenadas={coordenadas}
          onItemPress={onItemPress}
        />
      </ScrollView>
    </View>
  );
};

// Componente para lista de usuarios y eventos
const ListaUsuariosYEventos = ({ usuarios, eventos, coordenadas, onItemPress }: any) => {
  const calcularDistancia = (item: any) => {
    const R = 6371;
    const dLat = (item.ubicacionLat - coordenadas.latitud) * Math.PI / 180;
    const dLon = (item.ubicacionLng - coordenadas.longitud) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coordenadas.latitud * Math.PI / 180) * Math.cos(item.ubicacionLat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distancia = R * c;
    return distancia < 1 ? `${Math.round(distancia * 1000)}m` : `${distancia.toFixed(1)}km`;
  };

  return (
    <>
      <Text variant="titleMedium" style={styles.seccionTitulo}>
        👥 Usuarios Cercanos ({usuarios.length})
      </Text>
      
      {usuarios.map((usuario: UsuarioMapa) => (
        <TouchableOpacity
          key={usuario.id}
          onPress={() => onItemPress('usuario', usuario)}
        >
          <List.Item
            title={usuario.nombre}
            description={`${usuario.edad} años - ${usuario.ubicacionCiudad}`}
            left={(props) => <List.Icon {...props} icon="account" />}
            right={() => (
              <View style={styles.distanciaContainer}>
                <Text variant="bodySmall">{calcularDistancia(usuario)}</Text>
                <MaterialIcons name="place" size={16} color={temaApp.colors.onSurfaceVariant} />
              </View>
            )}
            style={styles.listItem}
          />
        </TouchableOpacity>
      ))}
      
      <Divider style={styles.divider} />
      
      <Text variant="titleMedium" style={styles.seccionTitulo}>
        📅 Eventos pet-friendly ({eventos.length})
      </Text>
      
      {eventos.map((evento: EventoMapa) => (
        <TouchableOpacity
          key={evento.id}
          onPress={() => onItemPress('evento', evento)}
        >
          <List.Item
            title={evento.titulo}
            description={`${evento.tipo} - ${new Date(evento.fechaInicio).toLocaleDateString('es-AR')}`}
            left={(props) => <List.Icon {...props} icon="calendar" />}
            right={() => (
              <View style={styles.distanciaContainer}>
                <Text variant="bodySmall">{calcularDistancia(evento)}</Text>
                <Text variant="bodySmall">{evento.participantes}/{evento.maxParticipantes}</Text>
              </View>
            )}
            style={styles.listItem}
          />
        </TouchableOpacity>
      ))}
    </>
  );
};

export default function PantallaMapa() {
  const navigation = useNavigation<any>();
  const { coordenadas: coordenadasContexto } = useUbicacion();
  
  // Usar coordenadas del contexto o Santa Fe Capital por defecto
  const coordenadas = coordenadasContexto || SANTA_FE_CAPITAL;
  
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
      
      // Datos de prueba para Santa Fe Capital
      const usuariosPrueba: UsuarioMapa[] = [
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

      const eventosPrueba: EventoMapa[] = [
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
    
    const R = 6371;
    const dLat = (elemento.ubicacionLat - coordenadas.latitud) * Math.PI / 180;
    const dLon = (elemento.ubicacionLng - coordenadas.longitud) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coordenadas.latitud * Math.PI / 180) * Math.cos(elemento.ubicacionLat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distancia = R * c;
    
    return distancia < 1 
      ? `${Math.round(distancia * 1000)}m`
      : `${distancia.toFixed(1)}km`;
  };

  return (
    <Surface style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Mapa de Indio" />
        <Appbar.Action 
          icon="refresh" 
          onPress={cargarDatosCercanos}
          disabled={cargando}
        />
      </Appbar.Header>

      {cargando ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator animating={true} size="large" />
          <Text style={{ marginTop: 16 }}>Cargando mapa...</Text>
        </View>
      ) : (
        <View style={styles.mapaContainer}>
          <VistaMapaSimple
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
      )}

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
                      {elementoSeleccionado.mascotas?.length > 0 && (
                        <View style={styles.mascotasContainer}>
                          <Text variant="bodySmall" style={styles.mascotasTitle}>Mascotas:</Text>
                          {elementoSeleccionado.mascotas.map((mascota: string, index: number) => (
                            <Chip key={index} compact style={styles.mascotaChip}>
                              {mascota}
                            </Chip>
                          ))}
                        </View>
                      )}
                    </>
                  ) : (
                    <>
                      <Text variant="headlineSmall">{elementoSeleccionado.titulo}</Text>
                      <Text variant="bodyMedium">Tipo: {elementoSeleccionado.tipo}</Text>
                      <Text variant="bodySmall">
                        Fecha: {new Date(elementoSeleccionado.fechaInicio).toLocaleDateString('es-AR')}
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
              if (tipoElemento === 'evento') {
                navigation.navigate('DetalleEvento', { eventoId: elementoSeleccionado.id });
              }
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
        onPress={() => navigation.navigate('CrearEvento')}
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
  mapaWebContainer: {
    margin: espaciado.md,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: temaApp.colors.surface,
    position: 'relative',
  },
  mapaClickable: {
    position: 'relative',
    cursor: 'pointer',
  },
  marcadoresOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  marcadorVisual: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  marcadorAzul: {
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  marcadorVerde: {
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  marcadorRojo: {
    backgroundColor: '#F44336',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  mapaOverlayWeb: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: espaciado.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciado.xs,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  mapaOverlayTextoWeb: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  mapaPlaceholderContainer: {
    margin: espaciado.md,
  },
  mapaPlaceholder: {
    height: 300,
    backgroundColor: temaApp.colors.surface,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: espaciado.xl,
    borderWidth: 2,
    borderColor: temaApp.colors.primary,
    borderStyle: 'dashed',
  },
  mapaPlaceholderTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    marginTop: espaciado.md,
    marginBottom: espaciado.sm,
  },
  mapaPlaceholderTexto: {
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: espaciado.xs,
  },
  marcadoresContainer: {
    marginTop: espaciado.md,
    marginBottom: espaciado.md,
    gap: espaciado.sm,
  },
  marcadorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
  },
  marcadorPunto: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  marcadorTexto: {
    fontSize: 12,
    color: temaApp.colors.onSurface,
  },
  mapaPlaceholderBoton: {
    marginTop: espaciado.md,
    backgroundColor: temaApp.colors.primary,
    paddingHorizontal: espaciado.lg,
    paddingVertical: espaciado.md,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
  },
  mapaPlaceholderBotonTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  leyendaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: espaciado.md,
    padding: espaciado.sm,
    backgroundColor: temaApp.colors.surface,
    marginHorizontal: espaciado.md,
    borderRadius: 8,
    marginTop: espaciado.sm,
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
  },
  leyendaColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  leyendaTexto: {
    fontSize: 11,
    color: temaApp.colors.onSurfaceVariant,
  },
  listaContainer: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
  },
  seccionTitulo: {
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.md,
    backgroundColor: temaApp.colors.surface,
    fontWeight: '600',
  },
  listItem: {
    backgroundColor: temaApp.colors.surface,
    marginBottom: 1,
  },
  distanciaContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  divider: {
    marginVertical: espaciado.sm,
  },
  controlesFlotantes: {
    position: 'absolute',
    top: espaciado.md,
    right: espaciado.md,
    flexDirection: 'column',
    gap: espaciado.sm,
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  dialogCard: {
    marginBottom: espaciado.md,
  },
  mascotasContainer: {
    marginTop: espaciado.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciado.xs,
  },
  mascotasTitle: {
    fontWeight: 'bold',
    marginRight: espaciado.xs,
  },
  mascotaChip: {
    marginRight: espaciado.xs,
    marginBottom: espaciado.xs,
  },
  fab: {
    position: 'absolute',
    margin: espaciado.md,
    right: 0,
    bottom: 0,
  },
});
