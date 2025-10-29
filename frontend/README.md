# 📱 SportPetMatch - Frontend Móvil

Aplicación móvil desarrollada con **Expo** y **React Native** para conectar personas y mascotas en eventos deportivos.

## 🚀 Características

- **React Native** con **Expo** para desarrollo multiplataforma
- **TypeScript** para tipado estático y mejor desarrollo
- **React Navigation** para navegación fluida
- **React Native Paper** para componentes Material Design
- **React Query** para manejo de estado del servidor
- **Zustand** para estado local
- **Geolocalización** para eventos cercanos
- **Cámara** para fotos de mascotas
- **Notificaciones push** para eventos y matches

## 🛠️ Tecnologías

- **Expo SDK 50** - Framework de React Native
- **React Native 0.73** - Framework móvil
- **TypeScript 5.1** - Tipado estático
- **React Navigation 6** - Navegación
- **React Native Paper 5** - UI Components
- **React Query 5** - Estado del servidor
- **Zustand 4** - Estado local
- **Expo Location** - Geolocalización
- **Expo Camera** - Cámara
- **Expo Notifications** - Notificaciones

## 📦 Instalación

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app en tu dispositivo móvil

### Pasos

1. **Instalar dependencias**
```bash
npm install
```

2. **Configurar variables de entorno**
```bash
cp env.example .env
# Editar .env con tus configuraciones
```

3. **Iniciar el servidor de desarrollo**
```bash
npm start
```

4. **Ejecutar en dispositivo**
- Escanear QR con Expo Go (Android/iOS)
- O usar `npm run android` / `npm run ios`

## 📱 Scripts Disponibles

- `npm start` - Iniciar servidor de desarrollo
- `npm run android` - Ejecutar en Android
- `npm run ios` - Ejecutar en iOS
- `npm run web` - Ejecutar en web
- `npm test` - Ejecutar tests
- `npm run lint` - Linter de código
- `npm run build:android` - Build para Android
- `npm run build:ios` - Build para iOS

## 🏗️ Estructura del Proyecto

```
frontend/
├── src/
│   ├── componentes/          # Componentes reutilizables
│   ├── pantallas/           # Pantallas de la app
│   ├── navegacion/          # Configuración de navegación
│   ├── servicios/           # Servicios API
│   ├── almacen/             # Estado global (Zustand)
│   ├── hooks/               # Custom hooks
│   ├── utilidades/          # Funciones utilitarias
│   ├── tipos/               # Definiciones de TypeScript
│   └── constantes/          # Constantes y configuración
├── assets/                  # Imágenes, fuentes, etc.
├── App.tsx                  # Componente principal
├── app.json                 # Configuración de Expo
├── babel.config.js          # Configuración de Babel
├── metro.config.js          # Configuración de Metro
├── tsconfig.json            # Configuración de TypeScript
└── package.json             # Dependencias y scripts
```

## 🎨 Diseño

### Tema de Colores

- **Primario**: Verde bosque (#2E7D32) - Naturaleza y vida
- **Secundario**: Naranja vibrante (#FF6F00) - Energía y actividad
- **Acento**: Dorado (#FFD700) - Logros y premios
- **Fondo**: Gris claro (#FAFAFA) - Limpieza y simplicidad

### Componentes

- **Material Design 3** con React Native Paper
- **Iconos** de Material Icons
- **Tipografías** del sistema
- **Bordes redondeados** para suavidad
- **Sombras sutiles** para profundidad

## 🔧 Configuración

### Variables de Entorno

Configura las siguientes variables en tu archivo `.env`:

```env
API_BASE_URL=http://localhost:3000/api
GOOGLE_MAPS_API_KEY=tu_api_key
EXPO_PUSH_TOKEN=tu_push_token
```

### Navegación

La app usa **React Navigation** con:
- **Stack Navigator** para navegación principal
- **Tab Navigator** para pestañas inferiores
- **Drawer Navigator** para menú lateral (futuro)

### Estado

- **React Query** para datos del servidor
- **Zustand** para estado local
- **AsyncStorage** para persistencia

## 📱 Pantallas

### Autenticación
- **Login** - Iniciar sesión
- **Registro** - Crear cuenta

### Principales
- **Inicio** - Feed de actividades
- **Eventos** - Lista de eventos
- **Mascotas** - Gestión de mascotas
- **Matches** - Conexiones
- **Perfil** - Perfil del usuario

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 🚀 Build y Deploy

### Desarrollo
```bash
npm run build:development
```

### Producción
```bash
npm run build:production
```

### EAS Build
```bash
# Instalar EAS CLI
npm install -g @expo/eas-cli

# Configurar proyecto
eas build:configure

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
```

## 🔍 Debugging

### Herramientas
- **React Native Debugger**
- **Flipper**
- **Expo Dev Tools**
- **Chrome DevTools**

### Logs
```bash
# Ver logs de Expo
npx expo logs

# Logs específicos de plataforma
npx expo logs --platform android
npx expo logs --platform ios
```

## 📚 Documentación

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://reactnativepaper.com/)
- [React Query](https://tanstack.com/query/latest)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](../LICENSE) para más detalles.

---

Desarrollado con ❤️ para conectar personas y mascotas en eventos deportivos.
