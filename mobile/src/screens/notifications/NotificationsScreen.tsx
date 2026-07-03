import React from 'react';
import {
  View,
  Text,
  StyleSheet,  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TreklyLogo } from '../../components/common/TreklyLogo';
import { useAuth } from '../../context/AuthContext';

export function NotificationsScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TreklyLogo />
        <View style={styles.avatarSmall}>
          <Text style={styles.avatarSmallText}>
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </Text>
        </View>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Bildirimler</Text>
      </View>

      <View style={styles.emptyState}>
        <Ionicons name="notifications-outline" size={56} color="#E5E5E5" />
        <Text style={styles.emptyText}>Henüz bildiriminiz yok.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF9F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF5A1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmallText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  titleRow: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A1A' },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
