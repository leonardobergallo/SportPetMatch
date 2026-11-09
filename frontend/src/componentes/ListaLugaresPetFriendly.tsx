// Lista de Lugares pet friendly - Indio
// Vista de recomendaciones por zona, con filtros, distancia y sugerencias de la comunidad.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  Chip,
  Dialog,
  Divider,
  Portal,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Coordenadas, formatearDistancia } from '../contextos/ContextoUbicacion';
import { useAuth } from '../contextos/ContextoAuth';
import { mostrarAlerta } from '../utilidades/alerta';
import { temaApp, espaciado, sombras } from '../constantes/tema';
import {
  CategoriaLugar,
  LugarPetFriendly,
  ZonaLugar,
  obtenerLugares,
  sugerirLugar,
} from '../servicios/servicioLugares';

interface Props {
  coordenadas: Coordenadas;
  ciudadActual?: string;
  provinciaActual?: string;
  onSolicitarUbicacion?: () => Promise<boolean>;
}

type CategoriaFiltro = CategoriaLugar | 'todos';

interface CategoriaInfo {
  valor: CategoriaFiltro;
  etiqueta: string;
  icono: keyof typeof MaterialIcons.glyphMap;
  color: string;
}

const CATEGORIAS: CategoriaInfo[] = [
  { valor: 'todos', etiqueta: 'Todos', icono: 'apps', color: '#607D8B' },
  { valor: 'parque', etiqueta: 'Parques', icono: 'park', color: '#2E7D32' },
  { valor: 'plaza', etiqueta: 'Plazas', icono: 'place', color: '#388E3C' },
  { valor: 'paseo', etiqueta: 'Paseos', icono: 'directions-walk', color: '#1976D2' },
  { valor: 'cafeteria', etiqueta: 'Cafeterías', icono: 'local-cafe', color: '#8D6E63' },
  { valor: 'restaurante', etiqueta: 'Restaurantes', icono: 'restaurant', color: '#EF6C00' },
  { valor: 'bar', etiqueta: 'Bares', icono: 'local-bar', color: '#6A1B9A' },
  { valor: 'alojamiento', etiqueta: 'Alojamientos', icono: 'hotel', color: '#00838F' },
  { valor: 'veterinaria', etiqueta: 'Veterinarias', icono: 'medical-services', color: '#C62828' },
  { valor: 'pet_shop', etiqueta: 'Pet shops', icono: 'pets', color: '#5D4037' },
  { valor: 'otro', etiqueta: 'Otros', icono: 'more-horiz', color: '#455A64' },
];

function obtenerCategoria(categoria: string): CategoriaInfo {
  return CATEGORIAS.find((item) => item.valor === categoria) || CATEGORIAS[CATEGORIAS.length - 1];
}

