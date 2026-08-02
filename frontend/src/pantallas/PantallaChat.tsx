// Pantalla de Chat de SportPetMatch
// Chat individual con un usuario que hizo match

import React, { useState, useEffect, useRef } from 'react';
import {
  useNavigation,
  useRoute,
  RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Avatar,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

// Importar servicios y tipos
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import { temaApp, espaciado, sombras } from '../constantes/tema';
import { useAuth } from '../contextos/ContextoAuth';
import {
  obtenerMensajes,
  enviarMensaje,
  marcarComoLeido,
  Mensaje,
} from '../servicios/servicioMensajes';
import { obtenerMisMatches, Match } from '../servicios/servicioMatches';
import { mostrarAlerta } from '@/utilidades/alerta';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;

/**
 * Pantalla de Chat - Conversación individual con un match
 */
export default function PantallaChat(): JSX.Element {
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const route = useRoute<ChatScreenRouteProp>();
  const { matchId } = route.params;
  const { usuario } = useAuth();

  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [refrescando, setRefrescando] = useState(false);
  const [match, setMatch] = useState<Match | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Cargar mensajes y información del match
  useEffect(() => {
    cargarDatos();
  }, [matchId]);

  // Auto-refrescar mensajes cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (!cargando && !refrescando) {
        cargarMensajes();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [matchId, cargando, refrescando]);

  // Marcar mensajes como leídos cuando se abre el chat
  useEffect(() => {
    if (mensajes.length > 0 && usuario) {
      marcarMensajesComoLeidos();
    }
  }, [mensajes, usuario]);

  /**
   * Cargar datos del chat (match y mensajes)
   */
  const cargarDatos = async () => {
    try {
      setCargando(true);
      await Promise.all([cargarMatch(), cargarMensajes()]);
    } catch (error) {
      console.error('Error cargando datos del chat:', error);
      mostrarAlerta('Error', 'No se pudieron cargar los datos del chat');
    } finally {
      setCargando(false);
    }
  };

  /**
   * Cargar información del match
   */
  const cargarMatch = async () => {
    try {
      const matches = await obtenerMisMatches();
      const matchEncontrado = matches.find(m => m.id === matchId);
      if (matchEncontrado) {
        setMatch(matchEncontrado);
        // Actualizar título de la navegación
        const otroUsuario = matchEncontrado.usuarioId === usuario?.id
          ? matchEncontrado.usuarioMatch
          : matchEncontrado.usuario;
        navigation.setOptions({
          title: otroUsuario.nombre || 'Chat',
        });
      }
    } catch (error) {
      console.error('Error cargando match:', error);
    }
  };

  /**
   * Cargar mensajes del chat
   */
  const cargarMensajes = async () => {
    try {
      const mensajesData = await obtenerMensajes(matchId);
      setMensajes(mensajesData);
      // Scroll al final cuando se cargan nuevos mensajes
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
      if (!refrescando) {
        mostrarAlerta('Error', 'No se pudieron cargar los mensajes');
      }
    }
  };

  /**
   * Enviar un mensaje
   */
  const manejarEnviarMensaje = async () => {
    if (!nuevoMensaje.trim() || enviando) {
      return;
    }

    const contenido = nuevoMensaje.trim();
    setNuevoMensaje('');
    setEnviando(true);

    try {
      const mensajeEnviado = await enviarMensaje({
        matchId,
        contenido,
        tipo: 'texto',
      });

      // Agregar mensaje a la lista localmente (optimistic update)
      setMensajes(prev => [...prev, mensajeEnviado]);

      // Scroll al final
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Recargar mensajes para asegurar sincronización
      await cargarMensajes();
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      mostrarAlerta('Error', 'No se pudo enviar el mensaje');
      setNuevoMensaje(contenido); // Restaurar mensaje
    } finally {
      setEnviando(false);
    }
  };

  /**
   * Marcar mensajes como leídos
   */
  const marcarMensajesComoLeidos = async () => {
    try {
      await marcarComoLeido(matchId);
    } catch (error) {
      console.error('Error marcando mensajes como leídos:', error);
    }
  };

  /**
   * Refrescar mensajes manualmente
   */
  const manejarRefrescar = async () => {
    setRefrescando(true);
    await cargarMensajes();
    setRefrescando(false);
  };

  /**
   * Formatear fecha del mensaje
   */
  const formatearFecha = (fecha: string): string => {
    const fechaObj = new Date(fecha);
    const ahora = new Date();
    const diferencia = ahora.getTime() - fechaObj.getTime();
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 1) {
      return 'Ahora';
    } else if (minutos < 60) {
      return `Hace ${minutos} min`;
    } else if (horas < 24) {
      return `Hace ${horas} h`;
    } else if (dias < 7) {
      return `Hace ${dias} d`;
    } else {
      return fechaObj.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  /**
   * Renderizar un mensaje
   */
  const renderizarMensaje = ({ item }: { item: Mensaje }) => {
    const esMio = item.usuario.id === usuario?.id;
    const esConsecutivo = mensajes.length > 0 && 
      mensajes[mensajes.indexOf(item) - 1]?.usuario.id === item.usuario.id;

    return (
      <View
        style={[
          estilos.contenedorMensaje,
          esMio ? estilos.mensajeMio : estilos.mensajeOtro,
        ]}
      >
        {!esMio && !esConsecutivo && (
          <Avatar.Image
            size={32}
            source={
              item.usuario.avatar
                ? { uri: item.usuario.avatar }
                : require('../../assets/placeholder-user.jpg')
            }
            style={estilos.avatar}
          />
        )}
        <View
          style={[
            estilos.burbujaMensaje,
            esMio ? estilos.burbujaMensajeMio : estilos.burbujaMensajeOtro,
          ]}
        >
          {!esMio && !esConsecutivo && (
            <Text style={estilos.nombreUsuario}>{item.usuario.nombre}</Text>
          )}
          <Text
            style={[
              estilos.textoMensaje,
              esMio ? estilos.textoMensajeMio : estilos.textoMensajeOtro,
            ]}
          >
            {item.contenido}
          </Text>
          <Text
            style={[
              estilos.fechaMensaje,
              esMio ? estilos.fechaMensajeMio : estilos.fechaMensajeOtro,
            ]}
          >
            {formatearFecha(item.createdAt)}
            {esMio && item.isLeido && ' ✓✓'}
          </Text>
        </View>
      </View>
    );
  };

  if (cargando) {
    return (
      <View style={estilos.contenedorCarga}>
        <ActivityIndicator size="large" color={temaApp.colors.primary} />
        <Text style={estilos.textoCarga}>Cargando chat...</Text>
      </View>
    );
  }

  if (!match) {
    return (
      <View style={estilos.contenedorCarga}>
        <Text style={estilos.textoCarga}>Match no encontrado</Text>
      </View>
    );
  }

  const otroUsuario = match.usuarioId === usuario?.id
    ? match.usuarioMatch
    : match.usuario;

  return (
    <KeyboardAvoidingView
      style={estilos.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={mensajes}
        renderItem={renderizarMensaje}
        keyExtractor={(item) => item.id}
        style={estilos.listaMensajes}
        contentContainerStyle={estilos.contenidoLista}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={manejarRefrescar}
            colors={[temaApp.colors.primary]}
          />
        }
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
        ListEmptyComponent={
          <View style={estilos.contenedorVacio}>
            <MaterialIcons
              name="chat-bubble-outline"
              size={64}
              color={temaApp.colors.onSurfaceVariant}
            />
            <Text style={estilos.textoVacio}>
              No hay mensajes todavía
            </Text>
            <Text style={estilos.textoVacioSecundario}>
              Envía un mensaje para comenzar la conversación
            </Text>
          </View>
        }
      />

      <View style={estilos.contenedorInput}>
        <TextInput
          style={estilos.input}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={temaApp.colors.onSurfaceVariant}
          value={nuevoMensaje}
          onChangeText={setNuevoMensaje}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            estilos.botonEnviar,
            (!nuevoMensaje.trim() || enviando) && estilos.botonEnviarDeshabilitado,
          ]}
          onPress={manejarEnviarMensaje}
          disabled={!nuevoMensaje.trim() || enviando}
        >
          {enviando ? (
            <ActivityIndicator size="small" color={temaApp.colors.onPrimary} />
          ) : (
            <MaterialIcons
              name="send"
              size={24}
              color={
                nuevoMensaje.trim() && !enviando
                  ? temaApp.colors.onPrimary
                  : temaApp.colors.onSurfaceVariant
              }
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
  },
  contenedorCarga: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: temaApp.colors.background,
  },
  textoCarga: {
    marginTop: espaciado.md,
    color: temaApp.colors.onSurfaceVariant,
  },
  listaMensajes: {
    flex: 1,
  },
  contenidoLista: {
    padding: espaciado.md,
    paddingBottom: espaciado.lg,
  },
  contenedorMensaje: {
    flexDirection: 'row',
    marginBottom: espaciado.sm,
    alignItems: 'flex-end',
  },
  mensajeMio: {
    justifyContent: 'flex-end',
  },
  mensajeOtro: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginRight: espaciado.xs,
    marginBottom: 2,
  },
  burbujaMensaje: {
    maxWidth: '75%',
    padding: espaciado.md,
    borderRadius: 16,
    ...sombras.sm,
  },
  burbujaMensajeMio: {
    backgroundColor: temaApp.colors.primary,
    borderBottomRightRadius: 4,
  },
  burbujaMensajeOtro: {
    backgroundColor: temaApp.colors.surfaceVariant,
    borderBottomLeftRadius: 4,
  },
  nombreUsuario: {
    fontSize: 12,
    fontWeight: '600',
    color: temaApp.colors.onSurfaceVariant,
    marginBottom: espaciado.xs,
  },
  textoMensaje: {
    fontSize: 16,
    lineHeight: 20,
  },
  textoMensajeMio: {
    color: temaApp.colors.onPrimary,
  },
  textoMensajeOtro: {
    color: temaApp.colors.onSurface,
  },
  fechaMensaje: {
    fontSize: 11,
    marginTop: espaciado.xs,
  },
  fechaMensajeMio: {
    color: temaApp.colors.onPrimary + 'CC',
  },
  fechaMensajeOtro: {
    color: temaApp.colors.onSurfaceVariant,
  },
  contenedorInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: espaciado.md,
    paddingBottom: Platform.OS === 'ios' ? espaciado.lg : espaciado.md,
    backgroundColor: temaApp.colors.surface,
    borderTopWidth: 1,
    borderTopColor: temaApp.colors.outline,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: temaApp.colors.surfaceVariant,
    borderRadius: 20,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
    marginRight: espaciado.sm,
    fontSize: 16,
    color: temaApp.colors.onSurface,
  },
  botonEnviar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: temaApp.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...sombras.sm,
  },
  botonEnviarDeshabilitado: {
    backgroundColor: temaApp.colors.surfaceVariant,
  },
  contenedorVacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: espaciado.xxxl,
  },
  textoVacio: {
    fontSize: 18,
    fontWeight: '600',
    color: temaApp.colors.onSurfaceVariant,
    marginTop: espaciado.md,
  },
  textoVacioSecundario: {
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: espaciado.xs,
    textAlign: 'center',
  },
});

