import React from 'react';
import { View, Image, Text, StyleSheet, TextStyle } from 'react-native';

interface TreklyLogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: TextStyle;
  showIcon?: boolean;
}

export function TreklyLogo({ size = 'medium', color = '#FF5A1F', style, showIcon = false }: TreklyLogoProps) {
  const fontSize = size === 'small' ? 20 : size === 'large' ? 36 : 26;
  const iconSize = size === 'small' ? 22 : size === 'large' ? 40 : 30;

  const text = (
    <Text style={[styles.logo, { fontSize, color }, style]}>
      Trekly
    </Text>
  );

  if (!showIcon) return text;

  return (
    <View style={styles.row}>
      <Image
        source={require('../../../assets/logo.png')}
        style={{ width: iconSize, height: iconSize }}
        resizeMode="contain"
      />
      {text}
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
