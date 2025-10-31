// App básico para probar login - SportPetMatch
import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Alert,
  SafeAreaView 
} from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Card,
  PaperProvider,
  MD3LightTheme
} from 'react-native-paper';

// Importar el dashboard original y contexto
import PantallaInicio from './src/pantallas/PantallaInicio';
import { ProveedorUsuario, useUsuario } from './src/contexto/ContextoUsuario';

// Tipo para los datos del usuario
interface DatosUsuario {
  id: string;
  email: string;
  nombre: string;
  avatar: string;
  esPremium: boolean;
}

const tema = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ea',
  },
};

export default function AppBasico() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [logueado, setLogueado] = useState(false);
  const [datosUsuario, setDatosUsuario] = useState<DatosUsuario | null>(null);

  const manejarLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setCargando(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const resultado = await response.json();
      
      if (resultado.success) {
        setDatosUsuario(resultado.data.usuario);
        setLogueado(true);
        Alert.alert('¡Éxito!', `Bienvenido ${resultado.data.usuario.nombre}!`);
      } else {
        Alert.alert('Error', resultado.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
      console.error('Error de login:', error);
    } finally {
      setCargando(false);
    }
  };

  if (logueado) {
    return (
      <PaperProvider theme={tema}>
        <PantallaInicio />
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={tema}>
      <SafeAreaView style={estilos.contenedorLogin}>
        <Card style={estilos.tarjeta}>
          <Card.Content>
            <Text variant="headlineSmall" style={estilos.titulo}>
              SportPetMatch 🐕‍🦺
            </Text>
            <Text variant="bodyMedium" style={estilos.subtitulo}>
              Inicia sesión para continuar
            </Text>
            
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={estilos.input}
              placeholder="test@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={estilos.input}
              placeholder="123456"
              secureTextEntry
            />
            
            <Button 
              mode="contained" 
              onPress={manejarLogin}
              loading={cargando}
              disabled={cargando}
              style={estilos.boton}
            >
              Iniciar Sesión
            </Button>
            
            <Text variant="bodySmall" style={estilos.ayuda}>
              Usuario de prueba: test@example.com / 123456
            </Text>
          </Card.Content>
        </Card>
      </SafeAreaView>
    </PaperProvider>
  );
}

const estilos = StyleSheet.create({
  contenedorLogin: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20,
  },
  tarjeta: {
    elevation: 4,
  },
  titulo: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#6200ea',
  },
  subtitulo: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  boton: {
    marginTop: 8,
    marginBottom: 8,
  },
  ayuda: {
    textAlign: 'center',
    marginTop: 16,
    color: '#999',
  },
});