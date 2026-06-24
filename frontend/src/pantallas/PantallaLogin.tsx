import React, { useEffect, useState, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ImageBackground,
  Pressable,
  TextInput as RNTextInput,
} from 'react-native';
import {
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

import { MARCA } from '../constantes/tema';
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import { useAuth, normalizarUsuario } from '../contextos/ContextoAuth';
import {
  iniciarSesion as servicioIniciarSesion,
  resetPassword,
  solicitarResetPassword,
} from '../servicios/servicioAuth';

type Nav = StackNavigationProp<RootStackParamList, 'Login'>;

/** Tipografía web (Plus Jakarta / Outfit cargadas en web/index.html) */
const fontSans = Platform.select({
  web: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
  default: undefined,
});
const fontDisplay = Platform.select({
  web: '"Outfit", "Plus Jakarta Sans", system-ui, sans-serif',
  default: undefined,
});

const IMGS = {
  golden: require('../../assets/golden-retriever-playing.png'),
  huskyWalk: require('../../assets/husky-running-mountain.jpg'),
  labradorPlay: require('../../assets/labrador-playing-tennis.jpg'),
};

const FEATURES = [
  { icon: 'event' as const, title: 'Eventos pet-friendly', desc: 'Actividades con tu mascota, por zona y tipo.' },
  { icon: 'favorite' as const, title: 'Matching', desc: 'Personas y mascotas compatibles cerca tuyo.' },
  { icon: 'chat' as const, title: 'Chat', desc: 'Coordiná salidas en segundos.' },
];

const GALLERY = [
  { img: IMGS.golden, caption: 'Tu mascota' },
  { img: IMGS.labradorPlay, caption: 'Eventos al aire libre' },
  { img: IMGS.huskyWalk, caption: 'Paseos compartidos' },
  { img: IMGS.golden, caption: 'En grupo' },
  { img: IMGS.labradorPlay, caption: 'Diversión' },
  { img: IMGS.huskyWalk, caption: 'Encuentros pet-friendly' },
];

export default function PantallaLogin(): JSX.Element {
  const navigation = useNavigation<Nav>();
  const { iniciarSesion } = useAuth();
  const loginRef = useRef<View>(null);
  const scrollRef = useRef<ScrollView>(null);

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPw, setNewPw] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const token = new URLSearchParams(window.location.search).get('resetToken');
    if (token) {
      setResetToken(token);
      setResetMode(true);
      setResetMessage('Ingresa tu nueva contrasena para recuperar el acceso.');
    }
  }, []);

  const scrollToExtraLogin = () => {
    loginRef.current?.measureLayout(
      scrollRef.current?.getInnerViewNode?.() as never,
      (_x: number, y: number) => scrollRef.current?.scrollTo({ y: Math.max(0, y - 24), animated: true }),
      () => {},
    );
  };

  const handleLogin = async () => {
    if (!email.trim() || !pw.trim()) { Alert.alert('Error', 'Completá correo y contraseña'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { Alert.alert('Error', 'Correo no válido'); return; }
    setLoading(true);
    try {
      const r = await servicioIniciarSesion({ email: email.trim(), password: pw });
      if (r.success && r.data) {
        const u = r.data.usuario;
        const usuario = normalizarUsuario({
          id: u.id,
          nombre: u.nombre,
          email: u.email, fechaNacimiento: '', genero: 'otro',
          intereses: u.intereses || [],
          avatar: u.avatar || null,
          esPremium: u.esPremium,
          tipoUsuario: u.tipoUsuario || null,
          onboardingCompletado: u.onboardingCompletado || false,
        });
        await iniciarSesion(usuario, r.data.token);
        Alert.alert('Bienvenido!', `Hola ${usuario.nombre}!`, [{ text: 'Continuar' }]);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Credenciales incorrectas');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try { await new Promise(r => setTimeout(r, 2000)); Alert.alert('Bienvenido!', 'Sesion con Google'); }
    catch { Alert.alert('Error', 'No se pudo iniciar con Google.'); }
    finally { setLoading(false); }
  };

  const handleSolicitarReset = async () => {
    const correo = email.trim();
    if (!correo) { Alert.alert('Error', 'Ingresa el email de tu cuenta'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) { Alert.alert('Error', 'Correo no valido'); return; }

    setLoading(true);
    setResetMessage('');
    try {
      const r = await solicitarResetPassword(correo);
      if (r.data?.resetToken) {
        setResetToken(r.data.resetToken);
        setResetMessage('Usuario validado. Ingresa una nueva contrasena.');
      } else {
        setResetMessage(r.message || 'Si el email existe, te enviamos un link de recuperacion.');
      }
    } catch (e: any) {
      Alert.alert('No pudimos validar el usuario', e.message || 'Revisa el email ingresado');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarReset = async () => {
    if (!resetToken) { Alert.alert('Error', 'Primero solicita un link de recuperacion'); return; }
    if (newPw.length < 6) { Alert.alert('Error', 'La nueva contrasena debe tener al menos 6 caracteres'); return; }

    setLoading(true);
    try {
      const r = await resetPassword(resetToken, newPw);
      Alert.alert('Listo', r.message || 'Contrasena actualizada');
      setResetMode(false);
      setResetToken('');
      setNewPw('');
      setPw('');
      setResetMessage('');
    } catch (e: any) {
      Alert.alert('No pudimos actualizar la contrasena', e.message || 'Solicita un link nuevo e intenta otra vez');
    } finally {
      setLoading(false);
    }
  };

  const goRegistro = () => navigation.navigate('Registro');

  return (
    <KeyboardAvoidingView style={st.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView ref={scrollRef} contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ═══════════════ HERO BANNER ═══════════════ */}
        <ImageBackground source={IMGS.golden} style={st.hero} imageStyle={st.heroImg}>
          <View style={st.heroOverlay}>
            <View style={st.heroContent}>
              <MaterialIcons name="pets" size={48} color="#fff" />
              <Text style={st.heroTitle}>{MARCA.nombre}</Text>
              <Text style={st.heroSlogan}>{MARCA.slogan}</Text>
              <Text style={st.heroDesc}>App gratis: eventos, matching y chat con tu mascota.</Text>

              <View style={st.heroForm}>
                <RNTextInput
                  style={st.heroInput}
                  placeholder="Correo o usuario"
                  placeholderTextColor="rgba(255,255,255,0.88)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!loading}
                />
                <RNTextInput
                  style={st.heroInput}
                  placeholder="Contraseña"
                  placeholderTextColor="rgba(255,255,255,0.88)"
                  value={pw}
                  onChangeText={setPw}
                  secureTextEntry
                  autoComplete="password"
                  editable={!loading}
                />
                <Pressable style={st.heroLoginBtn} onPress={handleLogin} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#6200ea" />
                  ) : (
                    <Text style={st.heroLoginBtnTxt}>Iniciar sesión</Text>
                  )}
                </Pressable>
                <Pressable
                  onPress={() => {
                    setResetMode(!resetMode);
                    setResetMessage('');
                  }}
                  style={st.heroLinkMore}
                  disabled={loading}
                >
                  <Text style={st.heroLinkMoreTxt}>
                    {resetMode ? 'Volver al inicio de sesion' : 'Olvide mi contrasena'}
                  </Text>
                </Pressable>
                {resetMode && (
                  <View style={st.resetBox}>
                    {resetToken ? (
                      <>
                        <RNTextInput
                          style={st.heroInput}
                          placeholder="Nueva contrasena"
                          placeholderTextColor="rgba(255,255,255,0.88)"
                          value={newPw}
                          onChangeText={setNewPw}
                          secureTextEntry
                          autoComplete="new-password"
                          editable={!loading}
                        />
                        <Pressable style={st.heroLoginBtn} onPress={handleConfirmarReset} disabled={loading}>
                          {loading ? <ActivityIndicator color="#6200ea" /> : <Text style={st.heroLoginBtnTxt}>Guardar contrasena</Text>}
                        </Pressable>
                      </>
                    ) : (
                      <Pressable style={st.heroLoginBtn} onPress={handleSolicitarReset} disabled={loading}>
                        {loading ? <ActivityIndicator color="#6200ea" /> : <Text style={st.heroLoginBtnTxt}>Validar usuario</Text>}
                      </Pressable>
                    )}
                    {!!resetMessage && <Text style={st.resetInfo}>{resetMessage}</Text>}
                  </View>
                )}
                <Pressable style={st.heroCtaSecondary} onPress={goRegistro}>
                  <Text style={st.heroCtaSecondaryTxt}>Crear cuenta gratis</Text>
                </Pressable>
                <Pressable onPress={scrollToExtraLogin} style={st.heroLinkMore}>
                  <Text style={st.heroLinkMoreTxt}>Google y más opciones ↓</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* ═══════════════ FEATURES ═══════════════ */}
        <View style={st.section}>
          <Text style={st.sectionTag}>FUNCIONALIDADES</Text>
          <Text style={st.sectionTitle}>Todo en un solo lugar</Text>

          {FEATURES.map((f, i) => (
            <View key={f.title} style={[st.featureRow, i % 2 === 1 && st.featureRowReverse]}>
              <View style={st.featureIcon}>
                <MaterialIcons name={f.icon} size={32} color="#6200ea" />
              </View>
              <View style={st.featureText}>
                <Text style={st.featureTitle}>{f.title}</Text>
                <Text style={st.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ═══════════════ GALERIA ═══════════════ */}
        <View style={st.gallerySection}>
          <Text style={st.sectionTagOnDark}>GALERÍA</Text>
          <Text style={st.sectionTitleOnDark}>Con Indio</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.galleryScroll}>
            {GALLERY.map((g) => (
              <View key={g.caption} style={st.galleryCard}>
                <Image source={g.img} style={st.galleryImg} />
                <View style={st.galleryCaptionWrap}>
                  <Text style={st.galleryCaption}>{g.caption}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ═══════════════ COMO FUNCIONA ═══════════════ */}
        <View style={st.section}>
          <Text style={st.sectionTag}>3 PASOS</Text>
          <Text style={st.sectionTitle}>Empezá en minutos</Text>

          <View style={st.stepsRow}>
            {[
              { n: '1', t: 'Perfil', d: 'Alta gratis y tu mascota.', icon: 'person-add' as const },
              { n: '2', t: 'Explorá', d: 'Eventos y matches cerca.', icon: 'explore' as const },
              { n: '3', t: 'Chateá', d: 'Salidas y encuentros.', icon: 'chat' as const },
            ].map((s) => (
              <View key={s.n} style={st.stepCard}>
                <View style={st.stepNum}><Text style={st.stepNumTxt}>{s.n}</Text></View>
                <MaterialIcons name={s.icon} size={28} color="#6200ea" style={{ marginBottom: 6 }} />
                <Text style={st.stepTitle}>{s.t}</Text>
                <Text style={st.stepDesc}>{s.d}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ═══════════════ BANNER INTERMEDIO ═══════════════ */}
        <ImageBackground source={IMGS.huskyWalk} style={st.midBanner} imageStyle={st.midBannerImg}>
          <View style={st.midBannerOverlay}>
            <Text style={st.midBannerTitle}>Más encuentros para tu mascota.{'\n'}Comunidad para vos.</Text>
            <Pressable style={st.heroCtaPrimary} onPress={goRegistro}>
              <Text style={st.heroCtaPrimaryTxt}>Crear cuenta gratis</Text>
            </Pressable>
          </View>
        </ImageBackground>

        {/* ═══════════════ INSTALAR ═══════════════ */}
        <View style={st.section}>
          <Text style={st.sectionTag}>INSTALACIÓN</Text>
          <Text style={st.sectionTitle}>En el celular (PWA)</Text>

          <View style={st.installRow}>
            <View style={st.installCard}>
              <MaterialIcons name="phone-android" size={32} color="#6200ea" />
              <Text style={st.installTitle}>Android</Text>
              <Text style={st.installDesc}>Chrome → menú → Agregar a pantalla de inicio.</Text>
            </View>
            <View style={st.installCard}>
              <MaterialIcons name="phone-iphone" size={32} color="#6200ea" />
              <Text style={st.installTitle}>iPhone</Text>
              <Text style={st.installDesc}>Safari → compartir → Agregar a inicio.</Text>
            </View>
          </View>
          <Text style={st.installMicro}>Icono en escritorio, pantalla completa.</Text>
        </View>

        {/* ═══════════════ ACCESO EXTRA (SIN DUPLICAR LOGIN) ═══════════════ */}
        <View ref={loginRef} style={st.extraSection}>
          <View style={st.extraCard}>
            <Text style={st.extraTitle}>Más opciones de acceso</Text>
            <Text style={st.extraSub}>Si prefieres, también puedes continuar con Google o crear una cuenta nueva.</Text>

            <Pressable style={st.extraGoogleBtn} onPress={handleGoogle} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={st.extraGoogleTxt}>Continuar con Google</Text>}
            </Pressable>

            <Pressable style={st.extraRegisterBtn} onPress={goRegistro} disabled={loading}>
              <Text style={st.extraRegisterTxt}>Crear cuenta gratis</Text>
            </Pressable>
          </View>
        </View>

        {/* ═══════════════ FOOTER ═══════════════ */}
        <View style={st.footer}>
          <MaterialIcons name="pets" size={20} color="rgba(255,255,255,0.6)" />
          <Text style={st.footerTxt}>{MARCA.nombre} · {MARCA.slogan}</Text>
          <Text style={st.footerSub}>App social para personas con mascotas, matches y eventos pet-friendly.</Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8f9fa' },
  scroll: { flexGrow: 1 },

  // Hero
  hero: { width: '100%', minHeight: 440 },
  heroImg: { resizeMode: 'cover' },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.84)', justifyContent: 'center', paddingVertical: 64 },
  heroContent: { alignItems: 'center', paddingHorizontal: 24, maxWidth: 560, alignSelf: 'center', width: '100%' },
  heroTitle: {
    fontSize: 58,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 10,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    ...(fontDisplay ? { fontFamily: fontDisplay } : {}),
  },
  heroSlogan: {
    fontSize: 24,
    color: '#f8fafc',
    marginTop: 4,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  heroDesc: {
    fontSize: 22,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 28,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  heroForm: {
    width: '100%',
    maxWidth: 460,
    marginTop: 24,
    gap: 12,
    backgroundColor: 'rgba(2,6,23,0.58)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    padding: 14,
  },
  heroInput: {
    backgroundColor: 'rgba(15,23,42,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === 'web' ? 15 : 16,
    fontSize: 21,
    color: '#fff',
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  heroLoginBtn: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  heroLoginBtnTxt: { color: '#6200ea', fontWeight: '800', fontSize: 20, ...(fontSans ? { fontFamily: fontSans } : {}) },
  heroCtaSecondary: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  heroCtaSecondaryTxt: { color: '#fff', fontWeight: '700', fontSize: 20, ...(fontSans ? { fontFamily: fontSans } : {}) },
  heroLinkMore: { paddingVertical: 8, alignItems: 'center' },
  heroLinkMoreTxt: { color: 'rgba(255,255,255,0.96)', fontSize: 18, fontWeight: '700', ...(fontSans ? { fontFamily: fontSans } : {}) },
  resetBox: {
    gap: 10,
    paddingTop: 4,
  },
  resetInfo: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },

  // Sections
  section: { paddingHorizontal: 20, paddingVertical: 36, maxWidth: 600, alignSelf: 'center', width: '100%' },
  sectionTag: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5b21b6',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 6,
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 30,
    ...(fontDisplay ? { fontFamily: fontDisplay } : {}),
  },
  sectionTagOnDark: {
    fontSize: 13,
    fontWeight: '800',
    color: '#e9d5ff',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 6,
    ...(fontSans ? { fontFamily: fontSans } : {}),
  },
  sectionTitleOnDark: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 30,
    ...(fontDisplay ? { fontFamily: fontDisplay } : {}),
  },

  // Features
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 16 },
  featureRowReverse: { flexDirection: 'row-reverse' },
  featureIcon: { width: 64, height: 64, borderRadius: 18, backgroundColor: '#f3edff', justifyContent: 'center', alignItems: 'center' },
  featureText: { flex: 1 },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
    ...(fontDisplay ? { fontFamily: fontDisplay } : {}),
  },
  featureDesc: { fontSize: 17, color: '#334155', lineHeight: 24, ...(fontSans ? { fontFamily: fontSans } : {}) },

  // Gallery
  gallerySection: { backgroundColor: '#1a1a2e', paddingVertical: 36 },
  galleryScroll: { paddingHorizontal: 20, gap: 14 },
  galleryCard: { width: 220, borderRadius: 16, overflow: 'hidden', backgroundColor: '#2a2a4e' },
  galleryImg: { width: 220, height: 150, resizeMode: 'cover' },
  galleryCaptionWrap: { backgroundColor: 'rgba(15,23,42,0.92)', paddingVertical: 10, paddingHorizontal: 12 },
  galleryCaption: { color: '#ffffff', fontSize: 16, fontWeight: '700', lineHeight: 22, ...(fontSans ? { fontFamily: fontSans } : {}) },

  // Steps
  stepsRow: { flexDirection: 'row', gap: 12 },
  stepCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, borderWidth: 1, borderColor: '#f0f0f0' },
  stepNum: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6200ea', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  stepNumTxt: { color: '#fff', fontWeight: '900', fontSize: 17, ...(fontDisplay ? { fontFamily: fontDisplay } : {}) },
  stepTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 4, textAlign: 'center', ...(fontDisplay ? { fontFamily: fontDisplay } : {}) },
  stepDesc: { fontSize: 14, color: '#475569', textAlign: 'center', lineHeight: 20, ...(fontSans ? { fontFamily: fontSans } : {}) },

  // Mid banner
  midBanner: { width: '100%', minHeight: 280 },
  midBannerImg: { resizeMode: 'cover' },
  midBannerOverlay: { flex: 1, backgroundColor: 'rgba(98,0,234,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  midBannerTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    ...(fontDisplay ? { fontFamily: fontDisplay } : {}),
  },

  // Install
  installRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  installCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, borderWidth: 1, borderColor: '#f0f0f0' },
  installTitle: { fontSize: 19, fontWeight: '700', color: '#0f172a', marginTop: 8, marginBottom: 6, ...(fontDisplay ? { fontFamily: fontDisplay } : {}) },
  installDesc: { fontSize: 16, color: '#334155', textAlign: 'center', lineHeight: 23, ...(fontSans ? { fontFamily: fontSans } : {}) },
  installMicro: { fontSize: 15, color: '#475569', textAlign: 'center', ...(fontSans ? { fontFamily: fontSans } : {}) },

  // Extra access
  extraSection: { backgroundColor: '#f0ecf8', paddingVertical: 30, paddingHorizontal: 20 },
  extraCard: { maxWidth: 520, alignSelf: 'center', width: '100%', backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#ddd', padding: 20 },
  extraTitle: { fontSize: 28, fontWeight: '800', color: '#0f172a', textAlign: 'center', ...(fontDisplay ? { fontFamily: fontDisplay } : {}) },
  extraSub: { fontSize: 17, color: '#334155', textAlign: 'center', marginTop: 8, marginBottom: 16, ...(fontSans ? { fontFamily: fontSans } : {}) },
  extraGoogleBtn: { backgroundColor: '#6200ea', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  extraGoogleTxt: { color: '#fff', fontSize: 18, fontWeight: '700', ...(fontSans ? { fontFamily: fontSans } : {}) },
  extraRegisterBtn: { borderWidth: 1, borderColor: '#6200ea', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  extraRegisterTxt: { color: '#6200ea', fontSize: 18, fontWeight: '700', ...(fontSans ? { fontFamily: fontSans } : {}) },

  // Footer
  footer: { backgroundColor: '#1a1a2e', paddingVertical: 28, paddingHorizontal: 20, alignItems: 'center' },
  footerTxt: { color: '#f1f5f9', fontSize: 17, fontWeight: '700', marginTop: 6, ...(fontDisplay ? { fontFamily: fontDisplay } : {}) },
  footerSub: { color: '#cbd5e1', fontSize: 15, marginTop: 4, ...(fontSans ? { fontFamily: fontSans } : {}) },
});
