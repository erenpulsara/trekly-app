import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Difficulty } from '../../types';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  style?: ViewStyle;
}

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; bg: string; text: string }
> = {
  easy: { label: 'Kolay', bg: '#22C55E', text: '#FFFFFF' },
  medium: { label: 'Orta', bg: '#F59E0B', text: '#FFFFFF' },
  hard: { label: 'Zor', bg: '#FF5A1F', text: '#FFFFFF' },
  extreme: { label: 'Ekstrem', bg: '#EF4444', text: '#FFFFFF' },
};

export function DifficultyBadge({ difficulty, style }: DifficultyBadgeProps) {
  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