function urlComoLlegar(lugar: LugarPetFriendly): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lugar.latitud},${lugar.longitud}`;
}

function abrirComoLlegar(lugar: LugarPetFriendly): void {
  const url = urlComoLlegar(lugar);
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  Linking.openURL(url).catch(() => {
    mostrarAlerta('No se pudo abrir el mapa', 'Probá de nuevo en unos segundos.');
  });
}

function etiquetaZona(zonaPetFriendly: string): string {
  if (zonaPetFriendly === 'interior') return 'Adentro';
  if (zonaPetFriendly === 'ambos') return 'Adentro y afuera';
  return 'Afuera';
}

function extraerCoordenadasDeLink(link: string): { latitud: number; longitud: number } | null {
  if (!link) return null;

  const patrones = [
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
  ];

  for (const patron of patrones) {
    const match = link.match(patron);
    if (match) {
      const latitud = Number(match[1]);
      const longitud = Number(match[2]);
      if (
        Number.isFinite(latitud) &&
        Number.isFinite(longitud) &&
        latitud >= -90 &&
        latitud <= 90 &&
        longitud >= -180 &&
        longitud <= 180
      ) {
        return { latitud, longitud };
      }
    }
  }

  return null;
}

export default function ListaLugaresPetFriendly({
  coordenadas,
  ciudadActual,
  provinciaActual,
  onSolicitarUbicacion,
}: Props): JSX.Element {
  const navigation = useNavigation<any>();
  const { estaAutenticado } = useAuth();

  const [lugares, setLugares] = useState<LugarPetFriendly[]>([]);
  const [zonas, setZonas] = useState<ZonaLugar[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refrescar, setRefrescar] = useState(0);
  const [categoria, setCategoria] = useState<CategoriaFiltro>('todos');
  const [zonaSeleccionada, setZonaSeleccionada] = useState<ZonaLugar | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [lugarSeleccionado, setLugarSeleccionado] = useState<LugarPetFriendly | null>(null);
  const [sugerenciaVisible, setSugerenciaVisible] = useState(false);
  const [enviandoSugerencia, setEnviandoSugerencia] = useState(false);
  const [snackbar, setSnackbar] = useState('');
  const [formulario, setFormulario] = useState({
    nombre: '',
    categoria: 'cafeteria' as CategoriaLugar,
    direccion: '',
    ciudad: '',
    provincia: '',
    descripcion: '',
    linkMapa: '',
  });

  const zonasUnicas = useMemo(() => {
    const vistas = new Set<string>();
    return zonas.filter((zona) => {
      const clave = `${zona.provincia}|${zona.ciudad}`;
      if (vistas.has(clave)) return false;
      vistas.add(clave);
      return true;
    });
  }, [zonas]);

  const recargar = useCallback(() => {
    setRefrescar((actual) => actual + 1);
  }, []);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);

        const respuesta = await obtenerLugares({
          categoria,
          provincia: zonaSeleccionada?.provincia,
          ciudad: zonaSeleccionada?.ciudad,
          lat: coordenadas.latitud,
          lng: coordenadas.longitud,
          radio: zonaSeleccionada ? 0 : 150,
          limit: 100,
        });

        if (!activo) return;

        setLugares(respuesta.lugares);
        setZonas(respuesta.zonas || []);
      } catch (err: any) {
        if (activo) {
          setError(err?.message || 'No se pudieron cargar los lugares.');
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [
    categoria,
    zonaSeleccionada?.provincia,
    zonaSeleccionada?.ciudad,
    coordenadas.latitud,
    coordenadas.longitud,
    refrescar,
  ]);

  const lugaresFiltrados = useMemo(() => {
    const consulta = busqueda.trim().toLowerCase();
    if (!consulta) return lugares;

    return lugares.filter((lugar) => {
      const texto = `${lugar.nombre} ${lugar.descripcion || ''} ${lugar.direccion || ''} ${lugar.ciudad}`.toLowerCase();
      return texto.includes(consulta);
    });
  }, [busqueda, lugares]);

  const abrirSugerencia = () => {
    if (!estaAutenticado) {
      mostrarAlerta(
        'Iniciá sesión',
        'Para recomendar un lugar necesitás tener una cuenta en Indio.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ingresar', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    setFormulario({
      nombre: '',
      categoria: 'cafeteria',
      direccion: '',
      ciudad: zonaSeleccionada?.ciudad || ciudadActual || 'Santa Fe',
      provincia: zonaSeleccionada?.provincia || provinciaActual || 'Santa Fe',
      descripcion: '',
      linkMapa: '',
    });
    setSugerenciaVisible(true);
  };

  const enviarSugerencia = async () => {
    if (!formulario.nombre.trim() || !formulario.ciudad.trim() || !formulario.provincia.trim()) {
      mostrarAlerta('Faltan datos', 'Completá el nombre, la ciudad y la provincia.');
      return;
    }

    try {
      setEnviandoSugerencia(true);
      const coordenadasLink = extraerCoordenadasDeLink(formulario.linkMapa);

      await sugerirLugar({
        nombre: formulario.nombre.trim(),
        categoria: formulario.categoria,
        direccion: formulario.direccion.trim() || undefined,
        ciudad: formulario.ciudad.trim(),
        provincia: formulario.provincia.trim(),
        descripcion: formulario.descripcion.trim() || undefined,
        latitud: coordenadasLink?.latitud ?? coordenadas.latitud,
        longitud: coordenadasLink?.longitud ?? coordenadas.longitud,
        zonaPetFriendly: 'exterior',
      });

      setSugerenciaVisible(false);
      setSnackbar('¡Gracias! Ya aparece como dato de la comunidad. Lo vamos a verificar.');
      recargar();
    } catch (err: any) {
      mostrarAlerta('No se pudo enviar', err?.message || 'Probá de nuevo en unos segundos.');
    } finally {
      setEnviandoSugerencia(false);
    }
  };

  const compartirLugar = async (lugar: LugarPetFriendly) => {
    const texto = `${lugar.nombre} · ${obtenerCategoria(lugar.categoria).etiqueta} pet friendly en ${lugar.ciudad}. Cómo llegar: ${urlComoLlegar(lugar)}`;

    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({ title: lugar.nombre, text: texto, url: urlComoLlegar(lugar) });
        } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(texto);
          setSnackbar('Enlace copiado para compartir.');
        } else {
          mostrarAlerta('Compartir', texto);
        }
        return;
      }

      await Share.share({ message: texto });
    } catch {
      // El usuario canceló el compartir: no hacemos nada.
    }
  };

  const renderLugar = (lugar: LugarPetFriendly) => {
    const categoriaInfo = obtenerCategoria(lugar.categoria);

    return (
      <TouchableOpacity
        key={lugar.id}
        style={estilos.tarjeta}
        activeOpacity={0.8}
        onPress={() => setLugarSeleccionado(lugar)}
      >
        <View style={[estilos.iconoCategoria, { backgroundColor: `${categoriaInfo.color}18` }]}>
          <MaterialIcons name={categoriaInfo.icono} size={24} color={categoriaInfo.color} />
        </View>

        <View style={estilos.tarjetaContenido}>
          <View style={estilos.tarjetaTitulo}>
            <Text style={estilos.nombreLugar} numberOfLines={1}>
              {lugar.nombre}
            </Text>
            {lugar.destacado && (
              <View style={estilos.pastillaDestacado}>
                <Text style={estilos.textoDestacado}>Destacado</Text>
              </View>
            )}
          </View>

          <Text style={estilos.categoriaLugar} numberOfLines={1}>
            {categoriaInfo.etiqueta} · {lugar.ciudad}
          </Text>

          {!!lugar.descripcion && (
            <Text style={estilos.descripcionLugar} numberOfLines={2}>
              {lugar.descripcion}
            </Text>
          )}

          <View style={estilos.filaEtiquetas}>
            {typeof lugar.distanciaKm === 'number' && (
              <View style={estilos.etiquetaDistancia}>
                <MaterialIcons name="near-me" size={12} color={temaApp.colors.primary} />
                <Text style={estilos.textoDistancia}>{formatearDistancia(lugar.distanciaKm)}</Text>
              </View>
            )}
            <View style={[estilos.miniEtiqueta, lugar.verificado ? estilos.etiquetaVerificado : estilos.etiquetaComunidad]}>
              <MaterialIcons
                name={lugar.verificado ? 'verified' : 'groups'}
                size={11}
                color={lugar.verificado ? '#1B5E20' : '#6D4C41'}
              />
              <Text style={[estilos.textoMiniEtiqueta, { color: lugar.verificado ? '#1B5E20' : '#6D4C41' }]}>
                {lugar.verificado ? 'Verificado' : 'Comunidad'}
              </Text>
            </View>
            <View style={estilos.miniEtiquetaNeutra}>
              <MaterialIcons name="pets" size={11} color={temaApp.colors.onSurfaceVariant} />
              <Text style={estilos.textoMiniEtiquetaNeutra}>{etiquetaZona(lugar.zonaPetFriendly)}</Text>
            </View>
          </View>

          <View style={estilos.accionesTarjeta}>
            <TouchableOpacity style={estilos.accionPrincipal} onPress={() => abrirComoLlegar(lugar)}>
              <MaterialIcons name="directions" size={16} color="#FFFFFF" />
              <Text style={estilos.textoAccionPrincipal}>Cómo llegar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={estilos.accionSecundaria} onPress={() => compartirLugar(lugar)}>
              <MaterialIcons name="share" size={16} color={temaApp.colors.primary} />
              <Text style={estilos.textoAccionSecundaria}>Compartir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={estilos.contenedor}>
      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.contenido}
        showsVerticalScrollIndicator={false}
      >
        <View style={estilos.encabezado}>
          <View style={estilos.encabezadoTexto}>
            <Text style={estilos.titulo}>Lugares pet friendly</Text>
            <Text style={estilos.subtitulo}>
              Recomendados para salir con tu mascota
              {ciudadActual ? ` · ${ciudadActual}` : ''}
            </Text>
          </View>
          <TouchableOpacity style={estilos.botonUbicacion} onPress={onSolicitarUbicacion}>
            <MaterialIcons name="my-location" size={18} color={temaApp.colors.primary} />
            <Text style={estilos.textoUbicacion}>Mi ubicación</Text>
          </TouchableOpacity>
        </View>

        <View style={estilos.buscador}>
          <MaterialIcons name="search" size={20} color={temaApp.colors.onSurfaceVariant} />
          <TextInput
            placeholder="Buscar un lugar..."
            placeholderTextColor={temaApp.colors.onSurfaceVariant}
            value={busqueda}
            onChangeText={setBusqueda}
            style={estilos.inputBusqueda}
            mode="flat"
            underlineColor="transparent"
            activeUnderlineColor="transparent"
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda('')} hitSlop={8}>
              <MaterialIcons name="close" size={18} color={temaApp.colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={estilos.filaCategorias}
        >
          {CATEGORIAS.map((item) => {
            const activa = categoria === item.valor;
            return (
              <Chip
                key={item.valor}
                icon={({ size }) => (
                  <MaterialIcons
                    name={item.icono}
                    size={size}
                    color={activa ? '#FFFFFF' : item.color}
                  />
                )}
                selected={activa}
                onPress={() => setCategoria(item.valor)}
                style={[estilos.chipCategoria, activa && estilos.chipCategoriaActiva]}
                textStyle={[estilos.textoChip, activa && estilos.textoChipActivo]}
              >
                {item.etiqueta}
              </Chip>
            );
          })}
        </ScrollView>

        {zonasUnicas.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={estilos.filaZonas}
          >
            <Chip
              selected={!zonaSeleccionada}
              onPress={() => setZonaSeleccionada(null)}
              style={[estilos.chipZona, !zonaSeleccionada && estilos.chipZonaActiva]}
              textStyle={[estilos.textoZona, !zonaSeleccionada && estilos.textoZonaActiva]}
            >
              Todas las zonas
            </Chip>
            {zonasUnicas.map((zona) => {
              const activa =
                zonaSeleccionada?.ciudad === zona.ciudad &&
                zonaSeleccionada?.provincia === zona.provincia;
              return (
                <Chip
                  key={`${zona.provincia}-${zona.ciudad}`}
                  selected={activa}
                  onPress={() => setZonaSeleccionada(zona)}
                  style={[estilos.chipZona, activa && estilos.chipZonaActiva]}
                  textStyle={[estilos.textoZona, activa && estilos.textoZonaActiva]}
                >
                  {zona.ciudad}
                </Chip>
              );
            })}
          </ScrollView>
        )}

        <View style={estilos.filaResultados}>
          <Text style={estilos.contador}>
            {lugaresFiltrados.length} {lugaresFiltrados.length === 1 ? 'lugar' : 'lugares'}
          </Text>
          <TouchableOpacity style={estilos.botonSugerir} onPress={abrirSugerencia}>
            <MaterialIcons name="add-location-alt" size={16} color="#FFFFFF" />
            <Text style={estilos.textoSugerir}>Sugerir lugar</Text>
          </TouchableOpacity>
        </View>

        {cargando ? (
          <View style={estilos.estadoVacio}>
            <ActivityIndicator size="large" color={temaApp.colors.primary} />
            <Text style={estilos.textoEstado}>Buscando lugares cerca tuyo...</Text>
          </View>
        ) : error ? (
          <View style={estilos.estadoVacio}>
            <MaterialIcons name="cloud-off" size={40} color={temaApp.colors.onSurfaceVariant} />
            <Text style={estilos.textoEstado}>{error}</Text>
            <Button mode="outlined" onPress={recargar} style={{ marginTop: espaciado.md }}>
              Reintentar
            </Button>
          </View>
        ) : lugaresFiltrados.length === 0 ? (
          <View style={estilos.estadoVacio}>
            <MaterialIcons name="pets" size={44} color={temaApp.colors.onSurfaceVariant} />
            <Text style={estilos.tituloEstado}>Todavía no hay lugares para este filtro</Text>
            <Text style={estilos.textoEstado}>
              Probá con otra categoría u otra zona, o sumá el primer lugar pet friendly de tu ciudad.
            </Text>
            <Button mode="contained" icon="add-location-alt" onPress={abrirSugerencia} style={{ marginTop: espaciado.md }}>
              Sugerir un lugar
            </Button>
          </View>
        ) : (
          <View style={estilos.lista}>{lugaresFiltrados.map(renderLugar)}</View>
        )}

        <Text style={estilos.aviso}>
          La información puede cambiar. Confirmá con el lugar antes de ir. Si algo no coincide, avisanos.
        </Text>
      </ScrollView>

      <Portal>
        <Dialog visible={!!lugarSeleccionado} onDismiss={() => setLugarSeleccionado(null)} style={estilos.dialogo}>
          <Dialog.Title>{lugarSeleccionado?.nombre}</Dialog.Title>
          <Dialog.Content>
            {lugarSeleccionado && (
              <View style={{ gap: espaciado.sm }}>
                <Text style={estilos.dialogoCategoria}>
                  {obtenerCategoria(lugarSeleccionado.categoria).etiqueta} · {lugarSeleccionado.ciudad},{' '}
                  {lugarSeleccionado.provincia}
                </Text>
                {!!lugarSeleccionado.direccion && (
                  <View style={estilos.dialogoFila}>
                    <MaterialIcons name="place" size={16} color={temaApp.colors.onSurfaceVariant} />
                    <Text style={estilos.dialogoTexto}>{lugarSeleccionado.direccion}</Text>
                  </View>
                )}
                {typeof lugarSeleccionado.distanciaKm === 'number' && (
                  <View style={estilos.dialogoFila}>
                    <MaterialIcons name="near-me" size={16} color={temaApp.colors.onSurfaceVariant} />
                    <Text style={estilos.dialogoTexto}>
                      A {formatearDistancia(lugarSeleccionado.distanciaKm)} de tu ubicación
                    </Text>
                  </View>
                )}
                {!!lugarSeleccionado.descripcion && (
                  <Text style={estilos.dialogoDescripcion}>{lugarSeleccionado.descripcion}</Text>
                )}
                <View style={estilos.filaEtiquetas}>
                  <Chip
                    compact
                    icon={({ size, color }) => <MaterialIcons name="pets" size={size} color={color} />}
                  >
                    {etiquetaZona(lugarSeleccionado.zonaPetFriendly)}
                  </Chip>
                  <Chip
                    compact
                    icon={({ size, color }) => (
                      <MaterialIcons
                        name={lugarSeleccionado.verificado ? 'verified' : 'groups'}
                        size={size}
                        color={color}
                      />
                    )}
                  >
                    {lugarSeleccionado.verificado ? 'Verificado por Indio' : 'Dato de la comunidad'}
                  </Chip>
                  {lugarSeleccionado.requiereCorrea && (
                    <Chip
                      compact
                      icon={({ size, color }) => (
                        <MaterialIcons name="pets" size={size} color={color} />
                      )}
                    >
                      Con correa
                    </Chip>
                  )}
                  {lugarSeleccionado.aguaParaMascotas && (
                    <Chip
                      compact
                      icon={({ size, color }) => (
                        <MaterialIcons name="water-drop" size={size} color={color} />
                      )}
                    >
                      Agua para mascotas
                    </Chip>
                  )}
                </View>
                <Divider />
                <Text style={estilos.dialogoAviso}>
                  Si vas con tu mascota, llevá agua, correa y confirmá las condiciones del lugar.
                </Text>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLugarSeleccionado(null)}>Cerrar</Button>
            <Button
              mode="contained"
              icon="directions"
              onPress={() => {
                if (lugarSeleccionado) abrirComoLlegar(lugarSeleccionado);
              }}
            >
              Cómo llegar
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={sugerenciaVisible} onDismiss={() => setSugerenciaVisible(false)} style={estilos.dialogo}>
          <Dialog.Title>Sugerir un lugar</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={{ maxHeight: 430 }} showsVerticalScrollIndicator={false}>
              <Text style={estilos.dialogoAyuda}>
                Contanos qué lugar pet friendly conocés. Lo revisamos antes de publicarlo.
              </Text>

              <TextInput
                label="Nombre del lugar *"
                value={formulario.nombre}
                onChangeText={(valor) => setFormulario((actual) => ({ ...actual, nombre: valor }))}
                mode="outlined"
                style={estilos.inputFormulario}
              />

              <Text style={estilos.etiquetaFormulario}>Categoría</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.filaCategoriasFormulario}>
                {CATEGORIAS.filter((item) => item.valor !== 'todos').map((item) => (
                  <Chip
                    key={item.valor}
                    icon={({ size, color }) => <MaterialIcons name={item.icono} size={size} color={color} />}
                    selected={formulario.categoria === item.valor}
                    onPress={() =>
                      setFormulario((actual) => ({ ...actual, categoria: item.valor as CategoriaLugar }))
                    }
                    style={estilos.chipFormulario}
                  >
                    {item.etiqueta}
                  </Chip>
                ))}
              </ScrollView>

              <TextInput
                label="Dirección"
                value={formulario.direccion}
                onChangeText={(valor) => setFormulario((actual) => ({ ...actual, direccion: valor }))}
                mode="outlined"
                style={estilos.inputFormulario}
                placeholder="Calle y número"
              />
              <View style={estilos.filaCiudadProvincia}>
                <TextInput
                  label="Ciudad *"
                  value={formulario.ciudad}
                  onChangeText={(valor) => setFormulario((actual) => ({ ...actual, ciudad: valor }))}
                  mode="outlined"
                  style={[estilos.inputFormulario, estilos.inputMitad]}
                />
                <TextInput
                  label="Provincia *"
                  value={formulario.provincia}
                  onChangeText={(valor) => setFormulario((actual) => ({ ...actual, provincia: valor }))}
                  mode="outlined"
                  style={[estilos.inputFormulario, estilos.inputMitad]}
                />
              </View>
              <TextInput
                label="Link de Google Maps (opcional)"
                value={formulario.linkMapa}
                onChangeText={(valor) => setFormulario((actual) => ({ ...actual, linkMapa: valor }))}
                mode="outlined"
                style={estilos.inputFormulario}
                placeholder="Pegá el link del lugar"
                autoCapitalize="none"
              />

              <TextInput
                label="¿Por qué lo recomendás?"
                value={formulario.descripcion}
                onChangeText={(valor) => setFormulario((actual) => ({ ...actual, descripcion: valor }))}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={estilos.inputFormulario}
              />

              <View style={estilos.avisoUbicacion}>
                <MaterialIcons name="info-outline" size={15} color={temaApp.colors.onSurfaceVariant} />
                <Text style={estilos.textoAvisoUbicacion}>
                  Si pegás el link, ubicamos el lugar exacto. Si no, usamos tu ubicación actual como referencia.
                </Text>
              </View>
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSugerenciaVisible(false)} disabled={enviandoSugerencia}>
              Cancelar
            </Button>
            <Button mode="contained" onPress={enviarSugerencia} loading={enviandoSugerencia} disabled={enviandoSugerencia}>
              Enviar sugerencia
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={3500}>
        {snackbar}
      </Snackbar>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
  },
  scroll: {
    flex: 1,
  },
  contenido: {
    paddingHorizontal: espaciado.md,
    paddingBottom: 110,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaciado.md,
    paddingTop: espaciado.md,
  },
  encabezadoTexto: {
    flex: 1,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '800',
    color: temaApp.colors.onSurface,
  },
  subtitulo: {
    fontSize: 13,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: 2,
  },
  botonUbicacion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: temaApp.colors.primary,
    borderRadius: 20,
    paddingHorizontal: espaciado.sm,
    paddingVertical: 6,
  },
  textoUbicacion: {
    fontSize: 12,
    fontWeight: '700',
    color: temaApp.colors.primary,
  },
  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: temaApp.colors.surface,
    borderRadius: 14,
    paddingHorizontal: espaciado.sm,
    marginTop: espaciado.md,
    borderWidth: 1,
    borderColor: temaApp.colors.border,
  },
  inputBusqueda: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 14,
  },
  filaCategorias: {
    gap: 8,
    paddingVertical: espaciado.md,
  },
  chipCategoria: {
    backgroundColor: temaApp.colors.surface,
  },
  chipCategoriaActiva: {
    backgroundColor: temaApp.colors.primary,
  },
  textoChip: {
    fontSize: 12,
    color: temaApp.colors.onSurface,
  },
  textoChipActivo: {
    color: '#FFFFFF',
  },
  filaZonas: {
    gap: 8,
    paddingBottom: espaciado.sm,
  },
  chipZona: {
    backgroundColor: temaApp.colors.surface,
    borderWidth: 1,
    borderColor: temaApp.colors.border,
  },
  chipZonaActiva: {
    backgroundColor: temaApp.colors.accentLight,
    borderColor: temaApp.colors.secondary,
  },
  textoZona: {
    fontSize: 12,
    color: temaApp.colors.onSurface,
  },
  textoZonaActiva: {
    color: temaApp.colors.secondary,
    fontWeight: '700',
  },
  filaResultados: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: espaciado.sm,
    marginBottom: espaciado.sm,
  },
  contador: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    fontWeight: '600',
  },
  botonSugerir: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: temaApp.colors.secondary,
    borderRadius: 18,
    paddingHorizontal: espaciado.md,
    paddingVertical: 7,
  },
  textoSugerir: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lista: {
    gap: espaciado.sm,
  },
  tarjeta: {
    flexDirection: 'row',
    gap: espaciado.md,
    backgroundColor: temaApp.colors.surface,
    borderRadius: 18,
    padding: espaciado.md,
    borderWidth: 1,
    borderColor: temaApp.colors.border,
    ...sombras.pequena,
  },
  iconoCategoria: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tarjetaContenido: {
    flex: 1,
    minWidth: 0,
  },
  tarjetaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
  },
  nombreLugar: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: temaApp.colors.onSurface,
  },
  pastillaDestacado: {
    backgroundColor: temaApp.colors.accentLight,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  textoDestacado: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8D6E00',
    textTransform: 'uppercase',
  },
  categoriaLugar: {
    fontSize: 12,
    color: temaApp.colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  descripcionLugar: {
    fontSize: 12,
    lineHeight: 17,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: 4,
  },
  filaEtiquetas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: espaciado.sm,
  },
  etiquetaDistancia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  textoDistancia: {
    fontSize: 10,
    fontWeight: '800',
    color: temaApp.colors.primary,
  },
  miniEtiqueta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  etiquetaVerificado: {
    backgroundColor: '#E8F5E9',
  },
  etiquetaComunidad: {
    backgroundColor: '#EFEBE9',
  },
  miniEtiquetaNeutra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: temaApp.colors.surfaceVariant,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  textoMiniEtiqueta: {
    fontSize: 10,
    fontWeight: '700',
  },
  textoMiniEtiquetaNeutra: {
    fontSize: 10,
    fontWeight: '600',
    color: temaApp.colors.onSurfaceVariant,
  },
  accionesTarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    marginTop: espaciado.sm,
  },
  accionPrincipal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: temaApp.colors.primary,
    borderRadius: 12,
    paddingHorizontal: espaciado.sm,
    paddingVertical: 6,
  },
  textoAccionPrincipal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  accionSecundaria: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: espaciado.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: temaApp.colors.primary,
  },
  textoAccionSecundaria: {
    fontSize: 11,
    fontWeight: '700',
    color: temaApp.colors.primary,
  },
  estadoVacio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: espaciado.xxl,
    paddingHorizontal: espaciado.lg,
  },
  tituloEstado: {
    fontSize: 16,
    fontWeight: '700',
    color: temaApp.colors.onSurface,
    textAlign: 'center',
    marginTop: espaciado.sm,
  },
  textoEstado: {
    fontSize: 13,
    color: temaApp.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: espaciado.xs,
    lineHeight: 19,
  },
  aviso: {
    fontSize: 10,
    lineHeight: 15,
    color: temaApp.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: espaciado.lg,
    opacity: 0.9,
  },
  dialogo: {
    backgroundColor: temaApp.colors.surface,
    borderRadius: 20,
  },
  dialogoCategoria: {
    fontSize: 12,
    fontWeight: '700',
    color: temaApp.colors.primary,
  },
  dialogoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
  },
  dialogoTexto: {
    fontSize: 13,
    color: temaApp.colors.onSurfaceVariant,
    flex: 1,
  },
  dialogoDescripcion: {
    fontSize: 14,
    lineHeight: 20,
    color: temaApp.colors.onSurface,
  },
  dialogoAviso: {
    fontSize: 12,
    lineHeight: 18,
    color: temaApp.colors.onSurfaceVariant,
  },
  dialogoAyuda: {
    fontSize: 13,
    lineHeight: 19,
    color: temaApp.colors.onSurfaceVariant,
    marginBottom: espaciado.md,
  },
  inputFormulario: {
    marginBottom: espaciado.sm,
    backgroundColor: temaApp.colors.surface,
  },
  etiquetaFormulario: {
    fontSize: 12,
    fontWeight: '700',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.xs,
  },
  filaCategoriasFormulario: {
    gap: 6,
    paddingBottom: espaciado.md,
  },
  chipFormulario: {
    marginRight: 2,
  },
  filaCiudadProvincia: {
    flexDirection: 'row',
    gap: espaciado.sm,
  },
  inputMitad: {
    flex: 1,
  },
  avisoUbicacion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espaciado.xs,
    backgroundColor: temaApp.colors.surfaceVariant,
    borderRadius: 10,
    padding: espaciado.sm,
    marginTop: espaciado.xs,
  },
  textoAvisoUbicacion: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: temaApp.colors.onSurfaceVariant,
  },
});
