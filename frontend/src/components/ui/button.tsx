// Button Component - Adaptado de shadcn/ui para React Native
// Inspirado en la estructura con variantes y tamaños

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { temaApp } from '@/constantes/tema';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  style?: any;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconPosition?: 'left' | 'right';
}

export function Button({
  children,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  onPress,
  style,
  icon,
  iconPosition = 'left',
}: ButtonProps) {
  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size, !!icon && !children);
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        variantStyles.button,
        sizeStyles.button,
        isDisabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text.color} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <MaterialIcons
              name={icon}
              size={sizeStyles.iconSize}
              color={variantStyles.text.color}
              style={styles.iconLeft}
            />
          )}
          {children && (
            <Text style={[styles.text, variantStyles.text, sizeStyles.text]}>
              {children}
            </Text>
          )}
          {icon && iconPosition === 'right' && (
            <MaterialIcons
              name={icon}
              size={sizeStyles.iconSize}
              color={variantStyles.text.color}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

function getVariantStyles(variant: ButtonVariant) {
  switch (variant) {
    case 'default':
      return {
        button: {
          backgroundColor: temaApp.colors.primary,
        },
        text: {
          color: temaApp.colors.onPrimary,
        },
      };
    case 'destructive':
      return {
        button: {
          backgroundColor: temaApp.colors.error,
        },
        text: {
          color: '#FFFFFF',
        },
      };
    case 'outline':
      return {
        button: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: temaApp.colors.border,
        },
        text: {
          color: temaApp.colors.onSurface,
        },
      };
    case 'secondary':
      return {
        button: {
          backgroundColor: temaApp.colors.secondary,
        },
        text: {
          color: temaApp.colors.onSecondary,
        },
      };
    case 'ghost':
      return {
        button: {
          backgroundColor: 'transparent',
        },
        text: {
          color: temaApp.colors.onSurface,
        },
      };
    case 'link':
      return {
        button: {
          backgroundColor: 'transparent',
        },
        text: {
          color: temaApp.colors.primary,
          textDecorationLine: 'underline',
        },
      };
    default:
      return getVariantStyles('default');
  }
}

function getSizeStyles(size: ButtonSize, iconOnly: boolean) {
  if (iconOnly) {
    switch (size) {
      case 'sm':
        return {
          button: { width: 32, height: 32, padding: 0 },
          iconSize: 16,
        };
      case 'lg':
        return {
          button: { width: 40, height: 40, padding: 0 },
          iconSize: 24,
        };
      default:
        return {
          button: { width: 36, height: 36, padding: 0 },
          iconSize: 20,
        };
    }
  }

  switch (size) {
    case 'sm':
      return {
        button: { paddingVertical: 6, paddingHorizontal: 12, minHeight: 32 },
        text: { fontSize: 14 },
        iconSize: 16,
      };
    case 'lg':
      return {
        button: { paddingVertical: 12, paddingHorizontal: 24, minHeight: 40 },
        text: { fontSize: 16 },
        iconSize: 24,
      };
    default:
      return {
        button: { paddingVertical: 10, paddingHorizontal: 16, minHeight: 36 },
        text: { fontSize: 15 },
        iconSize: 20,
      };
  }
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    ...temaApp.roundness === 12 ? { borderRadius: 12 } : {},
  },
  text: {
    fontWeight: '500',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});

