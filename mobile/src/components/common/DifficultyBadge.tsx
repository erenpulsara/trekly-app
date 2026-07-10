import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Difficulty } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  style?: ViewStyle;
}

// Yalnızca renkler burada; etiket dile göre t.tourDetail.diff'ten gelir.
const DIFFICULTY_COLOR: Record<Difficulty, { bg: string; text: string }> = {
  easy: { bg: '#22C55E', text: '#FFFFFF' },
  easy_medium: { bg: '#84CC16', text: '#FFFFFF' },
  medium: { bg: '#F59E0B', text: '#FFFFFF' },
  medium_hard: { bg: '#F97316', text: '#FFFFFF' },
  hard: { bg: '#FF5A1F', text: '#FFFFFF' },
  very_hard: { bg: '#DC2626', text: '#FFFFFF' },
  extreme: { bg: '#B91C1C', text: '#FFFFFF' },
};

export function DifficultyBadge({ difficulty, style }: DifficultyBadgeProps) {
  const { t } = useLanguage();
  const color = DIFFICULTY_COLOR[difficulty] ?? DIFFICULTY_COLOR.easy;
  const label = t.tourDetail.diff[difficulty] ?? t.tourDetail.diff.easy;

  return (
    <View style={[styles.badge, { backgroundColor: color.bg }, style]}>
      <Text style={[styles.text, { color: color.text }]}>{label}</Text>
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
