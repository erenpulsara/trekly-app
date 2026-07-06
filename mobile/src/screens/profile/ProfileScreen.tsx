import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { TreklyLogo } from '../../components/common/TreklyLogo';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { usersService } from '../../services/api';
import { User, PointsLog } from '../../types';
import { getUserLevel, getLevelProgress, getPointsToNextLevel } from '../../utils/levels';
import { MainStackParamList } from '../../navigation/AppNavigator';
import { BottomTabParamList } from '../../navigation/BottomTabNavigator';

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<BottomTabParamList, 'Profile'>,
    StackNavigationProp<MainStackParamList>
  >;
};


export function ProfileScreen({ navigation }: Props) {
  const { user: authUser, logout, isGuest, exitGuest } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [pointsLog, setPointsLog] = useState<PointsLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const [userData, points] = await Promise.all([
        usersService.getMe(),
        usersService.getPoints(),
      ]);
      setProfile(userData);
      setPointsLog(points);
    } catch {
      // use auth user as fallback
    }
  }, []);

  useEffect(() => {
    fetchProfile().finally(() => setIsLoading(false));
  }, [fetchProfile]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchProfile();
    setIsRefreshing(false);
  }, [fetchProfile]);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Bu işlem geri alınamaz. Tüm rezervasyonlarınız ve verileriniz kalıcı olarak silinecek.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Hesabı Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingAccount(true);
              await usersService.deleteAccount();
              await logout();
            } catch {
              Alert.alert('Hata', 'Hesap silinemedi. Lütfen tekrar deneyin.');
            } finally {
              setDeletingAccount(false);
            }
          },
        },
      ]
    );
  };

  const displayUser = profile ?? authUser;
  const totalPoints = displayUser?.total_points ?? 0;
  const levelInfo = getUserLevel(totalPoints);
  const progress = getLevelProgress(totalPoints);
  const toNext = getPointsToNextLevel(totalPoints);

  if (isGuest) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center', gap: 16 }]}>
        <StatusBar barStyle="dark-content" />
        <Ionicons name="person-circle-outline" size={72} color="#D1D5DB" />
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1A1A' }}>Profili görüntülemek için giriş yap</Text>
        <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', paddingHorizontal: 32 }}>
          Profilinizi yönetmek, rezervasyonlarınızı takip etmek ve puanlarınızı görmek için giriş yapın.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: '#FF5A1F', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, marginTop: 8 }}
          onPress={exitGuest}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Giriş Yap</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TreklyLogo />
        <View style={styles.avatarSmall}>
          <Text style={styles.avatarSmallText}>
            {displayUser?.name?.charAt(0).toUpperCase() ?? 'U'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#FF5A1F" />
        }
      >
        {/* Avatar + name section */}
        <View style={styles.heroSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {displayUser?.name?.charAt(0).toUpperCase() ?? 'U'}
                </Text>
              </View>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>LVL {levelInfo.level}</Text>
            </View>
          </View>

          <Text style={styles.userName}>
            {displayUser?.name} {displayUser?.surname}
          </Text>
          <Text style={styles.userEmail}>{displayUser?.email}</Text>
          {displayUser?.phone ? (
            <Text style={styles.userEmail}>{displayUser.phone}</Text>
          ) : null}
          <View style={styles.levelRow}>
            <Ionicons name="compass" size={14} color="#FF5A1F" />
            <Text style={styles.levelLabel}>
              Seviye {levelInfo.level} – {levelInfo.title}
            </Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
            <Text style={styles.progressLabel}>
              SONRAKİ SEVİYE: {toNext > 0 ? `${toNext} XP` : 'MAX'}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Etkinlik</Text>
            <Text style={styles.statValue}>{pointsLog.length}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Toplam XP</Text>
            <Text style={styles.statValue}>{totalPoints.toLocaleString('tr-TR')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Seviye</Text>
            <Text style={styles.statValue}>{levelInfo.level}</Text>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rozetler</Text>
          </View>
          <View style={styles.emptyCollection}>
            <Ionicons name="ribbon-outline" size={40} color="#D1D5DB" />
            <Text style={styles.emptyText}>Henüz rozet kazanılmadı</Text>
          </View>
        </View>

        {/* Points history / Collection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Koleksiyon</Text>
          </View>
          {pointsLog.length === 0 ? (
            <View style={styles.emptyCollection}>
              <Ionicons name="images-outline" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>Henüz tamamlanan tur yok</Text>
            </View>
          ) : (
            <View style={styles.collectionGrid}>
              {pointsLog.map((log) => (
                <View key={log.id} style={styles.collectionCard}>
                  <View style={styles.collectionImagePlaceholder}>
                    <Ionicons name="image-outline" size={28} color="#D1D5DB" />
                  </View>
                  <Text style={styles.collectionName} numberOfLines={2}>
                    {log.tour.name}
                  </Text>
                  <Text style={styles.collectionPoints}>+{log.points_earned} XP</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Menu links */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="create-outline" size={20} color="#374151" />
            <Text style={styles.menuItemText}>Profili Düzenle</Text>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Favorites')}
          >
            <Ionicons name="heart-outline" size={20} color="#374151" />
            <Text style={styles.menuItemText}>Favorilerim</Text>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('MyBookings')}
          >
            <Ionicons name="calendar-outline" size={20} color="#374151" />
            <Text style={styles.menuItemText}>Rezervasyonlarım</Text>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Ionicons name="trophy-outline" size={20} color="#374151" />
            <Text style={styles.menuItemText}>Liderlik Tablosu</Text>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('About')}
          >
            <Ionicons name="information-circle-outline" size={20} color="#374151" />
            <Text style={styles.menuItemText}>Hakkımızda</Text>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>

        {/* Delete Account */}
        <View style={styles.dangerSection}>
          <TouchableOpacity
            style={[styles.deleteBtn, deletingAccount && { opacity: 0.5 }]}
            onPress={handleDeleteAccount}
            disabled={deletingAccount}
          >
            <Text style={styles.deleteBtnText}>
              {deletingAccount ? 'Siliniyor...' : 'Hesabı Sil'}
            </Text>
          </TouchableOpacity>
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
  avatarBtn: {},
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF5A1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmallText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  heroSection: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 8 },
  avatarContainer: { alignItems: 'center', marginBottom: 16 },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FF5A1F',
    padding: 3,
  },
  avatar: {
    flex: 1,
    borderRadius: 50,
    backgroundColor: '#FF5A1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#FFFFFF' },
  levelBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  levelBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  userName: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', marginBottom: 2 },
  userEmail: { fontSize: 13, color: '#9CA3AF', marginBottom: 4 },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 20,
  },
  levelLabel: { fontSize: 14, color: '#FF5A1F', fontWeight: '600' },
  progressContainer: { width: '100%' },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF5A1F',
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: '800', color: '#FF5A1F' },
  statDivider: { width: 1, backgroundColor: '#F3F4F6' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  seeAll: { fontSize: 14, color: '#FF5A1F', fontWeight: '600' },
  badgesRow: { flexDirection: 'row', gap: 12 },
  badgeItem: { alignItems: 'center', flex: 1 },
  badgeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeName: { fontSize: 11, color: '#1A1A1A', fontWeight: '600', textAlign: 'center' },
  collectionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  collectionCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  collectionImagePlaceholder: {
    height: 80,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
    padding: 10,
    paddingBottom: 4,
  },
  collectionPoints: {
    fontSize: 12,
    color: '#FF5A1F',
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  emptyCollection: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
  menuSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  logoutSection: { paddingHorizontal: 20, paddingBottom: 12 },
  dangerSection: { paddingHorizontal: 20, paddingBottom: 40 },
  deleteBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF5F5',
  },
  deleteBtnText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    backgroundColor: '#FFF5F5',
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },
});
