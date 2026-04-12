// Pantalla de Onboarding - SportPetMatch
// Configuración inicial de preferencias después del registro

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Text, Chip, IconButton, Surface } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

import { temaApp, espaciado, sombras, MARCA } from '@/constantes/tema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contextos/ContextoAuth';
import { actualizarMiPerfil } from '@/servicios/servicioUsuarios';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navegacion/NavegacionPrincipal';
import { mensajesError } from '@/utilidades/validaciones';

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

// Tipos de perfiles
const TIPOS_USUARIO = [
  { id: 'dueno', label: 'Tengo mascota', icon: 'pets', descripcion: 'Quiero conocer personas con mascotas y sumarme a eventos pet-friendly' },
  { id: 'familia', label: 'Familia pet', icon: 'group', descripcion: 'Salgo con mi mascota y también coordino planes con mi familia o amigos' },
  { id: 'cuidador', label: 'Cuidador', icon: 'person', descripcion: 'Busco comunidad, matches y encuentros para compartir con mascotas' },
];

// Intereses disponibles
const INTERESES_COMUNIDAD = [
  { id: 'paseos', label: 'Paseos diarios 🐾', icon: 'directions-walk' },
  { id: 'parques', label: 'Parques pet-friendly 🌳', icon: 'park' },
  { id: 'socializacion', label: 'Socialización 🐶', icon: 'groups' },
  { id: 'cafes', label: 'Cafés pet-friendly ☕', icon: 'coffee' },
  { id: 'eventos', label: 'Eventos con mascotas 🎉', icon: 'celebration' },
  { id: 'adopcion', label: 'Adopción y rescate ❤️', icon: 'favorite' },
  { id: 'viajes', label: 'Escapadas pet-friendly 🚗', icon: 'map' },
  { id: 'chat', label: 'Nuevas amistades 💬', icon: 'chat' },
];

// Tipos de mascotas
const TIPOS_MASCOTAS = [
  { id: 'perro', label: 'Perro 🐕', icon: 'pets' },
  { id: 'gato', label: 'Gato 🐈', icon: 'pets' },
  { id: 'ambos', label: 'Ambos 🐕🐈', icon: 'pets' },
];

/**
 * Pantalla de Onboarding - Configuración inicial
 */
