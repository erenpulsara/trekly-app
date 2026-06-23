import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TreklyLogo } from '../../components/common/TreklyLogo';

type TabKey = 'km' | 'altitude' | 'duration';

const TAB_LABELS: Record<TabKey, string> = {
  km: 'KM',
  altitude: 'İrtifa',
  duration: 'Süre',
};

export function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('altitude');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="menu-outline" size={26} color="#1A1A1A" />
        </TouchableOpacity>
        <TreklyLogo />
        <View style={styles.avatarSmallContainer}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>E</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Aylık Sıralama</Text>
          <Text style={styles.subtitle}>En iyi maceracılar burada sıralanacak.</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {(Object.keys(TAB_LABELS) as TabKey[]).map((key) => (
            <TouchableOpacity
              key={key}
              style={[styles.tab, activeTab === key && styles.tabActive]}
              onPress={() => setActiveTab(key)}
            >
              <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>
                {TAB_LABELS[key]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Empty state */}
        <View style={styles.emptyState}>
          <Ionicons name="trophy-outline" size={64} color="#E5E5E5" />
          <Text style={styles.emptyTitle}>Henüz veri yok</Text>
          <Text style={styles.emptySubtitle}>Turlara katıldıkça sıralama burada görünecek.</Text>
        </View>
      </ScrollView>
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
  avatarSmallContainer: {},
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF5A1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmallText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  titleSection: { paddingHorizontal: 20, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280' },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 28,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabActive: { backgroundColor: '#FFFFFF' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#FF5A1F' },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 20,
  },
});
