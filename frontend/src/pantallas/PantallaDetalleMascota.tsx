// Pantalla de Detalle de Mascota - SportPetMatch
// Muestra información completa de una mascota y permite editarla

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Importar servicios y tema
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import {
  obtenerMascota,
  eliminarMascota,
  Mascota,
} from '../servicios/servicioMascotas';
import { temaApp, espaciado, sombras } from '../constantes/tema';
import { useAuth } from '../contextos/ContextoAuth';
import { mostrarAlerta } from '@/utilidades/alerta';

type DetalleMascotaRouteProp = RouteProp<RootStackParamList, 'DetalleMascota'>;
type DetalleMascotaNavigationProp = StackNavigationProp<RootStackParamList, 'DetalleMascota'>;

/**
 * Pantalla de Detalle de Mascota
 */
export default function PantallaDetalleMascota(): JSX.Element {
  const navigation = useNavigation<DetalleMascotaNavigationProp>();
  const route = useRoute<DetalleMascotaRouteProp>();
  const { mascotaId } = route.params;
  const { usuario } = useAuth();

  const [mascota, setMascota] = useState<Mascota | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarMascota();
  }, [mascotaId]);

  /**
   * Cargar información de la mascota
   */
  const cargarMascota = async () => {
    try {
      setCargando(true);
      const datosMascota = await obtenerMascota(mascotaId);
      setMascota(datosMascota);
    } catch (error: any) {
      console.error('Error cargando mascota:', error);
      mostrarAlerta('Error', 'No se pudo cargar la información de la mascota');
      navigation.goBack();
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  /**
   * Manejar refresh
   */
  const manejarRefresh = () => {
    setRefrescando(true);
    cargarMascota();
  };

  /**
   * Eliminar mascota
   */
  const manejarEliminar = async () => {
    if (!mascota || !usuario || mascota.usuarioId !== usuario.id) {
      return;
    }

    mostrarAlerta(
      'Eliminar Mascota',
      `¿Estás seguro de que quieres eliminar a ${mascota.nombre}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcesando(true);
              await eliminarMascota(mascotaId);
              mostrarAlerta('Éxito', 'Mascota eliminada exitosamente');
              navigation.goBack();
            } catch (error: any) {
              mostrarAlerta('Error', error.message || 'No se pudo eliminar la mascota');
            } finally {
              setProcesando(false);
            }
          },
        },
      ]
    );
  };

  /**
   * Editar mascota
   */
  const manejarEditar = () => {
    navigation.navigate('EditarMascota', { mascotaId });
  };

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color={temaApp.colors.primary} />
        <Text style={estilos.textoCarga}>Cargando mascota...</Text>
      </View>
    );
  }

  if (!mascota) {
    return (
      <View style={estilos.centrado}>
        <MaterialIcons name="error-outline" size={60} color={temaApp.colors.error} />
        <Text style={estilos.textoError}>No se pudo cargar la mascota</Text>
        <Button onPress={cargarMascota} style={estilos.botonReintentar}>
          Reintentar
        </Button>
      </View>
    );
  }

  const esPropietario = usuario && mascota.usuarioId === usuario.id;

  return (
    <ScrollView
      style={estilos.contenedor}
      contentContainerStyle={estilos.scrollContent}
      showsVerticalScrollIndicator={true}
      refreshControl={
        <RefreshControl
          refreshing={refrescando}
          onRefresh={manejarRefresh}
          colors={[temaApp.colors.primary]}
        />
      }
    >
      {/* Fotos */}
      {mascota.fotos && mascota.fotos.length > 0 ? (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={estilos.fotosScroll}
        >
          {mascota.fotos.map((foto, index) => (
            <Image key={index} source={{ uri: foto }} style={estilos.foto} />
          ))}
        </ScrollView>
      ) : (
        <View style={estilos.fotoPlaceholder}>
          <MaterialIcons name="pets" size={80} color={temaApp.colors.onSurfaceVariant} />
        </View>
      )}

      {/* Información principal */}
      <Card style={estilos.card}>
        <Card.Content>
          <Text style={estilos.nombre}>{mascota.nombre}</Text>
          <View style={estilos.infoBasica}>
            <Text style={estilos.tipo}>{mascota.tipo}</Text>
            {mascota.raza && <Text style={estilos.raza}>• {mascota.raza}</Text>}
            {mascota.edad && <Text style={estilos.edad}>• {mascota.edad} años</Text>}
          </View>

          <Divider style={estilos.divisor} />

          {/* Características físicas */}
          <View style={estilos.seccion}>
            <Text style={estilos.seccionTitulo}>Características Físicas</Text>
            <View style={estilos.infoGrid}>
              {mascota.peso && (
                <View style={estilos.infoItem}>
                  <MaterialIcons name="scale" size={20} color={temaApp.colors.primary} />
                  <Text style={estilos.infoTexto}>{mascota.peso} kg</Text>
                </View>
              )}
              {mascota.altura && (
                <View style={estilos.infoItem}>
                  <MaterialIcons name="height" size={20} color={temaApp.colors.primary} />
                  <Text style={estilos.infoTexto}>{mascota.altura} cm</Text>
                </View>
              )}
              {mascota.color && (
                <View style={estilos.infoItem}>
                  <MaterialIcons name="palette" size={20} color={temaApp.colors.primary} />
                  <Text style={estilos.infoTexto}>{mascota.color}</Text>
                </View>
              )}
              {mascota.genero && (
                <View style={estilos.infoItem}>
                  <MaterialIcons name="wc" size={20} color={temaApp.colors.primary} />
                  <Text style={estilos.infoTexto}>{mascota.genero}</Text>
                </View>
              )}
            </View>
          </View>

          <Divider style={estilos.divisor} />

          {/* Personalidad */}
          {mascota.personalidad && mascota.personalidad.length > 0 && (
            <View style={estilos.seccion}>
              <Text style={estilos.seccionTitulo}>Personalidad</Text>
              <View style={estilos.chipsContainer}>
                {mascota.personalidad.map((p, index) => (
                  <View key={index} style={estilos.chip}>
                    <Text style={estilos.chipTexto}>{p}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Intereses */}
          {mascota.intereses && mascota.intereses.length > 0 && (
            <View style={estilos.seccion}>
              <Text style={estilos.seccionTitulo}>Intereses</Text>
              <View style={estilos.chipsContainer}>
                {mascota.intereses.map((interes, index) => (
                  <View key={index} style={estilos.chip}>
                    <Text style={estilos.chipTexto}>{interes}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Nivel de actividad */}
          <View style={estilos.seccion}>
            <Text style={estilos.seccionTitulo}>Nivel de Actividad</Text>
            <View style={estilos.nivelContainer}>
              {[1, 2, 3, 4, 5].map((nivel) => (
                <View
                  key={nivel}
                  style={[
                    estilos.nivelBar,
                    nivel <= mascota.nivelActividad && estilos.nivelBarActivo,
                  ]}
                />
              ))}
              <Text style={estilos.nivelTexto}>{mascota.nivelActividad}/5</Text>
            </View>
          </View>

          {/* Salud */}
          {mascota.salud && (
            <View style={estilos.seccion}>
              <Text style={estilos.seccionTitulo}>Notas de Salud</Text>
              <Text style={estilos.textoNormal}>{mascota.salud}</Text>
            </View>
          )}

          {mascota.veterinario && (
            <View style={estilos.seccion}>
              <Text style={estilos.seccionTitulo}>Veterinario</Text>
              <Text style={estilos.textoNormal}>{mascota.veterinario}</Text>
            </View>
          )}

          {/* Botones de acción */}
          {esPropietario && (
            <View style={estilos.botonesContainer}>
              <Button
                mode="contained"
                onPress={manejarEditar}
                icon="edit"
                style={estilos.botonEditar}
              >
                Editar Mascota
              </Button>
              <Button
                mode="outlined"
                onPress={manejarEliminar}
                disabled={procesando}
                icon="delete"
                textColor={temaApp.colors.error}
                style={estilos.botonEliminar}
              >
                Eliminar Mascota
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
  },
  scrollContent: {
    padding: espaciado.md,
    paddingBottom: 150, // Espacio al final para asegurar scroll completo
    flexGrow: 1,
    minHeight: '100%', // Asegura que el contenido pueda hacer scroll
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: espaciado.xl,
  },
  textoCarga: {
    marginTop: espaciado.md,
    fontSize: 16,
    color: temaApp.colors.onSurfaceVariant,
  },
  textoError: {
    marginTop: espaciado.md,
    fontSize: 18,
    fontWeight: '600',
    color: temaApp.colors.error,
    textAlign: 'center',
  },
  botonReintentar: {
    marginTop: espaciado.md,
  },
  fotosScroll: {
    height: 300,
  },
  foto: {
    width: 400,
    height: 300,
    resizeMode: 'cover',
  },
  fotoPlaceholder: {
    height: 300,
    backgroundColor: temaApp.colors.surfaceVariant || '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: espaciado.md,
    ...sombras.media,
  },
  nombre: {
    fontSize: 28,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.sm,
  },
  infoBasica: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    marginBottom: espaciado.md,
  },
  tipo: {
    fontSize: 16,
    fontWeight: '600',
    color: temaApp.colors.primary,
  },
  raza: {
    fontSize: 16,
    color: temaApp.colors.onSurfaceVariant,
  },
  edad: {
    fontSize: 16,
    color: temaApp.colors.onSurfaceVariant,
  },
  divisor: {
    marginVertical: espaciado.md,
  },
  seccion: {
    marginBottom: espaciado.lg,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.md,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciado.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    flex: 1,
    minWidth: '45%',
  },
  infoTexto: {
    fontSize: 14,
    color: temaApp.colors.onSurface,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciado.sm,
  },
  chip: {
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
    borderRadius: 20,
    backgroundColor: temaApp.colors.surfaceVariant || '#E0E0E0',
  },
  chipTexto: {
    fontSize: 12,
    color: temaApp.colors.onSurface,
  },
  nivelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
  },
  nivelBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: temaApp.colors.surfaceVariant || '#E0E0E0',
  },
  nivelBarActivo: {
    backgroundColor: temaApp.colors.primary,
  },
  nivelTexto: {
    marginLeft: espaciado.sm,
    fontSize: 14,
    fontWeight: '600',
    color: temaApp.colors.onSurface,
  },
  textoNormal: {
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  botonesContainer: {
    marginTop: espaciado.xl,
    gap: espaciado.md,
  },
  botonEditar: {
    marginTop: espaciado.md,
  },
  botonEliminar: {
    marginTop: espaciado.sm,
  },
});