export default function PantallaOnboarding(): JSX.Element {
  const { usuario, actualizarUsuario } = useAuth();
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const [pasoActual, setPasoActual] = useState(1);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);
  const [interesesSeleccionados, setInteresesSeleccionados] = useState<string[]>([]);
  const [tipoMascota, setTipoMascota] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const totalPasos = 3;

  /**
   * Manejar selección de tipo de usuario
   */
  const manejarSeleccionarTipo = (tipo: string) => {
    setTipoUsuario(tipo);
  };

  /**
   * Manejar toggle de intereses
   */
  const manejarToggleInteres = (interesId: string) => {
    setInteresesSeleccionados(prev => {
      if (prev.includes(interesId)) {
        return prev.filter(d => d !== interesId);
      } else {
        return [...prev, interesId];
      }
    });
  };

  /**
   * Validar paso actual
   */
  const validarPaso = (paso: number): { valida: boolean; mensaje?: string } => {
    switch (paso) {
      case 1:
        if (tipoUsuario === null) {
          return { valida: false, mensaje: 'Por favor selecciona cómo quieres usar la app' };
        }
        return { valida: true };
      case 2:
        if (interesesSeleccionados.length < 1) {
          return { valida: false, mensaje: 'Por favor selecciona al menos un interés' };
        }
        return { valida: true };
      case 3:
        if (tipoMascota === null) {
          return { valida: false, mensaje: 'Por favor selecciona el tipo de mascota' };
        }
        return { valida: true };
      default:
        return { valida: false, mensaje: 'Paso inválido' };
    }
  };

  /**
   * Siguiente paso
   */
  const siguientePaso = () => {
    const validacion = validarPaso(pasoActual);
    if (!validacion.valida) {
      Alert.alert('Completa la información', validacion.mensaje || 'Por favor completa todos los campos requeridos');
      return;
    }
    if (pasoActual < totalPasos) {
      setPasoActual(pasoActual + 1);
    } else {
      finalizarOnboarding();
    }
  };

  /**
   * Paso anterior
   */
  const pasoAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1);
    }
  };

  /**
   * Finalizar onboarding
   */
  const finalizarOnboarding = async () => {
    const validacion = validarPaso(pasoActual);
    if (!validacion.valida) {
      Alert.alert('Completa la información', validacion.mensaje || 'Por favor completa todos los campos requeridos');
      return;
    }

    // Validación final completa
    if (!tipoUsuario) {
      Alert.alert('Error', 'Debes seleccionar cómo quieres usar la app');
      return;
    }
    if (interesesSeleccionados.length < 1) {
      Alert.alert('Error', 'Debes seleccionar al menos un interés');
      return;
    }
    if (!tipoMascota) {
      Alert.alert('Error', 'Debes seleccionar el tipo de mascota');
      return;
    }

    setCargando(true);

    try {
      // Guardar en el backend
      const usuarioActualizado = await actualizarMiPerfil({
        tipoUsuario: tipoUsuario || undefined,
        intereses: interesesSeleccionados,
        onboardingCompletado: true,
      });

      // Actualizar contexto local
      actualizarUsuario(usuarioActualizado);

      // Navegar a completar perfil después del onboarding
      navigation.reset({
        index: 1,
        routes: [{ name: 'Principal' }, { name: 'EditarPerfil' }],
      });
    } catch (error: any) {
      console.error('Error guardando onboarding:', error);
      Alert.alert('Error', 'No se pudo guardar la configuración. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  /**
   * Renderizar indicadores de pasos
   */
  const renderIndicadoresPasos = () => (
    <View style={estilos.indicadoresContainer}>
      {Array.from({ length: totalPasos }, (_, i) => (
        <View
          key={i}
          style={[
            estilos.indicador,
            i + 1 === pasoActual && estilos.indicadorActivo,
            i + 1 < pasoActual && estilos.indicadorCompletado,
          ]}
        />
      ))}
    </View>
  );

  /**
   * Renderizar paso 1: Tipo de perfil
   */
  const renderPaso1 = () => (
    <View style={estilos.pasoContainer}>
      <Text style={estilos.tituloPaso}>¿Cómo quieres usar Indio?</Text>
      <Text style={estilos.descripcionPaso}>
        Queremos mostrarte mejores matches, eventos y personas con mascotas afines
      </Text>

      <View style={estilos.opcionesContainer}>
        {TIPOS_USUARIO.map((tipo) => (
          <TouchableOpacity
            key={tipo.id}
            style={[
              estilos.opcionCard,
              tipoUsuario === tipo.id && estilos.opcionCardSeleccionada,
            ]}
            onPress={() => manejarSeleccionarTipo(tipo.id)}
          >
            <MaterialIcons
              name={tipo.icon as any}
              size={48}
              color={tipoUsuario === tipo.id ? temaApp.colors.primary : temaApp.colors.onSurfaceVariant}
            />
            <Text style={[
              estilos.opcionLabel,
              tipoUsuario === tipo.id && estilos.opcionLabelSeleccionada,
            ]}>
              {tipo.label}
            </Text>
            <Text style={estilos.opcionDescripcion}>{tipo.descripcion}</Text>
            {tipoUsuario === tipo.id && (
              <MaterialIcons
                name="check-circle"
                size={24}
                color={temaApp.colors.primary}
                style={estilos.checkIcon}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  /**
   * Renderizar paso 2: Intereses de comunidad
   */
  const renderPaso2 = () => (
    <View style={estilos.pasoContainer}>
      <Text style={estilos.tituloPaso}>¿Qué planes te interesan?</Text>
      <Text style={estilos.descripcionPaso}>
        Selecciona al menos uno (puedes elegir varios)
      </Text>

      <View style={estilos.chipsContainer}>
        {INTERESES_COMUNIDAD.map((interes) => (
          <Chip
            key={interes.id}
            selected={interesesSeleccionados.includes(interes.id)}
            onPress={() => manejarToggleInteres(interes.id)}
            style={[
              estilos.chip,
              interesesSeleccionados.includes(interes.id) && estilos.chipSeleccionado,
            ]}
            textStyle={estilos.chipTexto}
          >
            {interes.label}
          </Chip>
        ))}
      </View>
    </View>
  );

  /**
   * Renderizar paso 3: Tipo de mascota
   */
  const renderPaso3 = () => {
    return (
      <View style={estilos.pasoContainer}>
        <Text style={estilos.tituloPaso}>¿Qué tipo de mascota tienes?</Text>
        <Text style={estilos.descripcionPaso}>
          Esto nos ayuda a sugerirte personas y eventos más compatibles
        </Text>

        <View style={estilos.opcionesContainer}>
          {TIPOS_MASCOTAS.map((tipo) => (
            <TouchableOpacity
              key={tipo.id}
              style={[
                estilos.opcionCard,
                tipoMascota === tipo.id && estilos.opcionCardSeleccionada,
              ]}
              onPress={() => setTipoMascota(tipo.id)}
            >
              <Text style={estilos.opcionEmoji}>
                {tipo.id === 'perro' ? '🐕' : tipo.id === 'gato' ? '🐈' : '🐕🐈'}
              </Text>
              <Text style={[
                estilos.opcionLabel,
                tipoMascota === tipo.id && estilos.opcionLabelSeleccionada,
              ]}>
                {tipo.label}
              </Text>
              {tipoMascota === tipo.id && (
                <MaterialIcons
                  name="check-circle"
                  size={24}
                  color={temaApp.colors.primary}
                  style={estilos.checkIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Surface style={estilos.contenedor}>
      {/* Header */}
      <View style={estilos.header}>
        <View style={estilos.logoContainer}>
          <View style={estilos.logo}>
            <Text style={estilos.logoEmoji}>🐾</Text>
          </View>
          <Text style={estilos.logoTexto}>{MARCA.nombre}</Text>
        </View>
        {renderIndicadoresPasos()}
      </View>

      {/* Contenido */}
      <ScrollView style={estilos.scrollView} contentContainerStyle={estilos.scrollContent}>
        {pasoActual === 1 && renderPaso1()}
        {pasoActual === 2 && renderPaso2()}
        {pasoActual === 3 && renderPaso3()}
      </ScrollView>

      {/* Footer con botones */}
      <View style={estilos.footer}>
        {pasoActual > 1 && (
          <Button
            variant="outline"
            onPress={pasoAnterior}
            disabled={cargando}
            style={estilos.botonSecundario}
          >
            Atrás
          </Button>
        )}
        <Button
          variant="default"
          onPress={siguientePaso}
          loading={cargando}
          disabled={!validarPaso(pasoActual)}
          style={estilos.botonPrincipal}
        >
          {pasoActual < totalPasos ? 'Siguiente' : 'Finalizar'}
        </Button>
      </View>
    </Surface>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: espaciado.lg,
    backgroundColor: temaApp.colors.primary,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaciado.lg,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: temaApp.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: espaciado.sm,
  },
  logoEmoji: {
    fontSize: 28,
  },
  logoTexto: {
    fontSize: 24,
    fontWeight: 'bold',
    color: temaApp.colors.onPrimary,
  },
  logoSlogan: {
    fontSize: 12,
    color: temaApp.colors.onPrimary,
    opacity: 0.9,
    marginTop: 4,
  },
  indicadoresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: espaciado.sm,
  },
  indicador: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  indicadorActivo: {
    width: 24,
    backgroundColor: temaApp.colors.secondary,
  },
  indicadorCompletado: {
    backgroundColor: temaApp.colors.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: espaciado.lg,
  },
  pasoContainer: {
    flex: 1,
  },
  tituloPaso: {
    fontSize: 28,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.sm,
    textAlign: 'center',
  },
  descripcionPaso: {
    fontSize: 16,
    color: temaApp.colors.onSurfaceVariant,
    marginBottom: espaciado.xl,
    textAlign: 'center',
  },
  opcionesContainer: {
    gap: espaciado.md,
  },
  opcionCard: {
    borderWidth: 2,
    borderColor: temaApp.colors.border,
    borderRadius: 16,
    padding: espaciado.xl,
    alignItems: 'center',
    backgroundColor: temaApp.colors.surface,
    position: 'relative',
  },
  opcionCardSeleccionada: {
    borderColor: temaApp.colors.primary,
    backgroundColor: temaApp.colors.primaryContainer,
  },
  opcionEmoji: {
    fontSize: 64,
    marginBottom: espaciado.md,
  },
  opcionLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.xs,
  },
  opcionLabelSeleccionada: {
    color: temaApp.colors.primary,
  },
  opcionDescripcion: {
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  checkIcon: {
    position: 'absolute',
    top: espaciado.md,
    right: espaciado.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciado.md,
    justifyContent: 'center',
  },
  chip: {
    marginRight: espaciado.sm,
    marginBottom: espaciado.sm,
    borderWidth: 2,
    borderColor: temaApp.colors.border,
  },
  chipSeleccionado: {
    backgroundColor: temaApp.colors.primaryContainer,
    borderColor: temaApp.colors.primary,
  },
  chipTexto: {
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: espaciado.lg,
    gap: espaciado.md,
    backgroundColor: temaApp.colors.surface,
    borderTopWidth: 1,
    borderTopColor: temaApp.colors.border,
  },
  botonPrincipal: {
    flex: 1,
  },
  botonSecundario: {
    flex: 1,
  },
});
