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

import { temaApp, espaciado, sombras } from '@/constantes/tema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contextos/ContextoAuth';
import { actualizarMiPerfil } from '@/servicios/servicioUsuarios';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navegacion/NavegacionPrincipal';

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

// Tipos de usuarios
const TIPOS_USUARIO = [
  { id: 'solo', label: 'Solo', icon: 'person', descripcion: 'Practico deporte sin mascota' },
  { id: 'con_mascota', label: 'Con Mascota', icon: 'pets', descripcion: 'Practico deporte CON mi mascota' },
  { id: 'ambos', label: 'Ambos', icon: 'people', descripcion: 'Hago ambas cosas' },
];

// Deportes disponibles
const DEPORTES_DISPONIBLES = [
  { id: 'correr', label: 'Correr 🏃', icon: 'directions-run' },
  { id: 'caminar', label: 'Caminar 🚶', icon: 'directions-walk' },
  { id: 'ciclismo', label: 'Ciclismo 🚴', icon: 'pedal-bike' },
  { id: 'senderismo', label: 'Senderismo ⛰️', icon: 'terrain' },
  { id: 'yoga', label: 'Yoga 🧘', icon: 'self-improvement' },
  { id: 'natacion', label: 'Natación 🏊', icon: 'pool' },
  { id: 'tenis', label: 'Tenis 🎾', icon: 'sports-tennis' },
  { id: 'futbol', label: 'Fútbol ⚽', icon: 'sports-soccer' },
  { id: 'volleyball', label: 'Volleyball 🏐', icon: 'sports-volleyball' },
  { id: 'patinaje', label: 'Patinaje 🛼', icon: 'sports-roller-skating' },
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
  const [deportesSeleccionados, setDeportesSeleccionados] = useState<string[]>([]);
  const [tipoMascota, setTipoMascota] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const totalPasos = 3;

  /**
   * Manejar selección de tipo de usuario
   */
  const manejarSeleccionarTipo = (tipo: string) => {
    setTipoUsuario(tipo);
    // Si selecciona "solo", no necesita tipo de mascota
    if (tipo === 'solo') {
      setTipoMascota(null);
    }
  };

  /**
   * Manejar toggle de deportes
   */
  const manejarToggleDeporte = (deporteId: string) => {
    setDeportesSeleccionados(prev => {
      if (prev.includes(deporteId)) {
        return prev.filter(d => d !== deporteId);
      } else {
        return [...prev, deporteId];
      }
    });
  };

  /**
   * Validar paso actual
   */
  const validarPaso = (paso: number): boolean => {
    switch (paso) {
      case 1:
        return tipoUsuario !== null;
      case 2:
        return deportesSeleccionados.length >= 1;
      case 3:
        // Solo validar tipo de mascota si no es "solo"
        if (tipoUsuario === 'solo') return true;
        return tipoMascota !== null;
      default:
        return false;
    }
  };

  /**
   * Siguiente paso
   */
  const siguientePaso = () => {
    if (!validarPaso(pasoActual)) {
      Alert.alert('Completa la información', 'Por favor completa todos los campos requeridos');
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
    if (!validarPaso(pasoActual)) {
      Alert.alert('Completa la información', 'Por favor completa todos los campos requeridos');
      return;
    }

    setCargando(true);

    try {
      // Guardar en el backend
      const usuarioActualizado = await actualizarMiPerfil({
        tipoUsuario: tipoUsuario || undefined,
        intereses: deportesSeleccionados,
        onboardingCompletado: true,
      });

      // Actualizar contexto local
      actualizarUsuario({
        deportesFavoritos: deportesSeleccionados,
        onboardingCompletado: true,
        tipoUsuario: tipoUsuario || undefined,
      });

      // Navegar a la pantalla principal
      navigation.reset({
        index: 0,
        routes: [{ name: 'Principal' }],
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
   * Renderizar paso 1: Tipo de usuario
   */
  const renderPaso1 = () => (
    <View style={estilos.pasoContainer}>
      <Text style={estilos.tituloPaso}>¿Cómo practicas deporte?</Text>
      <Text style={estilos.descripcionPaso}>
        Cuéntanos cómo prefieres hacer ejercicio
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
   * Renderizar paso 2: Deportes favoritos
   */
  const renderPaso2 = () => (
    <View style={estilos.pasoContainer}>
      <Text style={estilos.tituloPaso}>¿Qué deportes te gustan?</Text>
      <Text style={estilos.descripcionPaso}>
        Selecciona al menos uno (puedes elegir varios)
      </Text>

      <View style={estilos.chipsContainer}>
        {DEPORTES_DISPONIBLES.map((deporte) => (
          <Chip
            key={deporte.id}
            selected={deportesSeleccionados.includes(deporte.id)}
            onPress={() => manejarToggleDeporte(deporte.id)}
            style={[
              estilos.chip,
              deportesSeleccionados.includes(deporte.id) && estilos.chipSeleccionado,
            ]}
            textStyle={estilos.chipTexto}
          >
            {deporte.label}
          </Chip>
        ))}
      </View>
    </View>
  );

  /**
   * Renderizar paso 3: Tipo de mascota
   */
  const renderPaso3 = () => {
    if (tipoUsuario === 'solo') {
      // Si eligió "solo", no necesita este paso
      return null;
    }

    return (
      <View style={estilos.pasoContainer}>
        <Text style={estilos.tituloPaso}>¿Qué tipo de mascota tienes?</Text>
        <Text style={estilos.descripcionPaso}>
          Esto nos ayudará a encontrar mejores matches
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
          <Text style={estilos.logoTexto}>SportPetMatch</Text>
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
