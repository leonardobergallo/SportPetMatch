import React, { useState, useRef } from 'react';
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
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

import { MARCA } from '../constantes/tema';
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import { useAuth, Usuario } from '../contextos/ContextoAuth';
import { iniciarSesion as servicioIniciarSesion } from '../servicios/servicioAuth';

type Nav = StackNavigationProp<RootStackParamList, 'Login'>;

const IMGS = {
  golden: require('../../assets/golden-retriever-playing.png'),
  husky: require('../../assets/husky-running-mountain.jpg'),
  soccer: require('../../assets/soccer-tournament-park.jpg'),
  running: require('../../assets/5k-running-race-beach.jpg'),
  tennis: require('../../assets/tennis-group-game.jpg'),
  labrador: require('../../assets/labrador-playing-tennis.jpg'),
};

const FEATURES = [
  { icon: 'event' as const, title: 'Eventos Pet-Friendly', desc: 'Crea y participa en actividades deportivas con tu mascota. Filtros por tipo, ubicacion y nivel.' },
  { icon: 'favorite' as const, title: 'Matching Inteligente', desc: 'Encontra personas y mascotas compatibles por intereses, ubicacion y estilo de vida.' },
  { icon: 'chat' as const, title: 'Chat Integrado', desc: 'Coordina salidas, planifica encuentros y organizate en minutos con tus matches.' },
  { icon: 'map' as const, title: 'Mapa Interactivo', desc: 'Descubri eventos, usuarios y actividades cerca tuyo con geolocalizacion en tiempo real.' },
];

const GALLERY = [
  { img: IMGS.golden, caption: 'Perfil completo de tu mascota' },
  { img: IMGS.soccer, caption: 'Eventos deportivos pet-friendly' },
  { img: IMGS.husky, caption: 'Actividades al aire libre' },
  { img: IMGS.tennis, caption: 'Deportes en grupo' },
  { img: IMGS.labrador, caption: 'Diversion para todos' },
  { img: IMGS.running, caption: 'Carreras y caminatas' },
];

