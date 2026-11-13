// Detalle de un paseo: aceptar, iniciar, seguimiento GPS y resumen.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../contextos/ContextoAuth';
import { mostrarAlerta } from '../utilidades/alerta';
import { temaApp, espaciado, sombras } from '../constantes/tema';
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import MapaRecorrido from '../componentes/MapaRecorrido';
import { useSeguimientoPaseo } from '../utilidades/useSeguimientoPaseo';
import {
  EstadoPaseo,
  Paseo,
  RecorridoPaseo,
  aceptarPaseo,
  cancelarPaseo,
  enviarPuntoPaseo,
  finalizarPaseo,
  iniciarPaseo,
  obtenerPaseo,
  obtenerRecorrido,
  rechazarPaseo,
} from '../servicios/servicioPaseos';

type Nav = StackNavigationProp<RootStackParamList, 'DetallePaseo'>;

const estadoInfo: Record<EstadoPaseo, { label: string; color: string; fondo: string }> = {
  pendiente: { label: 'Pendiente', color: '#8a5300', fondo: '#fff3df' },
  aceptado: { label: 'Aceptado', color: '#1d6f2a', fondo: '#eaf5eb' },
  en_curso: { label: 'En curso', color: '#0b4a63', fondo: '#e3f2f7' },
  finalizado: { label: 'Finalizado', color: '#1d6f2a', fondo: '#eaf5eb' },
  rechazado: { label: 'Rechazado', color: '#9b241b', fondo: '#fde9e7' },
  cancelado: { label: 'Cancelado', color: '#6b7280', fondo: '#f3f4f6' },
};

const fechaLarga = (valor: string) =>
  new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeStyle: 'short' }).format(
    new Date(valor)
  );

const hora = (valor?: string | null) =>
  valor
    ? new Intl.DateTimeFormat('es-AR', { timeStyle: 'short' }).format(new Date(valor))
    : '—';

