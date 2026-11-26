// Pantalla de Registro de SportPetMatch
// Adaptada con nuevos componentes y servicios API

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TouchableOpacity,
  Image,
  TextInput as RNTextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { mostrarAlerta } from '@/utilidades/alerta';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { registrarUsuario, DatosRegistro } from '@/servicios/servicioAuth';
import { subirFotosPerfil } from '@/servicios/servicioUpload';
import { normalizarUsuario, useAuth } from '@/contextos/ContextoAuth';
import { temaApp, espaciado, sombras, MARCA } from '@/constantes/tema';
import { RootStackParamList } from '@/navegacion/NavegacionPrincipal';
import { normalizarEmail, normalizarTelefono, validarRegistro } from '@/utilidades/validaciones';

type RegistroScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Registro'>;

const MAX_FOTOS_PERFIL = 6;

/** Tipografía web (Plus Jakarta / Outfit cargadas en web/index.html), misma familia que PantallaLogin */
const fontSans = Platform.select({
  web: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
  default: undefined,
});
const fontDisplay = Platform.select({
  web: '"Outfit", "Plus Jakarta Sans", system-ui, sans-serif',
  default: undefined,
});

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
  const [fotos, setFotos] = useState<string[]>([]);
  const [subiendoFotos, setSubiendoFotos] = useState(false);

  const validarFormulario = (): boolean => {
    const resultado = validarRegistro({
      nombre,
      email,
      password,
      confirmarPassword,
      telefono,
    });

    if (!resultado.valida) {
      mostrarAlerta('Error', resultado.mensaje || 'Revisa los datos ingresados');
      return false;
    }

    return true;
  };

  const seleccionarFotos = async () => {
    if (fotos.length >= MAX_FOTOS_PERFIL) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsMultipleSelection: true,
        selectionLimit: MAX_FOTOS_PERFIL - fotos.length,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const nuevas = result.assets.map((asset) => asset.uri).filter(Boolean);
        setFotos((actuales) => [...actuales, ...nuevas].slice(0, MAX_FOTOS_PERFIL));
      }
    } catch (error) {
      console.error('Error seleccionando fotos:', error);
      mostrarAlerta('Error', 'No se pudieron seleccionar las fotos');
    }
  };

  const quitarFoto = (index: number) => {
    setFotos((actuales) => actuales.filter((_, i) => i !== index));
  };

  const marcarFotoPrincipal = (index: number) => {
    if (index === 0) return;
    setFotos((actuales) => {
      const copia = [...actuales];
      const [foto] = copia.splice(index, 1);
      return [foto, ...copia];
    });
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

        let mensaje = `Cuenta creada exitosamente. ¡Bienvenido ${usuario.nombre}!`;

        // Las fotos se suben después del registro porque el endpoint requiere
        // sesión. Si falla la subida, la cuenta ya quedó creada.
        if (fotos.length > 0) {
          setSubiendoFotos(true);
          try {
            const subidas = await subirFotosPerfil(fotos);
            await iniciarSesion(
              normalizarUsuario({
                ...usuario,
                avatar: subidas.avatar,
                fotos: subidas.fotos,
              }),
              respuesta.data.token
            );
          } catch (error: any) {
            console.error('Error subiendo fotos de perfil:', error);
            mensaje += ' No pudimos subir tus fotos; podés agregarlas desde Editar perfil.';
          } finally {
            setSubiendoFotos(false);
          }
        }

        mostrarAlerta('Bienvenido', mensaje, [{ text: 'Continuar' }]);
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      const mensajeError = error.response?.data?.message || error.message || 'No se pudo crear la cuenta. Intenta de nuevo.';
      mostrarAlerta('Error', mensajeError);
    } finally {
      setCargando(false);
    }
  };

  const navegarALogin = () => {
    navigation.navigate('Login');
  };

  if (Platform.OS === 'web') {
    return (
      <KeyboardAvoidingView style={web.root} behavior="height">
        <ScrollView
          contentContainerStyle={web.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={web.card}>
            <View style={web.header}>
              <View style={web.logo}>
                <Text style={web.logoEmoji}>🐾</Text>
              </View>
              <Text style={web.titulo}>{MARCA.nombre}</Text>
              <Text style={web.subtitulo}>Creá tu cuenta y conectá con otros</Text>
            </View>

            <Text style={web.formTitle}>Crear cuenta</Text>

            <View style={web.field}>
              <Text style={web.label}>Fotos con tu mascota (hasta 6)</Text>
              <Text style={web.help}>
                Mostrá tus mejores momentos con tu perro. La primera foto va a ser tu foto principal.
              </Text>
              <View style={web.fotosGrid}>
                {fotos.map((foto, index) => (
                  <View key={`${foto}-${index}`} style={web.fotoItem}>
                    <Image source={{ uri: foto }} style={web.foto} />
                    {index === 0 && (
                      <View style={web.fotoPrincipalBadge}>
                        <Text style={web.fotoPrincipalTxt}>Principal</Text>
                      </View>
                    )}
                    <Pressable style={web.fotoQuitar} onPress={() => quitarFoto(index)}>
                      <MaterialIcons name="close" size={16} color="#ffffff" />
                    </Pressable>
                    {index > 0 && (
                      <Pressable
                        style={web.fotoDestacar}
                        onPress={() => marcarFotoPrincipal(index)}
                      >
                        <MaterialIcons name="star" size={16} color="#ffffff" />
                      </Pressable>
                    )}
                  </View>
                ))}
                {fotos.length < MAX_FOTOS_PERFIL && (
                  <Pressable style={web.fotoAgregar} onPress={seleccionarFotos}>
                    <MaterialIcons
                      name="add-a-photo"
                      size={24}
                      color={temaApp.colors.primary}
                    />
                    <Text style={web.fotoAgregarTxt}>Agregar</Text>
                  </Pressable>
                )}
              </View>
            </View>

            <View style={web.field}>
              <Text style={web.label}>Nombre completo</Text>
              <View style={web.inputWrap}>
                <MaterialIcons name="person" size={18} color={temaApp.colors.primary} style={web.inputIcon} />
                <RNTextInput
                  style={web.input}
                  value={nombre}
                  onChangeText={setNombre}
                  autoCapitalize="words"
                  editable={!cargando}
                  placeholder="Tu nombre"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={web.field}>
              <Text style={web.label}>Email</Text>
              <View style={web.inputWrap}>
                <MaterialIcons name="email" size={18} color={temaApp.colors.primary} style={web.inputIcon} />
                <RNTextInput
                  style={web.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!cargando}
                  placeholder="tu@email.com"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={web.field}>
              <Text style={web.label}>Teléfono (opcional)</Text>
              <View style={web.inputWrap}>
                <MaterialIcons name="phone" size={18} color={temaApp.colors.primary} style={web.inputIcon} />
                <RNTextInput
                  style={web.input}
                  value={telefono}
                  onChangeText={setTelefono}
                  keyboardType="phone-pad"
                  editable={!cargando}
                  placeholder="Tu teléfono"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={web.field}>
              <Text style={web.label}>Contraseña</Text>
              <View style={web.inputWrap}>
                <MaterialIcons name="lock" size={18} color={temaApp.colors.primary} style={web.inputIcon} />
                <RNTextInput
                  style={web.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!mostrarPassword}
                  autoComplete="new-password"
                  editable={!cargando}
                  placeholder="Contraseña"
                  placeholderTextColor="#94a3b8"
                />
                <Pressable onPress={() => setMostrarPassword(!mostrarPassword)} style={web.inputEyeBtn}>
                  <MaterialIcons name={mostrarPassword ? 'visibility-off' : 'visibility'} size={18} color="#94a3b8" />
                </Pressable>
              </View>
            </View>

            <View style={web.field}>
              <Text style={web.label}>Confirmar contraseña</Text>
              <View style={web.inputWrap}>
                <MaterialIcons name="lock-outline" size={18} color={temaApp.colors.primary} style={web.inputIcon} />
                <RNTextInput
                  style={web.input}
                  value={confirmarPassword}
                  onChangeText={setConfirmarPassword}
                  secureTextEntry={!mostrarPassword}
                  autoComplete="new-password"
                  editable={!cargando}
                  placeholder="Repetí tu contraseña"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <Pressable
              style={[web.button, (cargando || subiendoFotos) && web.buttonDisabled]}
              onPress={manejarRegistro}
              disabled={cargando || subiendoFotos}
            >
              {cargando || subiendoFotos ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={web.buttonTxt}>Crear cuenta</Text>
              )}
            </Pressable>

            <View style={web.loginRow}>
              <Text style={web.loginTxt}>¿Ya tenés cuenta? </Text>
              <Pressable onPress={navegarALogin}>
                <Text style={web.loginLink}>Iniciá sesión aquí</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

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

            <View style={estilos.fotosContainer}>
              <Text style={estilos.labelFotos}>Fotos con tu mascota (hasta 6)</Text>
              <Text style={estilos.ayudaFotos}>
                Mostrá tus mejores momentos con tu perro. La primera foto va a ser tu foto principal.
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={estilos.fotosScroll}
              >
                {fotos.map((foto, index) => (
                  <View key={`${foto}-${index}`} style={estilos.fotoItem}>
                    <Image source={{ uri: foto }} style={estilos.foto} />
                    {index === 0 && (
                      <View style={estilos.fotoPrincipalBadge}>
                        <Text style={estilos.fotoPrincipalTxt}>Principal</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={estilos.fotoQuitar}
                      onPress={() => quitarFoto(index)}
                    >
                      <MaterialIcons name="close" size={16} color="#ffffff" />
                    </TouchableOpacity>
                    {index > 0 && (
                      <TouchableOpacity
                        style={estilos.fotoDestacar}
                        onPress={() => marcarFotoPrincipal(index)}
                      >
                        <MaterialIcons name="star" size={16} color="#ffffff" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                {fotos.length < MAX_FOTOS_PERFIL && (
                  <TouchableOpacity style={estilos.fotoAgregar} onPress={seleccionarFotos}>
                    <MaterialIcons
                      name="add-a-photo"
                      size={26}
                      color={temaApp.colors.primary}
                    />
                    <Text style={estilos.fotoAgregarTxt}>Agregar</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>

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

            <View style={estilos.campoContainer}>
              <MaterialIcons
                name="lock-outline"
                size={20}
                color={temaApp.colors.primary}
                style={estilos.iconoCampo}
              />
              <TextInput
                label="Confirmar contraseña"
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
              loading={cargando || subiendoFotos}
              disabled={cargando || subiendoFotos}
              style={estilos.botonRegistro}
            >
              {subiendoFotos
                ? 'Subiendo fotos...'
                : cargando
                  ? 'Creando cuenta...'
                  : 'Crear Cuenta'}
            </Button>
          </CardContent>
        </Card>

        <View style={estilos.contenedorLogin}>
          <Text style={estilos.textoLogin}>¿Ya tenés cuenta? </Text>
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
  fotosContainer: {
    marginBottom: espaciado.lg,
  },
  labelFotos: {
    fontSize: 14,
    fontWeight: '600',
    color: temaApp.colors.onSurface,
    marginBottom: 4,
  },
  ayudaFotos: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    marginBottom: espaciado.sm,
  },
  fotosScroll: {
    gap: espaciado.sm,
    paddingVertical: 4,
  },
  fotoItem: {
    width: 92,
    height: 92,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: temaApp.colors.surfaceVariant || '#EDEDED',
  },
  foto: {
    width: '100%',
    height: '100%',
  },
  fotoPrincipalBadge: {
    position: 'absolute',
    left: 4,
    bottom: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fotoPrincipalTxt: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  fotoQuitar: {
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
  fotoDestacar: {
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
  fotoAgregar: {
    width: 92,
    height: 92,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: temaApp.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: temaApp.colors.surface,
  },
  fotoAgregarTxt: {
    fontSize: 11,
    color: temaApp.colors.primary,
    fontWeight: '600',
    marginTop: 4,
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

/** Estilos exclusivos de la versión web (no afectan iOS/Android) */
const web = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8f9fa' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eef0f2',
    padding: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 3,
  },
  header: { alignItems: 'center', marginBottom: 28 },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: temaApp.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logoEmoji: { fontSize: 26 },
  titulo: {
    fontSize: 22,
    fontWeight: '800',
    color: temaApp.colors.primary,
    ...(fontDisplay ? { fontFamily: fontDisplay } : {}),
  },
  subtitulo: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  formTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 20,
    ...(fontDisplay ? { fontFamily: fontDisplay } : {}),
  },
  field: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  help: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  fotosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  fotoItem: {
    width: 86,
    height: 86,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    position: 'relative',
  },
  foto: {
    width: '100%',
    height: '100%',
  },
  fotoPrincipalBadge: {
    position: 'absolute',
    left: 4,
    bottom: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fotoPrincipalTxt: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  fotoQuitar: {
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
  fotoDestacar: {
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
  fotoAgregar: {
    width: 86,
    height: 86,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: temaApp.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  fotoAgregarTxt: {
    fontSize: 10,
    color: temaApp.colors.primary,
    fontWeight: '700',
    marginTop: 4,
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#f8fafc',
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
    outlineStyle: 'none',
    ...(fontSans ? { fontFamily: fontSans } : {}),
  } as any,
  inputEyeBtn: { padding: 4, marginLeft: 6 },
  button: {
    marginTop: 8,
    backgroundColor: temaApp.colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  loginTxt: { color: '#64748b', fontSize: 14, ...(fontSans ? { fontFamily: fontSans } : {}) },
  loginLink: { color: temaApp.colors.primary, fontSize: 14, fontWeight: '700', ...(fontSans ? { fontFamily: fontSans } : {}) },
});
