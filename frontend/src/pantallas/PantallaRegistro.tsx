// Pantalla de Registro de SportPetMatch
// Adaptada con nuevos componentes y servicios API

import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Importar nuevos componentes UI
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Importar servicios y contexto
import { registrarUsuario, DatosRegistro } from '@/servicios/servicioAuth';
import { useAuth } from '@/contextos/ContextoAuth';
import { temaApp, espaciado, sombras } from '@/constantes/tema';
import { RootStackParamList } from '@/navegacion/NavegacionPrincipal';

type RegistroScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Registro'>;

/**
 * Pantalla de Registro - Crear nueva cuenta
 */
export default function PantallaRegistro(): JSX.Element {
  const navigation = useNavigation<RegistroScreenNavigationProp>();
  const { iniciarSesion } = useAuth();
  
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  /**
   * Validar formulario
   */
  const validarFormulario = (): boolean => {
    const { validarEmail, validarContraseña, validarTelefono, validarCampoRequerido, mensajesError } = require('../utilidades/validaciones');
    
    if (!validarCampoRequerido(nombre)) {
      Alert.alert('Error', mensajesError.campoRequerido('El nombre'));
      return false;
    }
    if (!validarCampoRequerido(email)) {
      Alert.alert('Error', mensajesError.campoRequerido('El email'));
      return false;
    }
    if (!validarEmail(email)) {
      Alert.alert('Error', mensajesError.emailInvalido);
      return false;
    }
    if (!validarCampoRequerido(password)) {
      Alert.alert('Error', mensajesError.campoRequerido('La contraseña'));
      return false;
    }
    if (!validarContraseña(password)) {
      Alert.alert('Error', mensajesError.contraseñaCorta);
      return false;
    }
    if (password !== confirmarPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }
    // Validar teléfono si se proporciona
    if (telefono.trim() && !validarTelefono(telefono.trim())) {
      Alert.alert('Error', mensajesError.telefonoInvalido);
      return false;
    }
    return true;
  };

  /**
   * Manejar registro
   */
  const manejarRegistro = async () => {
    if (!validarFormulario()) {
      return;
    }

    setCargando(true);

    try {
      const datosRegistro: DatosRegistro = {
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password,
        telefono: telefono.trim() || undefined,
      };

      const respuesta = await registrarUsuario(datosRegistro);

      if (respuesta.success && respuesta.data) {
        // Convertir usuario del backend al formato del contexto
        const usuario = {
          id: respuesta.data.usuario.id,
          nombre: respuesta.data.usuario.nombre.split(' ')[0] || respuesta.data.usuario.nombre,
          apellido: respuesta.data.usuario.nombre.split(' ').slice(1).join(' ') || '',
          email: respuesta.data.usuario.email,
          fechaNacimiento: '',
          genero: 'otro',
          ciudad: '',
          provincia: '',
          pais: '',
          deportesFavoritos: [],
          nivelActividad: 'intermedio',
          disponibilidadSemanal: [],
          foto: respuesta.data.usuario.avatar || undefined,
        };

        await iniciarSesion(usuario, respuesta.data.token);

        Alert.alert(
          '¡Bienvenido!',
          `Cuenta creada exitosamente. ¡Bienvenido ${usuario.nombre}!`,
          [{ text: 'Continuar' }]
        );

        // La navegación se maneja automáticamente por el contexto de auth
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'No se pudo crear la cuenta. Intenta de nuevo.'
      );
    } finally {
      setCargando(false);
    }
  };

  /**
   * Navegar a login
   */
  const navegarALogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={estilos.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={estilos.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={estilos.header}>
          <View style={estilos.logoContainer}>
            <View style={estilos.logo}>
              <Text style={estilos.logoEmoji}>🐾</Text>
            </View>
            <Text style={estilos.titulo}>SportPetMatch</Text>
          </View>
          <Text style={estilos.subtitulo}>Crea tu cuenta y conecta con otros</Text>
        </View>

        {/* Formulario */}
        <Card style={estilos.card}>
          <CardContent>
            <Text style={estilos.tituloFormulario}>Crear Cuenta</Text>

            {/* Nombre */}
            <View style={estilos.campoContainer}>
              <MaterialIcons
                name="person"
                size={20}
                color={temaApp.colors.primary}
                style={estilos.iconoCampo}
              />
              <TextInput
                label="Nombre completo"
                value={nombre}
                onChangeText={setNombre}
                mode="outlined"
                style={estilos.campo}
                autoCapitalize="words"
                disabled={cargando}
              />
            </View>

            {/* Email */}
            <View style={estilos.campoContainer}>
              <MaterialIcons
                name="email"
                size={20}
                color={temaApp.colors.primary}
                style={estilos.iconoCampo}
              />
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={estilos.campo}
                disabled={cargando}
              />
            </View>

            {/* Teléfono (opcional) */}
            <View style={estilos.campoContainer}>
              <MaterialIcons
                name="phone"
                size={20}
                color={temaApp.colors.primary}
                style={estilos.iconoCampo}
              />
              <TextInput
                label="Teléfono (opcional)"
                value={telefono}
                onChangeText={setTelefono}
                mode="outlined"
                keyboardType="phone-pad"
                style={estilos.campo}
                disabled={cargando}
              />
            </View>

            {/* Contraseña */}
            <View style={estilos.campoContainer}>
              <MaterialIcons
                name="lock"
                size={20}
                color={temaApp.colors.primary}
                style={estilos.iconoCampo}
              />
              <TextInput
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!mostrarPassword}
                style={estilos.campo}
                right={
                  <TextInput.Icon
                    icon={mostrarPassword ? 'eye-off' : 'eye'}
                    onPress={() => setMostrarPassword(!mostrarPassword)}
                  />
                }
                disabled={cargando}
              />
            </View>

            {/* Confirmar Contraseña */}
            <View style={estilos.campoContainer}>
              <MaterialIcons
                name="lock-outline"
                size={20}
                color={temaApp.colors.primary}
                style={estilos.iconoCampo}
              />
              <TextInput
                label="Confirmar Contraseña"
                value={confirmarPassword}
                onChangeText={setConfirmarPassword}
                mode="outlined"
                secureTextEntry={!mostrarPassword}
                style={estilos.campo}
                disabled={cargando}
              />
            </View>

            {/* Botón de registro */}
            <Button
              variant="default"
              size="lg"
              onPress={manejarRegistro}
              loading={cargando}
              style={estilos.botonRegistro}
            >
              {cargando ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </CardContent>
        </Card>

        {/* Enlace a login */}
        <View style={estilos.contenedorLogin}>
          <Text style={estilos.textoLogin}>¿Ya tienes cuenta? </Text>
          <Button
            variant="link"
            onPress={navegarALogin}
            style={estilos.botonLogin}
          >
            Inicia sesión aquí
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: espaciado.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: espaciado.xxl,
    marginBottom: espaciado.xl,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: espaciado.md,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: temaApp.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombras.media,
  },
  logoEmoji: {
    fontSize: 24,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: temaApp.colors.primary,
  },
  subtitulo: {
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: espaciado.sm,
  },
  card: {
    ...sombras.media,
    marginBottom: espaciado.lg,
  },
  tituloFormulario: {
    fontSize: 20,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.lg,
  },
  campoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: espaciado.md,
  },
  iconoCampo: {
    marginRight: espaciado.sm,
    marginTop: 8,
  },
  campo: {
    flex: 1,
  },
  botonRegistro: {
    marginTop: espaciado.lg,
  },
  contenedorLogin: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: espaciado.lg,
  },
  textoLogin: {
    color: temaApp.colors.onSurfaceVariant,
    fontSize: 14,
  },
  botonLogin: {
    marginLeft: -espaciado.sm,
  },
});