export default function PantallaDetallePaseo({ route }: any): JSX.Element {
  const navigation = useNavigation<Nav>();
  const { usuario, estaAutenticado } = useAuth();
  const paseoId = route.params?.paseoId as string;
  const [paseo, setPaseo] = useState<Paseo | null>(null);
  const [rol, setRol] = useState<'dueno' | 'paseador' | 'admin'>('dueno');
  const [recorrido, setRecorrido] = useState<RecorridoPaseo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [siguiendo, setSiguiendo] = useState(false);
  const paseoRef = useRef<Paseo | null>(null);
  paseoRef.current = paseo;

  const cargar = useCallback(async () => {
    try {
      const datos = await obtenerPaseo(paseoId);
      setPaseo(datos.paseo);
      setRol(datos.rol);
      if (['en_curso', 'finalizado'].includes(datos.paseo.estado)) {
        setRecorrido(await obtenerRecorrido(paseoId));
      }
    } catch (error: any) {
      mostrarAlerta('Paseo', error?.message || 'No se pudo cargar el paseo.');
    } finally {
      setCargando(false);
    }
  }, [paseoId]);

  useEffect(() => {
    if (!estaAutenticado) {
      navigation.navigate('Login');
      return;
    }
    cargar();
  }, [estaAutenticado, cargar, navigation]);

  useEffect(() => {
    if (!paseo || !['pendiente', 'aceptado', 'en_curso'].includes(paseo.estado)) return;
    const timer = setInterval(() => {
      cargar();
    }, 8000);
    return () => clearInterval(timer);
  }, [paseo?.id, paseo?.estado, cargar]);

  const { ultimo, error: errorGps, iniciando } = useSeguimientoPaseo({
    paseoId: paseo?.id ?? null,
    activo: siguiendo && paseo?.estado === 'en_curso',
    onPunto: async (latitud, longitud, precision) => {
      const actual = paseoRef.current;
      if (!actual || actual.estado !== 'en_curso') return;
      await enviarPuntoPaseo(actual.id, latitud, longitud, precision);
      setRecorrido((prev) =>
        prev
          ? {
              ...prev,
              puntos: [
                ...prev.puntos,
                {
                  id: `local-${Date.now()}`,
                  latitud,
                  longitud,
                  precision: precision ?? null,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : prev
      );
    },
  });

  const ejecutar = async (accion: () => Promise<unknown>, mensaje: string) => {
    if (procesando) return;
    try {
      setProcesando(true);
      await accion();
      await cargar();
      mostrarAlerta('Paseo', mensaje);
    } catch (error: any) {
      mostrarAlerta('Paseo', error?.message || 'No se pudo completar la acción.');
    } finally {
      setProcesando(false);
    }
  };

  const iniciarYseguir = async () => {
    if (procesando || !paseo) return;
    try {
      setProcesando(true);
      await iniciarPaseo(paseo.id);
      await cargar();
      setSiguiendo(true);
      mostrarAlerta('Paseo', 'Paseo iniciado. Compartí tu ubicación durante el recorrido.');
    } catch (error: any) {
      mostrarAlerta('Paseo', error?.message || 'No se pudo iniciar el paseo.');
    } finally {
      setProcesando(false);
    }
  };

  const confirmarCancelar = () => {
    mostrarAlerta('Cancelar paseo', '¿Querés cancelar este paseo?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: () =>
          ejecutar(async () => {
            if (!paseo) return;
            await cancelarPaseo(paseo.id);
          }, 'El paseo fue cancelado.'),
      },
    ]);
  };

  const confirmarFinalizar = () => {
    mostrarAlerta('Finalizar paseo', '¿Terminó el paseo? Se va a guardar el recorrido y el resumen.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, finalizar',
        onPress: () =>
          ejecutar(async () => {
            if (!paseo) return;
            setSiguiendo(false);
            await finalizarPaseo(paseo.id);
          }, 'Paseo finalizado.'),
      },
    ]);
  };

  if (cargando || !paseo) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color={temaApp.colors.primary} />
        <Text style={estilos.textoCargando}>Cargando paseo...</Text>
      </View>
    );
  }

  const info = estadoInfo[paseo.estado];
  const esDueno = rol === 'dueno';
  const esPaseador = rol === 'paseador';
  const esAdmin = rol === 'admin';
  const puntos = recorrido?.puntos || [];
  const companero = esDueno ? paseo.paseador?.usuario : paseo.dueno;

  return (
    <ScrollView style={estilos.contenedor} contentContainerStyle={estilos.contenido}>
      <Card style={estilos.cardPrincipal}>
        <Card.Content>
          <View style={estilos.filaTitulo}>
            <View style={estilos.icono}>
              <MaterialIcons name="directions-walk" size={28} color="#FFFFFF" />
            </View>
            <View style={estilos.textoTitulo}>
              <Text style={estilos.titulo}>Paseo con {paseo.mascota?.nombre}</Text>
              <Text style={estilos.subtitulo}>{fechaLarga(paseo.fechaProgramada)}</Text>
            </View>
            <Chip compact style={[estilos.chip, { backgroundColor: info.fondo }]} textStyle={{ color: info.color }}>
              {info.label}
            </Chip>
          </View>

          <View style={estilos.resumenFila}>
            <View style={estilos.resumenItem}>
              <Text style={estilos.resumenLabel}>Duración</Text>
              <Text style={estilos.resumenValor}>{paseo.duracionMin} min</Text>
            </View>
            {paseo.precioHora ? (
              <View style={estilos.resumenItem}>
                <Text style={estilos.resumenLabel}>Precio/hora</Text>
                <Text style={estilos.resumenValor}>${paseo.precioHora}</Text>
              </View>
            ) : null}
            {paseo.distanciaKm !== null && paseo.distanciaKm !== undefined ? (
              <View style={estilos.resumenItem}>
                <Text style={estilos.resumenLabel}>Distancia</Text>
                <Text style={estilos.resumenValor}>{paseo.distanciaKm.toFixed(2)} km</Text>
              </View>
            ) : null}
            {paseo.duracionRealMin ? (
              <View style={estilos.resumenItem}>
                <Text style={estilos.resumenLabel}>Duración real</Text>
                <Text style={estilos.resumenValor}>{paseo.duracionRealMin} min</Text>
              </View>
            ) : null}
          </View>

          {paseo.direccion ? (
            <View style={estilos.filaContacto}>
              <MaterialIcons name="place" size={18} color={temaApp.colors.primary} />
              <Text style={estilos.contactoTexto}>{paseo.direccion}</Text>
            </View>
          ) : null}
          {paseo.notas ? <Text style={estilos.notas}>{paseo.notas}</Text> : null}
        </Card.Content>
      </Card>

      <Card style={estilos.card}>
        <Card.Content>
          <Text style={estilos.seccion}>Participantes</Text>
          <View style={estilos.filaContacto}>
            <MaterialIcons name="person" size={18} color={temaApp.colors.primary} />
            <Text style={estilos.contactoTexto}>
              {esDueno ? 'Paseador: ' : 'Dueño: '}
              <Text style={estilos.contactoFuerte}>{companero?.nombre || '—'}</Text>
            </Text>
          </View>
          {companero?.telefono ? (
            <View style={estilos.filaContacto}>
              <MaterialIcons name="phone" size={18} color={temaApp.colors.primary} />
              <Text style={estilos.contactoTexto}>{companero.telefono}</Text>
            </View>
          ) : null}
          <View style={estilos.filaContacto}>
            <MaterialIcons name="pets" size={18} color={temaApp.colors.primary} />
            <Text style={estilos.contactoTexto}>
              {paseo.mascota?.nombre} · {paseo.mascota?.tipo}
              {paseo.mascota?.raza ? ` · ${paseo.mascota.raza}` : ''}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {['en_curso', 'finalizado'].includes(paseo.estado) && (
        <Card style={estilos.card}>
          <Card.Content>
            <View style={estilos.filaTitulo}>
              <Text style={estilos.seccion}>Recorrido</Text>
              <Text style={estilos.contadorPuntos}>{puntos.length} puntos</Text>
            </View>
            {puntos.length > 0 ? (
              <MapaRecorrido
                puntos={puntos.map((p) => ({ latitud: p.latitud, longitud: p.longitud }))}
                height={260}
              />
            ) : (
              <View style={estilos.mapaVacio}>
                <MaterialIcons name="my-location" size={28} color={temaApp.colors.onSurfaceVariant} />
                <Text style={estilos.mapaVacioTexto}>
                  Todavía no hay puntos de ubicación. El paseador tiene que activar el seguimiento.
                </Text>
              </View>
            )}
            {paseo.estado === 'en_curso' ? (
              <Text style={estilos.actualizando}>Actualizando cada 8 segundos...</Text>
            ) : (
              <View style={estilos.resumenFila}>
                <View style={estilos.resumenItem}>
                  <Text style={estilos.resumenLabel}>Inicio</Text>
                  <Text style={estilos.resumenValor}>{hora(paseo.inicioEn)}</Text>
                </View>
                <View style={estilos.resumenItem}>
                  <Text style={estilos.resumenLabel}>Fin</Text>
                  <Text style={estilos.resumenValor}>{hora(paseo.finEn)}</Text>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {esPaseador && paseo.estado === 'pendiente' && (
        <Card style={estilos.cardAcciones}>
          <Card.Content>
            <Text style={estilos.seccion}>Solicitud pendiente</Text>
            <Text style={estilos.ayuda}>
              Revisá el horario y la mascota. Si aceptás, después vas a poder iniciar el paseo y
              compartir tu ubicación.
            </Text>
            <View style={estilos.botonesFila}>
              <Button
                mode="contained"
                onPress={() => ejecutar(async () => {
                  await aceptarPaseo(paseo.id);
                }, 'Aceptaste el paseo.')}
                loading={procesando}
                disabled={procesando}
                style={estilos.boton}
              >
                Aceptar
              </Button>
              <Button
                mode="outlined"
                onPress={() => ejecutar(async () => {
                  await rechazarPaseo(paseo.id);
                  navigation.goBack();
                }, 'Rechazaste la solicitud.')}
                disabled={procesando}
                style={estilos.boton}
              >
                Rechazar
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {esPaseador && paseo.estado === 'aceptado' && (
        <Card style={estilos.cardAcciones}>
          <Card.Content>
            <Text style={estilos.seccion}>Paseo aceptado</Text>
            <Text style={estilos.ayuda}>
              Cuando llegues al punto de encuentro, iniciá el paseo. Se va a activar el
              seguimiento GPS mientras la pantalla esté abierta.
            </Text>
            <Button
              mode="contained"
              onPress={iniciarYseguir}
              loading={procesando}
              disabled={procesando}
              style={estilos.boton}
            >
              Iniciar paseo
            </Button>
          </Card.Content>
        </Card>
      )}

      {esPaseador && paseo.estado === 'en_curso' && (
        <Card style={estilos.cardAcciones}>
          <Card.Content>
            <Text style={estilos.seccion}>Seguimiento en vivo</Text>
            <Text style={estilos.ayuda}>
              Mantené la pantalla abierta. La ubicación se comparte solo mientras el seguimiento
              esté activo.
            </Text>
            {siguiendo ? (
              <>
                <View style={estilos.estadoGps}>
                  <MaterialIcons name="my-location" size={18} color="#1d6f2a" />
                  <Text style={estilos.estadoGpsTexto}>
                    {iniciando
                      ? 'Iniciando GPS...'
                      : ultimo
                        ? `Compartiendo · ${ultimo.latitud.toFixed(4)}, ${ultimo.longitud.toFixed(4)}`
                        : 'Esperando la primera ubicación...'}
                  </Text>
                </View>
                <Button
                  mode="outlined"
                  onPress={() => setSiguiendo(false)}
                  style={estilos.boton}
                >
                  Pausar seguimiento
                </Button>
              </>
            ) : (
              <Button
                mode="contained"
                onPress={() => setSiguiendo(true)}
                style={estilos.boton}
              >
                Iniciar seguimiento
              </Button>
            )}
            {errorGps ? <Text style={estilos.errorGps}>{errorGps}</Text> : null}
            <Button
              mode="contained"
              buttonColor="#1d6f2a"
              onPress={confirmarFinalizar}
              loading={procesando}
              disabled={procesando}
              style={estilos.boton}
            >
              Finalizar paseo
            </Button>
          </Card.Content>
        </Card>
      )}

      {(esDueno || esAdmin) && ['pendiente', 'aceptado'].includes(paseo.estado) && (
        <Card style={estilos.cardAcciones}>
          <Card.Content>
            <Text style={estilos.seccion}>
              {paseo.estado === 'pendiente' ? 'Esperando al paseador' : 'Paseo aceptado'}
            </Text>
            <Text style={estilos.ayuda}>
              {paseo.estado === 'pendiente'
                ? 'El paseador todavía tiene que aceptar la solicitud.'
                : 'El paseador va a iniciar el recorrido en el horario acordado.'}
            </Text>
            <Button mode="outlined" onPress={confirmarCancelar} disabled={procesando} style={estilos.boton}>
              Cancelar paseo
            </Button>
          </Card.Content>
        </Card>
      )}

      {esAdmin && ['en_curso'].includes(paseo.estado) && (
        <Button mode="outlined" onPress={confirmarCancelar} disabled={procesando} style={estilos.boton}>
          Cancelar desde administración
        </Button>
      )}

      {paseo.estado === 'finalizado' && (
        <Card style={estilos.cardAcciones}>
          <Card.Content>
            <Text style={estilos.seccion}>Paseo finalizado</Text>
            <Text style={estilos.ayuda}>
              Recorrido de {paseo.distanciaKm?.toFixed(2) || '0'} km en{' '}
              {paseo.duracionRealMin || 0} minutos.
            </Text>
          </Card.Content>
        </Card>
      )}
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
  cardPrincipal: { borderRadius: 18, marginBottom: espaciado.md, ...sombras.media },
  card: { borderRadius: 16, marginBottom: espaciado.md, ...sombras.media },
  cardAcciones: { borderRadius: 16, marginBottom: espaciado.md, ...sombras.media },
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
  titulo: { fontSize: 20, fontWeight: '800', color: temaApp.colors.onSurface },
  subtitulo: { fontSize: 13, color: temaApp.colors.onSurfaceVariant, marginTop: 2 },
  chip: { alignSelf: 'flex-start' },
  resumenFila: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, marginTop: espaciado.md },
  resumenItem: { minWidth: 80 },
  resumenLabel: { fontSize: 11, textTransform: 'uppercase', color: temaApp.colors.onSurfaceVariant },
  resumenValor: { fontSize: 16, fontWeight: '800', color: temaApp.colors.onSurface, marginTop: 2 },
  filaContacto: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: espaciado.sm },
  contactoTexto: { fontSize: 14, color: temaApp.colors.onSurfaceVariant, flex: 1 },
  contactoFuerte: { fontWeight: '800', color: temaApp.colors.onSurface },
  notas: {
    marginTop: espaciado.sm,
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  seccion: { fontSize: 17, fontWeight: '800', color: temaApp.colors.onSurface },
  contadorPuntos: { marginLeft: 'auto', fontSize: 13, color: temaApp.colors.onSurfaceVariant },
  mapaVacio: {
    height: 160,
    borderRadius: 14,
    backgroundColor: '#eef3ee',
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaciado.md,
    marginTop: espaciado.sm,
  },
  mapaVacioTexto: {
    marginTop: 6,
    textAlign: 'center',
    color: temaApp.colors.onSurfaceVariant,
    fontSize: 13,
  },
  actualizando: { fontSize: 12, color: temaApp.colors.onSurfaceVariant, marginTop: 6 },
  botonesFila: { flexDirection: 'row', gap: 10, marginTop: espaciado.sm },
  boton: { marginTop: espaciado.md, borderRadius: 12, flex: 1 },
  ayuda: {
    marginTop: espaciado.sm,
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  estadoGps: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: espaciado.sm },
  estadoGpsTexto: { fontSize: 13, color: '#1d6f2a', flex: 1 },
  errorGps: { marginTop: espaciado.sm, color: '#9b241b', fontSize: 13 },
});
