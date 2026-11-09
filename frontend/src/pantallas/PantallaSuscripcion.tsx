// Pantalla de Membresía Indio
// Muestra el mes gratis, el estado de la membresía y las renovaciones por Mercado Pago.

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Card, Divider, Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../contextos/ContextoAuth';
import { mostrarAlerta } from '../utilidades/alerta';
import { temaApp, espaciado, sombras } from '../constantes/tema';
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import {
  PeriodoMembresia,
  RenovacionMembresia,
  RespuestaMembresia,
  activarPrueba,
  obtenerMembresia,
  solicitarRenovacion,
} from '../servicios/servicioMembresia';

type SuscripcionNavigationProp = StackNavigationProp<RootStackParamList>;

const fechaLarga = (valor: string) =>
  new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(new Date(valor));

const importe = (valor: number, moneda = 'ARS') =>
  `${moneda} $${new Intl.NumberFormat('es-AR').format(valor)}`;

function abrirEnlace(url: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  Linking.openURL(url).catch(() => {
    mostrarAlerta('No se pudo abrir Mercado Pago', 'Probá de nuevo en unos segundos.');
  });
}

export default function PantallaSuscripcion(): JSX.Element {
  const navigation = useNavigation<SuscripcionNavigationProp>();
  const { estaAutenticado } = useAuth();
  const [datos, setDatos] = useState<RespuestaMembresia | null>(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      setDatos(await obtenerMembresia());
    } catch (error: any) {
      mostrarAlerta('Membresía', error?.message || 'No se pudo cargar la membresía.');
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

  const ejecutar = async (accion: () => Promise<unknown>, mensaje: string) => {
    if (procesando) return;
    try {
      setProcesando(true);
      await accion();
      await cargar();
      mostrarAlerta('Membresía', mensaje);
    } catch (error: any) {
      mostrarAlerta('Membresía', error?.message || 'No se pudo completar la operación.');
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color={temaApp.colors.primary} />
        <Text style={estilos.textoCargando}>Cargando tu membresía...</Text>
      </View>
    );
  }

  const periodo: PeriodoMembresia | null = datos?.periodo || null;
  const vigente = !!periodo && new Date(periodo.fechaFin) > new Date();
  const vencida = !!periodo && !vigente;
  const pendiente = (datos?.renovaciones || []).some((item) => item.estado === 'pendiente');
  const puedeRenovar = !!periodo && !pendiente && new Date(periodo.fechaInicio) <= new Date();

  return (
    <ScrollView style={estilos.contenedor} contentContainerStyle={estilos.contenido}>
      <Card style={estilos.cardPrincipal}>
        <Card.Content>
          <View style={estilos.filaTitulo}>
            <View style={estilos.iconoMembresia}>
              <MaterialIcons name="workspace-premium" size={28} color="#FFFFFF" />
            </View>
            <View style={estilos.textoTitulo}>
              <Text style={estilos.titulo}>Membresía Indio</Text>
              <Text style={estilos.subtitulo}>Primer mes gratis</Text>
            </View>
          </View>

          <View style={estilos.estadoCaja}>
            <Text style={estilos.estadoLabel}>Estado</Text>
            <Text style={estilos.estadoValor}>
              {vigente
                ? `Activa hasta el ${fechaLarga(periodo!.fechaFin)}`
                : vencida
                  ? `Venció el ${fechaLarga(periodo!.fechaFin)}`
                  : 'Mes gratis disponible'}
            </Text>
          </View>

          <Text style={estilos.precio}>
            {importe(datos?.precio || 15900)} <Text style={estilos.precioPeriodo}>/ mes</Text>
          </Text>
          <Text style={estilos.descripcion}>
            Después del primer mes, la renovación se paga por Mercado Pago. El enlace y el estado
            aparecen acá y también te los enviamos por correo.
          </Text>

          {datos?.puedeActivarPrueba && (
            <Button
              mode="contained"
              icon="gift"
              loading={procesando}
              disabled={procesando}
              style={estilos.boton}
              onPress={() =>
                ejecutar(activarPrueba, '¡Listo! Tu mes gratis quedó activado.')
              }
            >
              Activar mi mes gratis
            </Button>
          )}

          {puedeRenovar && (
            <Button
              mode="contained"
              icon="credit-card"
              loading={procesando}
              disabled={procesando}
              style={estilos.boton}
              onPress={() =>
                ejecutar(
                  solicitarRenovacion,
                  'Solicitud enviada. Cuando esté el link de pago, te avisamos por correo.'
                )
              }
            >
              Solicitar enlace de pago
            </Button>
          )}

          {pendiente && (
            <View style={estilos.avisoPendiente}>
              <MaterialIcons name="schedule" size={18} color="#8D6E00" />
              <Text style={estilos.avisoPendienteTexto}>
                Tenés una renovación pendiente. Cuando esté el link de Mercado Pago, aparece abajo.
              </Text>
            </View>
          )}

          {periodo && (
            <Text style={estilos.nota}>
              La membresía se renueva mes a mes. No se debita automáticamente: cada pago se
              confirma manualmente.
            </Text>
          )}
        </Card.Content>
      </Card>

      <Card style={estilos.cardRenovaciones}>
        <Card.Content>
          <Text style={estilos.tituloSeccion}>Renovaciones</Text>
          {(datos?.renovaciones || []).length === 0 ? (
            <Text style={estilos.textoVacio}>Todavía no hay renovaciones.</Text>
          ) : (
            (datos?.renovaciones || []).map((item: RenovacionMembresia, index) => {
              const confirmada = item.estado === 'completada';
              return (
                <View key={item.id}>
                  {index > 0 && <Divider style={estilos.divisor} />}
                  <View style={estilos.filaRenovacion}>
                    <View style={estilos.renovacionInfo}>
                      <Text style={estilos.renovacionMonto}>
                        {importe(item.monto, item.moneda)}
                      </Text>
                      <Text style={estilos.renovacionEstado}>
                        {confirmada
                          ? `Pago confirmado · ${fechaLarga(item.fechaCompra)}`
                          : item.enlacePagoIndio
                            ? 'Pendiente de pago'
                            : 'Enlace solicitado'}
                      </Text>
                    </View>
                    {!confirmada && item.enlacePagoIndio && (
                      <TouchableOpacity
                        style={estilos.botonPagar}
                        onPress={() => abrirEnlace(item.enlacePagoIndio!)}
                      >
                        <MaterialIcons name="open-in-new" size={15} color="#FFFFFF" />
                        <Text style={estilos.botonPagarTexto}>Pagar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </Card.Content>
      </Card>

      <Text style={estilos.pie}>
        ¿Tenés dudas? Escribinos a it360tecnologia@gmail.com o por WhatsApp al +54 9 342 508-9906.
      </Text>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
  },
  contenido: {
    padding: espaciado.md,
    paddingBottom: espaciado.xxl,
    gap: espaciado.md,
  },
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: temaApp.colors.background,
    padding: espaciado.lg,
  },
  textoCargando: {
    marginTop: espaciado.sm,
    color: temaApp.colors.onSurfaceVariant,
  },
  cardPrincipal: {
    backgroundColor: temaApp.colors.surface,
    borderRadius: 18,
    ...sombras.pequena,
  },
  cardRenovaciones: {
    backgroundColor: temaApp.colors.surface,
    borderRadius: 18,
    ...sombras.pequena,
  },
  filaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.md,
    marginBottom: espaciado.md,
  },
  iconoMembresia: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: temaApp.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoTitulo: {
    flex: 1,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '800',
    color: temaApp.colors.onSurface,
  },
  subtitulo: {
    fontSize: 13,
    color: temaApp.colors.onSurfaceVariant,
  },
  estadoCaja: {
    backgroundColor: temaApp.colors.surfaceVariant,
    borderRadius: 12,
    padding: espaciado.md,
    marginBottom: espaciado.md,
  },
  estadoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: temaApp.colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  estadoValor: {
    fontSize: 16,
    fontWeight: '700',
    color: temaApp.colors.primary,
    marginTop: 2,
  },
  precio: {
    fontSize: 28,
    fontWeight: '900',
    color: temaApp.colors.onSurface,
  },
  precioPeriodo: {
    fontSize: 14,
    fontWeight: '500',
    color: temaApp.colors.onSurfaceVariant,
  },
  descripcion: {
    fontSize: 13,
    lineHeight: 19,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: espaciado.xs,
  },
  boton: {
    marginTop: espaciado.md,
    borderRadius: 12,
  },
  avisoPendiente: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espaciado.sm,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: espaciado.sm,
    marginTop: espaciado.md,
  },
  avisoPendienteTexto: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#6D4C00',
  },
  nota: {
    fontSize: 11,
    lineHeight: 16,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: espaciado.md,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: '800',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.sm,
  },
  textoVacio: {
    fontSize: 13,
    color: temaApp.colors.onSurfaceVariant,
    paddingVertical: espaciado.sm,
  },
  filaRenovacion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaciado.sm,
    paddingVertical: espaciado.sm,
  },
  renovacionInfo: {
    flex: 1,
  },
  renovacionMonto: {
    fontSize: 15,
    fontWeight: '700',
    color: temaApp.colors.onSurface,
  },
  renovacionEstado: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: 2,
  },
  botonPagar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: temaApp.colors.primary,
    borderRadius: 12,
    paddingHorizontal: espaciado.sm,
    paddingVertical: 7,
  },
  botonPagarTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  divisor: {
    backgroundColor: temaApp.colors.border,
  },
  pie: {
    fontSize: 12,
    lineHeight: 18,
    color: temaApp.colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: espaciado.md,
  },
});
