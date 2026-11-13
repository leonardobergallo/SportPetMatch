// Pantalla de Paseos: mis solicitudes y agenda del paseador.
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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
import {
  Paseo,
  EstadoPaseo,
  obtenerMisPaseos,
  obtenerPaseosAsignados,
} from '../servicios/servicioPaseos';
import { obtenerMiPaseador, Paseador } from '../servicios/servicioPaseadores';

type Nav = StackNavigationProp<RootStackParamList, 'Paseos'>;
type Pestana = 'mios' | 'asignados';

const estadoInfo: Record<EstadoPaseo, { label: string; color: string; fondo: string }> = {
  pendiente: { label: 'Pendiente', color: '#8a5300', fondo: '#fff3df' },
  aceptado: { label: 'Aceptado', color: '#1d6f2a', fondo: '#eaf5eb' },
  en_curso: { label: 'En curso', color: '#0b4a63', fondo: '#e3f2f7' },
  finalizado: { label: 'Finalizado', color: '#1d6f2a', fondo: '#eaf5eb' },
  rechazado: { label: 'Rechazado', color: '#9b241b', fondo: '#fde9e7' },
  cancelado: { label: 'Cancelado', color: '#6b7280', fondo: '#f3f4f6' },
};

const fechaCorta = (valor: string) =>
  new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(valor)
  );

