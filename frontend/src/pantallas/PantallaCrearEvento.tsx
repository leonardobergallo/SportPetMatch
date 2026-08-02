// Pantalla de Crear Evento - SportPetMatch
// Formulario para crear un nuevo evento pet-friendly

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Text, TextInput, Portal, Dialog, Button as PaperButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format, addDays } from 'date-fns';

// Importar componentes UI
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Importar servicios y tema
import { crearEvento, DatosCrearEvento } from '@/servicios/servicioEventos';
import { temaApp, espaciado, sombras } from '@/constantes/tema';
import { RootStackParamList } from '@/navegacion/NavegacionPrincipal';
import { useAuth } from '@/contextos/ContextoAuth';

type CrearEventoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CrearEvento'>;

/** Tipografia web (Plus Jakarta / Outfit), misma familia que el resto de la app en web */
const fontSans = Platform.select({ web: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif', default: undefined });
const fontDisplay = Platform.select({ web: '"Outfit", "Plus Jakarta Sans", system-ui, sans-serif', default: undefined });

/**
 * Pantalla de Crear Evento
 */
export default function PantallaCrearEvento(): JSX.Element {
  const navigation = useNavigation<CrearEventoScreenNavigationProp>();
  const { estaAutenticado } = useAuth();

  // Estados del formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [nivelDificultad, setNivelDificultad] = useState('1');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [duracion, setDuracion] = useState('');
  const [maxParticipantes, setMaxParticipantes] = useState('');
  const [precio, setPrecio] = useState('');
  const [esPetFriendly, setEsPetFriendly] = useState(true);
  const [esPremium, setEsPremium] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [cargandoImagen, setCargandoImagen] = useState(false);

  // Estados para selectores de fecha
  const [mostrarFechaInicio, setMostrarFechaInicio] = useState(false);
  const [mostrarFechaFin, setMostrarFechaFin] = useState(false);
  const [fechaTemp, setFechaTemp] = useState({ fecha: '', hora: '' });
  const [campoFechaActivo, setCampoFechaActivo] = useState<'inicio' | 'fin' | null>(null);

  const obtenerMinFechaHora = (): string => {
    const ahora = new Date();
    const timezoneOffset = ahora.getTimezoneOffset() * 60000;
    return new Date(ahora.getTime() - timezoneOffset).toISOString().slice(0, 16);
  };

  /**
   * Formatear fecha para mostrar
   */
  const formatearFechaParaMostrar = (fechaStr: string): string => {
    if (!fechaStr) return '';
    try {
      const fecha = new Date(fechaStr);
      return format(fecha, "dd/MM/yyyy 'a las' HH:mm");
    } catch {
      return fechaStr;
    }
  };

  /**
   * Abrir selector de fecha de inicio
   */
  const abrirSelectorFechaInicio = () => {
    if (Platform.OS === 'web') {
      // En web, el input se maneja directamente en el render
      setCampoFechaActivo('inicio');
      return;
    }
    
    if (fechaInicio) {
      const fecha = new Date(fechaInicio);
      setFechaTemp({
        fecha: format(fecha, 'yyyy-MM-dd'),
        hora: format(fecha, 'HH:mm'),
      });
    } else {
      const ahora = new Date();
      setFechaTemp({
        fecha: format(addDays(ahora, 1), 'yyyy-MM-dd'),
        hora: format(ahora, 'HH:mm'),
      });
    }
    setCampoFechaActivo('inicio');
    setMostrarFechaInicio(true);
  };

  /**
   * Abrir selector de fecha de fin
   */
  const abrirSelectorFechaFin = () => {
    if (Platform.OS === 'web') {
      // En web, el input se maneja directamente en el render
      setCampoFechaActivo('fin');
      return;
    }
    
    if (fechaFin) {
      const fecha = new Date(fechaFin);
      setFechaTemp({
        fecha: format(fecha, 'yyyy-MM-dd'),
        hora: format(fecha, 'HH:mm'),
      });
    } else if (fechaInicio) {
      const fecha = new Date(fechaInicio);
      setFechaTemp({
        fecha: format(fecha, 'yyyy-MM-dd'),
        hora: format(addDays(fecha, 0), 'HH:mm'),
      });
    } else {
      const ahora = new Date();
      setFechaTemp({
        fecha: format(addDays(ahora, 1), 'yyyy-MM-dd'),
        hora: format(ahora, 'HH:mm'),
      });
    }
    setCampoFechaActivo('fin');
    setMostrarFechaFin(true);
  };

  /**
   * Confirmar selección de fecha (móvil)
   */
  const confirmarFecha = () => {
    if (!fechaTemp.fecha || !fechaTemp.hora) {
      Alert.alert('Error', 'Por favor selecciona fecha y hora');
      return;
    }

    const fechaCompleta = `${fechaTemp.fecha}T${fechaTemp.hora}`;
    
    if (campoFechaActivo === 'inicio') {
      setFechaInicio(fechaCompleta);
      setMostrarFechaInicio(false);
    } else if (campoFechaActivo === 'fin') {
      setFechaFin(fechaCompleta);
      setMostrarFechaFin(false);
    }
    
    setCampoFechaActivo(null);
  };

  /**
   * Cancelar selección de fecha
   */
  const cancelarFecha = () => {
    setMostrarFechaInicio(false);
    setMostrarFechaFin(false);
    setCampoFechaActivo(null);
    setFechaTemp({ fecha: '', hora: '' });
  };

  const seleccionarImagenEvento = async () => {
    try {
      setCargandoImagen(true);

      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = () => {
          const file = input.files?.[0];
          if (!file) {
            setCargandoImagen(false);
            return;
          }

          const reader = new FileReader();
          reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            if (result) {
              setImagenUrl(result);
            }
            setCargandoImagen(false);
          };
          reader.onerror = () => {
            setCargandoImagen(false);
            Alert.alert('Error', 'No se pudo leer la imagen seleccionada.');
          };
          reader.readAsDataURL(file);
        };

        input.click();
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para elegir una imagen.');
        setCargandoImagen(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          const mimeType = asset.mimeType || 'image/jpeg';
          setImagenUrl(`data:${mimeType};base64,${asset.base64}`);
        } else if (asset.uri) {
          setImagenUrl(asset.uri);
        }
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
    } finally {
      setCargandoImagen(false);
    }
  };

  /**
   * Validar formulario
   */
  const validarFormulario = (): boolean => {
    if (!titulo.trim()) {
      Alert.alert('Error', 'El título es requerido');
      return false;
    }
    if (!descripcion.trim()) {
      Alert.alert('Error', 'La descripción es requerida');
      return false;
    }
    if (!tipo) {
      Alert.alert('Error', 'La categoría del evento es requerida');
      return false;
    }
    if (!fechaInicio) {
      Alert.alert('Error', 'La fecha de inicio es requerida');
      return false;
    }
    
    // Validar formato de fecha (YYYY-MM-DDTHH:mm)
    const fechaRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    if (!fechaRegex.test(fechaInicio)) {
      Alert.alert('Error', 'Formato de fecha inválido. Usa: YYYY-MM-DDTHH:mm (ej: 2024-12-25T10:00)');
      return false;
    }

    // Validar que la fecha de inicio sea en el futuro
    const fechaInicioDate = new Date(fechaInicio);
    if (fechaInicioDate < new Date()) {
      Alert.alert('Error', 'La fecha de inicio debe ser en el futuro');
      return false;
    }

    // Si hay fecha fin, debe ser después de la fecha inicio
    if (fechaFin && new Date(fechaFin) < fechaInicioDate) {
      Alert.alert('Error', 'La fecha de fin debe ser después de la fecha de inicio');
      return false;
    }

    return true;
  };

  /**
   * Manejar creación del evento
   */
  const manejarCrearEvento = async () => {
    if (!estaAutenticado) {
      Alert.alert('Error', 'Debes iniciar sesión para crear eventos');
      navigation.goBack();
      return;
    }

    if (!validarFormulario()) {
      return;
    }

    setCargando(true);

    try {
      const datosEvento: DatosCrearEvento = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipo,
        imagenUrl: imagenUrl.trim() || undefined,
        nivelDificultad: parseInt(nivelDificultad) || 1,
        fechaInicio,
        fechaFin: fechaFin || undefined,
        duracion: duracion ? parseInt(duracion) : undefined,
        maxParticipantes: maxParticipantes ? parseInt(maxParticipantes) : undefined,
        precio: precio ? parseFloat(precio) : undefined,
        esPetFriendly,
        esPremium,
      };

      const nuevoEvento = await crearEvento(datosEvento);

      // En web, usar window.confirm en lugar de Alert.alert si es necesario
      if (Platform.OS === 'web') {
        const verEvento = window.confirm('¡Éxito! Evento creado exitosamente. ¿Deseas ver el evento?');
        if (verEvento) {
          navigation.goBack();
          setTimeout(() => {
            navigation.navigate('DetalleEvento', { eventoId: nuevoEvento.id });
          }, 500);
        } else {
          navigation.goBack();
        }
      } else {
        Alert.alert(
          '¡Éxito!',
          'Evento creado exitosamente',
          [
            {
              text: 'Ver Evento',
              onPress: () => {
                navigation.goBack();
                setTimeout(() => {
                  navigation.navigate('DetalleEvento', { eventoId: nuevoEvento.id });
                }, 500);
              },
            },
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear el evento');
    } finally {
      setCargando(false);
    }
  };

  const { width } = Dimensions.get('window');
  const isWeb = Platform.OS === 'web';
  const isTablet = width >= 768;
  const maxWidth = isTablet ? 800 : '100%';
  const scrollViewRef = useRef<any>(null);

  // Agregar estilos CSS para scrollbars personalizadas en web
  useEffect(() => {
    if (isWeb && typeof document !== 'undefined') {
      const styleId = 'scrollbar-styles-crear-evento';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          /* Estilos globales para scrollbars en la pantalla */
          body::-webkit-scrollbar,
          html::-webkit-scrollbar,
          .scrollView-crear-evento::-webkit-scrollbar,
          .scrollView-crear-evento *::-webkit-scrollbar,
          [class*="scrollView"]::-webkit-scrollbar {
            width: 12px !important;
            height: 12px !important;
          }
          body::-webkit-scrollbar-track,
          html::-webkit-scrollbar-track,
          .scrollView-crear-evento::-webkit-scrollbar-track,
          .scrollView-crear-evento *::-webkit-scrollbar-track,
          [class*="scrollView"]::-webkit-scrollbar-track {
            background: ${temaApp.colors.background} !important;
            border-radius: 6px !important;
          }
          body::-webkit-scrollbar-thumb,
          html::-webkit-scrollbar-thumb,
          .scrollView-crear-evento::-webkit-scrollbar-thumb,
          .scrollView-crear-evento *::-webkit-scrollbar-thumb,
          [class*="scrollView"]::-webkit-scrollbar-thumb {
            background: ${temaApp.colors.primary}CC !important;
            border-radius: 6px !important;
            border: 2px solid ${temaApp.colors.background} !important;
          }
          body::-webkit-scrollbar-thumb:hover,
          html::-webkit-scrollbar-thumb:hover,
          .scrollView-crear-evento::-webkit-scrollbar-thumb:hover,
          .scrollView-crear-evento *::-webkit-scrollbar-thumb:hover,
          [class*="scrollView"]::-webkit-scrollbar-thumb:hover {
            background: ${temaApp.colors.primary} !important;
          }
          /* Para Firefox */
          body, html, .scrollView-crear-evento {
            scrollbar-width: thin !important;
            scrollbar-color: ${temaApp.colors.primary}CC ${temaApp.colors.background} !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, [isWeb]);

  // Aplicar clase CSS al elemento del ScrollView después del render
  useEffect(() => {
    if (isWeb && scrollViewRef.current) {
      const applyScrollbarClass = () => {
        try {
          // Intentar obtener el elemento DOM del ScrollView
          const scrollViewElement = scrollViewRef.current?._component || 
                                   scrollViewRef.current?.getScrollableNode?.() ||
                                   scrollViewRef.current?.getNativeScrollRef?.()?.current;
          
          if (scrollViewElement) {
            // Buscar el div con overflow que realmente hace el scroll
            const scrollableDiv = scrollViewElement.querySelector?.('div[style*="overflow"]') || 
                                 scrollViewElement.querySelector?.('div') ||
                                 scrollViewElement;
            
            if (scrollableDiv && scrollableDiv.classList) {
              scrollableDiv.classList.add('scrollView-crear-evento');
              
              // También aplicar a todos los divs hijos por si acaso
              const allDivs = scrollableDiv.querySelectorAll?.('div') || [];
              allDivs.forEach((div: any) => {
                if (div.style && (div.style.overflow === 'auto' || div.style.overflow === 'scroll' || div.style.overflowY === 'auto' || div.style.overflowY === 'scroll')) {
                  div.classList?.add('scrollView-crear-evento');
                }
              });
            }
          }
        } catch (error) {
          console.log('Error aplicando scrollbar class:', error);
        }
      };

      // Aplicar inmediatamente
      applyScrollbarClass();
      
      // Y después de un delay para asegurarse
      const timer = setTimeout(applyScrollbarClass, 200);
      return () => clearTimeout(timer);
    }
  }, [isWeb]);

  const contenido = (
    <>
    <ScrollView
      ref={scrollViewRef}
      style={estilos.scrollView}
      contentContainerStyle={[
        estilos.scrollContent,
        isWeb && { alignItems: 'center', paddingHorizontal: isTablet ? espaciado.xl : espaciado.md },
      ]}
      showsVerticalScrollIndicator={true}
      showsHorizontalScrollIndicator={true}
      keyboardShouldPersistTaps="handled"
      {...(isWeb && {
        className: 'scrollView-crear-evento',
      })}
    >
        <Card style={[estilos.card, { maxWidth }]}>
          <CardContent>
            <Text style={estilos.titulo}>Crear nuevo evento</Text>
            <Text style={estilos.subtitulo}>Completa los datos de tu encuentro pet-friendly</Text>

            {/* Título */}
            <View style={estilos.campoContainer}>
              <TextInput
                label="Título *"
                value={titulo}
                onChangeText={setTitulo}
                mode="outlined"
                style={estilos.campo}
                placeholder="Ej: Encuentro en parque pet-friendly"
                disabled={cargando}
              />
            </View>

            {/* Descripción */}
            <View style={estilos.campoContainer}>
              <TextInput
                label="Descripción *"
                value={descripcion}
                onChangeText={setDescripcion}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={estilos.campo}
                placeholder="Describe tu evento..."
                disabled={cargando}
              />
            </View>

            {/* Tipo */}
            <View style={estilos.campoContainer}>
              <TextInput
                label="Categoría del evento *"
                value={tipo}
                onChangeText={setTipo}
                mode="outlined"
                style={estilos.campo}
                placeholder="Ej: paseo, parque, merienda, encuentro..."
                disabled={cargando}
              />
              <Text style={estilos.hint}>
                Ejemplos: paseo, parque, cafetería pet-friendly, encuentro, adopción, socialización
              </Text>
            </View>

            {/* Imagen opcional */}
            <View style={estilos.campoContainer}>
              <TextInput
                label="URL de imagen (opcional)"
                value={imagenUrl}
                onChangeText={setImagenUrl}
                mode="outlined"
                style={estilos.campo}
                placeholder="https://... para diferenciar este evento"
                disabled={cargando}
              />
              <Text style={estilos.hint}>
                Si no agregas una imagen, usamos una portada de ejemplo según el tipo de evento.
              </Text>
              <View style={estilos.accionesImagen}>
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={seleccionarImagenEvento}
                  loading={cargandoImagen}
                >
                  Buscar imagen
                </Button>
                {!!imagenUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setImagenUrl('')}
                  >
                    Quitar
                  </Button>
                )}
              </View>
              {!!imagenUrl && (
                <View style={estilos.previewContainer}>
                  <Image
                    source={{ uri: imagenUrl }}
                    style={estilos.previewImagen}
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>

            {/* Ritmo sugerido */}
            <View style={estilos.campoContainer}>
              <TextInput
                label="Ritmo sugerido (1-5)"
                value={nivelDificultad}
                onChangeText={setNivelDificultad}
                mode="outlined"
                keyboardType="numeric"
                style={estilos.campo}
                disabled={cargando}
              />
            </View>

            {/* Fecha de inicio */}
            <View style={estilos.campoContainer}>
              <Text style={estilos.label}>Fecha y hora de inicio *</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="datetime-local"
                  value={fechaInicio}
                  onChange={(e) => {
                    setFechaInicio(e.target.value);
                    e.currentTarget.blur();
                  }}
                  min={obtenerMinFechaHora()}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '16px',
                    border: `2px solid ${temaApp.colors.border}`,
                    borderRadius: '8px',
                    backgroundColor: temaApp.colors.surface,
                    color: temaApp.colors.onSurface,
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    minHeight: '56px',
                    cursor: 'pointer',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = temaApp.colors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${temaApp.colors.primary}33`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = temaApp.colors.border;
                    e.target.style.boxShadow = 'none';
                  }}
                  disabled={cargando}
                />
              ) : (
                <TouchableOpacity
                  onPress={abrirSelectorFechaInicio}
                  disabled={cargando}
                  style={[estilos.botonFecha, cargando && estilos.botonFechaDeshabilitado]}
                >
                  <View style={estilos.botonFechaContent}>
                    <MaterialIcons name="calendar-today" size={20} color={temaApp.colors.primary} />
                    <Text style={[estilos.botonFechaTexto, !fechaInicio && estilos.botonFechaTextoPlaceholder]}>
                      {fechaInicio ? formatearFechaParaMostrar(fechaInicio) : 'Seleccionar fecha y hora'}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={temaApp.colors.onSurfaceVariant} />
                </TouchableOpacity>
              )}
            </View>

            {/* Fecha de fin (opcional) */}
            <View style={estilos.campoContainer}>
              <Text style={estilos.label}>Fecha y hora de fin (opcional)</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="datetime-local"
                  value={fechaFin}
                  onChange={(e) => {
                    setFechaFin(e.target.value);
                    e.currentTarget.blur();
                  }}
                  min={fechaInicio || obtenerMinFechaHora()}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '16px',
                    border: `2px solid ${temaApp.colors.border}`,
                    borderRadius: '8px',
                    backgroundColor: temaApp.colors.surface,
                    color: temaApp.colors.onSurface,
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    minHeight: '56px',
                    cursor: 'pointer',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = temaApp.colors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${temaApp.colors.primary}33`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = temaApp.colors.border;
                    e.target.style.boxShadow = 'none';
                  }}
                  disabled={cargando}
                />
              ) : (
                <TouchableOpacity
                  onPress={abrirSelectorFechaFin}
                  disabled={cargando}
                  style={[estilos.botonFecha, cargando && estilos.botonFechaDeshabilitado]}
                >
                  <View style={estilos.botonFechaContent}>
                    <MaterialIcons name="calendar-today" size={20} color={temaApp.colors.primary} />
                    <Text style={[estilos.botonFechaTexto, !fechaFin && estilos.botonFechaTextoPlaceholder]}>
                      {fechaFin ? formatearFechaParaMostrar(fechaFin) : 'Seleccionar fecha y hora'}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={temaApp.colors.onSurfaceVariant} />
                </TouchableOpacity>
              )}
            </View>

            {/* Duración */}
            <View style={estilos.campoContainer}>
              <TextInput
                label="Duración en minutos (opcional)"
                value={duracion}
                onChangeText={setDuracion}
                mode="outlined"
                keyboardType="numeric"
                style={estilos.campo}
                disabled={cargando}
              />
            </View>

            {/* Máximo de participantes */}
            <View style={estilos.campoContainer}>
              <TextInput
                label="Máximo de participantes (opcional)"
                value={maxParticipantes}
                onChangeText={setMaxParticipantes}
                mode="outlined"
                keyboardType="numeric"
                style={estilos.campo}
                disabled={cargando}
              />
            </View>

            {/* Precio */}
            <View style={estilos.campoContainer}>
              <TextInput
                label="Precio (opcional)"
                value={precio}
                onChangeText={setPrecio}
                mode="outlined"
                keyboardType="decimal-pad"
                style={estilos.campo}
                disabled={cargando}
              />
            </View>

            {/* Opciones */}
            <View style={estilos.opcionesContainer}>
              <Button
                variant={esPetFriendly ? 'default' : 'secondary'}
                size="sm"
                onPress={() => setEsPetFriendly(!esPetFriendly)}
                style={estilos.opcionBoton}
                disabled={cargando}
              >
                <MaterialIcons
                  name={esPetFriendly ? 'check-circle' : 'circle'}
                  size={20}
                />
                <Text style={estilos.opcionTexto}>Pet Friendly</Text>
              </Button>

              <Button
                variant={esPremium ? 'default' : 'secondary'}
                size="sm"
                onPress={() => setEsPremium(!esPremium)}
                style={estilos.opcionBoton}
                disabled={cargando}
              >
                <MaterialIcons
                  name={esPremium ? 'star' : 'star-border'}
                  size={20}
                />
                <Text style={estilos.opcionTexto}>Premium</Text>
              </Button>
            </View>

            {/* Botón crear */}
            <Button
              variant="default"
              size="lg"
              onPress={manejarCrearEvento}
              loading={cargando}
              style={estilos.botonCrear}
            >
              {cargando ? 'Creando...' : 'Crear Evento'}
            </Button>

            {/* Botón cancelar */}
            <Button
              variant="secondary"
              size="lg"
              onPress={() => navigation.goBack()}
              disabled={cargando}
              style={estilos.botonCancelar}
            >
              Cancelar
            </Button>
          </CardContent>
        </Card>
      </ScrollView>

      {/* Modal para seleccionar fecha y hora (móvil) */}
      <Portal>
        <Dialog 
          visible={mostrarFechaInicio || mostrarFechaFin} 
          onDismiss={cancelarFecha}
          style={estilos.dialog}
        >
          <Dialog.Title>
            Seleccionar {campoFechaActivo === 'inicio' ? 'Fecha de Inicio' : 'Fecha de Fin'}
          </Dialog.Title>
          <Dialog.Content>
            <View style={estilos.selectorFechaContainer}>
              {/* Selector de fecha */}
              <View style={estilos.selectorFechaItem}>
                <Text style={estilos.selectorFechaLabel}>Fecha</Text>
                <TextInput
                  mode="outlined"
                  value={fechaTemp.fecha}
                  onChangeText={(text) => setFechaTemp({ ...fechaTemp, fecha: text })}
                  placeholder="YYYY-MM-DD"
                  style={estilos.selectorFechaInput}
                  keyboardType="default"
                />
                <Text style={estilos.hint}>Formato: YYYY-MM-DD (ej: 2024-12-25)</Text>
              </View>

              {/* Selector de hora */}
              <View style={estilos.selectorFechaItem}>
                <Text style={estilos.selectorFechaLabel}>Hora</Text>
                <TextInput
                  mode="outlined"
                  value={fechaTemp.hora}
                  onChangeText={(text) => setFechaTemp({ ...fechaTemp, hora: text })}
                  placeholder="HH:mm"
                  style={estilos.selectorFechaInput}
                  keyboardType="default"
                />
                <Text style={estilos.hint}>Formato: HH:mm (ej: 14:30)</Text>
              </View>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton onPress={cancelarFecha}>Cancelar</PaperButton>
            <PaperButton onPress={confirmarFecha} mode="contained">Confirmar</PaperButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );

  // En web, no usar KeyboardAvoidingView porque limita el scroll
  if (isWeb) {
    return <View style={estilos.contenedor}>{contenido}</View>;
  }

  return (
    <KeyboardAvoidingView
      style={estilos.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {contenido}
    </KeyboardAvoidingView>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: temaApp.colors.background,
    ...(isWeb && {
      height: '100vh',
      overflow: 'hidden',
    }),
  },
  scrollView: {
    flex: 1,
    ...(isWeb && {
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
    }),
  } as any,
  scrollContent: {
    padding: espaciado.md,
    paddingBottom: 200, // Más espacio al final para asegurar scroll completo
    ...(isWeb && {
      paddingHorizontal: SCREEN_WIDTH >= 768 ? espaciado.xl : espaciado.md,
      paddingVertical: SCREEN_WIDTH >= 768 ? espaciado.xl : espaciado.md,
      paddingBottom: 300, // Mucho más espacio en web para ver todo
      minHeight: 'auto', // No limitar altura mínima
    }),
  },
  card: {
    ...sombras.media,
    width: '100%',
    ...(isWeb && {
      alignSelf: 'center',
      marginTop: SCREEN_WIDTH >= 768 ? 20 : 0,
      marginBottom: 0,
      maxWidth: SCREEN_WIDTH >= 768 ? 800 : '100%',
      padding: SCREEN_WIDTH >= 768 ? espaciado.xl : espaciado.lg,
      borderRadius: 20,
    }),
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.xs,
    ...(isWeb && {
      fontSize: SCREEN_WIDTH >= 768 ? 32 : 24,
      textAlign: SCREEN_WIDTH >= 768 ? 'center' : 'left',
      color: temaApp.colors.primary,
      fontWeight: '800' as const,
      ...(fontDisplay ? { fontFamily: fontDisplay } : {}),
    }),
  },
  subtitulo: {
    fontSize: 14,
    color: temaApp.colors.onSurfaceVariant,
    marginBottom: espaciado.lg,
    ...(isWeb && {
      fontSize: SCREEN_WIDTH >= 768 ? 16 : 14,
      textAlign: SCREEN_WIDTH >= 768 ? 'center' : 'left',
      ...(fontSans ? { fontFamily: fontSans } : {}),
    }),
  },
  campoContainer: {
    marginBottom: espaciado.md,
    width: '100%',
    ...(isWeb && {
      marginBottom: SCREEN_WIDTH >= 768 ? espaciado.lg : espaciado.md,
    }),
  },
  campo: {
    backgroundColor: temaApp.colors.surface,
    ...(isWeb && {
      minHeight: 56,
      fontSize: 16,
    }),
  },
  hint: {
    fontSize: 12,
    color: temaApp.colors.onSurfaceVariant,
    marginTop: espaciado.xs,
    fontStyle: 'italic',
  },
  accionesImagen: {
    flexDirection: 'row',
    gap: espaciado.sm,
    marginTop: espaciado.sm,
    flexWrap: 'wrap',
  },
  previewContainer: {
    marginTop: espaciado.md,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: temaApp.colors.border,
  },
  previewImagen: {
    width: '100%',
    height: 180,
    backgroundColor: temaApp.colors.surfaceVariant,
  },
  opcionesContainer: {
    flexDirection: 'row',
    gap: espaciado.md,
    marginBottom: espaciado.lg,
    flexWrap: isWeb ? 'wrap' : 'nowrap',
    ...(isWeb && SCREEN_WIDTH < 768 && {
      flexDirection: 'column',
    }),
  },
  opcionBoton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.xs,
  },
  opcionTexto: {
    fontSize: 14,
    fontWeight: '500',
  },
  botonCrear: {
    marginBottom: espaciado.md,
    width: '100%',
    ...(isWeb && {
      minHeight: 48,
      fontSize: 16,
    }),
  },
  botonCancelar: {
    marginBottom: espaciado.md,
    width: '100%',
    ...(isWeb && {
      minHeight: 48,
      fontSize: 16,
    }),
  },
  botonFecha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: espaciado.md,
    backgroundColor: temaApp.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: temaApp.colors.border,
    minHeight: 56,
    width: '100%',
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'all 0.2s',
      ':hover': {
        borderColor: temaApp.colors.primary,
        backgroundColor: temaApp.colors.surfaceVariant,
      },
    }),
  },
  botonFechaDeshabilitado: {
    opacity: 0.5,
  },
  botonFechaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: espaciado.sm,
  },
  botonFechaTexto: {
    fontSize: 16,
    color: temaApp.colors.onSurface,
    flex: 1,
    ...(isWeb && {
      fontSize: SCREEN_WIDTH >= 768 ? 18 : 16,
    }),
  },
  botonFechaTextoPlaceholder: {
    color: temaApp.colors.onSurfaceVariant,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.xs,
    ...(isWeb && {
      fontSize: SCREEN_WIDTH >= 768 ? 16 : 14,
      ...(fontSans ? { fontFamily: fontSans } : {}),
    }),
  },
  dialog: {
    backgroundColor: temaApp.colors.surface,
  },
  selectorFechaContainer: {
    gap: espaciado.md,
  },
  selectorFechaItem: {
    marginBottom: espaciado.md,
  },
  selectorFechaLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.xs,
  },
  selectorFechaInput: {
    backgroundColor: temaApp.colors.surface,
  },
});
