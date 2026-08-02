// Pantalla de Editar Mascota - SportPetMatch
// Formulario para editar una mascota existente

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
  ActivityIndicator,
  Switch,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';

// Importar servicios y tema
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import {
  obtenerMascota,
  actualizarMascota,
  DatosCrearMascota,
  Mascota,
} from '../servicios/servicioMascotas';
import { subirFotosMascota } from '../servicios/servicioUpload';
import { temaApp, espaciado, sombras } from '../constantes/tema';
import { useAuth } from '../contextos/ContextoAuth';
import { validarNumeroEntero, validarNumeroDecimal, mensajesError } from '../utilidades/validaciones';

type EditarMascotaRouteProp = RouteProp<RootStackParamList, 'EditarMascota'>;
type EditarMascotaNavigationProp = StackNavigationProp<RootStackParamList, 'EditarMascota'>;

/** Tipografia web (Plus Jakarta / Outfit), misma familia que el resto de la app en web */
const fontSans = Platform.select({ web: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', default: undefined });
const fontDisplay = Platform.select({ web: '"Outfit", "Plus Jakarta Sans", system-ui, sans-serif', default: undefined });

// Tipos de mascotas
const TIPOS_MASCOTAS = ['Perro', 'Gato', 'Otro'];

// Géneros
const GENEROS = ['Macho', 'Hembra'];

// Personalidades
const PERSONALIDADES = [
  'Juguetón',
  'Tranquilo',
  'Activo',
  'Sociable',
  'Independiente',
  'Cariñoso',
  'Protector',
  'Curioso',
];

// Intereses de la mascota
const INTERESES_MASCOTA = [
  'Paseos',
  'Jugar con otras mascotas',
  'Parques',
  'Cafés pet-friendly',
  'Encuentros tranquilos',
  'Eventos con mascotas',
];

/**
 * Pantalla de Editar Mascota
 */
export default function PantallaEditarMascota(): JSX.Element {
  const navigation = useNavigation<EditarMascotaNavigationProp>();
  const route = useRoute<EditarMascotaRouteProp>();
  const { mascotaId } = route.params;
  const { usuario } = useAuth();

  const [mascota, setMascota] = useState<Mascota | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('Perro');
  const [raza, setRaza] = useState('');
  const [edad, setEdad] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [color, setColor] = useState('');
  const [genero, setGenero] = useState('Macho');
  const [esterilizado, setEsterilizado] = useState(false);
  const [nivelActividad, setNivelActividad] = useState(3);
  const [personalidad, setPersonalidad] = useState<string[]>([]);
  const [intereses, setIntereses] = useState<string[]>([]);
  const [salud, setSalud] = useState('');
  const [veterinario, setVeterinario] = useState('');
  const [fotos, setFotos] = useState<string[]>([]);

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
      
      // Verificar que el usuario sea el propietario
      if (usuario && datosMascota.usuarioId !== usuario.id) {
        mostrarAlerta('Error', 'No tienes permiso para editar esta mascota');
        navigation.goBack();
        return;
      }
      
      // Cargar datos en el formulario
      setNombre(datosMascota.nombre);
      setTipo(datosMascota.tipo);
      setRaza(datosMascota.raza || '');
      setEdad(datosMascota.edad?.toString() || '');
      setPeso(datosMascota.peso?.toString() || '');
      setAltura(datosMascota.altura?.toString() || '');
      setColor(datosMascota.color || '');
      setGenero(datosMascota.genero || 'Macho');
      setEsterilizado(datosMascota.esterilizado || false);
      setNivelActividad(datosMascota.nivelActividad);
      setPersonalidad(datosMascota.personalidad || []);
      setIntereses(datosMascota.intereses || []);
      setSalud(datosMascota.salud || '');
      setVeterinario(datosMascota.veterinario || '');
      setFotos(datosMascota.fotos || []);
    } catch (error: any) {
      console.error('Error cargando mascota:', error);
      mostrarAlerta('Error', 'No se pudo cargar la información de la mascota');
      navigation.goBack();
    } finally {
      setCargando(false);
    }
  };

  /**
   * Seleccionar imagen
   */
  const seleccionarImagen = async () => {
    try {
      // Solicitar permisos solo en mobile
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          mostrarAlerta('Permisos', 'Se necesitan permisos para acceder a la galería');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images', // Nueva API sin deprecación
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const nuevasFotos = result.assets.map((asset) => asset.uri).filter(uri => uri);
        setFotos([...fotos, ...nuevasFotos]);
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      mostrarAlerta('Error', 'No se pudo seleccionar la imagen');
    }
  };

  /**
   * Eliminar foto
   */
  const eliminarFoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  /**
   * Toggle personalidad
   */
  const togglePersonalidad = (p: string) => {
    if (personalidad.includes(p)) {
      setPersonalidad(personalidad.filter((item) => item !== p));
    } else {
      setPersonalidad([...personalidad, p]);
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
      mostrarAlerta('Error', mensajesError.campoRequerido('El nombre'));
      return;
    }

    // Validar edad si se proporciona
    if (edad && !validarNumeroEntero(edad, 0, 30)) {
      mostrarAlerta('Error', mensajesError.numeroFueraDeRango(0, 30));
      return;
    }

    // Validar peso si se proporciona
    if (peso && !validarNumeroDecimal(peso, 0.1, 200)) {
      mostrarAlerta('Error', mensajesError.numeroFueraDeRango(0.1, 200));
      return;
    }

    // Validar altura si se proporciona
    if (altura && !validarNumeroDecimal(altura, 0.1, 200)) {
      mostrarAlerta('Error', mensajesError.numeroFueraDeRango(0.1, 200));
      return;
    }

    try {
      setGuardando(true);
      
      // Separar fotos locales (URIs) de fotos ya subidas (URLs)
      const fotosLocales = fotos.filter(foto => !foto.startsWith('http') && !foto.startsWith('data:'));
      const fotosExistentes = fotos.filter(foto => foto.startsWith('http') || foto.startsWith('data:'));

      const datos: Partial<DatosCrearMascota> = {
        nombre: nombre.trim(),
        tipo,
        raza: raza.trim() || undefined,
        edad: edad ? parseInt(edad) : undefined,
        peso: peso ? parseFloat(peso) : undefined,
        altura: altura ? parseFloat(altura) : undefined,
        color: color.trim() || undefined,
        genero,
        esterilizado,
        nivelActividad,
        personalidad,
        intereses,
        salud: salud.trim() || undefined,
        veterinario: veterinario.trim() || undefined,
        fotos: fotosExistentes.length > 0 ? fotosExistentes : undefined,
      };

      // Actualizar mascota primero (sin fotos locales nuevas)
      await actualizarMascota(mascotaId, datos);

      // Si hay fotos locales nuevas, subirlas después de actualizar
      if (fotosLocales.length > 0) {
        try {
          await subirFotosMascota(mascotaId, fotosLocales);
        } catch (error: any) {
          console.error('Error subiendo fotos:', error);
          // No fallar si las fotos no se suben, solo mostrar advertencia
          mostrarAlerta(
            'Mascota actualizada',
            'La mascota se actualizó correctamente, pero algunas fotos no se pudieron subir. Puedes intentar agregarlas nuevamente.',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]
          );
          return; // Salir aquí para no mostrar el alert de éxito duplicado
        }
      }

      // Navegar de vuelta inmediatamente después de guardar
      navigation.goBack();
      
      // Mostrar mensaje de éxito (opcional, sin bloquear navegación)
      setTimeout(() => {
        mostrarAlerta('Éxito', 'Mascota actualizada correctamente');
      }, 300);
    } catch (error: any) {
      console.error('Error guardando mascota:', error);
      mostrarAlerta('Error', error.message || 'No se pudo actualizar la mascota');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color={temaApp.colors.primary} />
        <Text style={estilos.textoCarga}>Cargando mascota...</Text>
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
          {/* Información Básica */}
          <Text style={estilos.seccionTitulo}>Información Básica</Text>

          <View style={estilos.campoContainer}>
            <Text style={estilos.label}>Nombre *</Text>
            <TextInput
              mode="outlined"
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre de tu mascota"
              style={estilos.input}
            />
          </View>

          <View style={estilos.campoContainer}>
            <Text style={estilos.label}>Tipo *</Text>
            <View style={estilos.chipsContainer}>
              {TIPOS_MASCOTAS.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[estilos.chip, tipo === t && estilos.chipActivo]}
                  onPress={() => setTipo(t)}
                >
                  <Text
                    style={[estilos.chipTexto, tipo === t && estilos.chipTextoActivo]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={estilos.campoContainer}>
            <Text style={estilos.label}>Raza</Text>
            <TextInput
              mode="outlined"
              value={raza}
              onChangeText={setRaza}
              placeholder="Ej: Golden Retriever"
              style={estilos.input}
            />
          </View>

          <View style={estilos.campoContainer}>
            <Text style={estilos.label}>Edad (años)</Text>
            <TextInput
              mode="outlined"
              value={edad}
              onChangeText={setEdad}
              placeholder="Ej: 3"
              keyboardType="numeric"
              style={estilos.input}
            />
          </View>

          <View style={estilos.campoContainer}>
            <Text style={estilos.label}>Género</Text>
            <View style={estilos.chipsContainer}>
              {GENEROS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[estilos.chip, genero === g && estilos.chipActivo]}
                  onPress={() => setGenero(g)}
                >
                  <Text
                    style={[estilos.chipTexto, genero === g && estilos.chipTextoActivo]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={estilos.campoContainer}>
            <View style={estilos.switchContainer}>
              <Text style={estilos.label}>Esterilizado</Text>
              <Switch
                value={esterilizado}
                onValueChange={setEsterilizado}
                color={temaApp.colors.primary}
              />
            </View>
          </View>

          {/* Físico */}
          <Text style={estilos.seccionTitulo}>Características Físicas</Text>

          <View style={estilos.campoContainer}>
            <Text style={estilos.label}>Peso (kg)</Text>
            <TextInput
              mode="outlined"
              value={peso}
              onChangeText={setPeso}
              placeholder="Ej: 25.5"
              keyboardType="decimal-pad"
              style={estilos.input}
            />
          </View>

          <View style={estilos.campoContainer}>
            <Text style={estilos.label}>Altura (cm)</Text>
            <TextInput
              mode="outlined"
              value={altura}
              onChangeText={setAltura}
              placeholder="Ej: 60"
              keyboardType="numeric"
              style={estilos.input}
            />
          </View>

          <View style={estilos.campoContainer}>
            <Text style={estilos.label}>Color</Text>
            <TextInput
              mode="outlined"
              value={color}
              onChangeText={setColor}
              placeholder="Ej: Dorado"
              style={estilos.input}
            />
          </View>

          {/* Personalidad */}
          <Text style={estilos.seccionTitulo}>Personalidad</Text>

          <View style={estilos.campoContainer}>
            <Text style={estilos.label}>Nivel de Actividad (1-5)</Text>
            <View style={estilos.nivelesContainer}>
              {[1, 2, 3, 4, 5].map((nivel) => (
                <TouchableOpacity
                  key={nivel}
                  style={[
                    estilos.nivelChip,
                    nivelActividad === nivel && estilos.nivelChipActivo,
                  ]}
                  onPress={() => setNivelActividad(nivel)}
                >
                  <Text
                    style={[
                      estilos.nivelChipTexto,
                      nivelActividad === nivel && estilos.nivelChipTextoActivo,
                    ]}
                  >
                    {nivel}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={estilos.campoContainer}>
            <Text style={estilos.label}>Características</Text>
            <View style={estilos.chipsContainer}>
              {PERSONALIDADES.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    estilos.chip,
                    personalidad.includes(p) && estilos.chipActivo,
                  ]}
                  onPress={() => togglePersonalidad(p)}
                >
                  <Text
                    style={[
                      estilos.chipTexto,
                      personalidad.includes(p) && estilos.chipTextoActivo,
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={estilos.campoContainer}>
            <Text style={estilos.label}>Intereses de tu mascota</Text>
            <View style={estilos.chipsContainer}>
              {INTERESES_MASCOTA.map((interes) => (
                <TouchableOpacity
                  key={interes}
                  style={[
                    estilos.chip,
                    intereses.includes(interes) && estilos.chipActivo,
                  ]}
                  onPress={() => toggleInteres(interes)}
                >
                  <Text
                    style={[
                      estilos.chipTexto,
                      intereses.includes(interes) && estilos.chipTextoActivo,
                    ]}
                  >
                    {interes}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Fotos */}
          <Text style={estilos.seccionTitulo}>Fotos</Text>
          <View style={estilos.fotosContainer}>
            {fotos.map((foto, index) => (
              <View key={index} style={estilos.fotoContainer}>
                <Image source={{ uri: foto }} style={estilos.foto} />
                <TouchableOpacity
                  style={estilos.fotoEliminar}
                  onPress={() => eliminarFoto(index)}
                >
                  <MaterialIcons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
            {fotos.length < 5 && (
              <TouchableOpacity style={estilos.fotoAgregar} onPress={seleccionarImagen}>
                <MaterialIcons name="add" size={32} color={temaApp.colors.primary} />
                <Text style={estilos.fotoAgregarTexto}>Agregar foto</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Salud */}
          <Text style={estilos.seccionTitulo}>Salud</Text>

          <View style={estilos.campoContainer}>
            <Text style={estilos.label}>Notas de Salud</Text>
            <TextInput
              mode="outlined"
              value={salud}
              onChangeText={setSalud}
              placeholder="Información sobre salud..."
              multiline
              numberOfLines={3}
              style={[estilos.input, estilos.textArea]}
            />
          </View>

          <View style={estilos.campoContainer}>
            <Text style={estilos.label}>Veterinario</Text>
            <TextInput
              mode="outlined"
              value={veterinario}
              onChangeText={setVeterinario}
              placeholder="Nombre del veterinario"
              style={estilos.input}
            />
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
    ...(Platform.OS === 'web' ? { borderRadius: 20 } : {}),
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    marginTop: espaciado.lg,
    marginBottom: espaciado.md,
    ...(Platform.OS === 'web' ? { color: temaApp.colors.primary, ...(fontDisplay ? { fontFamily: fontDisplay } : {}) } : {}),
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
    minHeight: 80,
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
    borderWidth: 1,
    borderColor: temaApp.colors.border,
  },
  chipActivo: {
    backgroundColor: temaApp.colors.primary,
    borderColor: temaApp.colors.primary,
  },
  chipTexto: {
    fontSize: 12,
    color: temaApp.colors.onSurface,
  },
  chipTextoActivo: {
    color: temaApp.colors.onPrimary,
    fontWeight: '600',
  },
  nivelesContainer: {
    flexDirection: 'row',
    gap: espaciado.sm,
  },
  nivelChip: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: temaApp.colors.surfaceVariant || '#E0E0E0',
    borderWidth: 2,
    borderColor: temaApp.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nivelChipActivo: {
    backgroundColor: temaApp.colors.primary,
    borderColor: temaApp.colors.primary,
  },
  nivelChipTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
  },
  nivelChipTextoActivo: {
    color: temaApp.colors.onPrimary,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fotosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciado.md,
    marginBottom: espaciado.lg,
  },
  fotoContainer: {
    position: 'relative',
  },
  foto: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  fotoEliminar: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: temaApp.colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fotoAgregar: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: temaApp.colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: temaApp.colors.surfaceVariant || '#F5F5F5',
  },
  fotoAgregarTexto: {
    fontSize: 10,
    color: temaApp.colors.primary,
    marginTop: 4,
  },
  botonesContainer: {
    marginTop: espaciado.xl,
    marginBottom: espaciado.lg,
    gap: espaciado.md,
  },
  botonGuardar: {
    marginTop: espaciado.md,
  },
  botonCancelar: {
    marginTop: espaciado.sm,
  },
});
