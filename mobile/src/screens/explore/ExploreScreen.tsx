import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DifficultyBadge } from '../../components/common/DifficultyBadge';
import { toursService, bookingsService } from '../../services/api';
import { Tour, Booking } from '../../types';
import { formatDate } from '../../utils/formatting';
import { MainStackParamList } from '../../navigation/AppNavigator';
import { BottomTabParamList } from '../../navigation/BottomTabNavigator';

type ExploreNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Explore'>,
  StackNavigationProp<MainStackParamList>
>;

type Props = { navigation: ExploreNavProp };

type SubTab = 'upcoming' | 'attended' | 'cancelled';


function TourEventCard({ tour, onPress }: { tour: Tour; onPress: () => void }) {
  const firstDate = tour.dates?.[0];
  const bgColor = ['#2D4A3A', '#3A4A2D', '#4A2D3A', '#2D3A4A'][parseInt(tour.id) % 4];

  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress} activeOpacity={0.88}>
      <View style={[styles.eventImage, { backgroundColor: bgColor }]}>
        {tour.photo_urls?.[0] ? (
          <Image source={{ uri: tour.photo_urls[0] }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : null}
        <View style={styles.eventImageOverlay} />
        <View style={styles.eventBadgeContainer}>
          <DifficultyBadge difficulty={tour.difficulty} />
        </View>
      </View>
      <View style={styles.eventContent}>
        <Text style={styles.eventName} numberOfLines={2}>{tour.name}</Text>
        <View style={styles.eventMeta}>
          {firstDate && (
            <View style={styles.eventMetaRow}>
              <Ionicons name="calendar-outline" size={13} color="#6B7280" />
              <Text style={styles.eventMetaText}>{formatDate(firstDate.date)}</Text>
            </View>
          )}
          <View style={styles.eventMetaRow}>
            <Ionicons name="location-outline" size={13} color="#6B7280" />
            <Text style={styles.eventMetaText} numberOfLines={1}>{tour.location_name}</Text>
          </View>
          <View style={styles.eventPoints}>
            <Text style={styles.eventPointsText}>{tour.points} XP</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function BookingCard({ booking, onPress }: { booking: Booking; onPress: () => void }) {
  const bgColor = '#2D4A3A';

  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress} activeOpacity={0.88}>
      <View style={[styles.eventImage, { backgroundColor: bgColor }]}>
        {booking.tour.photo_urls?.[0] ? (
          <Image source={{ uri: booking.tour.photo_urls[0] }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : null}
        <View style={styles.eventImageOverlay} />
        <View style={styles.eventBadgeContainer}>
          <StatusBadge status={booking.status} />
        </View>
      </View>
      <View style={styles.eventContent}>
        <Text style={styles.eventName} numberOfLines={2}>{booking.tour.name}</Text>
        <View style={styles.eventMeta}>
          <View style={styles.eventMetaRow}>
            <Ionicons name="calendar-outline" size={13} color="#6B7280" />
            <Text style={styles.eventMetaText}>{formatDate(booking.tour_date.date)}</Text>
          </View>
          <View style={styles.eventMetaRow}>
            <Ionicons name="location-outline" size={13} color="#6B7280" />
            <Text style={styles.eventMetaText} numberOfLines={1}>{booking.tour.location_name}</Text>
          </View>
          <View style={styles.eventMetaRow}>
            <Ionicons name="people-outline" size={13} color="#6B7280" />
            <Text style={styles.eventMetaText}>{booking.participant_count} kişi</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function ExploreScreen({ navigation }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('upcoming');
  const [tours, setTours] = useState<Tour[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [toursData, bookingsData] = await Promise.all([
        toursService.getAll().catch(() => [] as Tour[]),
        bookingsService.getMy().catch(() => [] as Booking[]),
      ]);
      setTours(toursData);
      setBookings(bookingsData);
    } catch {
      setError('Veriler yüklenirken hata oluştu.');
    }
  }, []);

  useEffect(() => {
    loadData().finally(() => setIsLoading(false));
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const filteredBookings = bookings.filter((b) => {
    if (subTab === 'upcoming') return b.status === 'pending' || b.status === 'confirmed';
    if (subTab === 'attended') return b.status === 'completed';
    return b.status === 'cancelled';
  });

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} onRetry={loadData} />;

    const data = subTab === 'upcoming' ? tours : filteredBookings;

    if (data.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color="#E5E5E5" />
          <Text style={styles.emptyText}>
            {subTab === 'upcoming' ? 'Yaklaşan etkinlik yok' :
             subTab === 'attended' ? 'Katıldığınız etkinlik yok' :
             'İptal edilen rezervasyon yok'}
          </Text>
        </View>
      );
    }

    if (subTab === 'upcoming') {
      return (
        <FlatList
          data={tours}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TourEventCard
              tour={item}
              onPress={() => navigation.navigate('TourDetail', { tourId: item.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF5A1F" />
          }
          scrollEnabled={false}
        />
      );
    }

    return (
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onPress={() => navigation.navigate('TourDetail', { tourId: item.tour.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.subTabsContainer}>
        {(['upcoming', 'attended', 'cancelled'] as SubTab[]).map((tab) => {
          const labels: Record<SubTab, string> = {
            upcoming: 'Yaklaşan',
            attended: 'Katıldıklarım',
            cancelled: 'İptallerim',
          };
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.subTab, subTab === tab && styles.subTabActive]}
              onPress={() => setSubTab(tab)}
            >
              <Text style={[styles.subTabText, subTab === tab && styles.subTabTextActive]}>
                {labels[tab]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={[1]}
        keyExtractor={() => 'content'}
        renderItem={() => renderContent()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF5A1F" />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF9F7',
  },
  subTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8,
  },
  subTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  subTabActive: {
    backgroundColor: '#FF5A1F',
    borderColor: '#FF5A1F',
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  subTabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 14,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  eventImage: {
    height: 160,
    width: '100%',
  },
  eventImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  eventBadgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  eventContent: {
    padding: 14,
    gap: 8,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 22,
  },
  eventMeta: {
    gap: 5,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  eventMetaText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  eventPoints: {
    backgroundColor: '#FFF3EE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  eventPointsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF5A1F',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
