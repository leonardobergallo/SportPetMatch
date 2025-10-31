// Pantalla de Matches de SportPetMatch
// Conversaciones con usuarios que han hecho match

import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Alert 
} from 'react-native';
import { 
  Text, 
  Card, 
  Avatar, 
  Badge,
  Searchbar,
  FAB
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { temaApp, espaciado, sombras } from '../constantes/tema';

// Tipo para la conversación
interface Conversacion {
  id: string;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    foto?: string;
    edad: number;
    ciudad: string;
  };
  ultimoMensaje: {
    texto: string;
    fecha: Date;
    leido: boolean;
  };
  esNuevoMatch: boolean;
  mascota?: {
    nombre: string;
    raza: string;
    foto?: string;
  };
  distancia: number;
}

// Datos mock de conversaciones
const conversacionesMock: Conversacion[] = [
  {
    id: '1',
    usuario: {
      id: 'u1',
      nombre: 'Ana',
      apellido: 'García',
      foto: 'https://images.unsplash.com/photo-1494790108755-2616b612b1a?w=150&h=150&fit=crop&crop=face',
      edad: 28,
      ciudad: 'Palermo'
    },
    ultimoMensaje: {
      texto: '¡Hola! Me encanta tu golden retriever 🐕',
      fecha: new Date('2024-01-15T10:30:00'),
      leido: false
    },
    esNuevoMatch: true,
    mascota: {
      nombre: 'Luna',
      raza: 'Labrador',
      foto: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop'
    },
    distancia: 1.2
  },
  {
    id: '2',
    usuario: {
      id: 'u2',
      nombre: 'Carlos',
      apellido: 'Mendoza',
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      edad: 32,
      ciudad: 'Belgrano'
    },
    ultimoMensaje: {
      texto: '¿Vamos al parque mañana?',
      fecha: new Date('2024-01-15T09:15:00'),
      leido: true
    },
    esNuevoMatch: false,
    mascota: {
      nombre: 'Max',
      raza: 'Border Collie',
      foto: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=150&h=150&fit=crop'
    },
    distancia: 2.8
  },
  {
    id: '3',
    usuario: {
      id: 'u3',
      nombre: 'María',
      apellido: 'López',
      foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      edad: 25,
      ciudad: 'Recoleta'
    },
    ultimoMensaje: {
      texto: 'Perfecto! Nos vemos en el evento de running',
      fecha: new Date('2024-01-14T18:45:00'),
      leido: true
    },
    esNuevoMatch: false,
    mascota: {
      nombre: 'Bella',
      raza: 'Beagle',
      foto: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=150&h=150&fit=crop'
    },
    distancia: 0.8
  },
  {
    id: '4',
    usuario: {
      id: 'u4',
      nombre: 'Diego',
      apellido: 'Fernández',
      foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      edad: 30,
      ciudad: 'San Telmo'
    },
    ultimoMensaje: {
      texto: '¡Nuevo match! 🎉',
      fecha: new Date('2024-01-15T11:00:00'),
      leido: false
    },
    esNuevoMatch: true,
    mascota: {
      nombre: 'Rocky',
      raza: 'Bulldog Francés',
      foto: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=150&h=150&fit=crop'
    },
    distancia: 3.5
  }
];

