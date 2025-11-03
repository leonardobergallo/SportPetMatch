// Tema personalizado para SportPetMatch
// Configuración de colores, tipografías y estilos de la aplicación

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Colores principales de la marca SportPetMatch
// Adaptados de la estructura con oklch colors
const coloresMarca = {
  // Colores primarios - Inspirados en la naturaleza y el deporte
  // primary: oklch(0.4 0.15 136) - Green #2E7D32
  primario: '#2E7D32', // Verde bosque - representa naturaleza y vida
  primarioVariant: '#1B5E20', // Verde más oscuro para variantes
  // secondary: oklch(0.55 0.22 42) - Orange #FF6F00
  secundario: '#FF6F00', // Naranja vibrante - energía y actividad
  secundarioVariant: '#E65100', // Naranja más oscuro
  
  // Colores de acento
  // accent: oklch(0.75 0.18 60) - Gold #FFD700
  acento: '#FFD700', // Dorado - logros y premios
  acentoSuave: '#FFF9C4', // Dorado claro
  
  // Colores de estado
  exito: '#4CAF50', // Verde para éxito
  advertencia: '#FF9800', // Naranja para advertencias
  error: '#F44336', // Rojo para errores
  info: '#2196F3', // Azul para información
  
  // Colores neutros - Adaptados de la estructura
  // background: oklch(0.98 0.01 70) - Muy claro
  fondo: '#FAFAFA', // Fondo principal claro
  // card: oklch(1 0 0) - Blanco puro
  superficie: '#FFFFFF', // Superficie de tarjetas
  superficieVariant: '#F5F5F5', // Superficie alternativa
  // border: oklch(0.92 0.01 70) - Gris muy claro
  borde: '#E8E8E8', // Bordes sutiles
  // foreground: oklch(0.15 0.02 280) - Casi negro
  texto: '#212121', // Texto principal
  // muted-foreground: oklch(0.5 0.02 280) - Gris medio
  textoSecundario: '#757575', // Texto secundario
  textoDeshabilitado: '#BDBDBD', // Texto deshabilitado
  // muted: oklch(0.93 0.01 70) - Gris muy claro
  muted: '#EDEDED', // Fondo muted
  
  // Colores para mascotas
  perro: '#8D6E63', // Marrón para perros
  gato: '#795548', // Marrón más oscuro para gatos
  otros: '#607D8B', // Azul gris para otras mascotas
};

// Tema claro (por defecto)
export const temaApp = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Colores primarios
    primary: coloresMarca.primario,
    primaryContainer: coloresMarca.primarioVariant,
    secondary: coloresMarca.secundario,
    secondaryContainer: coloresMarca.secundarioVariant,
    
    // Colores de superficie
    surface: coloresMarca.superficie,
    surfaceVariant: coloresMarca.superficieVariant,
    background: coloresMarca.fondo,
    
    // Colores de texto
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: coloresMarca.texto,
    onBackground: coloresMarca.texto,
    onSurfaceVariant: coloresMarca.textoSecundario,
    
    // Colores de estado
    error: coloresMarca.error,
    onError: '#FFFFFF',
    warning: coloresMarca.advertencia,
    onWarning: '#FFFFFF',
    success: coloresMarca.exito,
    onSuccess: '#FFFFFF',
    info: coloresMarca.info,
    onInfo: '#FFFFFF',
    
    // Colores personalizados
    accent: coloresMarca.acento,
    accentLight: coloresMarca.acentoSuave,
    border: coloresMarca.borde,
    disabled: coloresMarca.textoDeshabilitado,
    muted: coloresMarca.muted,
    textoSecundario: coloresMarca.textoSecundario,
    
    // Colores específicos para mascotas
    petDog: coloresMarca.perro,
    petCat: coloresMarca.gato,
    petOther: coloresMarca.otros,
  },
  // Configuración de tipografías
  fonts: {
    ...MD3LightTheme.fonts,
    // Fuentes personalizadas (si las agregamos)
    headlineLarge: {
      ...MD3LightTheme.fonts.headlineLarge,
      fontFamily: 'System', // Usar fuente del sistema
      fontWeight: '700' as const,
    },
    headlineMedium: {
      ...MD3LightTheme.fonts.headlineMedium,
      fontFamily: 'System',
      fontWeight: '600' as const,
    },
    titleLarge: {
      ...MD3LightTheme.fonts.titleLarge,
      fontFamily: 'System',
      fontWeight: '600' as const,
    },
    bodyLarge: {
      ...MD3LightTheme.fonts.bodyLarge,
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    bodyMedium: {
      ...MD3LightTheme.fonts.bodyMedium,
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    labelLarge: {
      ...MD3LightTheme.fonts.labelLarge,
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
  },
  // Configuración de formas y bordes
  roundness: 12, // Bordes redondeados más suaves
};

// Tema oscuro (para modo nocturno futuro)
export const temaOscuro = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Adaptar colores de marca para tema oscuro
    primary: coloresMarca.primario,
    primaryContainer: coloresMarca.primarioVariant,
    secondary: coloresMarca.secundario,
    secondaryContainer: coloresMarca.secundarioVariant,
    
    // Superficies oscuras
    surface: '#1E1E1E',
    surfaceVariant: '#2D2D2D',
    background: '#121212',
    
    // Textos claros para tema oscuro
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#FFFFFF',
    onBackground: '#FFFFFF',
    onSurfaceVariant: '#CCCCCC',
    
    // Colores de estado (mismos que tema claro)
    error: coloresMarca.error,
    onError: '#FFFFFF',
    warning: coloresMarca.advertencia,
    onWarning: '#FFFFFF',
    success: coloresMarca.exito,
    onSuccess: '#FFFFFF',
    info: coloresMarca.info,
    onInfo: '#FFFFFF',
    
    // Colores personalizados
    accent: coloresMarca.acento,
    accentLight: coloresMarca.acentoSuave,
    border: '#404040',
    disabled: '#666666',
    
    // Colores específicos para mascotas (mismos que tema claro)
    petDog: coloresMarca.perro,
    petCat: coloresMarca.gato,
    petOther: coloresMarca.otros,
  },
  // Misma configuración de tipografías que tema claro
  fonts: temaApp.fonts,
  roundness: temaApp.roundness,
};

// Exportar colores para uso directo en componentes
export const colores = coloresMarca;

// Configuración de espaciado
export const espaciado = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Configuración de tamaños de fuente
export const tamanosFuente = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Configuración de sombras
export const sombras = {
  pequena: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  media: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  grande: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};
