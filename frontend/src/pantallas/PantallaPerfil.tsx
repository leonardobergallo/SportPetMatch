// Pantalla de Perfil de SportPetMatch
// Perfil del usuario y configuración

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { Text, Card, Avatar, Switch, Divider, List } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { temaApp, espaciado, sombras } from '../constantes/tema';
import { useAuth } from '../contextos/ContextoAuth';
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import { Button } from '@/components/ui/button';
import { obtenerDashboard } from '../servicios/servicioAuth';

// Importar componente Card si existe
// import { Card, CardContent } from '@/components/ui/card';

type PerfilScreenNavigationProp = StackNavigationProp<RootStackParamList>;

/** Tipografia web (Plus Jakarta / Outfit), misma familia que el resto de la app en web */
const fontSans = Platform.select({ web: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', default: undefined });
const fontDisplay = Platform.select({ web: '"Outfit", "Plus Jakarta Sans", system-ui, sans-serif', default: undefined });

export default function PantallaPerfil(): JSX.Element {
  const navigation = useNavigation<PerfilScreenNavigationProp>();
  const { usuario, cerrarSesion } = useAuth();
  const [notificacionesHabilitadas, setNotificacionesHabilitadas] = useState(true);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [estadisticas, setEstadisticas] = useState({ eventos: 0, matches: 0, mascotas: 0 });
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(true);
  const [visorFoto, setVisorFoto] = useState<number | null>(null);

  const fotosPerfil = usuario?.fotos?.length
    ? usuario.fotos
    : usuario?.avatar
      ? [usuario.avatar]
      : [];

  const fotoPrincipal = fotosPerfil[0] || usuario?.avatar || null;
  const fotoVisor = visorFoto !== null ? fotosPerfil[visorFoto] : null;

  const moverVisor = (paso: number) => {
    if (visorFoto === null || fotosPerfil.length === 0) return;
    const siguiente = (visorFoto + paso + fotosPerfil.length) % fotosPerfil.length;
    setVisorFoto(siguiente);
  };

  useEffect(() => {
    let activo = true;
    obtenerDashboard()
      .then((data) => {
        if (!activo) return;
        setEstadisticas({
          eventos: data.estadisticas?.eventosParticipados ?? 0,
          matches: data.estadisticas?.matchesRealizados ?? 0,
          mascotas: data.estadisticas?.mascotasRegistradas ?? 0,
        });
      })
      .catch((error) => {
        console.error('Error cargando estadísticas del perfil:', error);
      })
      .finally(() => {
        if (activo) setCargandoEstadisticas(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  return (
    <ScrollView 
      style={estilos.contenedor}
      contentContainerStyle={estilos.scrollContent}
      showsVerticalScrollIndicator={true}
    >
      {/* Header de Perfil */}
      <View style={estilos.profileHeader}>
        <View style={estilos.banner}>
          {/* Banner gradient */}
        </View>
        <View style={estilos.profileInfo}>
          <TouchableOpacity
            style={estilos.avatarContainer}
            activeOpacity={0.85}
            onPress={() => fotoPrincipal && setVisorFoto(0)}
          >
            {fotoPrincipal ? (
              <Image source={{ uri: fotoPrincipal }} style={estilos.avatar} />
            ) : (
              <Avatar.Text 
                size={80} 
                label={usuario?.nombre?.charAt(0).toUpperCase() || 'U'} 
                style={estilos.avatar}
              />
            )}
            {fotosPerfil.length > 0 && (
              <View style={estilos.fotosBadge}>
                <MaterialIcons name="photo-library" size={12} color="#FFFFFF" />
                <Text style={estilos.fotosBadgeTxt}>{fotosPerfil.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={estilos.nombreUsuario}>
            {usuario?.nombre || 'Usuario'}
          </Text>
          <Text style={estilos.emailUsuario}>{usuario?.email || 'email@example.com'}</Text>
          <View style={estilos.ubicacionContainer}>
            <MaterialIcons name="place" size={16} color={temaApp.colors.onSurfaceVariant} />
            <Text style={estilos.ubicacion}>
              {usuario?.ubicacionCiudad || usuario?.ciudad || 'Ubicación pendiente'}
            </Text>
          </View>
        </View>
        
        {/* Botones de acción */}
        <View style={estilos.accionesContainer}>
          <Button 
            variant="secondary" 
            onPress={() => navigation.navigate('EditarPerfil')}
            style={estilos.botonAccion}
          >
            <MaterialIcons name="edit" size={18} color="#FFFFFF" />
            <Text style={estilos.botonTextoAccion}>Editar Perfil</Text>
          </Button>
          <TouchableOpacity 
            style={estilos.botonVerMascota}
            onPress={() => (navigation as any).navigate('Principal', { screen: 'Mascotas' })}
          >
            <Text style={estilos.botonTextoVerMascota}>Ver Mis Mascotas</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Galería con la mascota */}
      <View style={estilos.galeriaSection}>
        <View style={estilos.galeriaHeader}>
          <View style={{ flex: 1 }}>
            <Text style={estilos.galeriaTitulo}>Momentos con mi mascota 🐾</Text>
            <Text style={estilos.galeriaSubtitulo}>
              {fotosPerfil.length > 0
                ? 'Tocá una foto para verla en grande'
                : 'Sumá fotos para que te conozcan'}
            </Text>
          </View>
          <TouchableOpacity
            style={estilos.galeriaEditar}
            onPress={() => navigation.navigate('EditarPerfil')}
          >
            <MaterialIcons name="add-a-photo" size={18} color={temaApp.colors.primary} />
            <Text style={estilos.galeriaEditarTxt}>
              {fotosPerfil.length > 0 ? 'Agregar' : 'Sumar fotos'}
            </Text>
          </TouchableOpacity>
        </View>

        {fotosPerfil.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={estilos.galeriaScroll}
          >
            {fotosPerfil.map((foto, index) => (
              <TouchableOpacity
                key={`${foto}-${index}`}
                style={estilos.galeriaCard}
                activeOpacity={0.85}
                onPress={() => setVisorFoto(index)}
              >
                <Image source={{ uri: foto }} style={estilos.galeriaFoto} />
                {index === 0 && (
                  <View style={estilos.galeriaPrincipalBadge}>
                    <Text style={estilos.galeriaPrincipalTxt}>Principal</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <TouchableOpacity
            style={estilos.galeriaVacia}
            onPress={() => navigation.navigate('EditarPerfil')}
            activeOpacity={0.85}
          >
            <View style={estilos.galeriaVaciaIcono}>
              <MaterialIcons name="pets" size={28} color={temaApp.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={estilos.galeriaVaciaTitulo}>Tu galería está esperando</Text>
              <Text style={estilos.galeriaVaciaTexto}>
                Subí hasta 6 fotos con tu perro y mostrá tu mejor lado.
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={22}
              color={temaApp.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Visor de fotos */}
      <Modal
        visible={visorFoto !== null && !!fotoVisor}
        transparent
        animationType="fade"
        onRequestClose={() => setVisorFoto(null)}
      >
        <View style={estilos.visorFondo}>
          <TouchableOpacity style={estilos.visorCerrar} onPress={() => setVisorFoto(null)}>
            <MaterialIcons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          {fotoVisor && (
            <Image
              source={{ uri: fotoVisor }}
              style={estilos.visorImagen}
              resizeMode="contain"
            />
          )}

          {fotosPerfil.length > 1 && (
            <>
              <TouchableOpacity
                style={[estilos.visorFlecha, estilos.visorFlechaIzq]}
                onPress={() => moverVisor(-1)}
              >
                <MaterialIcons name="chevron-left" size={34} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[estilos.visorFlecha, estilos.visorFlechaDer]}
                onPress={() => moverVisor(1)}
              >
                <MaterialIcons name="chevron-right" size={34} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          )}

          <View style={estilos.visorContador}>
            <Text style={estilos.visorContadorTxt}>
              {visorFoto !== null ? visorFoto + 1 : 0} / {fotosPerfil.length}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Banner: perfil incompleto */}
      {(fotosPerfil.length === 0 || !usuario?.biografia) && (
        <TouchableOpacity
          style={estilos.bannerInompleto}
          onPress={() => navigation.navigate('EditarPerfil')}
          activeOpacity={0.85}
        >
          <MaterialIcons name="edit" size={22} color="#fff" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={estilos.bannerTitle}>Completá tu perfil 🐾</Text>
            <Text style={estilos.bannerSub}>Agregá una foto con tu mascota y una descripción para que otros te encuentren.</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Acceso a funcionalidades */}
      <TouchableOpacity
        style={estilos.cardFuncionalidades}
        onPress={() => navigation.navigate('Funcionalidades')}
        activeOpacity={0.85}
      >
        <View style={estilos.funcionalidadesIcono}>
          <MaterialIcons name="apps" size={26} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={estilos.funcionalidadesTitle}>Descubrí las funcionalidades</Text>
          <Text style={estilos.funcionalidadesDesc}>
            Eventos, matching, lugares pet friendly, membresía y paseos con GPS.
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={temaApp.colors.onSurfaceVariant} />
      </TouchableOpacity>

      {/* Configuración */}
      <Card style={estilos.cardConfig}>
        <Card.Content>
          <Text style={estilos.seccionTitulo}>Configuración</Text>
          
          <TouchableOpacity style={estilos.configItem}>
            <MaterialIcons name="notifications" size={24} color={temaApp.colors.primary} />
            <View style={estilos.configContent}>
              <Text style={estilos.configLabel}>Notificaciones</Text>
              <Text style={estilos.configDescription}>Recibir alertas de matches y eventos</Text>
            </View>
            <Switch
              value={notificacionesHabilitadas}
              onValueChange={setNotificacionesHabilitadas}
              color={temaApp.colors.primary}
            />
          </TouchableOpacity>

          <Divider style={estilos.divider} />

          <TouchableOpacity style={estilos.configItem}>
            <MaterialIcons name="dark-mode" size={24} color={temaApp.colors.primary} />
            <View style={estilos.configContent}>
              <Text style={estilos.configLabel}>Modo Oscuro</Text>
              <Text style={estilos.configDescription}>Cambiar tema de la aplicación</Text>
            </View>
            <Switch
              value={modoOscuro}
              onValueChange={setModoOscuro}
              color={temaApp.colors.primary}
            />
          </TouchableOpacity>

          <Divider style={estilos.divider} />

          <TouchableOpacity 
            style={estilos.configItem}
            onPress={() => navigation.navigate('Configuracion')}
          >
            <MaterialIcons name="settings" size={24} color={temaApp.colors.primary} />
            <View style={estilos.configContent}>
              <Text style={estilos.configLabel}>Configuración</Text>
              <Text style={estilos.configDescription}>Ajustes y preferencias</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={temaApp.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* Estadísticas */}
      <Card style={estilos.cardStats}>
        <Card.Content>
          <Text style={estilos.seccionTitulo}>Estadísticas</Text>
          <View style={estilos.statsGrid}>
            <View style={estilos.statItem}>
              <MaterialIcons name="event" size={32} color={temaApp.colors.primary} />
              <Text style={estilos.statValue}>{cargandoEstadisticas ? '—' : estadisticas.eventos}</Text>
              <Text style={estilos.statLabel}>Eventos</Text>
            </View>
            <View style={estilos.statItem}>
              <MaterialIcons name="favorite" size={32} color={temaApp.colors.like} />
              <Text style={estilos.statValue}>{cargandoEstadisticas ? '—' : estadisticas.matches}</Text>
              <Text style={estilos.statLabel}>Matches</Text>
            </View>
            <View style={estilos.statItem}>
              <MaterialIcons name="pets" size={32} color={temaApp.colors.accent} />
              <Text style={estilos.statValue}>{cargandoEstadisticas ? '—' : estadisticas.mascotas}</Text>
              <Text style={estilos.statLabel}>Mascotas</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Cerrar Sesión */}
      <TouchableOpacity 
        style={estilos.cerrarSesion}
        onPress={async () => {
          await cerrarSesion();
        }}
      >
        <MaterialIcons name="logout" size={24} color={temaApp.colors.error} />
        <Text style={estilos.cerrarSesionTexto}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
  },
  scrollContent: {
    paddingBottom: 150, // Espacio al final para asegurar scroll completo
    flexGrow: 1,
    minHeight: '100%', // Asegura que el contenido pueda hacer scroll
    ...(Platform.OS === 'web' ? { paddingHorizontal: 32 } : {}),
  },
  profileHeader: {
    backgroundColor: temaApp.colors.surface,
    paddingBottom: 24,
    ...sombras.media,
  },
  banner: {
    height: 120,
    backgroundColor: temaApp.colors.primary,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: -40,
    paddingHorizontal: espaciado.lg,
  },
  avatarContainer: {
    marginBottom: espaciado.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: temaApp.colors.surface,
    ...sombras.media,
  },
  fotosBadge: {
    position: 'absolute',
    bottom: -2,
    right: -6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: temaApp.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: temaApp.colors.surface,
  },
  fotosBadgeTxt: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  galeriaSection: {
    backgroundColor: temaApp.colors.surface,
    marginTop: espaciado.md,
    paddingVertical: espaciado.lg,
    ...sombras.pequena,
  },
  galeriaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: espaciado.lg,
    marginBottom: espaciado.sm,
    gap: espaciado.sm,
  },
  galeriaTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: temaApp.colors.onSurface,
    ...(fontDisplay ? { fontFamily: fontDisplay } : {}),
  },
  galeriaSubtitulo: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: 2,
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  galeriaEditar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: temaApp.colors.surfaceVariant || '#EEF2F0',
  },
  galeriaEditarTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: temaApp.colors.primary,
  },
  galeriaScroll: {
    paddingHorizontal: espaciado.lg,
    gap: espaciado.sm,
    paddingVertical: 4,
  },
  galeriaCard: {
    width: 170,
    height: 200,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: temaApp.colors.surfaceVariant || '#EDEDED',
  },
  galeriaFoto: {
    width: '100%',
    height: '100%',
  },
  galeriaPrincipalBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  galeriaPrincipalTxt: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  galeriaVacia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
    marginHorizontal: espaciado.lg,
    padding: espaciado.md,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: temaApp.colors.border,
    backgroundColor: temaApp.colors.background,
  },
  galeriaVaciaIcono: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: temaApp.colors.surfaceVariant || '#EEF2F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galeriaVaciaTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: temaApp.colors.onSurface,
  },
  galeriaVaciaTexto: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: 2,
  },
  visorFondo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visorImagen: {
    width: '100%',
    height: '100%',
  },
  visorCerrar: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 3,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visorFlecha: {
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  visorFlechaIzq: {
    left: 12,
  },
  visorFlechaDer: {
    right: 12,
  },
  visorContador: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  visorContadorTxt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  nombreUsuario: {
    fontSize: 24,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.xs,
    ...(fontDisplay ? { fontFamily: fontDisplay } : {}),
  },
  emailUsuario: {
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
    marginBottom: espaciado.sm,
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  ubicacionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: espaciado.lg,
  },
  ubicacion: {
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
    marginLeft: 4,
  },
  accionesContainer: {
    paddingHorizontal: espaciado.lg,
    gap: espaciado.md,
  },
  botonAccion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
  },
  botonTextoAccion: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  botonVerMascota: {
    borderWidth: 1,
    borderColor: temaApp.colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: temaApp.colors.surface,
  },
  botonTextoVerMascota: {
    fontSize: 16,
    fontWeight: '600',
    color: temaApp.colors.onSurface,
  },
  cardConfig: {
    margin: espaciado.lg,
    ...sombras.media,
  },
  cardFuncionalidades: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
    backgroundColor: temaApp.colors.surface,
    marginHorizontal: espaciado.lg,
    marginTop: espaciado.lg,
    borderRadius: 14,
    padding: espaciado.md,
    borderWidth: 1,
    borderColor: temaApp.colors.border,
    ...sombras.pequena,
  },
  funcionalidadesIcono: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: temaApp.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  funcionalidadesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: temaApp.colors.onSurface,
  },
  funcionalidadesDesc: {
    fontSize: 12,
    lineHeight: 17,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: 2,
  },
  cardStats: {
    margin: espaciado.lg,
    marginTop: 0,
    ...sombras.media,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.md,
    ...(fontDisplay ? { fontFamily: fontDisplay } : {}),
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: espaciado.md,
  },
  configContent: {
    flex: 1,
    marginLeft: espaciado.md,
  },
  configLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: temaApp.colors.onSurface,
    marginBottom: 2,
  },
  configDescription: {
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
  },
  divider: {
    marginVertical: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: espaciado.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    marginTop: espaciado.xs,
  },
  statLabel: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: 4,
  },
  cerrarSesion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: espaciado.lg,
    paddingVertical: 16,
    gap: 8,
  },
  cerrarSesionTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: temaApp.colors.error,
  },
  bannerInompleto: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: temaApp.colors.primary,
    marginHorizontal: espaciado.lg,
    marginTop: espaciado.lg,
    marginBottom: 0,
    borderRadius: 12,
    padding: espaciado.md,
    ...sombras.media,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 16,
  },
});
