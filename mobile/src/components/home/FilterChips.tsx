import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface FilterChip {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const DEFAULT_CHIPS: FilterChip[] = [
  { key: 'all', label: 'Tümü', icon: 'apps-outline' },
  { key: 'climbing', label: 'Tırmanış', icon: 'flag-outline' },
  { key: 'trekking', label: 'Trekking', icon: 'footsteps-outline' },
  { key: 'camping', label: 'Kamp', icon: 'bonfire-outline' },
  { key: 'hiking', label: 'Doğa Yürüyüşü', icon: 'leaf-outline' },
];

interface FilterChipsProps {
  chips?: FilterChip[];
  selected: string;
  onSelect: (key: string) => void;
}

export function FilterChips({ chips = DEFAULT_CHIPS, selected, onSelect }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {chips.map((chip) => {
        const isActive = chip.key === selected;
        return (
          <TouchableOpacity
            key={chip.key}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(chip.key)}
            activeOpacity={0.75}
          >
            {chip.icon && (
              <Ionicons
                name={chip.icon}
                size={15}
                color={isActive ? '#FFFFFF' : '#6B7280'}
              />
            )}
            <Text style={[styles.label, isActive && styles.labelActive]}>{chip.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  chipActive: {
    backgroundColor: '#FF5A1F',
    borderColor: '#FF5A1F',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
