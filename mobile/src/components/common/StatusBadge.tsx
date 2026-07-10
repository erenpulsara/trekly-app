import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { BookingStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface StatusBadgeProps {
  status: BookingStatus;
  style?: ViewStyle;
}

const STATUS_COLORS: Record<BookingStatus, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#D97706' },
  confirmed: { bg: '#DCFCE7', text: '#16A34A' },
  completed: { bg: '#EFF6FF', text: '#2563EB' },
  cancelled: { bg: '#FEE2E2', text: '#DC2626' },
};

export function StatusBadge({ status, style }: StatusBadgeProps) {
  const { t } = useLanguage();
  const colors = STATUS_COLORS[status];
  const labels: Record<BookingStatus, string> = {
    pending: t.common.statusPending,
    confirmed: t.common.statusConfirmed,
    completed: t.common.statusCompleted,
    cancelled: t.common.statusCancelled,
  };

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{labels[status]}</Text>
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
