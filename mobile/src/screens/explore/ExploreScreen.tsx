import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Image,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DifficultyBadge } from '../../components/common/DifficultyBadge';
import { toursService, bookingsService, CategoryItem } from '../../services/api';
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

// Same fallback photos as the web (TurlarCategories)
const CATEGORY_FALLBACK_PHOTOS: Record<string, string> = {
  'trekking':            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=75',
  'dağcılık':            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=75',
  'bisiklet':            'https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=600&q=75',
  'kamp':                'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=75',
  'dalış':               'https://images.unsplash.com/photo-1682687982502-1529b3b33f85?w=600&q=75',
  'zirve tırmanışı':     'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&q=75',
  'kaya tırmanışı':      'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=600&q=75',
  'yelken':              'https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=600&q=75',
  'aile kampı':          'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&q=75',
  'dağcılık eğitimi':    'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&q=75',
  'kayak':               'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=75',
  'su sporları':         'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=600&q=75',
  'kültür turları':      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=75',
  'gastronomi':          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=75',
  'transfer hizmeti':    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=75',
  'gemi ve tekne turları': 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=75',
  'doğa macera turları': 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=75',
  'deniz macera turları': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=75',
  'hava macera turları': 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=75',
  'kış turizm turları':  'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600&q=75',
  'wellness spa / sağlık': 'https://images.unsplash.com/photo-1540555700478-4be0bf42b3ef?w=600&q=75',
  'tema / aksiyon turları': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=75',
};
const CATEGORY_DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=75';

const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

function getCategoryPhoto(cat: CategoryItem): string {
  if (cat.image_url) return cat.image_url;
  return CATEGORY_FALLBACK_PHOTOS[cat.name.toLowerCase()] ?? CATEGORY_DEFAULT_PHOTO;
}

