import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/AppNavigator';
import { toursService } from '../../services/api';
import { Tour } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 16 * 3) / 2;
const HEIGHTS = [200, 160, 180, 220, 170, 190];

type Props = {
  navigation: StackNavigationProp<MainStackParamList, 'PopularTours'>;
};

type TabKey = 'popular' | 'following';

export function PopularToursScreen({ navigation }: Props) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('popular');
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  const fetchTours = useCallback(async () => {
    try {
      setError(null);
      const data = await toursService.getAll();
      setTours(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Turlar yüklenemedi.');
    }
  }, []);

  useEffect(() => {
    fetchTours().finally(() => setIsLoading(false));
  }, [fetchTours]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchTours();
    setIsRefreshing(false);
  }, [fetchTours]);

  function toggleLike(id: string) {
    setLikes((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const displayTours = activeTab === 'following' ? [] : tours;

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons name="search-outline" size={22} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['popular', 'following'] as TabKey[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'popular' ? 'Popüler' : 'Takip Edilenler'}
            </Text>
            {activeTab === tab && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {error ? (
        <ErrorMessage message={error} onRetry={fetchTours} />
      ) : (
        <FlatList
          data={displayTours}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={displayTours.length === 0 ? styles.emptyContainer : styles.grid}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#FF5A1F" />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={56} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>
                {activeTab === 'following' ? 'Henüz takip edilmiyor' : 'Tur bulunamadı'}
              </Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const cardHeight = HEIGHTS[index % HEIGHTS.length];
            const isLiked = likes[item.id] ?? false;
            const fakeLikeCount = Math.floor(Math.random() * 3000) + 500;

            return (
              <TouchableOpacity
                style={[styles.card, { height: cardHeight }]}
                onPress={() => navigation.navigate('TourDetail', { tourId: item.id })}
                activeOpacity={0.9}
              >
                {item.photo_urls.length > 0 ? (
                  <Image
                    source={{ uri: item.photo_urls[0] }}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[StyleSheet.absoluteFill, styles.imagePlaceholder]}>
                    <Ionicons name="image-outline" size={32} color="#D1D5DB" />
                  </View>
                )}
                <View style={styles.cardOverlay} />
                <TouchableOpacity
                  style={styles.likeBtn}
                  onPress={() => toggleLike(item.id)}
                >
                  <Ionicons
                    name={isLiked ? 'heart' : 'heart-outline'}
                    size={16}
                    color={isLiked ? '#FF5A1F' : '#FFFFFF'}
                  />
                  <Text style={styles.likeCount}>
                    {isLiked ? fakeLikeCount + 1 : fakeLikeCount}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  tab: { paddingBottom: 12, marginRight: 24, position: 'relative' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#9CA3AF' },
  tabTextActive: { color: '#1A1A1A' },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FF5A1F',
    borderRadius: 1,
  },
  grid: { padding: 16, gap: 8 },
  row: { gap: 8 },
  card: {
    width: CARD_WIDTH,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  likeBtn: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  likeCount: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  emptyContainer: { flex: 1 },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
});
