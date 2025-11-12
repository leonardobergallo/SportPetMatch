// Navegación principal de SportPetMatch
// Configuración de la navegación con React Navigation

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

// Importar pantallas
import PantallaInicio from '../pantallas/PantallaInicio';
import PantallaEventos from '../pantallas/PantallaEventos';
import PantallaMascotas from '../pantallas/PantallaMascotas';
import PantallaMatches from '../pantallas/PantallaMatches';
import PantallaMatching from '../pantallas/PantallaMatching';
import PantallaPerfil from '../pantallas/PantallaPerfil';
import PantallaLogin from '../pantallas/PantallaLogin';
import PantallaRegistro from '../pantallas/PantallaRegistro';
import PantallaOnboarding from '../pantallas/PantallaOnboarding';
import PantallaDashboard from '../pantallas/PantallaDashboard';
import PantallaMapaWebCompatible from '../pantallas/PantallaMapaWebCompatible';
import PantallaMapa from '../pantallas/PantallaMapa';
import PantallaCrearEvento from '../pantallas/PantallaCrearEvento';

// Importar tema y contexto de autenticación
import { temaApp } from '../constantes/tema';
import { useAuth } from '../contextos/ContextoAuth';

// Tipos para la navegación
export type RootStackParamList = {
  // Pantallas de autenticación
  Login: undefined;
  Registro: undefined;
  Onboarding: undefined;
  
  // Pantalla principal con tabs
  Principal: undefined;
  
  // Pantallas de detalle
  DetalleEvento: { eventoId: string };
  DetalleMascota: { mascotaId: string };
  DetalleMatch: { matchId: string };
  Chat: { matchId: string };
  
  // Pantallas de configuración
  Configuracion: undefined;
  EditarPerfil: undefined;
  AgregarMascota: undefined;
  CrearEvento: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Inicio: undefined;
  Matching: undefined;
  Mapa: undefined;
  Eventos: undefined;
  Mascotas: undefined;
  Matches: undefined;
  Perfil: undefined;
};

// Crear navegadores
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const Drawer = createDrawerNavigator();

/**
 * Navegador de pestañas inferiores
 * Contiene las pantallas principales de la aplicación
 */