function tourMonth(tour: Tour): number | null {
  const s = tour.start_date ?? tour.dates?.[0]?.date;
  if (!s) return null;
  const d = new Date(s.includes('T') ? s : s + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d.getMonth();
}

function TourEventCard({ tour, onPress }: { tour: Tour; onPress: () => void }) {
  const dateStr = tour.start_date ?? tour.dates?.[0]?.date ?? null;
  const colorIdx = tour.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 4;
  const bgColor = ['#2D4A3A', '#3A4A2D', '#4A2D3A', '#2D3A4A'][colorIdx];

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
        {tour.category ? (
          <View style={styles.eventCategoryBadge}>
            <Text style={styles.eventCategoryText}>{tour.category}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.eventContent}>
        <Text style={styles.eventName} numberOfLines={2}>{tour.name}</Text>
        <View style={styles.eventMeta}>
          {dateStr && (
            <View style={styles.eventMetaRow}>
              <Ionicons name="calendar-outline" size={13} color="#6B7280" />
              <Text style={styles.eventMetaText}>{formatDate(dateStr)}</Text>
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
  const insets = useSafeAreaInsets();
  const [subTab, setSubTab] = useState<SubTab>('upcoming');
  const [tours, setTours] = useState<Tour[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [toursData, bookingsData, categoriesData] = await Promise.all([
        toursService.getAll().catch(() => [] as Tour[]),
        bookingsService.getMy().catch(() => [] as Booking[]),
        toursService.getCategories().catch(() => [] as CategoryItem[]),
      ]);
      setTours(toursData);
      setBookings(bookingsData);
      setCategories(categoriesData.filter((c) => c?.name));
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

  // Locations derived from all tours (same as web sidebar)
  const allLocations = [...new Set(
    tours.flatMap((t) => (t.location_name ?? '').split(',').map((s) => s.trim())).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, 'tr'));

  const searchLower = search.trim().toLocaleLowerCase('tr');

  const filteredTours = tours.filter((t) => {
    if (selectedCategory !== 'all' && !t.category?.includes(selectedCategory)) return false;
    if (selectedLocation && !t.location_name?.includes(selectedLocation)) return false;
    if (selectedMonth !== null && tourMonth(t) !== selectedMonth) return false;
    if (searchLower) {
      const haystack = [
        t.name,
        t.location_name,
        t.category ?? '',
        ...(t.tags ?? []),
      ].join(' ').toLocaleLowerCase('tr');
      if (!haystack.includes(searchLower)) return false;
    }
    return true;
  });

  const activeFilterCount =
    (selectedLocation ? 1 : 0) + (selectedMonth !== null ? 1 : 0);
  const hasAnyFilter =
    selectedCategory !== 'all' || !!selectedLocation || selectedMonth !== null || !!searchLower;

  function clearFilters() {
    setSelectedCategory('all');
    setSelectedLocation('');
    setSelectedMonth(null);
    setSearch('');
  }

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} onRetry={loadData} />;

    const data = subTab === 'upcoming' ? filteredTours : filteredBookings;

    if (data.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color="#E5E5E5" />
          <Text style={styles.emptyText}>
            {subTab === 'upcoming'
              ? (hasAnyFilter ? 'Filtrelere uygun tur bulunamadı' : 'Yaklaşan etkinlik yok')
              : subTab === 'attended' ? 'Katıldığınız etkinlik yok'
              : 'İptal edilen rezervasyon yok'}
          </Text>
          {subTab === 'upcoming' && hasAnyFilter && (
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearLink}>Filtreleri Temizle</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (subTab === 'upcoming') {
      return (
        <FlatList
          data={filteredTours}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TourEventCard
              tour={item}
              onPress={() => navigation.navigate('TourDetail', { tourId: item.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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

  const showFilters = subTab === 'upcoming';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF5A1F" />
        }
        ListHeaderComponent={
          showFilters ? (
            <>
              {/* Search + filter button */}
              <View style={styles.searchRow}>
                <View style={styles.searchBox}>
                  <Ionicons name="search" size={16} color="#9CA3AF" />
                  <TextInput
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Tur veya etiket ara..."
                    placeholderTextColor="#9CA3AF"
                    returnKeyType="search"
                  />
                  {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')}>
                      <Ionicons name="close-circle" size={16} color="#D1D5DB" />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
                  onPress={() => setFilterVisible(true)}
                >
                  <Ionicons
                    name="options-outline"
                    size={18}
                    color={activeFilterCount > 0 ? '#FFFFFF' : '#374151'}
                  />
                  {activeFilterCount > 0 && (
                    <View style={styles.filterBadge}>
                      <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Photo category cards */}
              {categories.length > 0 && (
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={categories}
                  keyExtractor={(item) => item.name}
                  contentContainerStyle={styles.categoryList}
                  style={styles.categoryRow}
                  renderItem={({ item }) => {
                    const isActive = selectedCategory === item.name;
                    return (
                      <TouchableOpacity
                        style={[styles.categoryCard, isActive && styles.categoryCardActive]}
                        onPress={() => setSelectedCategory(isActive ? 'all' : item.name)}
                        activeOpacity={0.85}
                      >
                        <Image
                          source={{ uri: getCategoryPhoto(item) }}
                          style={StyleSheet.absoluteFill}
                          resizeMode="cover"
                        />
                        <View
                          style={[
                            StyleSheet.absoluteFill,
                            { backgroundColor: isActive ? 'rgba(255,90,31,0.45)' : 'rgba(0,0,0,0.35)' },
                          ]}
                        />
                        <Text style={styles.categoryCardLabel} numberOfLines={2}>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              )}

              {/* Result count + clear */}
              <View style={styles.resultRow}>
                <Text style={styles.resultText}>{filteredTours.length} tur bulundu</Text>
                {hasAnyFilter && (
                  <TouchableOpacity onPress={clearFilters}>
                    <Text style={styles.clearLink}>Filtreleri Temizle</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          ) : null
        }
        renderItem={() => renderContent()}
      />

      {/* Filter modal (location + month) */}
      <Modal
        visible={filterVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setFilterVisible(false)} />
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrele</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Ionicons name="close" size={22} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {/* Location */}
              {allLocations.length > 0 && (
                <>
                  <Text style={styles.modalSectionTitle}>Lokasyon</Text>
                  <View style={styles.modalChipWrap}>
                    {allLocations.map((loc) => {
                      const isActive = selectedLocation === loc;
                      return (
                        <TouchableOpacity
                          key={loc}
                          style={[styles.modalChip, isActive && styles.modalChipActive]}
                          onPress={() => setSelectedLocation(isActive ? '' : loc)}
                        >
                          <Text style={[styles.modalChipText, isActive && styles.modalChipTextActive]}>
                            {loc}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              {/* Month */}
              <Text style={styles.modalSectionTitle}>Tarih (Ay)</Text>
              <View style={styles.modalChipWrap}>
                {MONTHS.map((month, idx) => {
                  const isActive = selectedMonth === idx;
                  return (
                    <TouchableOpacity
                      key={month}
                      style={[styles.modalChip, isActive && styles.modalChipActive]}
                      onPress={() => setSelectedMonth(isActive ? null : idx)}
                    >
                      <Text style={[styles.modalChipText, isActive && styles.modalChipTextActive]}>
                        {month}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalClearBtn}
                onPress={() => {
                  setSelectedLocation('');
                  setSelectedMonth(null);
                }}
              >
                <Text style={styles.modalClearText}>Temizle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalApplyBtn}
                onPress={() => setFilterVisible(false)}
              >
                <Text style={styles.modalApplyText}>Sonuçları Göster</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    paddingVertical: 0,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#FF5A1F',
    borderColor: '#FF5A1F',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  categoryRow: {
    marginBottom: 12,
  },
  categoryList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryCard: {
    width: 108,
    height: 72,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: '#2D4A3A',
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 10,
  },
  categoryCardActive: {
    borderColor: '#FF5A1F',
  },
  categoryCardLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: 8,
    paddingBottom: 7,
    lineHeight: 13,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  resultText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  clearLink: {
    fontSize: 12,
    color: '#FF5A1F',
    fontWeight: '700',
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
  eventCategoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FF5533',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
  },
  eventCategoryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
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
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  modalSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 10,
  },
  modalChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalChipActive: {
    backgroundColor: '#FFF3EE',
    borderColor: '#FF5A1F',
  },
  modalChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  modalChipTextActive: {
    color: '#FF5A1F',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  modalClearBtn: {
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClearText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  modalApplyBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FF5A1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalApplyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
