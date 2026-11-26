// Pantalla de Editar Perfil - SportPetMatch
// Permite editar la información del perfil del usuario

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { mostrarAlerta } from '@/utilidades/alerta';
import {
  Text,
  TextInput,
  Button,
  Card,
  Avatar,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';

// Importar servicios y tema
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import {
  obtenerMiPerfil,
  actualizarMiPerfil,
  DatosActualizacionUsuario,
  Usuario,
} from '../servicios/servicioUsuarios';
import { subirFotosPerfil } from '../servicios/servicioUpload';
import { temaApp, espaciado, sombras } from '../constantes/tema';
import { useAuth } from '../contextos/ContextoAuth';
import { validarTelefono, mensajesError } from '../utilidades/validaciones';

type EditarPerfilNavigationProp = StackNavigationProp<RootStackParamList, 'EditarPerfil'>;

/** Tipografia web (Plus Jakarta / Outfit), misma familia que el resto de la app en web */
const fontSans = Platform.select({ web: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', default: undefined });
const fontDisplay = Platform.select({ web: '"Outfit", "Plus Jakarta Sans", system-ui, sans-serif', default: undefined });

// Intereses disponibles
const INTERESES_DISPONIBLES = [
  'Paseos',
  'Parques pet-friendly',
  'Cafés pet-friendly',
  'Socialización',
  'Eventos pet-friendly',
  'Adopción',
  'Charlas con otros dueños',
  'Viajes con mascotas',
  'Cuidados y bienestar',
  'Rescate animal',
];

// Niveles de participación en la comunidad
const NIVELES_DEPORTE = [
  { valor: 1, label: 'Recién empiezo' },
  { valor: 2, label: 'Me estoy sumando' },
  { valor: 3, label: 'Participación media' },
  { valor: 4, label: 'Muy participativo' },
  { valor: 5, label: 'Siempre organizo planes' },
];

/**
 * Pantalla de Editar Perfil
 */
export default function PantallaEditarPerfil(): JSX.Element {
  const navigation = useNavigation<EditarPerfilNavigationProp>();
  const { actualizarUsuario } = useAuth();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [biografia, setBiografia] = useState('');
  const [nivelDeporte, setNivelDeporte] = useState(3);
  const [intereses, setIntereses] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fotos, setFotos] = useState<string[]>([]);
  const [subiendoFotos, setSubiendoFotos] = useState(false);

  useEffect(() => {
    cargarPerfil();
  }, []);

  /**
   * Cargar perfil del usuario
   */
  const cargarPerfil = async () => {
    try {
      setCargando(true);
      const datosUsuario = await obtenerMiPerfil();
      setUsuario(datosUsuario);
      setNombre(datosUsuario.nombre || '');
      setTelefono(datosUsuario.telefono || '');
      setBiografia(datosUsuario.biografia || '');
      setNivelDeporte(datosUsuario.nivelDeporte || 3);
      setIntereses(datosUsuario.intereses || []);
      const fotosCargadas = datosUsuario.fotos?.length
        ? datosUsuario.fotos
        : datosUsuario.avatar
          ? [datosUsuario.avatar]
          : [];
      setFotos(fotosCargadas);
      setAvatar(fotosCargadas[0] || null);
    } catch (error: any) {
      console.error('Error cargando perfil:', error);
      mostrarAlerta('Error', 'No se pudo cargar el perfil');
      navigation.goBack();
    } finally {
      setCargando(false);
    }
  };

  const MAX_FOTOS_PERFIL = 6;

  const aplicarFotos = (nuevasFotos: string[]) => {
    setFotos(nuevasFotos);
    setAvatar(nuevasFotos[0] || null);
  };

  /**
   * Cambiar la foto principal (se sube y se mueve al primer lugar).
   */
  const cambiarFotoPrincipal = async () => {
    if (fotos.length >= MAX_FOTOS_PERFIL) {
      mostrarAlerta(
        'Galería completa',
        `Ya tenés ${MAX_FOTOS_PERFIL} fotos. Quitá una para poder cambiar la principal.`
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setSubiendoFotos(true);
        const subidas = await subirFotosPerfil([result.assets[0].uri]);
        const nueva = subidas.fotos[subidas.fotos.length - 1];
        const resto = subidas.fotos.filter((foto) => foto !== nueva);
        aplicarFotos([nueva, ...resto]);
        actualizarUsuario({ avatar: nueva, fotos: [nueva, ...resto] });
      }
    } catch (error: any) {
      console.error('Error cambiando foto principal:', error);
      mostrarAlerta('Error', error.message || 'No se pudo subir la foto');
    } finally {
      setSubiendoFotos(false);
    }
  };

  /**
   * Agregar fotos a la galería (hasta 6).
   */
  const agregarFotos = async () => {
    if (fotos.length >= MAX_FOTOS_PERFIL) {
      mostrarAlerta(
        'Galería completa',
        `Ya tenés ${MAX_FOTOS_PERFIL} fotos en tu perfil. Quitá una para agregar otra.`
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsMultipleSelection: true,
        selectionLimit: MAX_FOTOS_PERFIL - fotos.length,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length) {
        const nuevas = result.assets.map((asset) => asset.uri).filter(Boolean);
        if (nuevas.length === 0) return;

        setSubiendoFotos(true);
        const subidas = await subirFotosPerfil(nuevas);
        aplicarFotos(subidas.fotos);
        actualizarUsuario({ avatar: subidas.avatar, fotos: subidas.fotos });
      }
    } catch (error: any) {
      console.error('Error agregando fotos:', error);
      mostrarAlerta('Error', error.message || 'No se pudieron subir las fotos');
    } finally {
      setSubiendoFotos(false);
    }
  };

  /**
   * Quitar una foto de la galería (se guarda al tocar “Guardar cambios”).
   */
  const quitarFoto = (index: number) => {
    if (fotos.length <= 1) {
      mostrarAlerta('Foto principal', 'Tu perfil necesita al menos una foto.');
      return;
    }
    aplicarFotos(fotos.filter((_, i) => i !== index));
  };

  /**
   * Mover una foto al primer lugar (se guarda al tocar “Guardar cambios”).
   */
  const marcarPrincipal = (index: number) => {
    if (index === 0) return;
    const copia = [...fotos];
    const [foto] = copia.splice(index, 1);
    aplicarFotos([foto, ...copia]);
  };

  /**
   * Toggle interés
   */
  const toggleInteres = (interes: string) => {
    if (intereses.includes(interes)) {
      setIntereses(intereses.filter((i) => i !== interes));
    } else {
      setIntereses([...intereses, interes]);
    }
  };

  /**
   * Guardar cambios
   */
  const guardarCambios = async () => {
    if (!nombre.trim()) {
      mostrarAlerta('Error', mensajesError.campoRequerido('El nombre'));
      return;
    }

    // Validar teléfono si se proporciona
    if (telefono.trim() && !validarTelefono(telefono.trim())) {
      mostrarAlerta('Error', mensajesError.telefonoInvalido);
      return;
    }

    try {
      setGuardando(true);
      const datosActualizacion: DatosActualizacionUsuario = {
        nombre: nombre.trim(),
        telefono: telefono.trim() || undefined,
        biografia: biografia.trim() || undefined,
        nivelDeporte,
        intereses,
        avatar: fotos[0] || undefined,
        fotos,
      };

      const usuarioActualizado = await actualizarMiPerfil(datosActualizacion);
      
      // Actualizar contexto de autenticación
      if (actualizarUsuario) {
        actualizarUsuario(usuarioActualizado);
      }

      // Navegar de vuelta inmediatamente después de guardar
      navigation.goBack();
      
      // Mostrar mensaje de éxito (opcional, sin bloquear navegación)
      setTimeout(() => {
        mostrarAlerta('Éxito', 'Perfil actualizado correctamente');
      }, 300);
    } catch (error: any) {
      console.error('Error guardando perfil:', error);
      const mensajeError = error.response?.data?.message || error.message || 'No se pudo actualizar el perfil';
      mostrarAlerta('Error', mensajeError);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color={temaApp.colors.primary} />
        <Text style={estilos.textoCarga}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={estilos.contenedor}
      contentContainerStyle={estilos.scrollContent}
      showsVerticalScrollIndicator={true}
      keyboardShouldPersistTaps="handled"
    >
      <Card style={estilos.card}>
        <Card.Content>
          {/* Foto principal */}
          <View style={estilos.avatarContainer}>
            <TouchableOpacity onPress={cambiarFotoPrincipal} disabled={subiendoFotos}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={estilos.avatar} />
              ) : (
                <Avatar.Text
                  size={100}
                  label={nombre.charAt(0).toUpperCase() || 'U'}
                  style={estilos.avatarPlaceholder}
                />
              )}
              <View style={estilos.avatarEditBadge}>
                {subiendoFotos ? (
                  <ActivityIndicator size={16} color="#FFFFFF" />
                ) : (
                  <MaterialIcons name="camera-alt" size={20} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>
            <Text style={estilos.avatarLabel}>Foto principal · tocá para cambiarla</Text>
          </View>

          {/* Galería de fotos con la mascota */}
          <View style={estilos.galeriaContainer}>
            <View style={estilos.galeriaHeader}>
              <Text style={estilos.label}>Galería con tu mascota 🐾</Text>
              <Text style={estilos.galeriaContador}>
                {fotos.length}/{MAX_FOTOS_PERFIL}
              </Text>
            </View>
            <Text style={estilos.galeriaAyuda}>
              Mostrá tus mejores momentos. La primera foto es la que más se ve.
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={estilos.galeriaScroll}
            >
              {fotos.map((foto, index) => (
                <View key={`${foto}-${index}`} style={estilos.galeriaItem}>
                  <Image source={{ uri: foto }} style={estilos.galeriaFoto} />
                  {index === 0 && (
                    <View style={estilos.galeriaPrincipalBadge}>
                      <Text style={estilos.galeriaPrincipalTxt}>Principal</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={estilos.galeriaQuitar}
                    onPress={() => quitarFoto(index)}
                  >
                    <MaterialIcons name="close" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                  {index > 0 && (
                    <TouchableOpacity
                      style={estilos.galeriaDestacar}
                      onPress={() => marcarPrincipal(index)}
                    >
                      <MaterialIcons name="star" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {fotos.length < MAX_FOTOS_PERFIL && (
                <TouchableOpacity
                  style={estilos.galeriaAgregar}
                  onPress={agregarFotos}
                  disabled={subiendoFotos}
                >
                  <MaterialIcons
                    name="add-a-photo"
                    size={24}
                    color={temaApp.colors.primary}
                  />
                  <Text style={estilos.galeriaAgregarTxt}>Agregar</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          {/* Nombre */}
          <View style={estilos.campoContainer}>
            <Text style={estilos.label}>Nombre *</Text>
            <TextInput
              mode="outlined"
              value={nombre}
              onChangeText={setNombre}
              placeholder="Tu nombre completo"
              style={estilos.input}
            />
          </View>

          {/* Teléfono */}
          <View style={estilos.campoContainer}>
            <Text style={estilos.label}>Teléfono</Text>
            <TextInput
              mode="outlined"
              value={telefono}
              onChangeText={setTelefono}
              placeholder="+54 9 11 1234-5678"
              keyboardType="phone-pad"
              style={estilos.input}
            />
          </View>

          {/* Biografía */}
          <View style={estilos.campoContainer}>
            <Text style={estilos.label}>Biografía</Text>
            <TextInput
              mode="outlined"
              value={biografia}
              onChangeText={setBiografia}
              placeholder="Cuéntanos sobre ti..."
              multiline
              numberOfLines={4}
              style={[estilos.input, estilos.textArea]}
            />
          </View>

          {/* Nivel de participación */}
          <View style={estilos.campoContainer}>
            <Text style={estilos.label}>Nivel de participación</Text>
            <View style={estilos.nivelesContainer}>
              {NIVELES_DEPORTE.map((nivel) => (
                <TouchableOpacity
                  key={nivel.valor}
                  style={[
                    estilos.nivelChip,
                    nivelDeporte === nivel.valor && estilos.nivelChipActivo,
                  ]}
                  onPress={() => setNivelDeporte(nivel.valor)}
                >
                  <Text
                    style={[
                      estilos.nivelChipTexto,
                      nivelDeporte === nivel.valor && estilos.nivelChipTextoActivo,
                    ]}
                  >
                    {nivel.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Intereses */}
          <View style={estilos.campoContainer}>
            <Text style={estilos.label}>Intereses</Text>
            <View style={estilos.interesesContainer}>
              {INTERESES_DISPONIBLES.map((interes) => (
                <TouchableOpacity
                  key={interes}
                  style={[
                    estilos.interesChip,
                    intereses.includes(interes) && estilos.interesChipActivo,
                  ]}
                  onPress={() => toggleInteres(interes)}
                >
                  <Text
                    style={[
                      estilos.interesChipTexto,
                      intereses.includes(interes) && estilos.interesChipTextoActivo,
                    ]}
                  >
                    {interes}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Botones */}
          <View style={estilos.botonesContainer}>
            <Button
              mode="contained"
              onPress={guardarCambios}
              disabled={guardando || subiendoFotos || !nombre.trim()}
              loading={guardando}
              style={estilos.botonGuardar}
            >
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              disabled={guardando}
              style={estilos.botonCancelar}
            >
              Cancelar
            </Button>
          </View>
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
    paddingBottom: 300, // Mucho más espacio al final para asegurar scroll completo
    ...(Platform.OS === 'web' && {
      paddingBottom: 400, // Aún más en web
    }),
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
  card: {
    margin: espaciado.md,
    ...sombras.media,
    ...(Platform.OS === 'web' ? { borderRadius: 20 } : {}),
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: espaciado.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: temaApp.colors.primary,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: temaApp.colors.primary,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: temaApp.colors.surface,
  },
  avatarLabel: {
    marginTop: espaciado.sm,
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
  },
  galeriaContainer: {
    marginBottom: espaciado.xl,
  },
  galeriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  galeriaContador: {
    fontSize: 12,
    fontWeight: '700',
    color: temaApp.colors.primary,
  },
  galeriaAyuda: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    marginBottom: espaciado.sm,
  },
  galeriaScroll: {
    gap: espaciado.sm,
    paddingVertical: 4,
  },
  galeriaItem: {
    width: 96,
    height: 96,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: temaApp.colors.surfaceVariant || '#EDEDED',
  },
  galeriaFoto: {
    width: '100%',
    height: '100%',
  },
  galeriaPrincipalBadge: {
    position: 'absolute',
    left: 4,
    bottom: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  galeriaPrincipalTxt: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  galeriaQuitar: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galeriaDestacar: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(23, 63, 65, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galeriaAgregar: {
    width: 96,
    height: 96,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: temaApp.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: temaApp.colors.surface,
  },
  galeriaAgregarTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: temaApp.colors.primary,
    marginTop: 4,
  },
  campoContainer: {
    marginBottom: espaciado.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.sm,
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  input: {
    backgroundColor: temaApp.colors.surface,
  },
  textArea: {
    minHeight: 100,
  },
  nivelesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciado.sm,
  },
  nivelChip: {
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
    borderRadius: 20,
    backgroundColor: temaApp.colors.surfaceVariant || '#E0E0E0',
    borderWidth: 1,
    borderColor: temaApp.colors.border,
  },
  nivelChipActivo: {
    backgroundColor: temaApp.colors.primary,
    borderColor: temaApp.colors.primary,
  },
  nivelChipTexto: {
    fontSize: 12,
    color: temaApp.colors.onSurface,
  },
  nivelChipTextoActivo: {
    color: temaApp.colors.onPrimary,
    fontWeight: '600',
  },
  interesesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciado.sm,
  },
  interesChip: {
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
    borderRadius: 20,
    backgroundColor: temaApp.colors.surfaceVariant || '#E0E0E0',
    borderWidth: 1,
    borderColor: temaApp.colors.border,
  },
  interesChipActivo: {
    backgroundColor: temaApp.colors.secondary,
    borderColor: temaApp.colors.secondary,
  },
  interesChipTexto: {
    fontSize: 12,
    color: temaApp.colors.onSurface,
  },
  interesChipTextoActivo: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  botonesContainer: {
    marginTop: espaciado.xl,
    gap: espaciado.md,
  },
  botonGuardar: {
    marginTop: espaciado.md,
  },
  botonCancelar: {
    marginTop: espaciado.sm,
  },
});
