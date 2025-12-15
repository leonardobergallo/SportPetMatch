// Componente Header reutilizable para SportPetMatch
// Header con logo, título y menú de usuario

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text, Avatar, Menu, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navegacion/NavegacionPrincipal';
import { useAuth } from '../contextos/ContextoAuth';
import { temaApp, espaciado } from '../constantes/tema';

type HeaderNavigationProp = StackNavigationProp<RootStackParamList>;

interface HeaderProps {
  /** Título a mostrar en el header (opcional, por defecto "SportPetMatch") */
  titulo?: string;
  /** Mostrar avatar y menú de usuario (por defecto true) */
  mostrarUsuario?: boolean;
  /** Acción personalizada al presionar el logo (opcional) */
  onLogoPress?: () => void;
}

/**
 * Header reutilizable para las pantallas principales
 */
export default function Header({ 
  titulo = 'SportPetMatch',
  mostrarUsuario = true,
  onLogoPress 
}: HeaderProps): JSX.Element {
  const navigation = useNavigation<HeaderNavigationProp>();
  const { usuario, cerrarSesion } = useAuth();
  const [mostrarMenu, setMostrarMenu] = useState(false);

  const manejarLogoPress = () => {
    if (onLogoPress) {
      onLogoPress();
    } else {
      // Por defecto, navegar a Inicio
      navigation.navigate('Principal');
    }
  };

  return (
    <View style={estilos.header}>
      <View style={estilos.headerContent}>
        {/* Logo y Título */}
        <TouchableOpacity 
          style={estilos.logoContainer}
          onPress={manejarLogoPress}
          activeOpacity={0.7}
        >
          <View style={estilos.logo}>
            <Text style={estilos.logoEmoji}>🐾</Text>
          </View>
          <Text style={estilos.titulo}>{titulo}</Text>
        </TouchableOpacity>

        {/* Avatar y Menú de Usuario */}
        {mostrarUsuario && usuario && (
          <Menu
            visible={mostrarMenu}
            onDismiss={() => setMostrarMenu(false)}
            anchor={
              <TouchableOpacity 
                onPress={() => setMostrarMenu(true)} 
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
                navigation.navigate('Perfil');
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
  avatarContainer: {
    marginLeft: 'auto',
  },
  menuContent: {
    backgroundColor: temaApp.colors.surface,
  },
});

