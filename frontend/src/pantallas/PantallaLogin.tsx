import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

import { temaApp, espaciado, sombras, MARCA } from '../constantes/tema';
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import { useAuth, Usuario } from '../contextos/ContextoAuth';
import { iniciarSesion as servicioIniciarSesion } from '../servicios/servicioAuth';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const { width } = Dimensions.get('window');
const MAX_WIDTH = 480;

const FEATURES = [
  { icon: 'event' as const, label: 'Eventos', desc: 'Actividades pet-friendly cerca tuyo' },
  { icon: 'favorite' as const, label: 'Matching', desc: 'Personas y mascotas compatibles' },
  { icon: 'chat' as const, label: 'Chat', desc: 'Coordina salidas en minutos' },
  { icon: 'map' as const, label: 'Mapa', desc: 'Descubri todo cerca en el mapa' },
  { icon: 'pets' as const, label: 'Mascotas', desc: 'Perfil completo de tu mascota' },
  { icon: 'person' as const, label: 'Perfil', desc: 'Tu cuenta y preferencias' },
];

const PASOS = [
  { num: '1', titulo: 'Registrate', desc: 'Crea tu cuenta y el perfil de tu mascota.' },
  { num: '2', titulo: 'Explora', desc: 'Eventos, matches y actividades cerca.' },
  { num: '3', titulo: 'Conecta', desc: 'Habla por chat y organiza salidas.' },
];

