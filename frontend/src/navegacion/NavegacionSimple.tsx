// Navegación Simple - SportPetMatch
// Solo para probar Login → Dashboard

import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importar pantallas
import PantallaLogin from '../pantallas/PantallaLogin';
import PantallaInicio from '../pantallas/PantallaInicio';

// Tipos para la navegación
export type RootStackParamList = {
  Login: undefined;
  Inicio: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

/**
 * Navegación principal simplificada
 */
export default function NavegacionSimple(): JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6200ea',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={PantallaLogin}
          options={{
            title: 'Iniciar Sesión',
            headerShown: false, // Ocultar header en login
          }}
        />
        <Stack.Screen 
          name="Inicio" 
          component={PantallaInicio}
          options={{
            title: 'SportPetMatch Dashboard',
            headerLeft: () => null, // No permitir volver al login
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}