import React from 'react';
import { Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface TreklyLogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: TextStyle;
}

export function TreklyLogo({ size = 'medium', color = '#FF5A1F', style }: TreklyLogoProps) {
  const fontSize = size === 'small' ? 20 : size === 'large' ? 36 : 26;

  return (
    <Text style={[styles.logo, { fontSize, color }, style]}>
      Trekly
    </Text>
  );
}

const styles = StyleSheet.create({
  logo: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
