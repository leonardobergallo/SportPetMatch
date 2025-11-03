// Card Component - Adaptado de shadcn/ui para React Native
// Inspirado en la estructura

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { temaApp, sombras } from '@/constantes/tema';
import { cn } from '@/lib/utils';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
}

export function Card({ children, style, className }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardHeader({ children, style }: CardHeaderProps) {
  return (
    <View style={[styles.cardHeader, style]}>
      {children}
    </View>
  );
}

export interface CardTitleProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardTitle({ children, style }: CardTitleProps) {
  return (
    <View style={[styles.cardTitle, style]}>
      {children}
    </View>
  );
}

export interface CardDescriptionProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardDescription({ children, style }: CardDescriptionProps) {
  return (
    <View style={[styles.cardDescription, style]}>
      {children}
    </View>
  );
}

export interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
  return (
    <View style={[styles.cardContent, style]}>
      {children}
    </View>
  );
}

export interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardFooter({ children, style }: CardFooterProps) {
  return (
    <View style={[styles.cardFooter, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: temaApp.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: temaApp.colors.border,
    ...sombras.media,
    padding: 0,
  },
  cardHeader: {
    padding: 16,
    paddingBottom: 12,
  },
  cardTitle: {
    // Se maneja con Text component en el uso
  },
  cardDescription: {
    // Se maneja con Text component en el uso
  },
  cardContent: {
    padding: 16,
  },
  cardFooter: {
    padding: 16,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

