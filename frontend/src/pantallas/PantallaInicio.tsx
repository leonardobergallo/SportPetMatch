// Pantalla de Inicio de SportPetMatch
// Pantalla principal con feed de actividades y resumen

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  Alert 
} from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  FAB,
  Chip,
  Avatar,
  Divider 
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

// Importar tema y constantes
import { temaApp, espaciado, sombras } from '../constantes/tema';

/**
 * Pantalla de Inicio - Feed principal de la aplicación
 * 
 * Esta pantalla muestra:
 * - Resumen de actividades recientes
 * - Eventos próximos
 * - Matches recientes
 * - Desafíos activos
 * - Acceso rápido a funciones principales
 * 
 * @returns JSX.Element - La pantalla de inicio renderizada
 */
export default function PantallaInicio(): JSX.Element {
  // Estado para controlar el refresh
  const [refrescando, setRefrescando] = useState(false);
  
  // Estado para datos del dashboard
  const [datos, setDatos] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  // Cargar datos al iniciar la pantalla
  useEffect(() => {
    cargarDatos();
  }, []);

  /**
   * Función para cargar datos del backend
   */
  const cargarDatos = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/dashboard');
      const result = await response.json();
      
      if (result.success) {
        setDatos(result.data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  /**
   * Función para manejar el refresh de la pantalla
   * Carga datos desde el servidor
   */
  const manejarRefresh = React.useCallback(() => {
    setRefrescando(true);
    
    // Cargar datos reales desde la API
    cargarDatos().finally(() => {
      setRefrescando(false);
    });
  }, []);

  /**
   * Función para manejar la creación de un nuevo evento
   */
  const manejarCrearEvento = () => {
    Alert.alert(
      'Crear Evento',
      '¿Te gustaría crear un nuevo evento deportivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Crear', onPress: () => {
          // TODO: Navegar a pantalla de crear evento
          console.log('Navegar a crear evento');
        }}
      ]
    );
  };

  /**
   * Función para manejar la búsqueda de eventos cercanos
   */
  const manejarBuscarEventos = () => {
    Alert.alert(
      'Buscar Eventos',
      '¿Te gustaría buscar eventos cerca de tu ubicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Buscar', onPress: () => {
          // TODO: Navegar a pantalla de búsqueda de eventos
          console.log('Navegar a buscar eventos');
        }}
      ]
    );
  };

  return (
    <View style={estilos.contenedor}>
      <ScrollView
        style={estilos.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={manejarRefresh}
            colors={[temaApp.colors.primary]}
            tintColor={temaApp.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header de bienvenida */}
        <Card style={[estilos.tarjeta, estilos.tarjetaBienvenida]}>
          <Card.Content>
            <View style={estilos.headerBienvenida}>
              <View style={estilos.textoBienvenida}>
                <Text variant="headlineSmall" style={estilos.tituloBienvenida}>
                  ¡Hola {datos?.usuario?.nombre || 'Usuario'}! 👋
                </Text>
                <Text variant="bodyLarge" style={estilos.subtituloBienvenida}>
                  ¿Listo para una nueva aventura deportiva con tu mascota?
                </Text>
              </View>
              <View style={estilos.avatarContainer}>
                <Avatar.Image 
                  size={60} 
                  source={{ uri: datos?.usuario?.avatar || 'https://via.placeholder.com/60' }}
                  style={estilos.avatarBienvenida}
                />
                <Button
                  mode="text"
                  onPress={() => {
                    Alert.alert(
                      'Cerrar Sesión',
                      '¿Estás seguro que quieres cerrar sesión?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Cerrar Sesión', onPress: () => {
                          // TODO: Implementar logout
                          console.log('Logout');
                        }}
                      ]
                    );
                  }}
                  style={estilos.botonLogout}
                  textColor="#fff"
                >
                  Salir
                </Button>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Acciones rápidas */}
        <Card style={estilos.tarjeta}>
          <Card.Content>
            <Text variant="titleMedium" style={estilos.tituloSeccion}>
              Acciones Rápidas
            </Text>
            <View style={estilos.contenedorAcciones}>
              <Button
                mode="contained"
                onPress={manejarCrearEvento}
                style={estilos.botonAccion}
                icon="plus"
              >
                Crear Evento
              </Button>
              <Button
                mode="outlined"
                onPress={manejarBuscarEventos}
                style={estilos.botonAccion}
                icon="magnify"
              >
                Buscar Eventos
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Eventos próximos */}
        <Card style={estilos.tarjeta}>
          <Card.Content>
            <View style={estilos.headerSeccion}>
              <Text variant="titleMedium" style={estilos.tituloSeccion}>
                Eventos Próximos
              </Text>
              <Chip 
                mode="outlined" 
                compact
                textStyle={estilos.textoChip}
              >
                {datos?.eventosRecientes?.length || 0} eventos
              </Chip>
            </View>
            
            {/* Lista de eventos del backend */}
            <View style={estilos.listaEventos}>
              {datos?.eventosRecientes?.map((evento: any, index: number) => (
                <View key={evento.id || index}>
                  <View style={estilos.itemEvento}>
                    <View style={estilos.infoEvento}>
                      <Text variant="titleSmall">{evento.nombre || evento.titulo}</Text>
                      <Text variant="bodySmall" style={estilos.textoSecundario}>
                        📍 {evento.ubicacion || 'Por definir'} • 👥 {evento.participantes} participantes
                      </Text>
                    </View>
                    <Chip 
                      mode="outlined" 
                      compact
                      style={estilos.chipTipo}
                    >
                      Evento
                    </Chip>
                  </View>
                  {index < (datos?.eventosRecientes?.length - 1) && <Divider style={estilos.divisor} />}
                </View>
              )) || (
                <Text variant="bodyMedium" style={estilos.textoSecundario}>
                  No hay eventos próximos
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Matches recientes */}
        <Card style={estilos.tarjeta}>
          <Card.Content>
            <View style={estilos.headerSeccion}>
              <Text variant="titleMedium" style={estilos.tituloSeccion}>
                Matches Recientes
              </Text>
              <Chip 
                mode="outlined" 
                compact
                textStyle={estilos.textoChip}
              >
                2 nuevos
              </Chip>
            </View>
            
            {/* Lista de matches (simulada) */}
            <View style={estilos.listaMatches}>
              <View style={estilos.itemMatch}>
                <Avatar.Text 
                  size={40} 
                  label="M" 
                  style={estilos.avatarMatch}
                />
                <View style={estilos.infoMatch}>
                  <Text variant="titleSmall">María González</Text>
                  <Text variant="bodySmall" style={estilos.textoSecundario}>
                    Tiene un Golden Retriever
                  </Text>
                </View>
                <MaterialIcons 
                  name="favorite" 
                  size={24} 
                  color={temaApp.colors.primary} 
                />
              </View>
              
              <Divider style={estilos.divisor} />
              
              <View style={estilos.itemMatch}>
                <Avatar.Text 
                  size={40} 
                  label="C" 
                  style={estilos.avatarMatch}
                />
                <View style={estilos.infoMatch}>
                  <Text variant="titleSmall">Carlos Ruiz</Text>
                  <Text variant="bodySmall" style={estilos.textoSecundario}>
                    Interesado en senderismo
                  </Text>
                </View>
                <MaterialIcons 
                  name="favorite" 
                  size={24} 
                  color={temaApp.colors.primary} 
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Desafíos activos */}
        <Card style={estilos.tarjeta}>
          <Card.Content>
            <Text variant="titleMedium" style={estilos.tituloSeccion}>
              Desafíos Activos
            </Text>
            
            <View style={estilos.listaDesafios}>
              <View style={estilos.itemDesafio}>
                <View style={estilos.infoDesafio}>
                  <Text variant="titleSmall">Caminar 10km</Text>
                  <Text variant="bodySmall" style={estilos.textoSecundario}>
                    Progreso: 7/10 km
                  </Text>
                </View>
                <Chip 
                  mode="outlined" 
                  compact
                  style={estilos.chipProgreso}
                >
                  70%
                </Chip>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Espacio para el FAB */}
        <View style={estilos.espacioFAB} />
      </ScrollView>

      {/* Botón flotante para crear evento */}
      <FAB
        icon="plus"
        style={estilos.fab}
        onPress={manejarCrearEvento}
        label="Crear Evento"
      />
    </View>
  );
}

