// Pantalla para que una persona se postule como paseador de mascotas.
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Card, Chip, Text, TextInput } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../contextos/ContextoAuth';
import { mostrarAlerta } from '../utilidades/alerta';
import { temaApp, espaciado, sombras } from '../constantes/tema';
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import SelectorCampo from '../componentes/SelectorCampo';
import {
  Paseador,
  enviarSolicitudPaseador,
  obtenerEstadoPerfilPaseador,
} from '../servicios/servicioPaseadores';

type Nav = StackNavigationProp<RootStackParamList, 'Paseadores'>;

const CIUDADES = [
  { valor: 'Santa Fe', etiqueta: 'Santa Fe' },
  { valor: 'Paraná', etiqueta: 'Paraná' },
  { valor: 'Rosario', etiqueta: 'Rosario' },
  { valor: '__otra__', etiqueta: 'Otra ciudad…' },
];

const ZONAS_POR_CIUDAD: Record<string, string[]> = {
  'Santa Fe': [
    'Centro',
    'Candioti',
    'Costanera',
    'Barranquitas',
    'Guadalupe',
    'Parque Sur',
    'Universidad',
    'Siete Jefes',
    'Norte',
  ],
  Paraná: ['Centro', 'Villa Urquiza', 'Parque Urquiza', 'Bajada Grande', 'Barrio Norte'],
  Rosario: ['Centro', 'Pichincha', 'Palermo', 'Abasto', 'Fischerton'],
};

const ZONAS_GENERICAS = ['Centro', 'Zona Norte', 'Zona Sur', 'Zona Este', 'Zona Oeste'];

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const FRANJAS_HORARIAS = ['Mañana (8-12 hs)', 'Tarde (12-18 hs)', 'Noche (18-22 hs)'];
const PRECIOS_HORA = ['2500', '3000', '3500', '4000', '4500', '5000', '6000', '7000', '8000'];

const precioEtiqueta = (valor: string) =>
  `$${new Intl.NumberFormat('es-AR').format(Number(valor))}`;

function parsearZonas(valor: string, ciudad: string) {
  const conocidas = ZONAS_POR_CIUDAD[ciudad] || ZONAS_GENERICAS;
  const partes = valor.split(',').map((parte) => parte.trim()).filter(Boolean);
  const seleccionadas: string[] = [];
  const extras: string[] = [];

  partes.forEach((parte) => {
    const coincidencia = conocidas.find((zona) => zona.toLowerCase() === parte.toLowerCase());
    if (coincidencia) {
      if (!seleccionadas.includes(coincidencia)) seleccionadas.push(coincidencia);
    } else {
      extras.push(parte);
    }
  });

  return { seleccionadas, extra: extras.join(', ') };
}