export default function PantallaMatches(): JSX.Element {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>(conversacionesMock);
  const [busqueda, setBusqueda] = useState('');

  // Filtrar conversaciones por búsqueda
  const conversacionesFiltradas = conversaciones.filter(conv =>
    conv.usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    conv.usuario.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
    conv.mascota?.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Formatear tiempo relativo
  const formatearTiempo = (fecha: Date): string => {
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `${minutos}m`;
    if (horas < 24) return `${horas}h`;
    return `${dias}d`;
  };

  // Abrir chat con usuario
  const abrirChat = (conversacion: Conversacion) => {
    Alert.alert(
      'Chat',
      `Abriendo conversación con ${conversacion.usuario.nombre}`,
      [{ text: 'OK' }]
    );
  };

  // Renderizar elemento de conversación
  const renderizarConversacion = ({ item }: { item: Conversacion }) => (
    <TouchableOpacity
      style={estilos.conversacionItem}
      onPress={() => abrirChat(item)}
      activeOpacity={0.7}
    >
      <Card style={[
        estilos.tarjetaConversacion,
        item.esNuevoMatch && estilos.nuevoMatch
      ]}>
        <Card.Content style={estilos.contenidoConversacion}>
          {/* Avatar del usuario */}
          <View style={estilos.avatarContainer}>
            {item.usuario.foto ? (
              <Avatar.Image 
                size={60} 
                source={{ uri: item.usuario.foto }}
              />
            ) : (
              <Avatar.Text 
                size={60} 
                label={`${item.usuario.nombre[0]}${item.usuario.apellido[0]}`}
              />
            )}
            {item.esNuevoMatch && (
              <Badge style={estilos.badgeNuevo}>NUEVO</Badge>
            )}
          </View>

          {/* Información de la conversación */}
          <View style={estilos.infoConversacion}>
            <View style={estilos.headerConversacion}>
              <Text variant="titleMedium" style={estilos.nombreUsuario}>
                {item.usuario.nombre} {item.usuario.apellido}
              </Text>
              <Text variant="bodySmall" style={estilos.tiempo}>
                {formatearTiempo(item.ultimoMensaje.fecha)}
              </Text>
            </View>

            <View style={estilos.detallesUsuario}>
              <Text variant="bodySmall" style={estilos.ubicacion}>
                📍 {item.usuario.ciudad} • {item.distancia}km
              </Text>
              {item.mascota && (
                <Text variant="bodySmall" style={estilos.mascota}>
                  🐕 {item.mascota.nombre} ({item.mascota.raza})
                </Text>
              )}
            </View>

            <View style={estilos.ultimoMensajeContainer}>
              <Text 
                variant="bodyMedium" 
                style={[
                  estilos.ultimoMensaje,
                  !item.ultimoMensaje.leido && estilos.mensajeNoLeido
                ]}
                numberOfLines={1}
              >
                {item.ultimoMensaje.texto}
              </Text>
              {!item.ultimoMensaje.leido && (
                <View style={estilos.indicadorNoLeido} />
              )}
            </View>
          </View>

          {/* Foto de la mascota */}
          {item.mascota?.foto && (
            <View style={estilos.fotoMascotaContainer}>
              <Image 
                source={{ uri: item.mascota.foto }}
                style={estilos.fotoMascota}
              />
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={estilos.contenedor}>
      {/* Barra de búsqueda */}
      <Searchbar
        placeholder="Buscar conversaciones..."
        onChangeText={setBusqueda}
        value={busqueda}
        style={estilos.barraBusqueda}
        icon="search"
        clearIcon="close"
      />

      {/* Lista de conversaciones */}
      <FlatList
        data={conversacionesFiltradas}
        renderItem={renderizarConversacion}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={estilos.listaConversaciones}
        ListEmptyComponent={
          <View style={estilos.contenedorVacio}>
            <MaterialIcons 
              name="chat-bubble-outline" 
              size={80} 
              color={temaApp.colors.onSurfaceVariant} 
            />
            <Text variant="headlineSmall" style={estilos.textoVacio}>
              Sin conversaciones
            </Text>
            <Text variant="bodyMedium" style={estilos.subtextoVacio}>
              ¡Comienza a hacer matches para chatear!
            </Text>
          </View>
        }
      />

      {/* FAB para ir a matching */}
      <FAB
        icon="favorite"
        style={estilos.fab}
        onPress={() => Alert.alert('Matching', 'Ir a la pantalla de matching')}
        label="Encontrar matches"
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
  },
  barraBusqueda: {
    margin: espaciado.md,
    elevation: 2,
  },
  listaConversaciones: {
    paddingHorizontal: espaciado.md,
    paddingBottom: 100, // Espacio para el FAB
  },
  conversacionItem: {
    marginBottom: espaciado.sm,
  },
  tarjetaConversacion: {
    ...sombras.media,
    borderRadius: 16,
  },
  nuevoMatch: {
    borderWidth: 2,
    borderColor: temaApp.colors.primary,
  },
  contenidoConversacion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: espaciado.md,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: espaciado.md,
  },
  badgeNuevo: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: temaApp.colors.primary,
  },
  infoConversacion: {
    flex: 1,
    marginRight: espaciado.sm,
  },
  headerConversacion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: espaciado.xs,
  },
  nombreUsuario: {
    fontWeight: '600',
    color: temaApp.colors.onSurface,
  },
  tiempo: {
    color: temaApp.colors.onSurfaceVariant,
  },
  detallesUsuario: {
    marginBottom: espaciado.xs,
  },
  ubicacion: {
    color: temaApp.colors.onSurfaceVariant,
    marginBottom: 2,
  },
  mascota: {
    color: temaApp.colors.primary,
  },
  ultimoMensajeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ultimoMensaje: {
    flex: 1,
    color: temaApp.colors.onSurfaceVariant,
  },
  mensajeNoLeido: {
    fontWeight: '600',
    color: temaApp.colors.onSurface,
  },
  indicadorNoLeido: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: temaApp.colors.primary,
    marginLeft: espaciado.xs,
  },
  fotoMascotaContainer: {
    marginLeft: espaciado.sm,
  },
  fotoMascota: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contenedorVacio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: espaciado.xl * 2,
  },
  textoVacio: {
    marginTop: espaciado.lg,
    color: temaApp.colors.onSurfaceVariant,
  },
  subtextoVacio: {
    marginTop: espaciado.sm,
    color: temaApp.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: espaciado.lg,
    bottom: espaciado.lg,
    backgroundColor: temaApp.colors.primary,
  },
});
