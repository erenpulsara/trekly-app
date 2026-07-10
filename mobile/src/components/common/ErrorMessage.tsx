import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export function ErrorMessage({
  message,
  onRetry,
  style,
}: ErrorMessageProps) {
  const { t } = useLanguage();
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
      <Text style={styles.message}>{message ?? t.common.genericError}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>{t.common.retry}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF5A1F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
