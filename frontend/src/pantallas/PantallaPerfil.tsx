// Pantalla de Perfil de SportPetMatch
// Perfil del usuario y configuración

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, LinearGradient } from 'react-native';
import { Text, Card, Avatar, Switch, Divider, List } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { temaApp, espaciado, sombras } from '../constantes/tema';
import { useAuth } from '../contextos/ContextoAuth';
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import { Button } from '@/components/ui/button';

// Importar componente Card si existe
// import { Card, CardContent } from '@/components/ui/card';

type PerfilScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function PantallaPerfil(): JSX.Element {
  const navigation = useNavigation<PerfilScreenNavigationProp>();
  const { usuario, cerrarSesion } = useAuth();
  const [notificacionesHabilitadas, setNotificacionesHabilitadas] = useState(true);
  const [modoOscuro, setModoOscuro] = useState(false);

  return (
    <ScrollView 
      style={estilos.contenedor}
      contentContainerStyle={estilos.scrollContent}
      showsVerticalScrollIndicator={true}
    >
      {/* Header de Perfil */}
      <View style={estilos.profileHeader}>
        <View style={estilos.banner}>
          {/* Banner gradient */}
        </View>
        <View style={estilos.profileInfo}>
          <View style={estilos.avatarContainer}>
            {usuario?.foto ? (
              <Image source={{ uri: usuario.foto }} style={estilos.avatar} />
            ) : (
              <Avatar.Text 
                size={80} 
                label={usuario?.nombre?.charAt(0).toUpperCase() || 'U'} 
                style={estilos.avatar}
              />
            )}
          </View>
          <Text style={estilos.nombreUsuario}>
            {usuario?.nombre || 'Usuario'} {usuario?.apellido || ''}
          </Text>
          <Text style={estilos.emailUsuario}>{usuario?.email || 'email@example.com'}</Text>
          <View style={estilos.ubicacionContainer}>
            <MaterialIcons name="place" size={16} color={temaApp.colors.onSurfaceVariant} />
            <Text style={estilos.ubicacion}>
              {usuario?.ciudad || 'Santa Fe'}, {usuario?.provincia || 'Santa Fe'}
            </Text>
          </View>
        </View>
        
        {/* Botones de acción */}
        <View style={estilos.accionesContainer}>
          <Button 
            variant="secondary" 
            onPress={() => navigation.navigate('EditarPerfil')}
            style={estilos.botonAccion}
          >
            <MaterialIcons name="edit" size={18} color="#FFFFFF" />
            <Text style={estilos.botonTextoAccion}>Editar Perfil</Text>
          </Button>
          <TouchableOpacity 
            style={estilos.botonVerMascota}
            onPress={() => navigation.navigate('Mascotas')}
          >
            <Text style={estilos.botonTextoVerMascota}>Ver Mis Mascotas</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Configuración */}
      <Card style={estilos.cardConfig}>
        <Card.Content>
          <Text style={estilos.seccionTitulo}>Configuración</Text>
          
          <TouchableOpacity style={estilos.configItem}>
            <MaterialIcons name="notifications" size={24} color={temaApp.colors.primary} />
            <View style={estilos.configContent}>
              <Text style={estilos.configLabel}>Notificaciones</Text>
              <Text style={estilos.configDescription}>Recibir alertas de matches y eventos</Text>
            </View>
            <Switch
              value={notificacionesHabilitadas}
              onValueChange={setNotificacionesHabilitadas}
              color={temaApp.colors.primary}
            />
          </TouchableOpacity>

          <Divider style={estilos.divider} />

          <TouchableOpacity style={estilos.configItem}>
            <MaterialIcons name="dark-mode" size={24} color={temaApp.colors.primary} />
            <View style={estilos.configContent}>
              <Text style={estilos.configLabel}>Modo Oscuro</Text>
              <Text style={estilos.configDescription}>Cambiar tema de la aplicación</Text>
            </View>
            <Switch
              value={modoOscuro}
              onValueChange={setModoOscuro}
              color={temaApp.colors.primary}
            />
          </TouchableOpacity>

          <Divider style={estilos.divider} />

          <TouchableOpacity 
            style={estilos.configItem}
            onPress={() => navigation.navigate('Configuracion')}
          >
            <MaterialIcons name="settings" size={24} color={temaApp.colors.primary} />
            <View style={estilos.configContent}>
              <Text style={estilos.configLabel}>Configuración</Text>
              <Text style={estilos.configDescription}>Ajustes y preferencias</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={temaApp.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* Estadísticas */}
      <Card style={estilos.cardStats}>
        <Card.Content>
          <Text style={estilos.seccionTitulo}>Estadísticas</Text>
          <View style={estilos.statsGrid}>
            <View style={estilos.statItem}>
              <MaterialIcons name="event" size={32} color={temaApp.colors.primary} />
              <Text style={estilos.statValue}>5</Text>
              <Text style={estilos.statLabel}>Eventos</Text>
            </View>
            <View style={estilos.statItem}>
              <MaterialIcons name="favorite" size={32} color={temaApp.colors.like} />
              <Text style={estilos.statValue}>12</Text>
              <Text style={estilos.statLabel}>Matches</Text>
            </View>
            <View style={estilos.statItem}>
              <MaterialIcons name="pets" size={32} color={temaApp.colors.accent} />
              <Text style={estilos.statValue}>3</Text>
              <Text style={estilos.statLabel}>Mascotas</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Cerrar Sesión */}
      <TouchableOpacity 
        style={estilos.cerrarSesion}
        onPress={async () => {
          await cerrarSesion();
        }}
      >
        <MaterialIcons name="logout" size={24} color={temaApp.colors.error} />
        <Text style={estilos.cerrarSesionTexto}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
  },
  scrollContent: {
    paddingBottom: 150, // Espacio al final para asegurar scroll completo
    flexGrow: 1,
    minHeight: '100%', // Asegura que el contenido pueda hacer scroll
  },
  profileHeader: {
    backgroundColor: temaApp.colors.surface,
    paddingBottom: 24,
    ...sombras.media,
  },
  banner: {
    height: 120,
    backgroundColor: temaApp.colors.primary,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: -40,
    paddingHorizontal: espaciado.lg,
  },
  avatarContainer: {
    marginBottom: espaciado.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: temaApp.colors.surface,
    ...sombras.media,
  },
  nombreUsuario: {
    fontSize: 24,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.xs,
  },
  emailUsuario: {
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
    marginBottom: espaciado.sm,
  },
  ubicacionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: espaciado.lg,
  },
  ubicacion: {
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
    marginLeft: 4,
  },
  accionesContainer: {
    paddingHorizontal: espaciado.lg,
    gap: espaciado.md,
  },
  botonAccion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
  },
  botonTextoAccion: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  botonVerMascota: {
    borderWidth: 1,
    borderColor: temaApp.colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: temaApp.colors.surface,
  },
  botonTextoVerMascota: {
    fontSize: 16,
    fontWeight: '600',
    color: temaApp.colors.onSurface,
  },
  cardConfig: {
    margin: espaciado.lg,
    ...sombras.media,
  },
  cardStats: {
    margin: espaciado.lg,
    marginTop: 0,
    ...sombras.media,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.md,
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: espaciado.md,
  },
  configContent: {
    flex: 1,
    marginLeft: espaciado.md,
  },
  configLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: temaApp.colors.onSurface,
    marginBottom: 2,
  },
  configDescription: {
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
  },
  divider: {
    marginVertical: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: espaciado.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    marginTop: espaciado.xs,
  },
  statLabel: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: 4,
  },
  cerrarSesion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: espaciado.lg,
    paddingVertical: 16,
    gap: 8,
  },
  cerrarSesionTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: temaApp.colors.error,
  },
});
