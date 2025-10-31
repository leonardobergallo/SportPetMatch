// Pantalla Dashboard - SportPetMatch
// Dashboard principal con datos del usuario

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView,
  Alert 
} from 'react-native';
import { 
  Text, 
  Card, 
  Button,
  Avatar,
  Chip,
  Divider
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

// Importar tema
import { temaApp, espaciado } from '../constantes/tema';

interface DashboardData {
  usuario: {
    id: string;
    nombre: string;
    avatar: string;
    esPremium: boolean;
  };
  estadisticas: {
    eventosParticipados: number;
    mascotasRegistradas: number;
    matchesRealizados: number;
    puntosGamificacion: number;
  };
  eventosRecientes: Array<{
    id: string;
    titulo: string;
    fecha: string;
    ubicacion: string;
    participantes: number;
  }>;
  mascotasFavoritas: Array<{
    id: string;
    nombre: string;
    tipo: string;
    raza: string;
    foto: string;
  }>;
}

export default function PantallaDashboard(): JSX.Element {
  const [datos, setDatos] = useState<DashboardData | null>(null);
  const [cargando, setCargando] = useState(true);

  // Cargar datos del dashboard
  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      // TODO: Reemplazar con llamada real a la API
      const response = await fetch('http://localhost:3000/api/auth/dashboard');
      const result = await response.json();
      
      if (result.success) {
        setDatos(result.data);
      } else {
        Alert.alert('Error', 'No se pudieron cargar los datos');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión');
      console.error('Error cargando dashboard:', error);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <View style={estilos.contenedorCarga}>
        <Text>Cargando dashboard...</Text>
      </View>
    );
  }

  if (!datos) {
    return (
      <View style={estilos.contenedorCarga}>
        <Text>Error cargando datos</Text>
        <Button onPress={cargarDashboard}>Reintentar</Button>
      </View>
    );
  }

  return (
    <ScrollView style={estilos.contenedor}>
      {/* Header del Usuario */}
      <Card style={estilos.tarjetaUsuario}>
        <Card.Content style={estilos.contenidoUsuario}>
          <Avatar.Image 
            size={60} 
            source={{ uri: datos.usuario.avatar }} 
          />
          <View style={estilos.infoUsuario}>
            <Text variant="headlineSmall">{datos.usuario.nombre}</Text>
            {datos.usuario.esPremium && (
              <Chip icon="crown" compact>Premium</Chip>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Estadísticas */}
      <Card style={estilos.tarjeta}>
        <Card.Title title="📊 Estadísticas" />
        <Card.Content>
          <View style={estilos.estadisticas}>
            <EstadisticaItem 
              icono="event" 
              valor={datos.estadisticas.eventosParticipados} 
              etiqueta="Eventos" 
            />
            <EstadisticaItem 
              icono="pets" 
              valor={datos.estadisticas.mascotasRegistradas} 
              etiqueta="Mascotas" 
            />
            <EstadisticaItem 
              icono="favorite" 
              valor={datos.estadisticas.matchesRealizados} 
              etiqueta="Matches" 
            />
            <EstadisticaItem 
              icono="star" 
              valor={datos.estadisticas.puntosGamificacion} 
              etiqueta="Puntos" 
            />
          </View>
        </Card.Content>
      </Card>

      {/* Eventos Recientes */}
      <Card style={estilos.tarjeta}>
        <Card.Title title="🏃‍♂️ Eventos Recientes" />
        <Card.Content>
          {datos.eventosRecientes.map((evento, index) => (
            <View key={evento.id}>
              <View style={estilos.itemEvento}>
                <Text variant="titleMedium">{evento.titulo}</Text>
                <Text variant="bodySmall">📍 {evento.ubicacion}</Text>
                <Text variant="bodySmall">👥 {evento.participantes} participantes</Text>
              </View>
              {index < datos.eventosRecientes.length - 1 && <Divider style={estilos.divisor} />}
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Mascotas Favoritas */}
      <Card style={estilos.tarjeta}>
        <Card.Title title="🐾 Mascotas Populares" />
        <Card.Content>
          {datos.mascotasFavoritas.map((mascota, index) => (
            <View key={mascota.id}>
              <View style={estilos.itemMascota}>
                <Avatar.Image size={40} source={{ uri: mascota.foto }} />
                <View style={estilos.infoMascota}>
                  <Text variant="titleSmall">{mascota.nombre}</Text>
                  <Text variant="bodySmall">{mascota.raza}</Text>
                </View>
              </View>
              {index < datos.mascotasFavoritas.length - 1 && <Divider style={estilos.divisor} />}
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

// Componente para mostrar estadísticas
function EstadisticaItem({ icono, valor, etiqueta }: { 
  icono: string; 
  valor: number; 
  etiqueta: string; 
}) {
  return (
    <View style={estilos.estadisticaItem}>
      <MaterialIcons name={icono as any} size={24} color={temaApp.colors.primary} />
      <Text variant="headlineSmall">{valor}</Text>
      <Text variant="bodySmall">{etiqueta}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
    padding: espaciado.md,
  },
  contenedorCarga: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: temaApp.colors.background,
  },
  tarjeta: {
    marginBottom: espaciado.md,
    elevation: 2,
  },
  tarjetaUsuario: {
    marginBottom: espaciado.md,
    elevation: 3,
  },
  contenidoUsuario: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoUsuario: {
    marginLeft: espaciado.md,
    flex: 1,
  },
  estadisticas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  estadisticaItem: {
    alignItems: 'center',
  },
  itemEvento: {
    paddingVertical: espaciado.sm,
  },
  itemMascota: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: espaciado.sm,
  },
  infoMascota: {
    marginLeft: espaciado.md,
  },
  divisor: {
    marginVertical: espaciado.sm,
  },
});