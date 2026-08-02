// Pantalla de Mascotas de SportPetMatch
// Adaptada con nuevos componentes y servicios API

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { mostrarAlerta } from '@/utilidades/alerta';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Importar componentes UI
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Importar servicios y tema
import {
  obtenerMisMascotas,
  eliminarMascota,
  Mascota,
} from '@/servicios/servicioMascotas';
import { temaApp, espaciado, sombras } from '@/constantes/tema';
import { RootStackParamList } from '@/navegacion/NavegacionPrincipal';
import { useAuth } from '@/contextos/ContextoAuth';

type MascotasScreenNavigationProp = StackNavigationProp<RootStackParamList>;

/** Tipografia web (Plus Jakarta / Outfit), misma familia que el resto de la app en web */
const fontSans = Platform.select({ web: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', default: undefined });
const fontDisplay = Platform.select({ web: '"Outfit", "Plus Jakarta Sans", system-ui, sans-serif', default: undefined });

// Imágenes de mascotas por tipo
const imagenesMascotas: Record<string, any> = {
  perro: require('../../assets/golden-retriever-playing.png'),
  gato: require('../../assets/husky-running-mountain.jpg'),
  default: require('../../assets/golden-retriever-playing.png'),
};

/**
 * Pantalla de Mascotas - Gestión de mascotas del usuario
 */
export default function PantallaMascotas(): JSX.Element {
  const navigation = useNavigation<MascotasScreenNavigationProp>();
  const { estaAutenticado } = useAuth();

  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  // Se ejecuta al montar, al cambiar el estado de auth y cada vez que la
  // pantalla vuelve a tener foco (por ejemplo al volver de "Agregar
  // Mascota"), asi la mascota recien creada aparece sin recargar la pagina.
  useFocusEffect(
    React.useCallback(() => {
      if (estaAutenticado) {
        cargarMascotas();
      }
    }, [estaAutenticado])
  );

  /**
   * Cargar mascotas desde la API
   */
  const cargarMascotas = async () => {
    try {
      setCargando(true);
      const datosMascotas = await obtenerMisMascotas();
      setMascotas(datosMascotas);
    } catch (error: any) {
      console.error('Error cargando mascotas:', error);
      if (error.message?.includes('No autenticado')) {
        mostrarAlerta('Autenticación requerida', 'Debes iniciar sesión para ver tus mascotas');
      }
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
    cargarMascotas();
  };

  /**
   * Obtener imagen de la mascota
   */
  const obtenerImagenMascota = (mascota: Mascota): any => {
    if (mascota.fotos && mascota.fotos.length > 0) {
      // Si tiene fotos, intentar usarlas (por ahora placeholder)
      return imagenesMascotas.default;
    }
    
    const tipoLower = mascota.tipo.toLowerCase();
    if (tipoLower.includes('perro') || tipoLower.includes('dog')) {
      return imagenesMascotas.perro;
    }
    if (tipoLower.includes('gato') || tipoLower.includes('cat')) {
      return imagenesMascotas.gato;
    }
    return imagenesMascotas.default;
  };

  /**
   * Manejar eliminar mascota
   */
  const manejarEliminar = (mascotaId: string, nombreMascota: string) => {
    mostrarAlerta(
      'Eliminar Mascota',
      `¿Estás seguro de que quieres eliminar a ${nombreMascota}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarMascota(mascotaId);
              mostrarAlerta('Éxito', 'Mascota eliminada exitosamente');
              cargarMascotas(); // Recargar lista
            } catch (error: any) {
              mostrarAlerta('Error', error.message || 'No se pudo eliminar la mascota');
            }
          },
        },
      ]
    );
  };

  /**
   * Navegar a agregar mascota
   */
  const navegarAAgregar = () => {
    navigation.navigate('AgregarMascota');
  };

  /**
   * Navegar a detalle de mascota
   */
  const navegarADetalle = (mascotaId: string) => {
    navigation.navigate('DetalleMascota', { mascotaId });
  };

  if (!estaAutenticado) {
    return (
      <View style={estilos.centrado}>
        <MaterialIcons name="lock" size={60} color={temaApp.colors.onSurfaceVariant} />
        <Text style={estilos.textoVacio}>Debes iniciar sesión para ver tus mascotas</Text>
      </View>
    );
  }

  if (cargando && mascotas.length === 0) {
    return (
      <View style={estilos.centrado}>
        <Text>Cargando mascotas...</Text>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      {/* Header con botón agregar */}
      <View style={estilos.header}>
        <Text style={estilos.titulo}>Mis Mascotas</Text>
        <Button
          variant="secondary"
          size="sm"
          icon="add"
          onPress={navegarAAgregar}
        >
          Agregar
        </Button>
      </View>

      {/* Lista de mascotas */}
      <ScrollView
        style={estilos.scrollView}
        contentContainerStyle={estilos.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={manejarRefresh}
            colors={[temaApp.colors.primary]}
          />
        }
      >
        {mascotas.length === 0 ? (
          <View style={estilos.vacio}>
            <MaterialIcons name="pets" size={60} color={temaApp.colors.onSurfaceVariant} />
            <Text style={estilos.textoVacio}>No tienes mascotas registradas</Text>
            <Text style={estilos.subtextoVacio}>
              Agrega tu primera mascota para comenzar
            </Text>
            <Button
              variant="default"
              size="lg"
              icon="add"
              onPress={navegarAAgregar}
              style={estilos.botonAgregar}
            >
              Agregar Mascota
            </Button>
          </View>
        ) : (
          mascotas.map((mascota) => (
            <TouchableOpacity
              key={mascota.id}
              onPress={() => navegarADetalle(mascota.id)}
              activeOpacity={0.7}
            >
              <Card style={estilos.cardMascota}>
                <View style={estilos.contenidoCard}>
                  <Image
                    source={obtenerImagenMascota(mascota)}
                    style={estilos.imagenMascota}
                    resizeMode="cover"
                  />
                  <View style={estilos.infoMascota}>
                    <View style={estilos.headerMascota}>
                      <Text style={estilos.nombreMascota}>{mascota.nombre}</Text>
                      <View style={estilos.badgesContainer}>
                        {mascota.tipo && (
                          <View style={estilos.badgeTipo}>
                            <Text style={estilos.badgeTipoTexto}>
                              {mascota.tipo}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Text style={estilos.infoTexto}>
                      {mascota.raza && `${mascota.raza} • `}
                      {mascota.edad ? `${mascota.edad} años` : 'Edad no especificada'}
                    </Text>
                    {mascota.intereses && mascota.intereses.length > 0 && (
                      <View style={estilos.interesesContainer}>
                        {mascota.intereses.slice(0, 3).map((interes, index) => (
                          <View key={index} style={estilos.interesBadge}>
                            <Text style={estilos.interesTexto}>{interes}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    style={estilos.botonEliminar}
                    onPress={() => manejarEliminar(mascota.id, mascota.nombre)}
                  >
                    <MaterialIcons name="delete" size={20} color={temaApp.colors.error} />
                  </TouchableOpacity>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: espaciado.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: espaciado.md,
    backgroundColor: temaApp.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: temaApp.colors.border,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    ...(fontDisplay ? { fontFamily: fontDisplay } : {}),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: espaciado.md,
    paddingBottom: 100,
    ...(Platform.OS === 'web'
      ? { paddingHorizontal: 32, flexDirection: 'row', flexWrap: 'wrap', gap: 20, paddingTop: 20 }
      : {}),
  },
  cardMascota: {
    marginBottom: espaciado.md,
    ...sombras.media,
    ...(Platform.OS === 'web' ? { width: 340, marginBottom: 0, borderRadius: 16 } : {}),
  },
  contenidoCard: {
    flexDirection: 'row',
    padding: espaciado.md,
  },
  imagenMascota: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: temaApp.colors.muted || '#EDEDED',
  },
  infoMascota: {
    flex: 1,
    marginLeft: espaciado.md,
  },
  headerMascota: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: espaciado.xs,
  },
  nombreMascota: {
    fontSize: 18,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    flex: 1,
    ...(fontDisplay ? { fontFamily: fontDisplay } : {}),
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: espaciado.xs,
  },
  badgeTipo: {
    backgroundColor: temaApp.colors.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTipoTexto: {
    fontSize: 12,
    color: temaApp.colors.onPrimaryContainer,
    fontWeight: '600',
  },
  infoTexto: {
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
    marginBottom: espaciado.xs,
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  interesesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciado.xs,
    marginTop: espaciado.xs,
  },
  interesBadge: {
    backgroundColor: temaApp.colors.accent + '33',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interesTexto: {
    fontSize: 12,
    color: temaApp.colors.accent,
    fontWeight: '500',
  },
  botonEliminar: {
    padding: espaciado.xs,
    marginLeft: espaciado.sm,
  },
  vacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: espaciado.xl,
  },
  textoVacio: {
    fontSize: 18,
    fontWeight: '600',
    color: temaApp.colors.onSurface,
    marginTop: espaciado.md,
    textAlign: 'center',
  },
  subtextoVacio: {
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: espaciado.sm,
    marginBottom: espaciado.lg,
    textAlign: 'center',
  },
  botonAgregar: {
    marginTop: espaciado.md,
  },
});
