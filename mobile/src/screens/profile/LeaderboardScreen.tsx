import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/AppNavigator';
import { leaderboardService, LeaderboardEntry } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { getUserLevel } from '../../utils/levels';
import { useAuth } from '../../context/AuthContext';

type Props = {
  navigation: StackNavigationProp<MainStackParamList, 'Leaderboard'>;
};

const MEDALS = ['🥇', '🥈', '🥉'];

export function LeaderboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<{ rank: number; total_points: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstLoad = useRef(true);

  const fetchData = useCallback(async (showSpinner = false) => {
    try {
      if (showSpinner) setIsLoading(true);
      setError(null);
      const [list, mine] = await Promise.all([
        leaderboardService.getTop(),
        user ? leaderboardService.getMyRank().catch(() => null) : Promise.resolve(null),
      ]);
      setEntries(list);
      setMyRank(mine);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Liderlik tablosu yüklenemedi.');
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchData(firstLoad.current);
      firstLoad.current = false;
    }, [fetchData])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  }, [fetchData]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Liderlik Tablosu</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => fetchData(true)} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => `${item.rank}-${item.name}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#FF5A1F" />
          }
          ListHeaderComponent={
            <>
              <Text style={styles.subtitle}>Turlara katıl, XP kazan, zirveye tırman! 🏔️</Text>
              {user && myRank && (
                <View style={styles.myRankCard}>
                  <View style={styles.myRankAvatar}>
                    <Text style={styles.myRankAvatarText}>
                      {user.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.myRankTitle}>Senin Sıran: #{myRank.rank}</Text>
                    <Text style={styles.myRankSub}>
                      Seviye {getUserLevel(myRank.total_points).level} — {getUserLevel(myRank.total_points).title}
                    </Text>
                  </View>
                  <Text style={styles.myRankPoints}>
                    {myRank.total_points.toLocaleString('tr-TR')} XP
                  </Text>
                </View>
              )}
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={56} color="#E5E5E5" />
              <Text style={styles.emptyText}>Henüz sıralama oluşmadı.{'\n'}İlk XP kazanan sen ol!</Text>
            </View>
          }
          renderItem={({ item }) => {
            const level = getUserLevel(item.total_points);
            const isTop3 = item.rank <= 3;
            return (
              <View style={[styles.row, isTop3 && styles.rowTop3]}>
                <Text style={[styles.rank, isTop3 && styles.rankTop3]}>
                  {isTop3 ? MEDALS[item.rank - 1] : `#${item.rank}`}
                </Text>
                <View style={[styles.avatar, isTop3 && styles.avatarTop3]}>
                  <Text style={[styles.avatarText, isTop3 && { color: '#FFFFFF' }]}>
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name} {item.surname_initial}
                  </Text>
                  <Text style={styles.levelText}>
                    Seviye {level.level} — {level.title}
                  </Text>
                </View>
                <Text style={styles.points}>
                  {item.total_points.toLocaleString('tr-TR')} XP
                </Text>
              </View>
            );
          }}
        />
      )}
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
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  listContent: {
    padding: 20,
    paddingBottom: 32,
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  myRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  myRankAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FF5A1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  myRankAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  myRankTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  myRankSub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    marginTop: 2,
  },
  myRankPoints: {
    color: '#FF5A1F',
    fontSize: 15,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  rowTop3: {
    backgroundColor: '#FFFDF7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  rank: {
    width: 34,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
    color: '#9CA3AF',
  },
  rankTop3: {
    fontSize: 20,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTop3: {
    backgroundColor: '#FF5A1F',
  },
  avatarText: {
    fontWeight: '800',
    fontSize: 15,
    color: '#6B7280',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  levelText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  points: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF5A1F',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 21,
  },
});
