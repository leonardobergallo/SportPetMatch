// Pantalla para solicitar un paseo a un paseador aprobado.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Card, Chip, Text, TextInput } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../contextos/ContextoAuth';
import { mostrarAlerta } from '../utilidades/alerta';
import { temaApp, espaciado, sombras } from '../constantes/tema';
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import SelectorCampo from '../componentes/SelectorCampo';
import { PASEADORES_DEMO_FALLBACK } from '../constantes/paseadoresDemoFallback';
import { Mascota, obtenerMisMascotas } from '../servicios/servicioMascotas';
import {
  PaseadorPaseo,
  crearPaseo,
  obtenerPaseadoresDisponibles,
} from '../servicios/servicioPaseos';

type Nav = StackNavigationProp<RootStackParamList, 'SolicitarPaseo'>;

const dosDigitos = (n: number) => String(n).padStart(2, '0');

function fechaPorDefecto(): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 1);
  fecha.setHours(10, 0, 0, 0);
  return `${dosDigitos(fecha.getDate())}/${dosDigitos(fecha.getMonth() + 1)}/${fecha.getFullYear()} ${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
}

function parsearFechaHora(texto: string): Date | null {
  const valor = texto.trim();
  let match = valor.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/);
  if (match) {
    const [, dia, mes, anio, hora, minuto] = match;
    return new Date(Number(anio), Number(mes) - 1, Number(dia), Number(hora), Number(minuto));
  }
  match = valor.match(/^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})$/);
  if (match) {
    const [, anio, mes, dia, hora, minuto] = match;
    return new Date(Number(anio), Number(mes) - 1, Number(dia), Number(hora), Number(minuto));
  }
  return null;
}

const precioEstimado = (paseador: PaseadorPaseo | undefined, duracion: number) => {
  if (!paseador?.precioHora) return null;
  return Math.round((paseador.precioHora * duracion) / 60);
};

export default function PantallaSolicitarPaseo(): JSX.Element {
  const navigation = useNavigation<Nav>();
  const { estaAutenticado } = useAuth();
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [paseadores, setPaseadores] = useState<PaseadorPaseo[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [paseadorId, setPaseadorId] = useState('');
  const [mascotaId, setMascotaId] = useState('');
  const [ciudadFiltro, setCiudadFiltro] = useState('todas');
  const [zonaFiltro, setZonaFiltro] = useState('todas');
  const [fechaTexto, setFechaTexto] = useState(fechaPorDefecto());
  const [duracionMin, setDuracionMin] = useState(60);
  const [direccion, setDireccion] = useState('');
  const [notas, setNotas] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setErrorCarga(false);
    try {
      const [disponibles, misMascotas] = await Promise.all([
        obtenerPaseadoresDisponibles(),
        obtenerMisMascotas(),
      ]);
      setPaseadores(disponibles.length > 0 ? disponibles : PASEADORES_DEMO_FALLBACK);
      setMascotas(misMascotas);
      if (misMascotas.length > 0) setMascotaId(misMascotas[0].id);
    } catch (error: any) {
      setErrorCarga(true);
      mostrarAlerta('Paseos', error?.message || 'No se pudieron cargar los datos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (!estaAutenticado) {
      navigation.navigate('Login');
      return;
    }
    cargar();
  }, [estaAutenticado, cargar, navigation]);

  const ciudadesDisponibles = useMemo(
    () =>
      Array.from(new Set(paseadores.map((paseador) => paseador.ciudad).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b)
      ),
    [paseadores]
  );

  const zonasDisponibles = useMemo(() => {
    const base =
      ciudadFiltro === 'todas'
        ? paseadores
        : paseadores.filter((paseador) => paseador.ciudad === ciudadFiltro);
    const zonas = new Set<string>();

    base.forEach((paseador) => {
      (paseador.zona || '')
        .split(',')
        .map((zona) => zona.trim())
        .filter(Boolean)
        .forEach((zona) => zonas.add(zona));
    });

    return Array.from(zonas).sort((a, b) => a.localeCompare(b));
  }, [paseadores, ciudadFiltro]);

  const paseadoresFiltrados = useMemo(
    () =>
      paseadores.filter((paseador) => {
        if (ciudadFiltro !== 'todas' && paseador.ciudad !== ciudadFiltro) return false;
        if (zonaFiltro !== 'todas') {
          const zonas = (paseador.zona || '')
            .split(',')
            .map((zona) => zona.trim().toLowerCase());
          if (!zonas.includes(zonaFiltro.toLowerCase())) return false;
        }
        return true;
      }),
    [paseadores, ciudadFiltro, zonaFiltro]
  );

  useEffect(() => {
    if (paseadorId && !paseadoresFiltrados.some((paseador) => paseador.id === paseadorId)) {
      setPaseadorId('');
    }
  }, [paseadorId, paseadoresFiltrados]);

  const paseadorSeleccionado = paseadores.find((p) => p.id === paseadorId);
  const totalEstimado = precioEstimado(paseadorSeleccionado, duracionMin);

  const enviar = async () => {
    if (enviando) return;
    if (paseadorSeleccionado?.esDemo) {
      mostrarAlerta(
        'Paseador de ejemplo',
        'Estos perfiles sirven para ver cómo funciona el flujo. Para enviar una solicitud real, un paseador tiene que registrarse y quedar aprobado. Si ya cargaste los paseadores demo en la base, recargá esta pantalla.'
      );
      return;
    }
    if (!paseadorId) {
      mostrarAlerta('Falta el paseador', 'Elegí un paseador aprobado.');
      return;
    }
    if (!mascotaId) {
      mostrarAlerta('Falta la mascota', 'Elegí una de tus mascotas.');
      return;
    }
    const fecha = parsearFechaHora(fechaTexto);
    if (!fecha) {
      mostrarAlerta('Fecha inválida', 'Usá el formato DD/MM/AAAA HH:mm.');
      return;
    }
    if (fecha.getTime() < Date.now() + 5 * 60 * 1000) {
      mostrarAlerta('Fecha inválida', 'Elegí una fecha al menos 5 minutos en el futuro.');
      return;
    }
    try {
      setEnviando(true);
      const paseo = await crearPaseo({
        paseadorId,
        mascotaId,
        fechaProgramada: fecha.toISOString(),
        duracionMin,
        direccion: direccion.trim(),
        notas: notas.trim(),
      });
      mostrarAlerta('Solicitud enviada', 'El paseador va a recibir tu solicitud.');
      navigation.replace('DetallePaseo', { paseoId: paseo.id });
    } catch (error: any) {
      mostrarAlerta('No pudimos solicitar el paseo', error?.message || 'Probá de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color={temaApp.colors.primary} />
        <Text style={estilos.textoCargando}>Cargando paseadores...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={estilos.contenedor} contentContainerStyle={estilos.contenido}>
      <Card style={estilos.cardIntro}>
        <Card.Content>
          <Text style={estilos.titulo}>Solicitar un paseo</Text>
          <Text style={estilos.descripcion}>
            Compará zonas, horarios y tarifas. Elegí un paseador y enviá tu solicitud.
            El paseador puede aceptarla o rechazarla.
          </Text>
        </Card.Content>
      </Card>

      {errorCarga ? (
        <Card style={estilos.avisoCard}>
          <Card.Content>
            <Text style={estilos.avisoTitulo}>No se pudo cargar la información</Text>
            <Button mode="outlined" onPress={cargar} style={estilos.boton}>
              Reintentar
            </Button>
          </Card.Content>
        </Card>
      ) : paseadores.length === 0 ? (
        <Card style={estilos.avisoCard}>
          <Card.Content>
            <Text style={estilos.avisoTitulo}>Todavía no hay paseadores disponibles</Text>
            <Text style={estilos.avisoTexto}>
              Los paseadores aparecen acá cuando su perfil está aprobado y su membresía está activa.
            </Text>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Paseadores')}
              style={estilos.boton}
            >
              Quiero ser paseador
            </Button>
          </Card.Content>
        </Card>
      ) : mascotas.length === 0 ? (
        <Card style={estilos.avisoCard}>
          <Card.Content>
            <Text style={estilos.avisoTitulo}>Primero cargá una mascota</Text>
            <Text style={estilos.avisoTexto}>
              Para solicitar un paseo necesitás tener una mascota en tu perfil.
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('AgregarMascota')}
              style={estilos.boton}
            >
              Agregar mascota
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <>
          <Text style={estilos.seccion}>Elegí tu paseador</Text>

          {paseadores.some((paseador) => paseador.esDemo) && (
            <Card style={estilos.demoCard}>
              <Card.Content>
                <View style={estilos.demoFila}>
                  <MaterialIcons name="info-outline" size={18} color={temaApp.colors.secondary} />
                  <Text style={estilos.demoTexto}>
                    Estos son paseadores de ejemplo para que veas el flujo y los filtros. Cuando
                    haya paseadores reales aprobados, aparecen automáticamente en su lugar.
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}

          <View style={estilos.filtros}>
            <SelectorCampo
              etiqueta="Ciudad"
              valor={ciudadFiltro}
              opciones={[
                { valor: 'todas', etiqueta: 'Todas las ciudades' },
                ...ciudadesDisponibles.map((opcion) => ({ valor: opcion, etiqueta: opcion })),
              ]}
              onChange={(valor) => {
                setCiudadFiltro(valor);
                setZonaFiltro('todas');
              }}
              icono="location-city"
              style={estilos.filtro}
            />
            <SelectorCampo
              etiqueta="Zona"
              valor={zonaFiltro}
              opciones={[
                { valor: 'todas', etiqueta: 'Todas las zonas' },
                ...zonasDisponibles.map((opcion) => ({ valor: opcion, etiqueta: opcion })),
              ]}
              onChange={setZonaFiltro}
              icono="place"
              disabled={zonasDisponibles.length === 0}
              style={estilos.filtro}
            />
          </View>

          <Text style={estilos.contadorPaseadores}>
            {paseadoresFiltrados.length}{' '}
            {paseadoresFiltrados.length === 1 ? 'paseador disponible' : 'paseadores disponibles'}
          </Text>

          {paseadoresFiltrados.length === 0 ? (
            <Card style={estilos.avisoCard}>
              <Card.Content>
                <Text style={estilos.avisoTitulo}>No hay paseadores en esa zona</Text>
                <Text style={estilos.avisoTexto}>
                  Probá con otra ciudad o zona, o quitá los filtros para ver todos los paseadores
                  disponibles.
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setCiudadFiltro('todas');
                    setZonaFiltro('todas');
                  }}
                  style={estilos.boton}
                >
                  Ver todos
                </Button>
              </Card.Content>
            </Card>
          ) : (
            <>
              {paseadoresFiltrados.map((paseador) => {
                const seleccionado = paseador.id === paseadorId;
                return (
                  <TouchableOpacity
                    key={paseador.id}
                    onPress={() => setPaseadorId(paseador.id)}
                    activeOpacity={0.85}
                  >
                    <Card style={[estilos.cardPaseador, seleccionado && estilos.cardSeleccionada]}>
                      <Card.Content>
                        <View style={estilos.filaPaseador}>
                          <View style={estilos.avatar}>
                            <MaterialIcons name="pets" size={24} color="#FFFFFF" />
                          </View>
                          <View style={estilos.textoPaseador}>
                            <View style={estilos.filaNombrePaseador}>
                              <Text style={estilos.nombrePaseador}>
                                {paseador.usuario?.nombre || 'Paseador'}
                              </Text>
                              {paseador.esDemo && (
                                <Chip
                                  compact
                                  style={estilos.chipDemo}
                                  textStyle={estilos.textoChipDemo}
                                >
                                  Ejemplo
                                </Chip>
                              )}
                            </View>
                            <Text style={estilos.detallePaseador}>
                              {[paseador.ciudad, paseador.zona].filter(Boolean).join(' · ')}
                            </Text>
                            <Text style={estilos.detallePaseador}>
                              {paseador.disponibilidad || 'Disponibilidad a convenir'}
                            </Text>
                          </View>
                          {paseador.precioHora ? (
                            <Text style={estilos.precio}>${paseador.precioHora}/h</Text>
                          ) : <Text style={estilos.detallePaseador}>Tarifa a convenir</Text>}
                        </View>
                      </Card.Content>
                    </Card>
                  </TouchableOpacity>
                );
              })}

              <Text style={estilos.seccion}>Tu mascota</Text>
              <View style={estilos.chips}>
                {mascotas.map((mascota) => (
                  <Chip
                    key={mascota.id}
                    selected={mascota.id === mascotaId}
                    onPress={() => setMascotaId(mascota.id)}
                    style={estilos.chip}
                  >
                    {mascota.nombre}
                  </Chip>
                ))}
              </View>

              <Text style={estilos.seccion}>Fecha y hora</Text>
              <TextInput
                label="DD/MM/AAAA HH:mm"
                value={fechaTexto}
                onChangeText={setFechaTexto}
                mode="outlined"
                style={estilos.input}
              />
              <Text style={estilos.ayuda}>Ejemplo: 15/11/2026 18:30</Text>

              <Text style={estilos.seccion}>Duración</Text>
              <View style={estilos.chips}>
                {[30, 45, 60, 90].map((minutos) => (
                  <Chip
                    key={minutos}
                    selected={duracionMin === minutos}
                    onPress={() => setDuracionMin(minutos)}
                    style={estilos.chip}
                  >
                    {minutos} min
                  </Chip>
                ))}
              </View>

              <TextInput
                label="Dirección o punto de encuentro"
                value={direccion}
                onChangeText={setDireccion}
                mode="outlined"
                placeholder="Ej: Parque Federal, Av. Alem"
                style={estilos.input}
              />
              <TextInput
                label="Notas para el paseador"
                value={notas}
                onChangeText={setNotas}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="Ej: Mi perro es sociable y pasea con correa."
                style={estilos.input}
              />

              {totalEstimado ? (
                <Text style={estilos.total}>
                  Estimado: ${totalEstimado} por {duracionMin} min
                </Text>
              ) : null}

              <Button
                mode="contained"
                onPress={enviar}
                loading={enviando}
                disabled={enviando}
                style={estilos.boton}
                contentStyle={estilos.botonContenido}
              >
                Enviar solicitud
              </Button>
              <Text style={estilos.ayuda}>
                Cada paseador fija su tarifa. Acordá el precio final y pagale directamente.
              </Text>
            </>
          )}
        </>
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
  cardIntro: { borderRadius: 18, marginBottom: espaciado.md, ...sombras.media },
  titulo: { fontSize: 22, fontWeight: '800', color: temaApp.colors.onSurface },
  descripcion: {
    marginTop: espaciado.sm,
    color: temaApp.colors.onSurfaceVariant,
    lineHeight: 21,
    fontSize: 15,
  },
  seccion: {
    fontSize: 16,
    fontWeight: '800',
    color: temaApp.colors.onSurface,
    marginTop: espaciado.md,
    marginBottom: espaciado.sm,
  },
  filtros: {
    flexDirection: 'row',
    gap: espaciado.sm,
  },
  filtro: {
    flex: 1,
    minWidth: 0,
  },
  contadorPaseadores: {
    fontSize: 12,
    fontWeight: '700',
    color: temaApp.colors.onSurfaceVariant,
    marginBottom: espaciado.sm,
  },
  cardPaseador: { borderRadius: 16, marginBottom: espaciado.sm, ...sombras.media },
  cardSeleccionada: { borderWidth: 2, borderColor: temaApp.colors.primary },
  demoCard: {
    borderRadius: 14,
    marginBottom: espaciado.sm,
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFE082',
    ...sombras.pequena,
  },
  demoFila: { flexDirection: 'row', alignItems: 'flex-start', gap: espaciado.sm },
  demoTexto: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: temaApp.colors.onSurfaceVariant,
  },
  filaNombrePaseador: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipDemo: {
    backgroundColor: '#FFF3E0',
  },
  textoChipDemo: {
    fontSize: 10,
    color: '#E65100',
    fontWeight: '700',
  },
  filaPaseador: { flexDirection: 'row', alignItems: 'center', gap: espaciado.sm },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: temaApp.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoPaseador: { flex: 1 },
  nombrePaseador: { fontSize: 16, fontWeight: '800', color: temaApp.colors.onSurface, flexShrink: 1 },
  detallePaseador: { fontSize: 13, color: temaApp.colors.onSurfaceVariant, marginTop: 2 },
  precio: { fontSize: 15, fontWeight: '800', color: temaApp.colors.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { marginBottom: 4 },
  input: { marginTop: espaciado.sm, backgroundColor: '#FFFFFF' },
  ayuda: {
    marginTop: 6,
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    lineHeight: 18,
  },
  total: {
    marginTop: espaciado.md,
    fontSize: 17,
    fontWeight: '800',
    color: temaApp.colors.primary,
  },
  boton: { marginTop: espaciado.md, borderRadius: 12 },
  botonContenido: { paddingVertical: 6 },
  avisoCard: { borderRadius: 16, ...sombras.media },
  avisoTitulo: { fontSize: 18, fontWeight: '800', color: temaApp.colors.onSurface },
  avisoTexto: {
    marginTop: espaciado.sm,
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
    lineHeight: 20,
  },
});
