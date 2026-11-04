// Componente Header reutilizable para SportPetMatch
// Header con logo, título y menú de usuario

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Text, Avatar, Menu, Divider, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contextos/ContextoAuth';
import { temaApp, espaciado, MARCA } from '../constantes/tema';

type HeaderNavigationProp = any;
const SECCIONES = [
  ['Inicio', 'Inicio'], ['Eventos', 'Eventos'], ['Matching', 'Matching'],
  ['Mapa', 'Mapa'], ['Mascotas', 'Mascotas'], ['Matches', 'Chats'], ['Perfil', 'Perfil'],
] as const;

interface HeaderProps {
  /** Título a mostrar en el header (opcional, por defecto "SportPetMatch") */
  titulo?: string;
  /** Mostrar avatar y menú de usuario (por defecto true) */
  mostrarUsuario?: boolean;
  /** Acción personalizada al presionar el logo (opcional) */
  onLogoPress?: () => void;
  onVolver?: () => void;
  seccionActiva?: string;
}

/**
 * Header reutilizable para las pantallas principales
 */
export default function Header({ 
  titulo = MARCA.nombre,
  mostrarUsuario = true,
  onLogoPress,
  onVolver,
  seccionActiva,
}: HeaderProps): JSX.Element {
  const navigation = useNavigation<HeaderNavigationProp>();
  const { usuario, cerrarSesion } = useAuth();
  const [mostrarMenu, setMostrarMenu] = useState(false);

  const manejarLogoPress = () => {
    if (onLogoPress) {
      onLogoPress();
    } else {
      // Por defecto, navegar a Inicio
      navigation.navigate('Principal', { screen: 'Inicio' });
    }
  };

  return (
    <View style={estilos.header}>
      <View style={estilos.headerContent}>
        {onVolver && (
          <IconButton icon="arrow-left" iconColor={temaApp.colors.onPrimary} accessibilityLabel="Volver" onPress={onVolver} />
        )}
        {/* Logo y Título */}
        <TouchableOpacity 
          style={estilos.logoContainer}
          onPress={manejarLogoPress}
          activeOpacity={0.7}
        >
          <View style={estilos.logo}>
            <Text style={estilos.logoEmoji}>🐾</Text>
          </View>
          <View>
            <Text style={estilos.titulo}>{titulo}</Text>
            <Text style={estilos.slogan}>{MARCA.slogan}</Text>
          </View>
        </TouchableOpacity>

        {/* Avatar y Menú de Usuario */}
        {mostrarUsuario && usuario && (
          <Menu
            visible={mostrarMenu}
            onDismiss={() => setMostrarMenu(false)}
            anchor={
              <TouchableOpacity 
                onPress={() => setMostrarMenu(true)} 
                accessibilityRole="button"
                accessibilityLabel="Menú de cuenta"
                style={estilos.avatarContainer}
                activeOpacity={0.7}
              >
                {usuario.avatar ? (
                  <Avatar.Image size={40} source={{ uri: usuario.avatar }} />
                ) : (
                  <Avatar.Text 
                    size={40} 
                    label={usuario.nombre?.charAt(0).toUpperCase() || 'U'}
                    style={{ backgroundColor: temaApp.colors.secondary }}
                  />
                )}
              </TouchableOpacity>
            }
            contentStyle={estilos.menuContent}
          >
            <Menu.Item 
              onPress={() => {
                setMostrarMenu(false);
                navigation.navigate('Principal', { screen: 'Perfil' });
              }} 
              title="Mi Perfil" 
              leadingIcon="account"
            />
            <Menu.Item 
              onPress={() => {
                setMostrarMenu(false);
                navigation.navigate('Configuracion');
              }} 
              title="Configuración" 
              leadingIcon="cog"
            />
            <Divider />
            <Menu.Item 
              onPress={async () => {
                setMostrarMenu(false);
                await cerrarSesion();
              }} 
              title="Cerrar Sesión" 
              leadingIcon="logout"
              titleStyle={{ color: temaApp.colors.error }}
            />
          </Menu>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.secciones}>
        {SECCIONES.map(([ruta, etiqueta]) => (
          <TouchableOpacity
            key={ruta}
            accessibilityRole="button"
            accessibilityState={{ selected: ruta === seccionActiva }}
            onPress={() => navigation.navigate('Principal', { screen: ruta })}
            style={[estilos.seccion, ruta === seccionActiva && estilos.seccionActiva]}
          >
            <Text style={estilos.seccionTexto}>{etiqueta}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  header: {
    backgroundColor: temaApp.colors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: espaciado.md,
    paddingHorizontal: espaciado.md,
    ...Platform.select({
      web: {
        paddingTop: 20,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: temaApp.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 24,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: temaApp.colors.onPrimary,
  },
  slogan: {
    fontSize: 11,
    color: temaApp.colors.onPrimary,
    opacity: 0.9,
    marginTop: 2,
  },
  avatarContainer: {
    marginLeft: 'auto',
  },
  menuContent: {
    backgroundColor: temaApp.colors.surface,
  },
  secciones: {
    gap: 6,
    paddingTop: 8,
  },
  seccion: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  seccionActiva: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  seccionTexto: {
    color: temaApp.colors.onPrimary,
    fontWeight: '600',
  },
});









