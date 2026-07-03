import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/AppNavigator';
import { bookingsService } from '../../services/api';
import { Booking } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { formatDate } from '../../utils/formatting';

const STATUS_ORDER: Record<string, number> = {
  confirmed: 0,
  pending: 1,
  completed: 2,
  cancelled: 3,
};

function sortBookings(bookings: Booking[]): Booking[] {
  return [...bookings].sort((a, b) => {
    const orderDiff = (STATUS_ORDER[a.status] ?? 4) - (STATUS_ORDER[b.status] ?? 4);
    if (orderDiff !== 0) return orderDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

type Props = {
  navigation: StackNavigationProp<MainStackParamList, 'MyBookings'>;
};

export function MyBookingsScreen({ navigation }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstLoad = useRef(true);

  const fetchBookings = useCallback(async (showSpinner = false) => {
    try {
      if (showSpinner) setIsLoading(true);
      setError(null);
      const data = await bookingsService.getMy();
      setBookings(sortBookings(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rezervasyonlar yüklenemedi.');
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBookings(firstLoad.current);
      firstLoad.current = false;
    }, [fetchBookings])
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchBookings();
    setIsRefreshing(false);
  }, [fetchBookings]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rezervasyonlarım</Text>
        <View style={{ width: 40 }} />
      </View>

      {error ? (
        <ErrorMessage message={error} onRetry={fetchBookings} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={bookings.length === 0 ? styles.emptyContainer : styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#FF5A1F"
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="bookmarks-outline" size={56} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Henüz rezervasyon yok</Text>
              <Text style={styles.emptySubtext}>
                Turları keşfederek rezervasyon yapabilirsiniz.
              </Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => navigation.navigate('Main')}
              >
                <Text style={styles.exploreBtnText}>Turları Keşfet</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, item.status === 'confirmed' && styles.cardConfirmed]}
              onPress={() => navigation.navigate('TourDetail', { tourId: item.tour.id })}
              activeOpacity={0.85}
            >
              {item.tour.photo_urls.length > 0 ? (
                <Image source={{ uri: item.tour.photo_urls[0] }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardImage, styles.imagePlaceholder]}>
                  <Ionicons name="image-outline" size={32} color="#D1D5DB" />
                </View>
              )}
              <View style={styles.statusBadge}>
                <StatusBadge status={item.status} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.tourName} numberOfLines={2}>{item.tour.name}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={13} color="#6B7280" />
                  <Text style={styles.metaText}>{formatDate(item.tour_date.date)}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={13} color="#6B7280" />
                  <Text style={styles.metaText}>{item.tour.location_name}</Text>
                </View>
                <View style={styles.pointsRow}>
                  <Text style={styles.points}>{item.tour.points} XP</Text>
                  <Text style={styles.participants}>
                    {item.participant_count} kişi
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
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
    paddingVertical: 16,
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  list: { padding: 16, gap: 12 },
  emptyContainer: { flex: 1 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardConfirmed: {
    borderWidth: 2,
    borderColor: '#16A34A',
    shadowColor: '#16A34A',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  cardImage: { width: '100%', height: 160 },
  imagePlaceholder: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: { position: 'absolute', top: 12, right: 12 },
  cardBody: { padding: 14 },
  tourName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  metaText: { fontSize: 13, color: '#6B7280' },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  points: { fontSize: 15, fontWeight: '700', color: '#FF5A1F' },
  participants: { fontSize: 13, color: '#6B7280' },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  exploreBtn: {
    backgroundColor: '#FF5A1F',
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
  },
  exploreBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
