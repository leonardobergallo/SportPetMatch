// Pantalla de Funcionalidades de Indio
// Explica qué puede hacer cada usuario y qué está disponible o por venir.

import React from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Chip, Divider, Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { temaApp, espaciado, sombras } from '../constantes/tema';
import { mostrarAlerta } from '../utilidades/alerta';
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';

type FuncionalidadesNavigationProp = StackNavigationProp<RootStackParamList>;

type EstadoFuncionalidad = 'disponible' | 'beta' | 'proximamente';

interface Funcionalidad {
  icono: keyof typeof MaterialIcons.glyphMap;
  titulo: string;
  descripcion: string;
  estado: EstadoFuncionalidad;
  accion?: () => void;
}

function abrirWhatsApp() {
  Linking.openURL(
    'https://wa.me/5493425089906?text=Hola%2C%20escribo%20por%20Indio.'
  ).catch(() => mostrarAlerta('WhatsApp', 'No se pudo abrir WhatsApp.'));
}

export default function PantallaFuncionalidades(): JSX.Element {
  const navigation = useNavigation<FuncionalidadesNavigationProp>();

  const irA = (screen: string, params?: Record<string, unknown>) => {
    (navigation as any).navigate('Principal', { screen, params });
  };

  const funcionalidades: Funcionalidad[] = [
    {
      icono: 'event',
      titulo: 'Eventos pet friendly',
      descripcion: 'Paseos, encuentros y actividades para hacer con tu mascota.',
      estado: 'disponible',
      accion: () => irA('Eventos'),
    },
    {
      icono: 'favorite',
      titulo: 'Matching',
      descripcion: 'Conocé personas con intereses similares y amor por los animales.',
      estado: 'disponible',
      accion: () => irA('Matching'),
    },
    {
      icono: 'chat',
      titulo: 'Chat',
      descripcion: 'Coordiná planes y hablá con tus matches desde la app.',
      estado: 'disponible',
      accion: () => irA('Matches'),
    },
    {
      icono: 'map',
      titulo: 'Mapa de la comunidad',
      descripcion: 'Ubicá personas y eventos cercanos en el mapa.',
      estado: 'disponible',
      accion: () => irA('Mapa'),
    },
    {
      icono: 'place',
      titulo: 'Lugares pet friendly',
      descripcion: 'Cafés, parques y comercios donde tu mascota es bienvenida.',
      estado: 'disponible',
      accion: () => irA('Mapa', { vista: 'lugares' }),
    },
    {
      icono: 'pets',
      titulo: 'Perfil de mascota',
      descripcion: 'Cargá sus datos, fotos y personalidad para que la conozcan.',
      estado: 'disponible',
      accion: () => irA('Mascotas'),
    },
    {
      icono: 'workspace-premium',
      titulo: 'Membresía Indio',
      descripcion: 'Primer mes gratis y renovación mensual por Mercado Pago.',
      estado: 'beta',
      accion: () => navigation.navigate('Suscripcion'),
    },
    {
      icono: 'pets',
      titulo: 'Paseadores',
      descripcion: 'Postulate para pasear mascotas o conocé a los paseadores de la comunidad.',
      estado: 'disponible',
      accion: () => navigation.navigate('Paseadores'),
    },
    {
      icono: 'navigation',
      titulo: 'Paseos con GPS',
      descripcion: 'Solicitá un paseo, seguí el recorrido y recibí el resumen al finalizar.',
      estado: 'proximamente',
      accion: () =>
        mostrarAlerta(
          'Paseos con GPS',
          'Estamos preparando los paseos con seguimiento GPS. Muy pronto vas a poder probarlo.'
        ),
    },
    {
      icono: 'support-agent',
      titulo: 'Ayuda y soporte',
      descripcion: 'Escribinos por WhatsApp o email si necesitás una mano.',
      estado: 'disponible',
      accion: abrirWhatsApp,
    },
  ];

  const etiquetaEstado = (estado: EstadoFuncionalidad) => {
    if (estado === 'beta') return 'Beta';
    if (estado === 'proximamente') return 'Próximamente';
    return 'Disponible';
  };

  return (
    <ScrollView style={estilos.contenedor} contentContainerStyle={estilos.contenido}>
      <Card style={estilos.intro}>
        <Card.Content>
          <Text style={estilos.titulo}>Todo lo que podés hacer en Indio</Text>
          <Text style={estilos.descripcionIntro}>
            Estas son las funcionalidades de tu cuenta. Las que dicen “Próximamente” están en
            desarrollo; las demás ya las podés usar.
          </Text>
        </Card.Content>
      </Card>

      {funcionalidades.map((item, index) => (
        <View key={item.titulo}>
          {index > 0 && <Divider style={estilos.divisor} />}
          <TouchableOpacity
            style={estilos.fila}
            onPress={item.accion}
            activeOpacity={0.8}
          >
            <View style={estilos.iconoCaja}>
              <MaterialIcons name={item.icono} size={24} color={temaApp.colors.primary} />
            </View>
            <View style={estilos.textoCaja}>
              <View style={estilos.tituloFila}>
                <Text style={estilos.tituloItem}>{item.titulo}</Text>
                <Chip
                  compact
                  style={[
                    estilos.chipEstado,
                    item.estado === 'proximamente' && estilos.chipProximamente,
                  ]}
                  textStyle={[
                    estilos.chipTexto,
                    item.estado === 'proximamente' && estilos.chipTextoProximamente,
                  ]}
                >
                  {etiquetaEstado(item.estado)}
                </Chip>
              </View>
              <Text style={estilos.descripcionItem}>{item.descripcion}</Text>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={22}
              color={temaApp.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>
      ))}

      <Text style={estilos.pie}>
        ¿Falta algo que te gustaría ver? Escribinos a it360tecnologia@gmail.com.
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
  },
  intro: {
    backgroundColor: temaApp.colors.primary,
    borderRadius: 18,
    marginBottom: espaciado.md,
    ...sombras.pequena,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  descripcionIntro: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.9)',
    marginTop: espaciado.xs,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    paddingVertical: espaciado.md,
  },
  iconoCaja: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: temaApp.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoCaja: {
    flex: 1,
  },
  tituloFila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaciado.xs,
  },
  tituloItem: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: temaApp.colors.onSurface,
  },
  descripcionItem: {
    fontSize: 12,
    lineHeight: 17,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: 2,
  },
  chipEstado: {
    backgroundColor: '#E8F5E9',
    height: 24,
  },
  chipProximamente: {
    backgroundColor: '#FFF8E1',
  },
  chipTexto: {
    fontSize: 9,
    color: '#1B5E20',
    fontWeight: '700',
  },
  chipTextoProximamente: {
    color: '#8D6E00',
  },
  divisor: {
    backgroundColor: temaApp.colors.border,
  },
  pie: {
    fontSize: 11,
    lineHeight: 16,
    color: temaApp.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: espaciado.lg,
  },
});
