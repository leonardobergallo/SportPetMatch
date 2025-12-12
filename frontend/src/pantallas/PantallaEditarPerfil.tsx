// Pantalla de Editar Perfil - SportPetMatch
// Permite editar la información del perfil del usuario

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
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
import { subirAvatar } from '../servicios/servicioUpload';
import { temaApp, espaciado, sombras } from '../constantes/tema';
import { useAuth } from '../contextos/ContextoAuth';
import { validarTelefono, mensajesError } from '../utilidades/validaciones';

type EditarPerfilNavigationProp = StackNavigationProp<RootStackParamList, 'EditarPerfil'>;

// Intereses disponibles
const INTERESES_DISPONIBLES = [
  'Running',
  'Ciclismo',
  'Fútbol',
  'Tenis',
  'Natación',
  'Yoga',
  'Crossfit',
  'Senderismo',
  'Basketball',
  'Voleibol',
];

// Niveles de deporte
const NIVELES_DEPORTE = [
  { valor: 1, label: 'Principiante' },
  { valor: 2, label: 'Principiante-Intermedio' },
  { valor: 3, label: 'Intermedio' },
  { valor: 4, label: 'Intermedio-Avanzado' },
  { valor: 5, label: 'Avanzado' },
];

/**
 * Pantalla de Editar Perfil
 */
export default function PantallaEditarPerfil(): JSX.Element {
  const navigation = useNavigation<EditarPerfilNavigationProp>();
  const { usuario: usuarioAuth, actualizarUsuario } = useAuth();

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
      setAvatar(datosUsuario.avatar || null);
    } catch (error: any) {
      console.error('Error cargando perfil:', error);
      Alert.alert('Error', 'No se pudo cargar el perfil');
      navigation.goBack();
    } finally {
      setCargando(false);
    }
  };

  /**
   * Seleccionar imagen de avatar
   */
  const seleccionarImagen = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesitan permisos para acceder a la galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        try {
          // Subir imagen al servidor
          const imageUrl = await subirAvatar(result.assets[0].uri);
          setAvatar(imageUrl);
        } catch (error: any) {
          console.error('Error subiendo avatar:', error);
          Alert.alert('Error', error.message || 'No se pudo subir la imagen');
        }
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
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
      Alert.alert('Error', mensajesError.campoRequerido('El nombre'));
      return;
    }

    // Validar teléfono si se proporciona
    if (telefono.trim() && !validarTelefono(telefono.trim())) {
      Alert.alert('Error', mensajesError.telefonoInvalido);
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
        avatar: avatar || undefined,
      };

      const usuarioActualizado = await actualizarMiPerfil(datosActualizacion);
      
      // Actualizar contexto de autenticación
      if (actualizarUsuario) {
        actualizarUsuario(usuarioActualizado);
      }

      Alert.alert('Éxito', 'Perfil actualizado correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Error guardando perfil:', error);
      Alert.alert('Error', error.message || 'No se pudo actualizar el perfil');
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
          {/* Avatar */}
          <View style={estilos.avatarContainer}>
            <TouchableOpacity onPress={seleccionarImagen}>
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
                <MaterialIcons name="camera-alt" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={estilos.avatarLabel}>Toca para cambiar foto</Text>
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

          {/* Nivel de Deporte */}
          <View style={estilos.campoContainer}>
            <Text style={estilos.label}>Nivel Deportivo</Text>
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
            <Text style={estilos.label}>Intereses Deportivos</Text>
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
              disabled={guardando || !nombre.trim()}
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
  campoContainer: {
    marginBottom: espaciado.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.sm,
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