function parsearDisponibilidad(valor: string) {
  const partes = valor
    .split('·')
    .flatMap((bloque) => bloque.split(','))
    .map((parte) => parte.trim())
    .filter(Boolean);
  const dias: string[] = [];
  const franjas: string[] = [];
  const detalle: string[] = [];

  partes.forEach((parte) => {
    if (DIAS_SEMANA.includes(parte)) {
      if (!dias.includes(parte)) dias.push(parte);
    } else if (FRANJAS_HORARIAS.includes(parte)) {
      if (!franjas.includes(parte)) franjas.push(parte);
    } else {
      detalle.push(parte);
    }
  });

  return { dias, franjas, detalle: detalle.join(' · ') };
}

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
  const [ciudadOtra, setCiudadOtra] = useState(false);
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState<string[]>([]);
  const [zonaExtra, setZonaExtra] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [precioHora, setPrecioHora] = useState('');
  const [precioPersonalizado, setPrecioPersonalizado] = useState(false);
  const [diasDisponibles, setDiasDisponibles] = useState<string[]>([]);
  const [franjasDisponibles, setFranjasDisponibles] = useState<string[]>([]);
  const [detalleDisponibilidad, setDetalleDisponibilidad] = useState('');
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
        setCiudadOtra(Boolean(actual.ciudad) && !CIUDADES.some((opcion) => opcion.valor === actual.ciudad));

        const zonas = parsearZonas(actual.zona || '', actual.ciudad || '');
        setZonasSeleccionadas(zonas.seleccionadas);
        setZonaExtra(zonas.extra);

        setExperiencia(actual.experiencia || '');

        const precio = actual.precioHora ? String(actual.precioHora) : '';
        setPrecioHora(precio);
        setPrecioPersonalizado(Boolean(precio) && !PRECIOS_HORA.includes(precio));

        const disponibilidad = parsearDisponibilidad(actual.disponibilidad || '');
        setDiasDisponibles(disponibilidad.dias);
        setFranjasDisponibles(disponibilidad.franjas);
        setDetalleDisponibilidad(disponibilidad.detalle);

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

  const zonasDisponibles = ZONAS_POR_CIUDAD[ciudad] || ZONAS_GENERICAS;
  const zonaFinal = [...zonasSeleccionadas, zonaExtra.trim()].filter(Boolean).join(', ');
  const disponibilidadFinal = [
    diasDisponibles.join(', '),
    franjasDisponibles.join(' · '),
    detalleDisponibilidad.trim(),
  ]
    .filter(Boolean)
    .join(' · ');
  const valorPrecio = precioPersonalizado
    ? '__otro__'
    : PRECIOS_HORA.includes(precioHora)
      ? precioHora
      : '';

  const manejarCiudad = (valor: string) => {
    if (valor === '__otra__') {
      if (!ciudadOtra) {
        setZonasSeleccionadas([]);
        setZonaExtra('');
      }
      setCiudadOtra(true);
      setCiudad('');
      return;
    }

    if (valor !== ciudad) {
      setZonasSeleccionadas([]);
      setZonaExtra('');
    }
    setCiudadOtra(false);
    setCiudad(valor);
  };

  const manejarPrecio = (valor: string) => {
    if (valor === '__otro__') {
      setPrecioPersonalizado(true);
      setPrecioHora('');
      return;
    }
    setPrecioPersonalizado(false);
    setPrecioHora(valor);
  };

  const toggleZona = (valor: string) => {
    setZonasSeleccionadas((actual) =>
      actual.includes(valor) ? actual.filter((zona) => zona !== valor) : [...actual, valor]
    );
  };

  const toggleDia = (valor: string) => {
    setDiasDisponibles((actual) =>
      actual.includes(valor) ? actual.filter((dia) => dia !== valor) : [...actual, valor]
    );
  };

  const toggleFranja = (valor: string) => {
    setFranjasDisponibles((actual) =>
      actual.includes(valor) ? actual.filter((franja) => franja !== valor) : [...actual, valor]
    );
  };

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
    if (precioPersonalizado && precioHora.trim()) {
      const precio = Number(precioHora.replace(/\./g, ''));
      if (!Number.isFinite(precio) || precio < 1 || precio > 1000000) {
        mostrarAlerta('Precio inválido', 'Ingresá un monto por hora entre $1 y $1.000.000.');
        return;
      }
    }
    try {
      setEnviando(true);
      const resultado = await enviarSolicitudPaseador({
        telefono: telefono.trim(),
        ciudad: ciudad.trim(),
        zona: zonaFinal,
        experiencia: experiencia.trim(),
        precioHora: precioHora.trim(),
        disponibilidad: disponibilidadFinal,
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
            placeholder="Ej: +54 9 342 555-1234"
            style={estilos.input}
          />

          <SelectorCampo
            etiqueta="Ciudad *"
            placeholder="Elegí tu ciudad"
            valor={ciudadOtra ? '__otra__' : ciudad}
            opciones={CIUDADES}
            onChange={manejarCiudad}
            icono="location-city"
          />
          {ciudadOtra && (
            <TextInput
              label="Escribí tu ciudad *"
              value={ciudad}
              onChangeText={setCiudad}
              mode="outlined"
              style={estilos.input}
            />
          )}

          <Text style={estilos.labelCampo}>Zonas donde paseás</Text>
          <Text style={estilos.ayudaCampo}>
            Elegí una o varias. Así los dueños te encuentran más fácil por zona.
          </Text>
          <View style={estilos.chips}>
            {zonasDisponibles.map((opcion) => (
              <Chip
                key={opcion}
                selected={zonasSeleccionadas.includes(opcion)}
                onPress={() => toggleZona(opcion)}
                style={estilos.chip}
                icon={zonasSeleccionadas.includes(opcion) ? 'check' : undefined}
              >
                {opcion}
              </Chip>
            ))}
          </View>
          <TextInput
            label="Otro barrio o zona (opcional)"
            value={zonaExtra}
            onChangeText={setZonaExtra}
            mode="outlined"
            placeholder="Ej: Villa del Parque"
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
            placeholder="Ej: 3 años paseando perros de vecinos, experiencia con razas grandes y perros rescatados."
            style={estilos.input}
          />

          <SelectorCampo
            etiqueta="Precio por hora"
            placeholder="Elegí un monto o dejalo vacío para acordar"
            valor={valorPrecio}
            opciones={[
              ...PRECIOS_HORA.map((valor) => ({
                valor,
                etiqueta: `${precioEtiqueta(valor)} por hora`,
              })),
              { valor: '__otro__', etiqueta: 'Otro monto…' },
            ]}
            onChange={manejarPrecio}
            icono="payments"
          />
          {precioPersonalizado && (
            <TextInput
              label="Otro monto por hora (ARS)"
              value={precioHora}
              onChangeText={setPrecioHora}
              mode="outlined"
              keyboardType="numeric"
              placeholder="Ej: 4200"
              style={estilos.input}
            />
          )}

          <Text style={estilos.labelCampo}>Días que paseás</Text>
          <View style={estilos.chips}>
            {DIAS_SEMANA.map((dia) => (
              <Chip
                key={dia}
                selected={diasDisponibles.includes(dia)}
                onPress={() => toggleDia(dia)}
                style={estilos.chip}
              >
                {dia}
              </Chip>
            ))}
          </View>

          <Text style={estilos.labelCampo}>Franjas horarias</Text>
          <View style={estilos.chips}>
            {FRANJAS_HORARIAS.map((franja) => (
              <Chip
                key={franja}
                selected={franjasDisponibles.includes(franja)}
                onPress={() => toggleFranja(franja)}
                style={estilos.chip}
              >
                {franja}
              </Chip>
            ))}
          </View>
          <TextInput
            label="Detalle adicional de disponibilidad (opcional)"
            value={detalleDisponibilidad}
            onChangeText={setDetalleDisponibilidad}
            mode="outlined"
            placeholder="Ej: solo perros sociables, paseos de 45 minutos"
            style={estilos.input}
          />

          <TextInput
            label="Mensaje adicional (opcional)"
            value={mensaje}
            onChangeText={setMensaje}
            mode="outlined"
            multiline
            numberOfLines={3}
            placeholder="Ej: Acepto perros grandes y puedo retirarlos por tu casa."
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
  labelCampo: {
    fontSize: 13,
    fontWeight: '700',
    color: temaApp.colors.onSurface,
    marginTop: espaciado.xs,
    marginBottom: espaciado.xs,
  },
  ayudaCampo: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    marginBottom: espaciado.sm,
    lineHeight: 17,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: espaciado.sm,
  },
  chip: {
    marginBottom: 2,
  },
  boton: { marginTop: espaciado.md, borderRadius: 12 },
  botonContenido: { paddingVertical: 6 },
  aviso: {
    marginTop: espaciado.sm,
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    lineHeight: 18,
  },
});
