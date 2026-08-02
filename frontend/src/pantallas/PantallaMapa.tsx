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
import { obtenerEventos } from '../servicios/servicioEventos';
import { obtenerRecomendaciones } from '../servicios/servicioMatches';

// Coordenadas de Santa Fe Capital, Argentina (por defecto)
const SANTA_FE_CAPITAL = {
  latitud: -31.6333,
  longitud: -60.7,
};

const PUNTOS_SANTA_FE = [
  { latitud: -31.6307, longitud: -60.6950, ciudad: 'Centro, Santa Fe' },
  { latitud: -31.6240, longitud: -60.7080, ciudad: 'Candioti Sur, Santa Fe' },
  { latitud: -31.6420, longitud: -60.6850, ciudad: 'Barranquitas, Santa Fe' },
  { latitud: -31.6180, longitud: -60.7120, ciudad: 'Guadalupe Norte, Santa Fe' },
  { latitud: -31.6350, longitud: -60.7000, ciudad: 'Costanera, Santa Fe' },
];

/** Tipografia web (Plus Jakarta / Outfit), misma familia que el resto de la app en web */
const fontSans = Platform.select({ web: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', default: undefined });
const fontDisplay = Platform.select({ web: '"Outfit", "Plus Jakarta Sans", system-ui, sans-serif', default: undefined });

const fechaFutura = (dias: number, hora = 9): string => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  fecha.setHours(hora, 0, 0, 0);
  return fecha.toISOString();
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
const VistaMapaSimple = ({ coordenadas, usuarios, eventos, onItemPress, onNavigateToEvents }: {
  coordenadas: { latitud: number; longitud: number };
  usuarios: UsuarioMapa[];
  eventos: EventoMapa[];
  onItemPress: (tipo: 'usuario' | 'evento', item: any) => void;
  onNavigateToEvents: () => void;
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
          <TouchableOpacity style={styles.leyendaItem} onPress={onNavigateToEvents} activeOpacity={0.75}>
            <View style={[styles.leyendaColor, { backgroundColor: '#F44336' }]} />
            <Text style={styles.leyendaTexto}>Eventos ({eventos.length})</Text>
          </TouchableOpacity>
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

  // En móvil, mostrar cabecera compacta con contadores y botón Google Maps
  return (
    <View style={styles.container}>
      <View style={styles.mapaMobileHeader}>
        <MaterialIcons name="map" size={32} color={temaApp.colors.primary} />
        <View style={styles.mapaMobileInfo}>
          <Text style={styles.mapaMobileTitulo}>Mapa de Indio</Text>
          <Text style={styles.mapaMobileUbicacion}>Santa Fe Capital, Argentina</Text>
        </View>
      </View>

      {/* Contadores de usuarios y eventos */}
      <View style={styles.contadoresRow}>
        <TouchableOpacity
          style={styles.contadorCard}
          onPress={() => onItemPress('usuario', usuarios[0])}
          activeOpacity={0.75}
        >
          <View style={[styles.contadorPunto, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.contadorNumero}>{usuarios.length}</Text>
          <Text style={styles.contadorLabel}>usuarios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contadorCard}
          onPress={onNavigateToEvents}
          activeOpacity={0.75}
        >
          <View style={[styles.contadorPunto, { backgroundColor: '#F44336' }]} />
          <Text style={styles.contadorNumero}>{eventos.length}</Text>
          <Text style={styles.contadorLabel}>eventos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contadorCard}
          onPress={() => {
            const marcadoresUrl = [
              `${coordenadas.latitud},${coordenadas.longitud}`,
              ...usuarios.map((u: any) => `${u.ubicacionLat},${u.ubicacionLng}`),
              ...eventos.map((e: any) => `${e.ubicacionLat},${e.ubicacionLng}`),
            ].join('/');
            Linking.openURL(`https://www.google.com/maps/dir/${marcadoresUrl}`).catch(() => {});
          }}
          activeOpacity={0.75}
        >
          <View style={[styles.contadorPunto, { backgroundColor: '#2196F3' }]} />
          <Text style={styles.contadorNumero}>
            <MaterialIcons name="open-in-new" size={14} color={temaApp.colors.primary} />
          </Text>
          <Text style={styles.contadorLabel}>Google Maps</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.listaContainer}
        contentContainerStyle={styles.listaContent}
      >
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

      const [usuariosRecomendados, eventosApi] = await Promise.all([
        obtenerRecomendaciones().catch(() => []),
        obtenerEventos({
          fechaDesde: new Date().toISOString(),
          limit: 20,
          esPetFriendly: true,
        }).catch(() => []),
      ]);

      const usuariosMapa = usuariosRecomendados.length > 0
        ? usuariosRecomendados.slice(0, 12).map((usuario, index) => {
            const punto = PUNTOS_SANTA_FE[index % PUNTOS_SANTA_FE.length];
            return {
              id: usuario.id,
              nombre: usuario.nombre,
              edad: 25,
              ubicacionLat: usuario.ubicacionLat || punto.latitud,
              ubicacionLng: usuario.ubicacionLng || punto.longitud,
              ubicacionCiudad: usuario.ubicacionCiudad || punto.ciudad,
              mascotas: usuario.mascotas.map((mascota) => `${mascota.nombre} (${mascota.tipo})`),
            };
          })
        : usuariosPrueba;

      const eventosMapa = eventosApi.length > 0
        ? eventosApi.slice(0, 12).map((evento, index) => {
            const punto = PUNTOS_SANTA_FE[(index + 1) % PUNTOS_SANTA_FE.length];
            return {
              id: evento.id,
              titulo: evento.titulo,
              tipo: evento.tipo,
              fechaInicio: evento.fechaInicio,
              ubicacionLat: punto.latitud,
              ubicacionLng: punto.longitud,
              participantes: evento.participantesCount || 0,
              maxParticipantes: evento.maxParticipantes || 20,
            };
          })
        : eventosPrueba.map((evento, index) => ({
            ...evento,
            fechaInicio: fechaFutura(index + 3, index % 2 === 0 ? 9 : 17),
          }));

      setUsuarios(usuariosMapa);
      setEventos(eventosMapa);
      
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
            onNavigateToEvents={() => navigation.navigate('Eventos')}
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
              onPress={() => navigation.navigate('Eventos')}
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
            {tipoElemento === 'evento' && (
              <Button mode="contained" onPress={() => {
                setDialogVisible(false);
                navigation.navigate('DetalleEvento', { eventoId: elementoSeleccionado.id });
              }}>
                Ver evento
              </Button>
            )}
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
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  listaContainer: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
  },
  listaContent: {
    paddingBottom: 80,
  },
  mapaMobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: espaciado.md,
    backgroundColor: temaApp.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: temaApp.colors.border,
    gap: espaciado.md,
  },
  mapaMobileInfo: {
    flex: 1,
  },
  mapaMobileTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
  },
  mapaMobileUbicacion: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: 2,
  },
  contadoresRow: {
    flexDirection: 'row',
    padding: espaciado.sm,
    backgroundColor: temaApp.colors.surface,
    gap: espaciado.sm,
    borderBottomWidth: 1,
    borderBottomColor: temaApp.colors.border,
  },
  contadorCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: espaciado.sm,
    borderRadius: 8,
    backgroundColor: temaApp.colors.muted || '#F5F5F5',
  },
  contadorPunto: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  contadorNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
  },
  contadorLabel: {
    fontSize: 11,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: 2,
  },
  seccionTitulo: {
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.md,
    backgroundColor: temaApp.colors.surface,
    fontWeight: '600',
    ...(fontDisplay ? { fontFamily: fontDisplay } : {}),
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
