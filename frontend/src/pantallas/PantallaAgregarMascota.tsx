// Pantalla de Agregar Mascota - SportPetMatch
// Formulario para agregar una nueva mascota

import React, { useState } from 'react';
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
  Switch,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';

// Importar servicios y tema
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import {
  crearMascota,
  DatosCrearMascota,
} from '../servicios/servicioMascotas';
import { subirFotosMascota } from '../servicios/servicioUpload';
import { temaApp, espaciado, sombras } from '../constantes/tema';
import { validarNumeroEntero, validarNumeroDecimal, mensajesError } from '../utilidades/validaciones';

type AgregarMascotaNavigationProp = StackNavigationProp<RootStackParamList, 'AgregarMascota'>;

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
 * Pantalla de Agregar Mascota
 */
export default function PantallaAgregarMascota(): JSX.Element {
  const navigation = useNavigation<AgregarMascotaNavigationProp>();
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

  const normalizarDecimal = (valor: string): string => valor.trim().replace(',', '.');

  /**
   * Seleccionar imagen
   */
  const seleccionarImagen = async () => {
    try {
      // Solicitar permisos solo en mobile
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permisos', 'Se necesitan permisos para acceder a la galería');
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
        const nuevasFotos = result.assets.map((asset) => asset.uri).filter(Boolean);
        setFotos([...fotos, ...nuevasFotos]);
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
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
   * Guardar mascota
   */
  const guardarMascota = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error de validación', 'Solo el nombre es obligatorio.');
      return;
    }

    const edadLimpia = edad.trim();
    const pesoLimpio = normalizarDecimal(peso);
    const alturaLimpia = normalizarDecimal(altura);

    // Validar edad si se proporciona
    if (edadLimpia && !validarNumeroEntero(edadLimpia, 0, 30)) {
      Alert.alert('Error de validación', `Edad inválida. ${mensajesError.numeroFueraDeRango(0, 30)}`);
      return;
    }

    // Validar peso si se proporciona
    if (pesoLimpio && !validarNumeroDecimal(pesoLimpio, 0.1, 200)) {
      Alert.alert('Error de validación', `Peso inválido. ${mensajesError.numeroFueraDeRango(0.1, 200)}`);
      return;
    }

    // Validar altura si se proporciona
    if (alturaLimpia && !validarNumeroDecimal(alturaLimpia, 0.1, 200)) {
      Alert.alert('Error de validación', `Altura inválida. ${mensajesError.numeroFueraDeRango(0.1, 200)}`);
      return;
    }

    try {
      setGuardando(true);
      // Separar fotos locales (URIs) de fotos ya subidas (URLs)
      const fotosLocales = fotos.filter(foto => !foto.startsWith('http') && !foto.startsWith('data:'));
      const fotosExistentes = fotos.filter(foto => foto.startsWith('http') || foto.startsWith('data:'));

      const datos: DatosCrearMascota = {
        nombre: nombre.trim(),
        tipo,
        raza: raza.trim() || undefined,
        edad: edadLimpia ? Number.parseInt(edadLimpia, 10) : undefined,
        peso: pesoLimpio ? Number.parseFloat(pesoLimpio) : undefined,
        altura: alturaLimpia ? Number.parseFloat(alturaLimpia) : undefined,
        color: color.trim() || undefined,
        genero,
        esterilizado,
        nivelActividad,
        personalidad,
        intereses,
        salud: salud.trim() || undefined,
        veterinario: veterinario.trim() || undefined,
        // No incluir fotos locales en la creación inicial
        fotos: fotosExistentes.length > 0 ? fotosExistentes : undefined,
      };

      // Crear mascota primero (sin fotos locales)
      const mascotaCreada = await crearMascota(datos);

      // Si hay fotos locales, subirlas después de crear la mascota
      if (fotosLocales.length > 0) {
        try {
          await subirFotosMascota(mascotaCreada.id, fotosLocales);
        } catch (error: any) {
          console.error('Error subiendo fotos:', error);
          // No fallar si las fotos no se suben, solo mostrar advertencia
          Alert.alert(
            'Mascota creada',
            'La mascota se creó correctamente, pero algunas fotos no se pudieron subir. Puedes agregarlas después editando la mascota.',
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
        Alert.alert('Éxito', 'Mascota agregada correctamente');
      }, 300);
    } catch (error: any) {
      console.error('Error guardando mascota:', error);
      const mensajeError = error.response?.data?.message || error.message || 'No se pudo agregar la mascota';
      Alert.alert('Error de validación', mensajeError);
    } finally {
      setGuardando(false);
    }
  };

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
          <Text style={estilos.ayudaValidacion}>Solo el campo Nombre es obligatorio. El resto es opcional.</Text>

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
              <View key={foto} style={estilos.fotoContainer}>
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
              onPress={guardarMascota}
              disabled={guardando || !nombre.trim()}
              loading={guardando}
              style={estilos.botonGuardar}
            >
              {guardando ? 'Guardando...' : 'Agregar Mascota'}
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
  card: {
    margin: espaciado.md,
    ...sombras.media,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    marginTop: espaciado.lg,
    marginBottom: espaciado.md,
  },
  ayudaValidacion: {
    fontSize: 13,
    color: temaApp.colors.onSurfaceVariant,
    marginBottom: espaciado.md,
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