function TarjetaPaseo({ paseo, rol, onPress }: { paseo: Paseo; rol: 'dueno' | 'paseador'; onPress: () => void }) {
  const info = estadoInfo[paseo.estado];
  const contraparte = rol === 'dueno' ? paseo.paseador?.usuario?.nombre : paseo.dueno.nombre;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={estilos.tarjeta}>
        <Card.Content>
          <View style={estilos.filaTitulo}>
            <View style={estilos.tarjetaTexto}>
              <Text style={estilos.tarjetaTitulo}>
                {paseo.mascota?.nombre || 'Mascota'} · {contraparte || (rol === 'dueno' ? 'Paseador' : 'Dueño')}
              </Text>
              <Text style={estilos.tarjetaFecha}>{fechaCorta(paseo.fechaProgramada)}</Text>
            </View>
            <Chip compact style={[estilos.chip, { backgroundColor: info.fondo }]} textStyle={{ color: info.color }}>
              {info.label}
            </Chip>
          </View>
          <View style={estilos.filaDetalle}>
            <MaterialIcons name="schedule" size={16} color={temaApp.colors.onSurfaceVariant} />
            <Text style={estilos.detalleTexto}>{paseo.duracionMin} min</Text>
            {paseo.distanciaKm ? (
              <>
                <MaterialIcons name="route" size={16} color={temaApp.colors.onSurfaceVariant} />
                <Text style={estilos.detalleTexto}>{paseo.distanciaKm.toFixed(1)} km</Text>
              </>
            ) : null}
            {paseo._count?.puntos ? (
              <>
                <MaterialIcons name="my-location" size={16} color={temaApp.colors.onSurfaceVariant} />
                <Text style={estilos.detalleTexto}>{paseo._count.puntos} puntos</Text>
              </>
            ) : null}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

export default function PantallaPaseos(): JSX.Element {
  const navigation = useNavigation<Nav>();
  const { estaAutenticado } = useAuth();
  const [pestana, setPestana] = useState<Pestana>('mios');
  const [paseosMios, setPaseosMios] = useState<Paseo[]>([]);
  const [paseosAsignados, setPaseosAsignados] = useState<Paseo[]>([]);
  const [paseador, setPaseador] = useState<Paseador | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const [mios, perfil] = await Promise.all([obtenerMisPaseos(), obtenerMiPaseador()]);
      setPaseosMios(mios);
      setPaseador(perfil);
      if (perfil?.estado === 'aprobado') {
        setPaseosAsignados(await obtenerPaseosAsignados());
      } else {
        setPaseosAsignados([]);
      }
    } catch (error: any) {
      mostrarAlerta('Paseos', error?.message || 'No se pudieron cargar los paseos.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => {
    if (!estaAutenticado) {
      navigation.navigate('Login');
      return;
    }
    cargar();
  }, [estaAutenticado, cargar, navigation]);

  const paseadorAprobado = paseador?.estado === 'aprobado';
  const lista = pestana === 'mios' ? paseosMios : paseosAsignados;

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color={temaApp.colors.primary} />
        <Text style={estilos.textoCargando}>Cargando paseos...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={estilos.contenedor}
      contentContainerStyle={estilos.contenido}
      refreshControl={
        <RefreshControl
          refreshing={refrescando}
          onRefresh={() => {
            setRefrescando(true);
            cargar();
          }}
          colors={[temaApp.colors.primary]}
        />
      }
    >
      <Card style={estilos.encabezado}>
        <Card.Content>
          <View style={estilos.filaTitulo}>
            <View style={estilos.icono}>
              <MaterialIcons name="directions-walk" size={28} color="#FFFFFF" />
            </View>
            <View style={estilos.tarjetaTexto}>
              <Text style={estilos.titulo}>Paseos</Text>
              <Text style={estilos.subtitulo}>Solicitá un paseo y seguí el recorrido en vivo</Text>
            </View>
          </View>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => navigation.navigate('SolicitarPaseo')}
            style={estilos.botonSolicitar}
          >
            Solicitar paseo
          </Button>
          {paseadorAprobado && (
            <Text style={estilos.notaPaseador}>
              Tu perfil de paseador está aprobado. En la pestaña “Soy paseador” ves las solicitudes
              que te asignaron.
            </Text>
          )}
        </Card.Content>
      </Card>

      {paseadorAprobado && (
        <View style={estilos.tabs}>
          <TouchableOpacity
            onPress={() => setPestana('mios')}
            style={[estilos.tab, pestana === 'mios' && estilos.tabActiva]}
          >
            <Text style={[estilos.tabTexto, pestana === 'mios' && estilos.tabTextoActivo]}>
              Mis paseos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPestana('asignados')}
            style={[estilos.tab, pestana === 'asignados' && estilos.tabActiva]}
          >
            <Text style={[estilos.tabTexto, pestana === 'asignados' && estilos.tabTextoActivo]}>
              Soy paseador
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {lista.length === 0 ? (
        <Card style={estilos.vacio}>
          <Card.Content>
            <MaterialIcons name="pets" size={36} color={temaApp.colors.primary} />
            <Text style={estilos.vacioTitulo}>
              {pestana === 'mios' ? 'Todavía no solicitaste un paseo' : 'No tenés paseos asignados'}
            </Text>
            <Text style={estilos.vacioTexto}>
              {pestana === 'mios'
                ? 'Elegí un paseador aprobado, tu mascota y un horario.'
                : 'Cuando un dueño te asigne un paseo, va a aparecer acá.'}
            </Text>
          </Card.Content>
        </Card>
      ) : (
        lista.map((paseo) => (
          <TarjetaPaseo
            key={paseo.id}
            paseo={paseo}
            rol={pestana === 'mios' ? 'dueno' : 'paseador'}
            onPress={() => navigation.navigate('DetallePaseo', { paseoId: paseo.id })}
          />
        ))
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
  encabezado: { borderRadius: 18, marginBottom: espaciado.md, ...sombras.media },
  filaTitulo: { flexDirection: 'row', alignItems: 'center', gap: espaciado.sm },
  icono: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: temaApp.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tarjetaTexto: { flex: 1 },
  titulo: { fontSize: 24, fontWeight: '800', color: temaApp.colors.onSurface },
  subtitulo: { fontSize: 14, color: temaApp.colors.onSurfaceVariant, marginTop: 2 },
  botonSolicitar: { marginTop: espaciado.md, borderRadius: 12 },
  notaPaseador: {
    marginTop: espaciado.sm,
    fontSize: 13,
    lineHeight: 19,
    color: temaApp.colors.onSurfaceVariant,
  },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: espaciado.md },
  tab: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#edf5ee',
  },
  tabActiva: { backgroundColor: temaApp.colors.primary },
  tabTexto: { color: '#216c2e', fontWeight: '700' },
  tabTextoActivo: { color: '#FFFFFF' },
  tarjeta: { borderRadius: 16, marginBottom: espaciado.sm, ...sombras.media },
  filaDetalle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: espaciado.sm,
    flexWrap: 'wrap',
  },
  tarjetaTitulo: { fontSize: 16, fontWeight: '800', color: temaApp.colors.onSurface },
  tarjetaFecha: { fontSize: 13, color: temaApp.colors.onSurfaceVariant, marginTop: 2 },
  chip: { alignSelf: 'flex-start' },
  detalleTexto: { fontSize: 13, color: temaApp.colors.onSurfaceVariant, marginRight: 8 },
  vacio: { borderRadius: 18, ...sombras.media },
  vacioTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: temaApp.colors.onSurface,
    marginTop: espaciado.sm,
  },
  vacioTexto: {
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: 4,
    lineHeight: 20,
  },
});