export default function PantallaLogin(): JSX.Element {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { iniciarSesion } = useAuth();

  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [cargando, setCargando] = useState(false);

  const manejarLogin = async () => {
    if (!email.trim() || !contraseña.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }
    setCargando(true);
    try {
      const resultado = await servicioIniciarSesion({
        email: email.trim(),
        password: contraseña,
      });
      if (resultado.success && resultado.data) {
        const ub = resultado.data.usuario;
        const token = resultado.data.token;
        const usuario: Usuario = {
          id: ub.id,
          nombre: ub.nombre.split(' ')[0] || ub.nombre,
          apellido: ub.nombre.split(' ').slice(1).join(' ') || '',
          email: ub.email,
          fechaNacimiento: '',
          genero: 'otro',
          ciudad: '',
          provincia: '',
          pais: '',
          deportesFavoritos: ub.intereses || [],
          nivelActividad: 'intermedio',
          disponibilidadSemanal: [],
          foto: ub.avatar || undefined,
          tipoUsuario: ub.tipoUsuario || undefined,
          onboardingCompletado: ub.onboardingCompletado || false,
        };
        await iniciarSesion(usuario, token);
        Alert.alert('¡Bienvenido!', `Hola ${usuario.nombre}!`, [{ text: 'Continuar' }]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Credenciales incorrectas');
    } finally {
      setCargando(false);
    }
  };

  const manejarLoginGoogle = async () => {
    setCargando(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert('¡Bienvenido!', 'Has iniciado sesión con Google', [{ text: 'Continuar' }]);
    } catch {
      Alert.alert('Error', 'No se pudo iniciar sesión con Google.');
    } finally {
      setCargando(false);
    }
  };

  const manejarRecuperarContraseña = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email primero');
      return;
    }
    Alert.alert('Recuperar Contraseña', `¿Enviar enlace de recuperación a ${email}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Enviar', onPress: () => Alert.alert('Email Enviado', 'Revisa tu bandeja de entrada') },
    ]);
  };

  const navegarARegistro = () => navigation.navigate('Registro');

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── HERO ── */}
        <View style={s.hero}>
          <View style={s.heroInner}>
            <MaterialIcons name="pets" size={52} color="#fff" />
            <Text style={s.heroTitle}>{MARCA.nombre}</Text>
            <Text style={s.heroSlogan}>{MARCA.slogan}</Text>
            <Text style={s.heroDesc}>
              La app gratis para encontrar eventos, personas y actividades pet-friendly cerca tuyo.
            </Text>
            <Button
              mode="contained"
              onPress={navegarARegistro}
              style={s.heroCta}
              labelStyle={s.heroCtaLabel}
              buttonColor="#fff"
              textColor="#6200ea"
            >
              Empezar gratis
            </Button>
          </View>
        </View>

        <View style={s.body}>
          {/* ── FEATURES ── */}
          <Text style={s.seccionTitulo}>Todo lo que necesitas</Text>
          <View style={s.featGrid}>
            {FEATURES.map((f) => (
              <View key={f.label} style={s.featCard}>
                <View style={s.featIconWrap}>
                  <MaterialIcons name={f.icon} size={26} color="#6200ea" />
                </View>
                <Text style={s.featLabel}>{f.label}</Text>
                <Text style={s.featDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>

          {/* ── PASOS ── */}
          <Text style={s.seccionTitulo}>Como funciona</Text>
          <View style={s.pasosRow}>
            {PASOS.map((p) => (
              <View key={p.num} style={s.pasoCard}>
                <View style={s.pasoNum}>
                  <Text style={s.pasoNumTxt}>{p.num}</Text>
                </View>
                <Text style={s.pasoTitulo}>{p.titulo}</Text>
                <Text style={s.pasoDesc}>{p.desc}</Text>
              </View>
            ))}
          </View>

          {/* ── INSTALAR ── */}
          <View style={s.instalarCard}>
            <MaterialIcons name="phone-android" size={28} color="#6200ea" style={{ marginBottom: 8 }} />
            <Text style={s.instalarTitulo}>Instalala en tu celular</Text>
            <Text style={s.instalarTexto}>
              <Text style={{ fontWeight: '700' }}>Android:</Text> menu de Chrome → Agregar a pantalla de inicio.
            </Text>
            <Text style={s.instalarTexto}>
              <Text style={{ fontWeight: '700' }}>iPhone:</Text> compartir en Safari → Agregar a inicio.
            </Text>
            <Text style={s.instalarMicro}>Sin App Store ni Play Store. Se instala como app.</Text>
          </View>

          {/* ── SEPARADOR ── */}
          <View style={s.separador}>
            <View style={s.separadorLinea} />
            <Text style={s.separadorTexto}>o inicia sesion</Text>
            <View style={s.separadorLinea} />
          </View>

          {/* ── LOGO CHICO ── */}
          <View style={s.logoChico}>
            <MaterialIcons name="pets" size={36} color="#6200ea" />
            <Text style={s.logoChicoNombre}>{MARCA.nombre}</Text>
          </View>

          {/* ── LOGIN ── */}
          <Card style={s.loginCard}>
            <Card.Content>
              <Text variant="titleLarge" style={s.loginTitulo}>Iniciar Sesion</Text>
              <Text variant="bodyMedium" style={s.loginSub}>Ingresa tus datos para continuar</Text>

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={s.input}
                left={<TextInput.Icon icon="email" />}
                disabled={cargando}
                outlineStyle={s.inputOutline}
              />

              <TextInput
                label="Contraseña"
                value={contraseña}
                onChangeText={setContraseña}
                mode="outlined"
                secureTextEntry={!mostrarContraseña}
                autoComplete="password"
                style={s.input}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={mostrarContraseña ? 'eye-off' : 'eye'}
                    onPress={() => setMostrarContraseña(!mostrarContraseña)}
                  />
                }
                disabled={cargando}
                outlineStyle={s.inputOutline}
              />

              <Button mode="text" onPress={manejarRecuperarContraseña} style={s.forgot} disabled={cargando}>
                ¿Olvidaste tu contraseña?
              </Button>

              <Button
                mode="contained"
                onPress={manejarLogin}
                style={s.loginBtn}
                contentStyle={s.loginBtnInner}
                disabled={cargando}
              >
                {cargando ? <ActivityIndicator color="#fff" /> : 'Iniciar Sesion'}
              </Button>

              <View style={s.dividerRow}>
                <Divider style={s.dividerLine} />
                <Text style={s.dividerTxt}>o continua con</Text>
                <Divider style={s.dividerLine} />
              </View>

              <Button
                mode="outlined"
                onPress={manejarLoginGoogle}
                style={s.googleBtn}
                contentStyle={s.loginBtnInner}
                icon="google"
                disabled={cargando}
              >
                Google
              </Button>
            </Card.Content>
          </Card>

          {/* ── REGISTRO ── */}
          <View style={s.registroRow}>
            <Text style={s.registroTxt}>¿No tenes cuenta? </Text>
            <Button mode="text" onPress={navegarARegistro} disabled={cargando} compact>
              Registrate
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scroll: {
    flexGrow: 1,
  },

  // Hero
  hero: {
    backgroundColor: '#6200ea',
    paddingTop: 56,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  heroInner: {
    alignItems: 'center',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginTop: 8,
  },
  heroSlogan: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  heroDesc: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
    maxWidth: 360,
  },
  heroCta: {
    marginTop: 20,
    borderRadius: 24,
    elevation: 0,
  },
  heroCtaLabel: {
    fontWeight: '700',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },

  // Body
  body: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
    maxWidth: MAX_WIDTH + 40,
    alignSelf: 'center',
    width: '100%',
  },

  seccionTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 14,
    textAlign: 'center',
  },

  // Features grid
  featGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  featCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  featIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f3edff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 3,
  },
  featDesc: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },

  // Pasos
  pasosRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  pasoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  pasoNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6200ea',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  pasoNumTxt: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  pasoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
    textAlign: 'center',
  },
  pasoDesc: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 15,
  },

  // Instalar
  instalarCard: {
    backgroundColor: '#f3edff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e0d4f5',
  },
  instalarTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 10,
  },
  instalarTexto: {
    fontSize: 13,
    color: '#4a4a68',
    marginBottom: 4,
    textAlign: 'center',
  },
  instalarMicro: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 6,
  },

  // Separador
  separador: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  separadorLinea: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  separadorTexto: {
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#9ca3af',
  },

  // Logo chico
  logoChico: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  logoChicoNombre: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6200ea',
  },

  // Login card
  loginCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  loginTitulo: {
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  loginSub: {
    color: '#6b7280',
    marginBottom: 20,
  },
  input: {
    marginBottom: 14,
    backgroundColor: '#fff',
  },
  inputOutline: {
    borderRadius: 12,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  loginBtn: {
    borderRadius: 12,
    marginBottom: 4,
  },
  loginBtnInner: {
    paddingVertical: 6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
  },
  dividerTxt: {
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#9ca3af',
  },
  googleBtn: {
    borderRadius: 12,
    borderColor: '#ddd',
  },

  // Registro
  registroRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  registroTxt: {
    color: '#6b7280',
    fontSize: 14,
  },
});
