// Tema personalizado para SportPetMatch
// Configuración de colores, tipografías y estilos de la aplicación

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Colores principales de la marca SportPetMatch
// Paleta moderna y vibrante mejorada
const coloresMarca = {
  // Colores primarios - Verde moderno y vibrante
  primario: '#10B981', // Verde esmeralda moderno - representa naturaleza y vida
  primarioVariant: '#059669', // Verde más oscuro para variantes
  primarioClaro: '#D1FAE5', // Verde muy claro para fondos
  
  // Colores secundarios - Azul vibrante
  secundario: '#3B82F6', // Azul moderno - energía y actividad
  secundarioVariant: '#2563EB', // Azul más oscuro
  secundarioClaro: '#DBEAFE', // Azul muy claro
  
  // Colores de acento
  acento: '#F59E0B', // Ámbar dorado - logros y premios
  acentoSuave: '#FEF3C7', // Ámbar claro
  
  // Colores de estado
  exito: '#10B981', // Verde para éxito
  advertencia: '#F59E0B', // Ámbar para advertencias
  error: '#EF4444', // Rojo moderno para errores
  info: '#3B82F6', // Azul para información
  
  // Colores semánticos para funcionalidades
  like: '#EF4444', // Rojo para corazón/like
  likeClaro: '#FEE2E2', // Rojo claro para fondos
  match: '#059669', // Verde intenso para matches
  matchClaro: '#D1FAE5', // Verde claro para fondos de match
  pass: '#9CA3AF', // Gris para pass/rechazar
  
  // Colores neutros - Más suaves y modernos
  fondo: '#F9FAFB', // Fondo principal muy claro (gris azulado)
  superficie: '#FFFFFF', // Superficie de tarjetas (blanco puro)
  superficieVariant: '#F3F4F6', // Superficie alternativa (gris muy claro)
  borde: '#E5E7EB', // Bordes sutiles (gris claro)
  texto: '#111827', // Texto principal (casi negro suave)
  textoSecundario: '#6B7280', // Texto secundario (gris medio)
  textoDeshabilitado: '#9CA3AF', // Texto deshabilitado (gris)
  muted: '#F3F4F6', // Fondo muted (gris muy claro)
  
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
    
    // Colores semánticos para funcionalidades
    like: coloresMarca.like,
    likeLight: coloresMarca.likeClaro,
    match: coloresMarca.match,
    matchLight: coloresMarca.matchClaro,
    pass: coloresMarca.pass,
    
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