// Estilos de la pantalla
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  tarjeta: {
    margin: espaciado.md,
    marginBottom: espaciado.sm,
    ...sombras.media,
  },
  tarjetaBienvenida: {
    backgroundColor: temaApp.colors.primaryContainer,
  },
  headerBienvenida: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textoBienvenida: {
    flex: 1,
    marginRight: espaciado.md,
  },
  tituloBienvenida: {
    color: temaApp.colors.onPrimaryContainer,
    fontWeight: 'bold',
  },
  subtituloBienvenida: {
    color: temaApp.colors.onPrimaryContainer,
    marginTop: espaciado.xs,
  },
  avatarBienvenida: {
    backgroundColor: temaApp.colors.primary,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  botonLogout: {
    marginTop: 4,
  },
  tituloSeccion: {
    fontWeight: '600',
    marginBottom: espaciado.md,
    color: temaApp.colors.onSurface,
  },
  contenedorAcciones: {
    flexDirection: 'row',
    gap: espaciado.md,
  },
  botonAccion: {
    flex: 1,
  },
  headerSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: espaciado.md,
  },
  textoChip: {
    fontSize: 12,
  },
  listaEventos: {
    gap: espaciado.sm,
  },
  itemEvento: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: espaciado.sm,
  },
  infoEvento: {
    flex: 1,
  },
  textoSecundario: {
    color: temaApp.colors.onSurfaceVariant,
    marginTop: 2,
  },
  chipTipo: {
    marginLeft: espaciado.md,
  },
  divisor: {
    marginVertical: espaciado.xs,
  },
  listaMatches: {
    gap: espaciado.sm,
  },
  itemMatch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: espaciado.sm,
  },
  avatarMatch: {
    backgroundColor: temaApp.colors.primary,
    marginRight: espaciado.md,
  },
  infoMatch: {
    flex: 1,
  },
  listaDesafios: {
    gap: espaciado.sm,
  },
  itemDesafio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: espaciado.sm,
  },
  infoDesafio: {
    flex: 1,
  },
  chipProgreso: {
    backgroundColor: temaApp.colors.primaryContainer,
  },
  espacioFAB: {
    height: 100, // Espacio para el FAB
  },
  fab: {
    position: 'absolute',
    margin: espaciado.md,
    right: 0,
    bottom: 0,
    backgroundColor: temaApp.colors.primary,
  },
});
