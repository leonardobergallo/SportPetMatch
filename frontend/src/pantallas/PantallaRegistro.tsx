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
import { Text, TextInput } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { registrarUsuario, DatosRegistro } from '@/servicios/servicioAuth';
import { normalizarUsuario, useAuth } from '@/contextos/ContextoAuth';
import { temaApp, espaciado, sombras, MARCA } from '@/constantes/tema';
import { RootStackParamList } from '@/navegacion/NavegacionPrincipal';
import { normalizarEmail, normalizarTelefono, validarRegistro } from '@/utilidades/validaciones';

type RegistroScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Registro'>;

export default function PantallaRegistro(): JSX.Element {
  const navigation = useNavigation<RegistroScreenNavigationProp>();
  const { iniciarSesion } = useAuth();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  const validarFormulario = (): boolean => {
    const resultado = validarRegistro({
      nombre,
      email,
      password,
      confirmarPassword,
      telefono,
    });

    if (!resultado.valida) {
      Alert.alert('Error', resultado.mensaje || 'Revisa los datos ingresados');
      return false;
    }

    return true;
  };

  const manejarRegistro = async () => {
    if (!validarFormulario()) {
      return;
    }

    setCargando(true);

    try {
      const datosRegistro: DatosRegistro = {
        nombre: nombre.trim(),
        email: normalizarEmail(email),
        password,
        telefono: telefono.trim() ? normalizarTelefono(telefono) : undefined,
      };

      const respuesta = await registrarUsuario(datosRegistro);

      if (respuesta.success && respuesta.data) {
        const usuario = normalizarUsuario({
          id: respuesta.data.usuario.id,
          nombre: respuesta.data.usuario.nombre,
          email: respuesta.data.usuario.email,
          avatar: respuesta.data.usuario.avatar || null,
          esPremium: respuesta.data.usuario.esPremium,
          intereses: [],
          onboardingCompletado: false,
        });

        await iniciarSesion(usuario, respuesta.data.token);

        Alert.alert(
          'Bienvenido',
          `Cuenta creada exitosamente. Bienvenido ${usuario.nombre}!`,
          [{ text: 'Continuar' }]
        );
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      const mensajeError = error.response?.data?.message || error.message || 'No se pudo crear la cuenta. Intenta de nuevo.';
      Alert.alert('Error', mensajeError);
    } finally {
      setCargando(false);
    }
  };

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
        <View style={estilos.header}>
          <View style={estilos.logoContainer}>
            <View style={estilos.logo}>
              <Text style={estilos.logoEmoji}>🐾</Text>
            </View>
            <Text style={estilos.titulo}>{MARCA.nombre}</Text>
          </View>
          <Text style={estilos.subtitulo}>Crea tu cuenta y conecta con otros</Text>
        </View>

        <Card style={estilos.card}>
          <CardContent>
            <Text style={estilos.tituloFormulario}>Crear Cuenta</Text>

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

            <View style={estilos.campoContainer}>
              <MaterialIcons
                name="phone"
                size={20}
                color={temaApp.colors.primary}
                style={estilos.iconoCampo}
              />
              <TextInput
                label="Telefono (opcional)"
                value={telefono}
                onChangeText={setTelefono}
                mode="outlined"
                keyboardType="phone-pad"
                style={estilos.campo}
                disabled={cargando}
              />
            </View>

            <View style={estilos.campoContainer}>
              <MaterialIcons
                name="lock"
                size={20}
                color={temaApp.colors.primary}
                style={estilos.iconoCampo}
              />
              <TextInput
                label="Contrasena"
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

            <View style={estilos.campoContainer}>
              <MaterialIcons
                name="lock-outline"
                size={20}
                color={temaApp.colors.primary}
                style={estilos.iconoCampo}
              />
              <TextInput
                label="Confirmar contrasena"
                value={confirmarPassword}
                onChangeText={setConfirmarPassword}
                mode="outlined"
                secureTextEntry={!mostrarPassword}
                style={estilos.campo}
                disabled={cargando}
              />
            </View>

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

        <View style={estilos.contenedorLogin}>
          <Text style={estilos.textoLogin}>Ya tienes cuenta? </Text>
          <Button
            variant="link"
            onPress={navegarALogin}
            style={estilos.botonLogin}
          >
            Inicia sesion aqui
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
