// Declaraciones de tipos para Expo
// Archivo de definiciones de tipos para el entorno de Expo

/// <reference types="expo/types" />

// Declaraciones adicionales para módulos de Expo
declare module 'expo-constants' {
  export const expoConfig: any;
  export const manifest: any;
}

declare module 'expo-location' {
  export interface LocationObject {
    coords: {
      latitude: number;
      longitude: number;
      altitude: number | null;
      accuracy: number | null;
      altitudeAccuracy: number | null;
      heading: number | null;
      speed: number | null;
    };
    timestamp: number;
  }
}

declare module 'expo-camera' {
  export interface CameraProps {
    style?: any;
    type?: 'front' | 'back';
    flashMode?: 'off' | 'on' | 'auto';
    onCameraReady?: () => void;
    onMountError?: (error: any) => void;
  }
}

declare module 'expo-image-picker' {
  export interface ImagePickerResult {
    uri: string;
    width: number;
    height: number;
    type?: string;
    fileName?: string;
    fileSize?: number;
  }
}

declare module 'expo-notifications' {
  export interface Notification {
    request: {
      content: {
        title: string;
        body: string;
        data?: any;
      };
      identifier: string;
    };
  }
}

// Declaraciones para React Native Paper
declare module 'react-native-paper' {
  export interface Theme {
    colors: {
      primary: string;
      primaryContainer: string;
      secondary: string;
      secondaryContainer: string;
      surface: string;
      surfaceVariant: string;
      background: string;
      onPrimary: string;
      onSecondary: string;
      onSurface: string;
      onBackground: string;
      onSurfaceVariant: string;
      error: string;
      onError: string;
      warning?: string;
      onWarning?: string;
      success?: string;
      onSuccess?: string;
      info?: string;
      onInfo?: string;
      accent?: string;
      accentLight?: string;
      border?: string;
      disabled?: string;
      petDog?: string;
      petCat?: string;
      petOther?: string;
    };
    fonts: any;
    roundness: number;
  }
}
