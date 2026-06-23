import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BookingStatus } from '../../types';

interface StatusBadgeProps {
  status: BookingStatus;
  style?: ViewStyle;
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Onay Bekliyor', bg: '#FEF3C7', text: '#D97706' },
  confirmed: { label: 'Onaylandı', bg: '#DCFCE7', text: '#16A34A' },
  completed: { label: 'Tamamlandı', bg: '#EFF6FF', text: '#2563EB' },
  cancelled: { label: 'İptal Edildi', bg: '#FEE2E2', text: '#DC2626' },
};

export function StatusBadge({ status, style }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

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
  },
});