function NavegadorTabs(): JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Configuración de iconos para cada tab
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          // Asignar iconos según la ruta
          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'dashboard' : 'dashboard';
              break;
            case 'Inicio':
              iconName = focused ? 'home' : 'home';
              break;
            case 'Matching':
              iconName = focused ? 'favorite' : 'favorite-border';
              break;
            case 'Mapa':
              iconName = focused ? 'map' : 'map';
              break;
            case 'Eventos':
              iconName = focused ? 'event' : 'event';
              break;
            case 'Mascotas':
              iconName = focused ? 'pets' : 'pets';
              break;
            case 'Matches':
              iconName = focused ? 'message' : 'message';
              break;
            case 'Perfil':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        // Configuración de colores de la barra de tabs
        tabBarActiveTintColor: temaApp.colors.primary,
        tabBarInactiveTintColor: temaApp.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: temaApp.colors.surface,
          borderTopColor: temaApp.colors.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        // Configuración de labels
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        // Configuración de header
        headerStyle: {
          backgroundColor: temaApp.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: temaApp.colors.border,
        },
        headerTintColor: temaApp.colors.onSurface,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      })}
    >
      {/* Tab de Inicio - Pantalla principal con feed de actividades */}
      <Tab.Screen 
        name="Inicio" 
        component={PantallaInicio}
        options={{
          title: 'Inicio',
          headerTitle: 'SportPetMatch',
        }}
      />
      
      {/* Tab de Matching - Pantalla estilo Tinder para encontrar conexiones */}
      <Tab.Screen 
        name="Matching" 
        component={PantallaMatching}
        options={{
          title: 'Matching',
          headerTitle: 'Descubre Conexiones',
        }}
      />
      
      {/* Tab de Mapa - Mapa con usuarios y eventos cercanos */}
      <Tab.Screen 
        name="Mapa" 
        component={PantallaMapa}
        options={{
          title: 'Mapa',
          headerTitle: 'Mapa de SportPetMatch',
        }}
      />
      
      {/* Tab de Eventos - Lista de eventos deportivos */}
      <Tab.Screen 
        name="Eventos" 
        component={PantallaEventos}
        options={{
          title: 'Eventos',
          headerTitle: 'Eventos Deportivos',
        }}
      />
      
      {/* Tab de Mascotas - Gestión de mascotas del usuario */}
      <Tab.Screen 
        name="Mascotas" 
        component={PantallaMascotas}
        options={{
          title: 'Mascotas',
          headerTitle: 'Mis Mascotas',
        }}
      />
      
      {/* Tab de Matches - Conexiones y chat */}
      <Tab.Screen 
        name="Matches" 
        component={PantallaMatches}
        options={{
          title: 'Chats',
          headerTitle: 'Conversaciones',
        }}
      />
      
      {/* Tab de Perfil - Perfil del usuario */}
      <Tab.Screen 
        name="Perfil" 
        component={PantallaPerfil}
        options={{
          title: 'Perfil',
          headerTitle: 'Mi Perfil',
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Navegador principal de la aplicación
 * Maneja la navegación entre pantallas de autenticación y la app principal
 */
function NavegadorPrincipal(): JSX.Element {
  const { estaAutenticado, cargandoAuth, usuario } = useAuth();
  const necesitaOnboarding = estaAutenticado && !usuario?.onboardingCompletado;

  // Mostrar loading mientras se verifica la autenticación
  if (cargandoAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: temaApp.colors.background }}>
        <ActivityIndicator size="large" color={temaApp.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        // Configuración global de headers
        headerStyle: {
          backgroundColor: temaApp.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: temaApp.colors.onSurface,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        // Configuración de transiciones
        cardStyle: {
          backgroundColor: temaApp.colors.background,
        },
      }}
    >
      {necesitaOnboarding ? (
        // Usuario autenticado pero sin completar onboarding
        <>
          <Stack.Screen 
            name="Onboarding" 
            component={PantallaOnboarding}
            options={{ 
              title: 'Configuración',
              headerShown: false,
              gestureEnabled: false, // No permitir volver atrás
            }}
          />
        </>
      ) : estaAutenticado ? (
        // Usuario autenticado con onboarding completo - mostrar app principal
        <>
          <Stack.Screen 
            name="Principal" 
            component={NavegadorTabs}
            options={{ headerShown: false }}
          />
          
          {/* Pantallas de detalle */}
          <Stack.Screen 
            name="DetalleEvento" 
            component={PantallaInicio} // TODO: Crear componente real
            options={{ title: 'Detalle del Evento' }}
          />
          
          <Stack.Screen 
            name="DetalleMascota" 
            component={PantallaInicio} // TODO: Crear componente real
            options={{ title: 'Detalle de la Mascota' }}
          />
          
          <Stack.Screen 
            name="DetalleMatch" 
            component={PantallaInicio} // TODO: Crear componente real
            options={{ title: 'Detalle del Match' }}
          />
          
          <Stack.Screen 
            name="Chat" 
            component={PantallaInicio} // TODO: Crear componente real
            options={{ title: 'Chat' }}
          />
          
          {/* Pantallas de configuración */}
          <Stack.Screen 
            name="Configuracion" 
            component={PantallaInicio} // TODO: Crear componente real
            options={{ title: 'Configuración' }}
          />
          
          <Stack.Screen 
            name="EditarPerfil" 
            component={PantallaInicio} // TODO: Crear componente real
            options={{ title: 'Editar Perfil' }}
          />
          
          <Stack.Screen 
            name="AgregarMascota" 
            component={PantallaInicio} // TODO: Crear componente real
            options={{ title: 'Agregar Mascota' }}
          />
          
          <Stack.Screen 
            name="CrearEvento" 
            component={PantallaCrearEvento}
            options={{ title: 'Crear Evento' }}
          />
        </>
      ) : (
        // Usuario no autenticado - mostrar pantallas de login
        <>
          <Stack.Screen 
            name="Login" 
            component={PantallaLogin}
            options={{ 
              title: 'Iniciar Sesión',
              headerShown: false, // Pantalla de login sin header
            }}
          />
          
          <Stack.Screen 
            name="Registro" 
            component={PantallaRegistro}
            options={{ 
              title: 'Crear Cuenta',
              headerShown: false, // Pantalla de registro sin header
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

/**
 * Componente principal de navegación
 * Configura el contenedor de navegación con el tema de la app
 */
export default function NavegacionPrincipal(): JSX.Element {
  return (
    <NavigationContainer
      theme={{
        // Configurar tema para React Navigation
        dark: false,
        colors: {
          primary: temaApp.colors.primary,
          background: temaApp.colors.background,
          card: temaApp.colors.surface,
          text: temaApp.colors.onSurface,
          border: temaApp.colors.border,
          notification: temaApp.colors.error,
        },
      }}
    >
      <NavegadorPrincipal />
    </NavigationContainer>
  );
}
