// Selector tipo combo box reutilizable - Indio
// Muestra un campo con opciones predefinidas para evitar errores de tipeo
// en ciudades, zonas, precios y filtros.

import React, { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Menu, Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

import { temaApp, espaciado } from '../constantes/tema';

export interface OpcionSelector {
  valor: string;
  etiqueta: string;
  icono?: keyof typeof MaterialIcons.glyphMap;
}

interface Props {
  etiqueta?: string;
  placeholder?: string;
  valor: string;
  opciones: OpcionSelector[];
  onChange: (valor: string) => void;
  icono?: keyof typeof MaterialIcons.glyphMap;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function SelectorCampo({
  etiqueta,
  placeholder = 'Elegir opción',
  valor,
  opciones,
  onChange,
  icono,
  disabled = false,
  style,
}: Props): JSX.Element {
  const [abierto, setAbierto] = useState(false);
  const seleccionada = opciones.find((opcion) => opcion.valor === valor);

  return (
    <View style={[estilos.contenedor, style]}>
      {!!etiqueta && <Text style={estilos.etiqueta}>{etiqueta}</Text>}
      <Menu
        visible={abierto}
        onDismiss={() => setAbierto(false)}
        anchor={
          <TouchableOpacity
            activeOpacity={0.8}
            disabled={disabled}
            onPress={() => setAbierto(true)}
            accessibilityRole="button"
            accessibilityLabel={etiqueta || placeholder}
            style={[estilos.campo, disabled && estilos.campoDeshabilitado]}
          >
            {icono && (
              <MaterialIcons
                name={icono}
                size={18}
                color={disabled ? temaApp.colors.disabled : temaApp.colors.onSurfaceVariant}
              />
            )}
            <Text
              numberOfLines={1}
              style={[
                estilos.valor,
                !seleccionada && estilos.placeholder,
                disabled && estilos.valorDeshabilitado,
              ]}
            >
              {seleccionada?.etiqueta || valor || placeholder}
            </Text>
            <MaterialIcons
              name="expand-more"
              size={20}
              color={disabled ? temaApp.colors.disabled : temaApp.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        }
      >
        {opciones.map((opcion) => (
          <Menu.Item
            key={opcion.valor}
            title={opcion.etiqueta}
            leadingIcon={opcion.icono}
            trailingIcon={opcion.valor === valor ? 'check' : undefined}
            onPress={() => {
              onChange(opcion.valor);
              setAbierto(false);
            }}
          />
        ))}
        {opciones.length === 0 && (
          <Menu.Item title="Sin opciones disponibles" disabled />
        )}
      </Menu>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    marginBottom: espaciado.sm,
  },
  etiqueta: {
    fontSize: 12,
    fontWeight: '700',
    color: temaApp.colors.onSurface,
    marginBottom: espaciado.xs,
  },
  campo: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciado.sm,
    backgroundColor: temaApp.colors.surface,
    borderWidth: 1,
    borderColor: temaApp.colors.border,
    borderRadius: 8,
    paddingHorizontal: espaciado.md,
  },
  campoDeshabilitado: {
    backgroundColor: temaApp.colors.surfaceVariant,
    opacity: 0.8,
  },
  valor: {
    flex: 1,
    fontSize: 15,
    color: temaApp.colors.onSurface,
  },
  placeholder: {
    color: temaApp.colors.onSurfaceVariant,
  },
  valorDeshabilitado: {
    color: temaApp.colors.disabled,
  },
});
