// Pantalla de Configuración - SportPetMatch
// Ajustes y configuración de la aplicación

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Text,
  Card,
  Switch,
  Divider,
  List,
  Button,
  Portal,
  Dialog,
  TextInput as PaperTextInput,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Importar servicios y tema
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import { temaApp, espaciado, sombras } from '../constantes/tema';
import { useAuth } from '../contextos/ContextoAuth';
import { mostrarAlerta } from '@/utilidades/alerta';
import { cambiarPassword } from '@/servicios/servicioAuth';

type ConfiguracionNavigationProp = StackNavigationProp<RootStackParamList, 'Configuracion'>;

/** Tipografia web (Plus Jakarta / Outfit), misma familia que el resto de la app en web */
const fontSans = Platform.select({ web: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', default: undefined });
const fontDisplay = Platform.select({ web: '"Outfit", "Plus Jakarta Sans", system-ui, sans-serif', default: undefined });

/**
 * Pantalla de Configuración
 */
export default function PantallaConfiguracion(): JSX.Element {
  const navigation = useNavigation<ConfiguracionNavigationProp>();
  const { cerrarSesion, usuario } = useAuth();

  const [notificaciones, setNotificaciones] = useState(true);
  const [notificacionesMatches, setNotificacionesMatches] = useState(true);
  const [notificacionesEventos, setNotificacionesEventos] = useState(true);
  const [modoOscuro, setModoOscuro] = useState(false);

  const [mostrarDialogoPassword, setMostrarDialogoPassword] = useState(false);
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  const [guardandoPassword, setGuardandoPassword] = useState(false);

  const limpiarDialogoPassword = () => {
    setMostrarDialogoPassword(false);
    setPasswordActual('');
    setPasswordNueva('');
    setPasswordConfirmar('');
  };

  /**
   * Cambiar contraseña: pide la actual, valida la nueva, confirma el cambio
   */
  const manejarCambiarPassword = async () => {
    if (!passwordActual || !passwordNueva || !passwordConfirmar) {
      mostrarAlerta('Error', 'Completa los tres campos');
      return;
    }
    if (passwordNueva.length < 6) {
      mostrarAlerta('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (passwordNueva !== passwordConfirmar) {
      mostrarAlerta('Error', 'La confirmación no coincide con la nueva contraseña');
      return;
    }

    try {
      setGuardandoPassword(true);
      await cambiarPassword(passwordActual, passwordNueva);
      limpiarDialogoPassword();
      mostrarAlerta('¡Listo!', 'Tu contraseña se actualizó correctamente');
    } catch (error: any) {
      const mensaje =
        error?.response?.data?.message || error?.message || 'No se pudo cambiar la contraseña';
      mostrarAlerta('Error', mensaje);
    } finally {
      setGuardandoPassword(false);
    }
  };

  /**
   * Manejar cerrar sesión
   */
  const manejarCerrarSesion = () => {
    mostrarAlerta(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await cerrarSesion();
              // La navegación se manejará automáticamente por el contexto
            } catch (error) {
              mostrarAlerta('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ]
    );
  };

  /**
   * Navegar a editar perfil
   */
  const navegarAEditarPerfil = () => {
    navigation.navigate('EditarPerfil');
  };

  /**
   * Navegar a privacidad
   */
  const navegarAPrivacidad = () => {
    mostrarAlerta('Privacidad', 'Política de privacidad próximamente');
  };

  /**
   * Navegar a términos
   */
  const navegarATerminos = () => {
    mostrarAlerta('Términos', 'Términos y condiciones próximamente');
  };

  /**
   * Navegar a ayuda
   */
  const navegarAAyuda = () => {
    mostrarAlerta('Ayuda', 'Centro de ayuda próximamente');
  };

  /**
   * Navegar a acerca de
   */
  const navegarAAcercaDe = () => {
    mostrarAlerta(
      'Acerca de',
      'Indio v1.0.0\n\nConecta personas con mascotas, matches y eventos pet-friendly.'
    );
  };

  return (
    <ScrollView 
      style={estilos.contenedor}
      contentContainerStyle={estilos.scrollContent}
      showsVerticalScrollIndicator={true}
    >
      {/* Perfil */}
      <Card style={estilos.card}>
        <Card.Content>
          <Text style={estilos.seccionTitulo}>Perfil</Text>
          <TouchableOpacity
            style={estilos.item}
            onPress={navegarAEditarPerfil}
          >
            <MaterialIcons name="person" size={24} color={temaApp.colors.primary} />
            <View style={estilos.itemContent}>
              <Text style={estilos.itemTitulo}>Editar Perfil</Text>
              <Text style={estilos.itemDescripcion}>
                {usuario?.nombre || 'Usuario'}
              </Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={temaApp.colors.onSurfaceVariant}
            />
          </TouchableOpacity>

          <Divider style={estilos.divisor} />

          <TouchableOpacity
            style={estilos.item}
            onPress={() => setMostrarDialogoPassword(true)}
          >
            <MaterialIcons name="lock" size={24} color={temaApp.colors.primary} />
            <View style={estilos.itemContent}>
              <Text style={estilos.itemTitulo}>Cambiar Contraseña</Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={temaApp.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* Notificaciones */}
      <Card style={estilos.card}>
        <Card.Content>
          <Text style={estilos.seccionTitulo}>Notificaciones</Text>
          
          <View style={estilos.switchItem}>
            <View style={estilos.switchContent}>
              <MaterialIcons
                name="notifications"
                size={24}
                color={temaApp.colors.primary}
              />
              <View style={estilos.itemContent}>
                <Text style={estilos.itemTitulo}>Notificaciones Push</Text>
                <Text style={estilos.itemDescripcion}>
                  Recibir notificaciones generales
                </Text>
              </View>
            </View>
            <Switch
              value={notificaciones}
              onValueChange={setNotificaciones}
              color={temaApp.colors.primary}
            />
          </View>

          <Divider style={estilos.divisor} />

          <View style={estilos.switchItem}>
            <View style={estilos.switchContent}>
              <MaterialIcons
                name="favorite"
                size={24}
                color={temaApp.colors.primary}
              />
              <View style={estilos.itemContent}>
                <Text style={estilos.itemTitulo}>Notificaciones de Matches</Text>
                <Text style={estilos.itemDescripcion}>
                  Alertas cuando alguien te hace match
                </Text>
              </View>
            </View>
            <Switch
              value={notificacionesMatches}
              onValueChange={setNotificacionesMatches}
              color={temaApp.colors.primary}
            />
          </View>

          <Divider style={estilos.divisor} />

          <View style={estilos.switchItem}>
            <View style={estilos.switchContent}>
              <MaterialIcons name="event" size={24} color={temaApp.colors.primary} />
              <View style={estilos.itemContent}>
                <Text style={estilos.itemTitulo}>Notificaciones de Eventos</Text>
                <Text style={estilos.itemDescripcion}>
                  Recordatorios de eventos cercanos
                </Text>
              </View>
            </View>
            <Switch
              value={notificacionesEventos}
              onValueChange={setNotificacionesEventos}
              color={temaApp.colors.primary}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Apariencia */}
      <Card style={estilos.card}>
        <Card.Content>
          <Text style={estilos.seccionTitulo}>Apariencia</Text>
          
          <View style={estilos.switchItem}>
            <View style={estilos.switchContent}>
              <MaterialIcons
                name="dark-mode"
                size={24}
                color={temaApp.colors.primary}
              />
              <View style={estilos.itemContent}>
                <Text style={estilos.itemTitulo}>Modo Oscuro</Text>
                <Text style={estilos.itemDescripcion}>
                  Cambiar tema de la aplicación
                </Text>
              </View>
            </View>
            <Switch
              value={modoOscuro}
              onValueChange={setModoOscuro}
              color={temaApp.colors.primary}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Información */}
      <Card style={estilos.card}>
        <Card.Content>
          <Text style={estilos.seccionTitulo}>Información</Text>
          
          <TouchableOpacity style={estilos.item} onPress={navegarAPrivacidad}>
            <MaterialIcons
              name="privacy-tip"
              size={24}
              color={temaApp.colors.primary}
            />
            <View style={estilos.itemContent}>
              <Text style={estilos.itemTitulo}>Privacidad</Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={temaApp.colors.onSurfaceVariant}
            />
          </TouchableOpacity>

          <Divider style={estilos.divisor} />

          <TouchableOpacity style={estilos.item} onPress={navegarATerminos}>
            <MaterialIcons
              name="description"
              size={24}
              color={temaApp.colors.primary}
            />
            <View style={estilos.itemContent}>
              <Text style={estilos.itemTitulo}>Términos y Condiciones</Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={temaApp.colors.onSurfaceVariant}
            />
          </TouchableOpacity>

          <Divider style={estilos.divisor} />

          <TouchableOpacity style={estilos.item} onPress={navegarAAyuda}>
            <MaterialIcons name="help" size={24} color={temaApp.colors.primary} />
            <View style={estilos.itemContent}>
              <Text style={estilos.itemTitulo}>Ayuda y Soporte</Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={temaApp.colors.onSurfaceVariant}
            />
          </TouchableOpacity>

          <Divider style={estilos.divisor} />

          <TouchableOpacity style={estilos.item} onPress={navegarAAcercaDe}>
            <MaterialIcons
              name="info"
              size={24}
              color={temaApp.colors.primary}
            />
            <View style={estilos.itemContent}>
              <Text style={estilos.itemTitulo}>Acerca de</Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={temaApp.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* Cerrar Sesión */}
      <Card style={estilos.card}>
        <Card.Content>
          <Button
            mode="outlined"
            onPress={manejarCerrarSesion}
            textColor={temaApp.colors.error}
            icon="logout"
            style={estilos.botonCerrarSesion}
          >
            Cerrar Sesión
          </Button>
        </Card.Content>
      </Card>

      <Portal>
        <Dialog visible={mostrarDialogoPassword} onDismiss={limpiarDialogoPassword}>
          <Dialog.Title>Cambiar Contraseña</Dialog.Title>
          <Dialog.Content>
            <PaperTextInput
              label="Contraseña actual"
              value={passwordActual}
              onChangeText={setPasswordActual}
              secureTextEntry
              style={estilos.inputPassword}
              mode="outlined"
            />
            <PaperTextInput
              label="Nueva contraseña"
              value={passwordNueva}
              onChangeText={setPasswordNueva}
              secureTextEntry
              style={estilos.inputPassword}
              mode="outlined"
            />
            <PaperTextInput
              label="Confirmar nueva contraseña"
              value={passwordConfirmar}
              onChangeText={setPasswordConfirmar}
              secureTextEntry
              style={estilos.inputPassword}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={limpiarDialogoPassword} disabled={guardandoPassword}>
              Cancelar
            </Button>
            <Button onPress={manejarCambiarPassword} loading={guardandoPassword} disabled={guardandoPassword}>
              Guardar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  card: {
    margin: espaciado.md,
    marginBottom: 0,
    ...sombras.media,
    ...(Platform.OS === 'web' ? { borderRadius: 20 } : {}),
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.md,
    ...(Platform.OS === 'web' ? { color: temaApp.colors.primary, ...(fontDisplay ? { fontFamily: fontDisplay } : {}) } : {}),
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: espaciado.sm,
    gap: espaciado.md,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: espaciado.sm,
  },
  switchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
    flex: 1,
  },
  itemContent: {
    flex: 1,
  },
  itemTitulo: {
    fontSize: 16,
    fontWeight: '500',
    color: temaApp.colors.onSurface,
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  itemDescripcion: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: 2,
  },
  divisor: {
    marginVertical: espaciado.sm,
  },
  botonCerrarSesion: {
    marginTop: espaciado.sm,
    borderColor: temaApp.colors.error,
  },
  inputPassword: {
    marginBottom: espaciado.sm,
  },
});

