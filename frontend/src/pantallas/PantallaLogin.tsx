// Pantalla de Login de SportPetMatch
// Pantalla de autenticación para usuarios existentes

import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert 
} from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Card, 
  Divider,
  ActivityIndicator 
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

// Importar tema, contexto y constantes
import { temaApp, espaciado, sombras } from '../constantes/tema';
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import { useAuth, Usuario } from '../contextos/ContextoAuth';
import { iniciarSesion as servicioIniciarSesion } from '../servicios/servicioAuth';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

/**
 * Pantalla de Login - Autenticación de usuarios
 * 
 * Esta pantalla permite a los usuarios:
 * - Iniciar sesión con email y contraseña
 * - Iniciar sesión con Google OAuth
 * - Navegar a la pantalla de registro
 * - Recuperar contraseña
 * 
 * @returns JSX.Element - La pantalla de login renderizada
 */
export default function PantallaLogin(): JSX.Element {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { iniciarSesion } = useAuth();
  
  // Estados para el formulario
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [cargando, setCargando] = useState(false);

  /**
   * Función para manejar el login con email y contraseña
   */
  const manejarLogin = async () => {
    // Validar campos
    if (!email.trim() || !contraseña.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setCargando(true);

    try {
      // Usar servicio de autenticación
      const resultado = await servicioIniciarSesion({
        email: email.trim(),
        password: contraseña,
      });
      
      if (resultado.success && resultado.data) {
        // Login exitoso con la API
        const usuarioBackend = resultado.data.usuario;
        const token = resultado.data.token;
        
        // Convertir usuario del backend al formato del contexto
        const usuario: Usuario = {
          id: usuarioBackend.id,
          nombre: usuarioBackend.nombre.split(' ')[0] || usuarioBackend.nombre,
          apellido: usuarioBackend.nombre.split(' ').slice(1).join(' ') || '',
          email: usuarioBackend.email,
          fechaNacimiento: '',
          genero: 'otro',
          ciudad: '',
          provincia: '',
          pais: '',
          deportesFavoritos: usuarioBackend.intereses || [],
          nivelActividad: 'intermedio',
          disponibilidadSemanal: [],
          foto: usuarioBackend.avatar || undefined,
          tipoUsuario: usuarioBackend.tipoUsuario || undefined,
          onboardingCompletado: usuarioBackend.onboardingCompletado || false,
        };
        
        await iniciarSesion(usuario, token);
        
        Alert.alert(
          '¡Bienvenido!', 
          `Hola ${usuario.nombre}!`,
          [{ text: 'Continuar' }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Credenciales incorrectas');
    } finally {
      setCargando(false);
    }
  };

  /**
   * Función para manejar el login con Google
   */
  const manejarLoginGoogle = async () => {
    setCargando(true);

    try {
      // TODO: Implementar autenticación con Google OAuth
      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        '¡Bienvenido!', 
        'Has iniciado sesión con Google',
        [{ text: 'Continuar', onPress: () => {
          // TODO: Navegar a la pantalla principal
          console.log('Navegar a pantalla principal con Google');
        }}]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar sesión con Google. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  /**
   * Función para manejar la recuperación de contraseña
   */
  const manejarRecuperarContraseña = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email primero');
      return;
    }

    Alert.alert(
      'Recuperar Contraseña',
      `¿Enviar enlace de recuperación a ${email}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar', onPress: () => {
          // TODO: Implementar envío de email de recuperación
          Alert.alert('Email Enviado', 'Revisa tu bandeja de entrada');
        }}
      ]
    );
  };

  /**
   * Función para navegar a la pantalla de registro
   */
  const navegarARegistro = () => {
    navigation.navigate('Registro');
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
        {/* Header con logo y título */}
        <View style={estilos.header}>
          <View style={estilos.contenedorLogo}>
            <MaterialIcons 
              name="pets" 
              size={60} 
              color={temaApp.colors.primary} 
            />
            <Text variant="headlineMedium" style={estilos.tituloApp}>
              SportPetMatch
            </Text>
            <Text variant="bodyLarge" style={estilos.subtituloApp}>
              Conecta personas y mascotas en eventos deportivos
            </Text>
          </View>
        </View>

        {/* Formulario de login */}
        <Card style={estilos.tarjetaFormulario}>
          <Card.Content>
            <Text variant="headlineSmall" style={estilos.tituloFormulario}>
              Iniciar Sesión
            </Text>
            <Text variant="bodyMedium" style={estilos.subtituloFormulario}>
              Ingresa tus datos para continuar
            </Text>

            {/* Campo de email */}
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={estilos.campoTexto}
              left={<TextInput.Icon icon="email" />}
              disabled={cargando}
            />

            {/* Campo de contraseña */}
            <TextInput
              label="Contraseña"
              value={contraseña}
              onChangeText={setContraseña}
              mode="outlined"
              secureTextEntry={!mostrarContraseña}
              autoComplete="password"
              style={estilos.campoTexto}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon 
                  icon={mostrarContraseña ? "eye-off" : "eye"}
                  onPress={() => setMostrarContraseña(!mostrarContraseña)}
                />
              }
              disabled={cargando}
            />

            {/* Botón de recuperar contraseña */}
            <Button
              mode="text"
              onPress={manejarRecuperarContraseña}
              style={estilos.botonRecuperar}
              disabled={cargando}
            >
              ¿Olvidaste tu contraseña?
            </Button>

            {/* Botón de login */}
            <Button
              mode="contained"
              onPress={manejarLogin}
              style={estilos.botonLogin}
              disabled={cargando}
              contentStyle={estilos.contenidoBoton}
            >
              {cargando ? (
                <ActivityIndicator color={temaApp.colors.onPrimary} />
              ) : (
                'Iniciar Sesión'
              )}
            </Button>

            {/* Divider */}
            <View style={estilos.contenedorDivider}>
              <Divider style={estilos.divider} />
              <Text variant="bodySmall" style={estilos.textoDivider}>
                o continúa con
              </Text>
              <Divider style={estilos.divider} />
            </View>

            {/* Botón de Google */}
            <Button
              mode="outlined"
              onPress={manejarLoginGoogle}
              style={estilos.botonGoogle}
              disabled={cargando}
              contentStyle={estilos.contenidoBoton}
              icon="google"
            >
              Google
            </Button>
          </Card.Content>
        </Card>

        {/* Enlace a registro */}
        <View style={estilos.contenedorRegistro}>
          <Text variant="bodyMedium" style={estilos.textoRegistro}>
            ¿No tienes cuenta?{' '}
          </Text>
          <Button
            mode="text"
            onPress={navegarARegistro}
            style={estilos.botonRegistro}
            disabled={cargando}
          >
            Regístrate aquí
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Estilos de la pantalla
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
  contenedorLogo: {
    alignItems: 'center',
  },
  tituloApp: {
    fontWeight: 'bold',
    color: temaApp.colors.primary,
    marginTop: espaciado.md,
    textAlign: 'center',
  },
  subtituloApp: {
    color: temaApp.colors.onSurfaceVariant,
    marginTop: espaciado.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  tarjetaFormulario: {
    ...sombras.media,
    marginBottom: espaciado.lg,
  },
  tituloFormulario: {
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.xs,
  },
  subtituloFormulario: {
    color: temaApp.colors.onSurfaceVariant,
    marginBottom: espaciado.xl,
  },
  campoTexto: {
    marginBottom: espaciado.md,
  },
  botonRecuperar: {
    alignSelf: 'flex-end',
    marginBottom: espaciado.lg,
  },
  botonLogin: {
    marginBottom: espaciado.lg,
  },
  contenidoBoton: {
    paddingVertical: espaciado.sm,
  },
  contenedorDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: espaciado.lg,
  },
  divider: {
    flex: 1,
  },
  textoDivider: {
    marginHorizontal: espaciado.md,
    color: temaApp.colors.onSurfaceVariant,
  },
  botonGoogle: {
    marginBottom: espaciado.lg,
  },
  contenedorRegistro: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: espaciado.lg,
  },
  textoRegistro: {
    color: temaApp.colors.onSurfaceVariant,
  },
  botonRegistro: {
    marginLeft: -espaciado.sm,
  },
});