export default function PantallaLogin(): JSX.Element {
  const navigation = useNavigation<Nav>();
  const { iniciarSesion } = useAuth();
  const loginRef = useRef<View>(null);
  const scrollRef = useRef<ScrollView>(null);

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const scrollToLogin = () => {
    loginRef.current?.measureLayout(
      scrollRef.current?.getInnerViewNode?.() as any,
      (_x: number, y: number) => scrollRef.current?.scrollTo({ y: y - 20, animated: true }),
      () => {},
    );
  };

  const handleLogin = async () => {
    if (!email.trim() || !pw.trim()) { Alert.alert('Error', 'Completa todos los campos'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { Alert.alert('Error', 'Email invalido'); return; }
    setLoading(true);
    try {
      const r = await servicioIniciarSesion({ email: email.trim(), password: pw });
      if (r.success && r.data) {
        const u = r.data.usuario;
        const usuario: Usuario = {
          id: u.id,
          nombre: u.nombre.split(' ')[0] || u.nombre,
          apellido: u.nombre.split(' ').slice(1).join(' ') || '',
          email: u.email, fechaNacimiento: '', genero: 'otro',
          ciudad: '', provincia: '', pais: '',
          deportesFavoritos: u.intereses || [], nivelActividad: 'intermedio',
          disponibilidadSemanal: [], foto: u.avatar || undefined,
          tipoUsuario: u.tipoUsuario || undefined,
          onboardingCompletado: u.onboardingCompletado || false,
        };
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
              <Text style={st.heroDesc}>
                La app gratis que conecta personas y mascotas{'\n'}en eventos, salidas y actividades pet-friendly.
              </Text>
              <View style={st.heroBtns}>
                <Pressable style={st.heroCtaPrimary} onPress={goRegistro}>
                  <Text style={st.heroCtaPrimaryTxt}>Empezar gratis</Text>
                </Pressable>
                <Pressable style={st.heroCtaSecondary} onPress={scrollToLogin}>
                  <Text style={st.heroCtaSecondaryTxt}>Ya tengo cuenta</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* ═══════════════ FEATURES ═══════════════ */}
        <View style={st.section}>
          <Text style={st.sectionTag}>FUNCIONALIDADES</Text>
          <Text style={st.sectionTitle}>Todo lo que necesitas en un solo lugar</Text>

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
          <Text style={st.sectionTagOnDark}>GALERIA</Text>
          <Text style={st.sectionTitleOnDark}>Asi se vive con Indio</Text>

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
          <Text style={st.sectionTitle}>Empeza en minutos</Text>

          <View style={st.stepsRow}>
            {[
              { n: '1', t: 'Registrate', d: 'Crea tu cuenta gratis y agrega el perfil de tu mascota.', icon: 'person-add' as const },
              { n: '2', t: 'Explora', d: 'Descubri eventos, matches y actividades cerca tuyo.', icon: 'explore' as const },
              { n: '3', t: 'Conecta', d: 'Habla por chat, organiza salidas y disfruten juntos.', icon: 'chat' as const },
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
        <ImageBackground source={IMGS.husky} style={st.midBanner} imageStyle={st.midBannerImg}>
          <View style={st.midBannerOverlay}>
            <Text style={st.midBannerTitle}>Tu mascota necesita mas actividad.{'\n'}Vos necesitas una comunidad.</Text>
            <Pressable style={st.heroCtaPrimary} onPress={goRegistro}>
              <Text style={st.heroCtaPrimaryTxt}>Crear cuenta gratis</Text>
            </Pressable>
          </View>
        </ImageBackground>

        {/* ═══════════════ INSTALAR ═══════════════ */}
        <View style={st.section}>
          <Text style={st.sectionTag}>INSTALACION</Text>
          <Text style={st.sectionTitle}>Llevala en tu celular sin tiendas</Text>

          <View style={st.installRow}>
            <View style={st.installCard}>
              <MaterialIcons name="phone-android" size={32} color="#6200ea" />
              <Text style={st.installTitle}>Android</Text>
              <Text style={st.installDesc}>Abre en Chrome, toca menu (tres puntos) y elige "Agregar a pantalla de inicio".</Text>
            </View>
            <View style={st.installCard}>
              <MaterialIcons name="phone-iphone" size={32} color="#6200ea" />
              <Text style={st.installTitle}>iPhone</Text>
              <Text style={st.installDesc}>Abre en Safari, toca compartir y elige "Agregar a inicio".</Text>
            </View>
          </View>
          <Text style={st.installMicro}>Se instala como app nativa, con icono y pantalla completa. Sin App Store ni Play Store.</Text>
        </View>

        {/* ═══════════════ LOGIN ═══════════════ */}
        <View ref={loginRef} style={st.loginSection}>
          <View style={st.loginInner}>
            <View style={st.loginLogo}>
              <MaterialIcons name="pets" size={36} color="#6200ea" />
              <Text style={st.loginLogoTxt}>{MARCA.nombre}</Text>
            </View>

            <Card style={st.loginCard}>
              <Card.Content>
                <Text style={st.loginTitle}>Iniciar Sesion</Text>
                <Text style={st.loginSub}>Ingresa tus datos para continuar</Text>

                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  style={st.input}
                  left={<TextInput.Icon icon="email" />}
                  disabled={loading}
                  outlineStyle={st.inputOutline}
                  textColor="#0f172a"
                  activeOutlineColor="#6200ea"
                  outlineColor="#64748b"
                  placeholderTextColor="#64748b"
                  theme={{ colors: { onSurfaceVariant: '#334155', onSurface: '#0f172a' } }}
                />

                <TextInput
                  label="Contraseña"
                  value={pw}
                  onChangeText={setPw}
                  mode="outlined"
                  secureTextEntry={!showPw}
                  autoComplete="password"
                  style={st.input}
                  left={<TextInput.Icon icon="lock" />}
                  right={<TextInput.Icon icon={showPw ? 'eye-off' : 'eye'} onPress={() => setShowPw(!showPw)} />}
                  disabled={loading}
                  outlineStyle={st.inputOutline}
                  textColor="#0f172a"
                  activeOutlineColor="#6200ea"
                  outlineColor="#64748b"
                  placeholderTextColor="#64748b"
                  theme={{ colors: { onSurfaceVariant: '#334155', onSurface: '#0f172a' } }}
                />

                <Button mode="text" onPress={() => {
                  if (!email.trim()) { Alert.alert('Error', 'Ingresa tu email primero'); return; }
                  Alert.alert('Recuperar', `Enviar enlace a ${email}?`, [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Enviar', onPress: () => Alert.alert('Listo', 'Revisa tu email') },
                  ]);
                }} style={st.forgot} disabled={loading}>¿Olvidaste tu contraseña?</Button>

                <Button mode="contained" onPress={handleLogin} style={st.loginBtn}
                  contentStyle={st.loginBtnInner} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : 'Iniciar Sesion'}
                </Button>

                <View style={st.dividerRow}>
                  <Divider style={st.dividerLine} />
                  <Text style={st.dividerTxt}>o continua con</Text>
                  <Divider style={st.dividerLine} />
                </View>

                <Button mode="outlined" onPress={handleGoogle} style={st.googleBtn}
                  contentStyle={st.loginBtnInner} icon="google" disabled={loading}>Google</Button>
              </Card.Content>
            </Card>

            <View style={st.regRow}>
              <Text style={st.regTxt}>¿No tenes cuenta? </Text>
              <Button mode="text" onPress={goRegistro} disabled={loading} compact>Registrate</Button>
            </View>
          </View>
        </View>

        {/* ═══════════════ FOOTER ═══════════════ */}
        <View style={st.footer}>
          <MaterialIcons name="pets" size={20} color="rgba(255,255,255,0.6)" />
          <Text style={st.footerTxt}>{MARCA.nombre} · {MARCA.slogan}</Text>
          <Text style={st.footerSub}>App social para personas y mascotas activas.</Text>
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
  heroOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.78)', justifyContent: 'center', paddingVertical: 60 },
  heroContent: { alignItems: 'center', paddingHorizontal: 24, maxWidth: 560, alignSelf: 'center', width: '100%' },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 8,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroSlogan: {
    fontSize: 17,
    color: '#f8fafc',
    marginTop: 2,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  heroDesc: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 24,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  heroBtns: { flexDirection: 'row', gap: 12, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' },
  heroCtaPrimary: { backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 28 },
  heroCtaPrimaryTxt: { color: '#6200ea', fontWeight: '800', fontSize: 15 },
  heroCtaSecondary: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 28 },
  heroCtaSecondaryTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Sections
  section: { paddingHorizontal: 20, paddingVertical: 36, maxWidth: 600, alignSelf: 'center', width: '100%' },
  sectionTag: { fontSize: 11, fontWeight: '800', color: '#5b21b6', letterSpacing: 2, textAlign: 'center', marginBottom: 6 },
  sectionTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: 24, lineHeight: 30 },
  sectionTagOnDark: { fontSize: 11, fontWeight: '800', color: '#e9d5ff', letterSpacing: 2, textAlign: 'center', marginBottom: 6 },
  sectionTitleOnDark: { fontSize: 24, fontWeight: '800', color: '#ffffff', textAlign: 'center', marginBottom: 24, lineHeight: 30 },

  // Features
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 16 },
  featureRowReverse: { flexDirection: 'row-reverse' },
  featureIcon: { width: 64, height: 64, borderRadius: 18, backgroundColor: '#f3edff', justifyContent: 'center', alignItems: 'center' },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  featureDesc: { fontSize: 14, color: '#334155', lineHeight: 21 },

  // Gallery
  gallerySection: { backgroundColor: '#1a1a2e', paddingVertical: 36 },
  galleryScroll: { paddingHorizontal: 20, gap: 14 },
  galleryCard: { width: 220, borderRadius: 16, overflow: 'hidden', backgroundColor: '#2a2a4e' },
  galleryImg: { width: 220, height: 150, resizeMode: 'cover' },
  galleryCaptionWrap: { backgroundColor: 'rgba(15,23,42,0.92)', paddingVertical: 10, paddingHorizontal: 12 },
  galleryCaption: { color: '#ffffff', fontSize: 14, fontWeight: '700', lineHeight: 20 },

  // Steps
  stepsRow: { flexDirection: 'row', gap: 12 },
  stepCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, borderWidth: 1, borderColor: '#f0f0f0' },
  stepNum: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#6200ea', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  stepNumTxt: { color: '#fff', fontWeight: '900', fontSize: 15 },
  stepTitle: { fontSize: 14, fontWeight: '800', color: '#0f172a', marginBottom: 4, textAlign: 'center' },
  stepDesc: { fontSize: 12, color: '#475569', textAlign: 'center', lineHeight: 17 },

  // Mid banner
  midBanner: { width: '100%', minHeight: 280 },
  midBannerImg: { resizeMode: 'cover' },
  midBannerOverlay: { flex: 1, backgroundColor: 'rgba(98,0,234,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  midBannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Install
  installRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  installCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, borderWidth: 1, borderColor: '#f0f0f0' },
  installTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginTop: 8, marginBottom: 6 },
  installDesc: { fontSize: 13, color: '#334155', textAlign: 'center', lineHeight: 19 },
  installMicro: { fontSize: 13, color: '#475569', textAlign: 'center' },

  // Login
  loginSection: { backgroundColor: '#f0ecf8', paddingVertical: 36, paddingHorizontal: 20 },
  loginInner: { maxWidth: 420, alignSelf: 'center', width: '100%' },
  loginLogo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 18 },
  loginLogoTxt: { fontSize: 24, fontWeight: '900', color: '#4c1d95' },
  loginCard: { borderRadius: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, backgroundColor: '#fff' },
  loginTitle: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  loginSub: { fontSize: 15, color: '#334155', marginBottom: 20 },
  input: { marginBottom: 14, backgroundColor: '#fff' },
  inputOutline: { borderRadius: 12 },
  forgot: { alignSelf: 'flex-end', marginBottom: 8 },
  loginBtn: { borderRadius: 12, marginBottom: 4 },
  loginBtnInner: { paddingVertical: 6 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1 },
  dividerTxt: { paddingHorizontal: 12, fontSize: 13, color: '#475569' },
  googleBtn: { borderRadius: 12, borderColor: '#ddd' },
  regRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 14, marginBottom: 8 },
  regTxt: { color: '#334155', fontSize: 15 },

  // Footer
  footer: { backgroundColor: '#1a1a2e', paddingVertical: 28, paddingHorizontal: 20, alignItems: 'center' },
  footerTxt: { color: '#f1f5f9', fontSize: 15, fontWeight: '700', marginTop: 6 },
  footerSub: { color: '#cbd5e1', fontSize: 13, marginTop: 4 },
});
