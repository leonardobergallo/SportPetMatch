// Pantalla para que una persona se postule como paseador de mascotas.
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../contextos/ContextoAuth';
import { mostrarAlerta } from '../utilidades/alerta';
import { temaApp, espaciado, sombras } from '../constantes/tema';
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import {
  Paseador,
  enviarSolicitudPaseador,
  obtenerEstadoPerfilPaseador,
} from '../servicios/servicioPaseadores';

type Nav = StackNavigationProp<RootStackParamList, 'Paseadores'>;

const estadoTexto = (paseador: Paseador | null) => {
  if (!paseador) return 'Todavía no enviaste tu solicitud';
  if (paseador.estado === 'aprobado') return 'Perfil aprobado';
  if (paseador.estado === 'rechazado') return 'Solicitud rechazada';
  return 'Solicitud en revisión';
};

export default function PantallaPaseadores(): JSX.Element {
  const navigation = useNavigation<Nav>();
  const { estaAutenticado } = useAuth();
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [paseador, setPaseador] = useState<Paseador | null>(null);
  const [membresiaActiva, setMembresiaActiva] = useState(false);
  const [precioMembresia, setPrecioMembresia] = useState<number | null>(null);
  const [telefono, setTelefono] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [zona, setZona] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [precioHora, setPrecioHora] = useState('');
  const [disponibilidad, setDisponibilidad] = useState('');
  const [mensaje, setMensaje] = useState('');

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      const { paseador: actual, membresiaActiva: activa, precioMembresia: precio } =
        await obtenerEstadoPerfilPaseador();
      setPaseador(actual);
      setMembresiaActiva(activa);
      setPrecioMembresia(precio);
      if (actual) {
        setTelefono(actual.telefono || '');
        setCiudad(actual.ciudad || '');
        setZona(actual.zona || '');
        setExperiencia(actual.experiencia || '');
        setPrecioHora(actual.precioHora ? String(actual.precioHora) : '');
        setDisponibilidad(actual.disponibilidad || '');
        setMensaje(actual.mensaje || '');
      }
    } catch (error: any) {
      mostrarAlerta('Paseadores', error?.message || 'No se pudo cargar tu solicitud.');
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    if (!estaAutenticado) {
      navigation.navigate('Login');
      return;
    }
    cargar();
  }, [estaAutenticado, cargar, navigation]));

  const enviar = async () => {
    if (enviando) return;
    if (telefono.trim().length < 6) {
      mostrarAlerta('Falta un dato', 'Ingresá un teléfono de contacto.');
      return;
    }
    if (ciudad.trim().length < 2) {
      mostrarAlerta('Falta un dato', 'Ingresá tu ciudad.');
      return;
    }
    try {
      setEnviando(true);
      const resultado = await enviarSolicitudPaseador({
        telefono: telefono.trim(),
        ciudad: ciudad.trim(),
        zona: zona.trim(),
        experiencia: experiencia.trim(),
        precioHora: precioHora.trim(),
        disponibilidad: disponibilidad.trim(),
        mensaje: mensaje.trim(),
      });
      setPaseador(resultado.paseador);
      mostrarAlerta(
        resultado.paseador.estado === 'aprobado' ? 'Perfil actualizado' : 'Solicitud enviada',
        resultado.message || 'Te vamos a contactar cuando tu perfil esté revisado.'
      );
    } catch (error: any) {
      mostrarAlerta('No pudimos enviar la solicitud', error?.message || 'Probá de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color={temaApp.colors.primary} />
        <Text style={estilos.textoCargando}>Cargando tu solicitud...</Text>
      </View>
    );
  }

  const aprobado = paseador?.estado === 'aprobado';

  return (
    <ScrollView style={estilos.contenedor} contentContainerStyle={estilos.contenido}>
      <Card style={estilos.cardIntro}>
        <Card.Content>
          <View style={estilos.filaTitulo}>
            <View style={estilos.icono}>
              <MaterialIcons name="pets" size={28} color="#FFFFFF" />
            </View>
            <View style={estilos.textoTitulo}>
              <Text style={estilos.titulo}>Quiero ser paseador</Text>
              <Text style={estilos.subtitulo}>Sumate a la red de paseadores de Indio</Text>
            </View>
          </View>
          <Text style={estilos.descripcion}>
            Postulate gratis. Vos elegís dónde paseás, cuánto cobrás y cómo te paga el dueño.
            Indio revisa tu solicitud antes de habilitar el perfil.
          </Text>
          {precioMembresia !== null && (
            <Text style={estilos.descripcion}>
              Para aparecer en el catálogo y recibir nuevas solicitudes, necesitás la Membresía
              Indio. El primer mes es gratis si todavía no usaste la prueba. Después son
              {' '}ARS ${new Intl.NumberFormat('es-AR').format(precioMembresia)} por mes.
            </Text>
          )}
        </Card.Content>
      </Card>

      <Card style={estilos.cardEstado}>
        <Card.Content>
          <Text style={estilos.estadoLabel}>Estado de tu solicitud</Text>
          <Text style={[estilos.estadoValor, aprobado && estilos.estadoAprobado]}>
            {estadoTexto(paseador)}
          </Text>
          {paseador?.estado === 'rechazado' && paseador.motivoRechazo ? (
            <Text style={estilos.motivo}>Motivo: {paseador.motivoRechazo}</Text>
          ) : null}
          {aprobado && (
            <>
              <Text style={estilos.motivo}>
                {membresiaActiva
                  ? 'Tu perfil está visible. Consultá las solicitudes en Paseos → Soy paseador.'
                  : 'Activá o renová tu membresía para publicar tu perfil y recibir nuevas solicitudes.'}
              </Text>
              <Button mode="outlined" onPress={() => navigation.navigate('Suscripcion')} style={estilos.boton}>
                Mi suscripción
              </Button>
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={estilos.cardFormulario}>
        <Card.Content>
          <Text style={estilos.seccion}>Datos de contacto</Text>
          <TextInput
            label="Teléfono / WhatsApp *"
            value={telefono}
            onChangeText={setTelefono}
            mode="outlined"
            keyboardType="phone-pad"
            style={estilos.input}
          />
          <TextInput
            label="Ciudad *"
            value={ciudad}
            onChangeText={setCiudad}
            mode="outlined"
            style={estilos.input}
          />
          <TextInput
            label="Zona o barrios donde paseás"
            value={zona}
            onChangeText={setZona}
            mode="outlined"
            style={estilos.input}
          />

          <Text style={estilos.seccion}>Experiencia y disponibilidad</Text>
          <TextInput
            label="Contanos tu experiencia con mascotas"
            value={experiencia}
            onChangeText={setExperiencia}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={estilos.input}
          />
          <TextInput
            label="Precio por hora (ARS, opcional)"
            value={precioHora}
            onChangeText={setPrecioHora}
            mode="outlined"
            keyboardType="numeric"
            style={estilos.input}
          />
          <TextInput
            label="Disponibilidad (días y horarios)"
            value={disponibilidad}
            onChangeText={setDisponibilidad}
            mode="outlined"
            style={estilos.input}
          />
          <TextInput
            label="Mensaje adicional (opcional)"
            value={mensaje}
            onChangeText={setMensaje}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={estilos.input}
          />

          <Button
            mode="contained"
            onPress={enviar}
            loading={enviando}
            disabled={enviando}
            style={estilos.boton}
            contentStyle={estilos.botonContenido}
          >
            {aprobado ? 'Guardar perfil' : paseador ? 'Actualizar solicitud' : 'Enviar solicitud'}
          </Button>
          <Text style={estilos.aviso}>
            Al enviar, aceptás que Indio revise tus datos y te contacte por WhatsApp o email.
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: temaApp.colors.background },
  contenido: { padding: espaciado.md, paddingBottom: espaciado.xl },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: temaApp.colors.background,
    padding: espaciado.lg,
  },
  textoCargando: { marginTop: espaciado.sm, color: temaApp.colors.onSurfaceVariant },
  cardIntro: { borderRadius: 18, marginBottom: espaciado.md, ...sombras.media },
  filaTitulo: { flexDirection: 'row', alignItems: 'center', gap: espaciado.sm },
  icono: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: temaApp.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoTitulo: { flex: 1 },
  titulo: { fontSize: 22, fontWeight: '800', color: temaApp.colors.onSurface },
  subtitulo: { fontSize: 14, color: temaApp.colors.onSurfaceVariant, marginTop: 2 },
  descripcion: {
    marginTop: espaciado.md,
    color: temaApp.colors.onSurfaceVariant,
    lineHeight: 21,
    fontSize: 15,
  },
  cardEstado: { borderRadius: 16, marginBottom: espaciado.md, ...sombras.media },
  estadoLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: temaApp.colors.onSurfaceVariant,
  },
  estadoValor: {
    fontSize: 19,
    fontWeight: '800',
    color: temaApp.colors.primary,
    marginTop: 4,
  },
  estadoAprobado: { color: '#1B7F3A' },
  motivo: { marginTop: espaciado.sm, color: temaApp.colors.onSurfaceVariant, lineHeight: 20 },
  cardFormulario: { borderRadius: 18, ...sombras.media },
  seccion: {
    fontSize: 16,
    fontWeight: '800',
    color: temaApp.colors.onSurface,
    marginTop: espaciado.sm,
    marginBottom: espaciado.xs,
  },
  input: { marginBottom: espaciado.sm, backgroundColor: '#FFFFFF' },
  boton: { marginTop: espaciado.md, borderRadius: 12 },
  botonContenido: { paddingVertical: 6 },
  aviso: {
    marginTop: espaciado.sm,
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    lineHeight: 18,
  },
});
