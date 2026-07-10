import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/AppNavigator';
import { favoritesService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Tour } from '../../types';
import { DifficultyBadge } from '../../components/common/DifficultyBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { formatShortDate } from '../../utils/formatting';
import { splitCategories } from '../../utils/category';
import { displayCategory, localeUpper } from '../../i18n/categories';

type Props = {
  navigation: StackNavigationProp<MainStackParamList, 'Favorites'>;
};

export function FavoritesScreen({ navigation }: Props) {
  const { t, lang } = useLanguage();
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const firstLoad = useRef(true);

  const fetchFavorites = useCallback(async (showSpinner = false) => {
    try {
      if (showSpinner) setIsLoading(true);
      setError(null);
      const data = await favoritesService.getAll();
      setTours(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.favorites.loadError);
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFavorites(firstLoad.current);
      firstLoad.current = false;
    }, [fetchFavorites])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchFavorites();
    setIsRefreshing(false);
  }, [fetchFavorites]);

  async function handleRemove(tourId: string) {
    setRemovingId(tourId);
    try {
      await favoritesService.remove(tourId);
      setTours((prev) => prev.filter((t) => t.id !== tourId));
    } catch {
      // keep item on failure
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.favorites.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => fetchFavorites(true)} />
      ) : tours.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={56} color="#E5E5E5" />
          <Text style={styles.emptyTitle}>{t.favorites.emptyTitle}</Text>
          <Text style={styles.emptySubtitle}>
            {t.favorites.emptySub}
          </Text>
        </View>
      ) : (
        <FlatList
          data={tours}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#FF5A1F" />
          }
          renderItem={({ item }) => {
            const dateStr = item.start_date ?? item.dates?.[0]?.date ?? null;
            const cats = splitCategories(item.category);
            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('TourDetail', { tourId: item.id })}
              >
                <View style={styles.cardImage}>
                  {item.photo_urls?.[0] ? (
                    <Image source={{ uri: item.photo_urls[0] }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                  ) : null}
                  <View style={styles.cardBadge}>
                    <DifficultyBadge difficulty={item.difficulty} />
                  </View>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    disabled={removingId === item.id}
                    onPress={() => handleRemove(item.id)}
                  >
                    <Ionicons name="heart" size={18} color="#FF5A1F" />
                  </TouchableOpacity>
                </View>
                <View style={styles.cardBody}>
                  {cats.length > 0 && (
                    <View style={styles.catRow}>
                      {cats.map((cat) => (
                        <View key={cat} style={styles.catBadge}>
                          <Text style={styles.catText}>{localeUpper(displayCategory(cat, lang), lang)}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
                  <View style={styles.cardMetaRow}>
                    <Ionicons name="location-outline" size={13} color="#6B7280" />
                    <Text style={styles.cardMetaText} numberOfLines={1}>{item.location_name}</Text>
                    {dateStr && (
                      <>
                        <Ionicons name="calendar-outline" size={13} color="#6B7280" style={{ marginLeft: 8 }} />
                        <Text style={styles.cardMetaText}>{formatShortDate(dateStr, lang)}</Text>
                      </>
                    )}
                  </View>
                </View>
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
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: {
    height: 150,
    width: '100%',
    backgroundColor: '#2D4A3A',
  },
  cardBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  removeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cardBody: {
    padding: 14,
    gap: 7,
  },
  catRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  catBadge: {
    backgroundColor: '#FFF4F1',
    borderWidth: 1,
    borderColor: 'rgba(255,85,51,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF5533',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 21,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardMetaText: {
    fontSize: 12,
    color: '#6B7280',
    flexShrink: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
  },
});
