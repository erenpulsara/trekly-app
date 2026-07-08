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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { DifficultyBadge } from '../../components/common/DifficultyBadge';
import { toursService, CategoryItem } from '../../services/api';
import { Tour } from '../../types';
import { formatDate, formatShortDate, formatPrice } from '../../utils/formatting';
import { splitCategories, sortByStartDate } from '../../utils/category';
import { REWARDS_ENABLED } from '../../config/features';
import { MainStackParamList } from '../../navigation/AppNavigator';
import { BottomTabParamList } from '../../navigation/BottomTabNavigator';

type ExploreNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Explore'>,
  StackNavigationProp<MainStackParamList>
>;

type Props = {
  navigation: ExploreNavProp;
  route: RouteProp<BottomTabParamList, 'Explore'>;
};

type DropdownKey = 'category' | 'location' | 'month' | null;

const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

function tourMonth(tour: Tour): number | null {
  const s = tour.start_date ?? tour.dates?.[0]?.date;
  if (!s) return null;
  const d = new Date(s.includes('T') ? s : s + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d.getMonth();
}

function TourEventCard({ tour, onPress }: { tour: Tour; onPress: () => void }) {
  const startStr = tour.start_date ?? tour.dates?.[0]?.date ?? null;
  const endStr = tour.end_date ?? null;
  const hasPrice = tour.price != null && Number(tour.price) > 0;
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
        {splitCategories(tour.category).length > 0 ? (
          <View style={styles.eventCategoryRow}>
            {splitCategories(tour.category).map((cat) => (
              <View key={cat} style={styles.eventCategoryBadge}>
                <Text style={styles.eventCategoryText}>{cat}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <View style={styles.eventContent}>
        <Text style={styles.eventName} numberOfLines={2}>{tour.name}</Text>
        <View style={styles.eventMeta}>
          {startStr && (
            <View style={styles.eventMetaRow}>
              <Ionicons name="calendar-outline" size={13} color="#6B7280" />
              <Text style={styles.eventMetaText}>
                {endStr
                  ? `${formatShortDate(startStr)} – ${formatShortDate(endStr)}`
                  : formatDate(startStr)}
              </Text>
            </View>
          )}
          <View style={styles.eventMetaRow}>
            <Ionicons name="location-outline" size={13} color="#6B7280" />
            <Text style={styles.eventMetaText} numberOfLines={1}>{tour.location_name}</Text>
          </View>
          <View style={styles.eventFooterRow}>
            <View style={styles.eventFooterLeft}>
              {hasPrice && (
                <Text style={styles.eventPrice}>
                  {formatPrice(Number(tour.price), tour.price_currency)}
                </Text>
              )}
              {REWARDS_ENABLED && tour.points > 0 && (
                <View style={styles.eventPoints}>
                  <Ionicons name="star" size={11} color="#FF5A1F" />
                  <Text style={styles.eventPointsText}>{tour.points} XP</Text>
                </View>
              )}
            </View>
            <View style={styles.eventDetailBtn}>
              <Text style={styles.eventDetailText}>Detayları Gör</Text>
              <Ionicons name="arrow-forward" size={12} color="#FF5A1F" />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function ExploreScreen({ navigation, route }: Props) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);
  const [showAll, setShowAll] = useState(false);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [toursData, categoriesData] = await Promise.all([
        toursService.getAll().catch(() => [] as Tour[]),
        toursService.getCategories().catch(() => [] as CategoryItem[]),
      ]);
      setTours(toursData);
      setCategories(categoriesData.filter((c) => c?.name));
    } catch {
      setError('Veriler yüklenirken hata oluştu.');
    }
  }, []);

  useEffect(() => {
    loadData().finally(() => setIsLoading(false));
  }, [loadData]);

  // Category preselected from Home's category cards
  useEffect(() => {
    const incoming = route.params?.category;
    if (incoming) {
      setSelectedCategory(incoming);
      navigation.setParams({ category: undefined });
    }
  }, [route.params?.category, navigation]);

  // Close any open dropdown when the screen loses focus (tab switch),
  // so it isn't left hanging open when the user comes back.
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => setOpenDropdown(null));
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Locations derived from all tours (same as web sidebar)
  const allLocations = [...new Set(
    tours.flatMap((t) => (t.location_name ?? '').split(',').map((s) => s.trim())).filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, 'tr'));

  const searchLower = search.trim().toLocaleLowerCase('tr');

  // Soonest start date first — same ordering as the web's Etkinlikler page
  const filteredTours = sortByStartDate(tours.filter((t) => {
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
  }));

  const hasAnyFilter =
    selectedCategory !== 'all' || !!selectedLocation || selectedMonth !== null || !!searchLower;

  function clearFilters() {
    setSelectedCategory('all');
    setSelectedLocation('');
    setSelectedMonth(null);
    setSearch('');
    setOpenDropdown(null);
  }

  function clearCategory() { setSelectedCategory('all'); setOpenDropdown(null); }
  function clearLocation() { setSelectedLocation(''); setOpenDropdown(null); }
  function clearMonth() { setSelectedMonth(null); setOpenDropdown(null); }

  function toggleDropdown(key: DropdownKey) {
    setOpenDropdown((cur) => (cur === key ? null : key));
  }

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} onRetry={loadData} />;

    if (filteredTours.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color="#E5E5E5" />
          <Text style={styles.emptyText}>
            {hasAnyFilter ? 'Filtrelere uygun tur bulunamadı' : 'Yaklaşan etkinlik yok'}
          </Text>
          {hasAnyFilter && (
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearLink}>Filtreleri Temizle</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    // First 9 tours, "Tümünü Listele" reveals the rest — same as the web
    const displayed = showAll ? filteredTours : filteredTours.slice(0, 9);

    return (
      <>
      {/* İç içe FlatList yerine düz View+map — böylece listContent dolgusu (kenar
          boşluğu) düzgün uygulanır ve kartlar ekran kenarına yapışmaz. */}
      <View style={styles.listContent}>
        {displayed.map((item) => (
          <TourEventCard
            key={item.id}
            tour={item}
            onPress={() => navigation.navigate('TourDetail', { tourId: item.id })}
          />
        ))}
      </View>
      {!showAll && filteredTours.length > 9 && (
        <TouchableOpacity
          style={styles.showAllBtn}
          activeOpacity={0.85}
          onPress={() => setShowAll(true)}
        >
          <Text style={styles.showAllBtnText}>Tümünü Listele</Text>
          <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <FlatList
        data={[1]}
        keyExtractor={() => 'content'}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF5A1F" />
        }
        ListHeaderComponent={
          <>
            {/* Screen title — mirrors web's Etkinlikler heading */}
            <View style={styles.titleWrap}>
              <Text style={styles.screenTitle}>TÜM ETKİNLİKLER</Text>
            </View>

            {/* Search */}
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
            </View>

            {/* Dropdown filter chips — horizontally scrollable so long values
                (e.g. "Diyarbakır") never squeeze or shift the other buttons */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.dropdownRowScroll}
              contentContainerStyle={styles.dropdownRow}
            >
              <TouchableOpacity
                style={[styles.dropdownBtn, (selectedCategory !== 'all' || openDropdown === 'category') && styles.dropdownBtnActive]}
                onPress={() => toggleDropdown('category')}
              >
                <Ionicons
                  name="pricetag-outline"
                  size={14}
                  color={selectedCategory !== 'all' || openDropdown === 'category' ? '#FF5A1F' : '#6B7280'}
                />
                <Text
                  style={[styles.dropdownBtnText, (selectedCategory !== 'all' || openDropdown === 'category') && styles.dropdownBtnTextActive]}
                  numberOfLines={1}
                >
                  {selectedCategory !== 'all' ? selectedCategory : 'Kategori'}
                </Text>
                {selectedCategory !== 'all' ? (
                  <TouchableOpacity onPress={clearCategory} hitSlop={{ top: 8, bottom: 8, left: 6, right: 8 }}>
                    <Ionicons name="close-circle" size={16} color="#FF5A1F" />
                  </TouchableOpacity>
                ) : (
                  <Ionicons
                    name={openDropdown === 'category' ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={openDropdown === 'category' ? '#FF5A1F' : '#9CA3AF'}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dropdownBtn, (selectedLocation || openDropdown === 'location') && styles.dropdownBtnActive]}
                onPress={() => toggleDropdown('location')}
              >
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={selectedLocation || openDropdown === 'location' ? '#FF5A1F' : '#6B7280'}
                />
                <Text
                  style={[styles.dropdownBtnText, (selectedLocation || openDropdown === 'location') && styles.dropdownBtnTextActive]}
                  numberOfLines={1}
                >
                  {selectedLocation || 'Lokasyon'}
                </Text>
                {selectedLocation ? (
                  <TouchableOpacity onPress={clearLocation} hitSlop={{ top: 8, bottom: 8, left: 6, right: 8 }}>
                    <Ionicons name="close-circle" size={16} color="#FF5A1F" />
                  </TouchableOpacity>
                ) : (
                  <Ionicons
                    name={openDropdown === 'location' ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={openDropdown === 'location' ? '#FF5A1F' : '#9CA3AF'}
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dropdownBtn, (selectedMonth !== null || openDropdown === 'month') && styles.dropdownBtnActive]}
                onPress={() => toggleDropdown('month')}
              >
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={selectedMonth !== null || openDropdown === 'month' ? '#FF5A1F' : '#6B7280'}
                />
                <Text
                  style={[styles.dropdownBtnText, (selectedMonth !== null || openDropdown === 'month') && styles.dropdownBtnTextActive]}
                  numberOfLines={1}
                >
                  {selectedMonth !== null ? MONTHS[selectedMonth] : 'Ay'}
                </Text>
                {selectedMonth !== null ? (
                  <TouchableOpacity onPress={clearMonth} hitSlop={{ top: 8, bottom: 8, left: 6, right: 8 }}>
                    <Ionicons name="close-circle" size={16} color="#FF5A1F" />
                  </TouchableOpacity>
                ) : (
                  <Ionicons
                    name={openDropdown === 'month' ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={openDropdown === 'month' ? '#FF5A1F' : '#9CA3AF'}
                  />
                )}
              </TouchableOpacity>
            </ScrollView>

            {/* Inline dropdown panel */}
            {openDropdown === 'category' && (
              <View style={styles.dropdownPanel}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled showsVerticalScrollIndicator>
                  {categories.length === 0 ? (
                    <Text style={styles.dropdownEmpty}>Kategori bulunamadı</Text>
                  ) : (
                    categories.map((cat) => {
                      const isActive = selectedCategory === cat.name;
                      return (
                        <TouchableOpacity
                          key={cat.name}
                          style={[styles.dropdownItem, isActive && styles.dropdownItemActive]}
                          onPress={() => {
                            setSelectedCategory(isActive ? 'all' : cat.name);
                            setOpenDropdown(null);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, isActive && styles.dropdownItemTextActive]}>
                            {cat.name}
                          </Text>
                          {isActive && <Ionicons name="checkmark" size={16} color="#FF5A1F" />}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            )}

            {openDropdown === 'location' && (
              <View style={styles.dropdownPanel}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled showsVerticalScrollIndicator>
                  {allLocations.length === 0 ? (
                    <Text style={styles.dropdownEmpty}>Lokasyon bulunamadı</Text>
                  ) : (
                    allLocations.map((loc) => {
                      const isActive = selectedLocation === loc;
                      return (
                        <TouchableOpacity
                          key={loc}
                          style={[styles.dropdownItem, isActive && styles.dropdownItemActive]}
                          onPress={() => {
                            setSelectedLocation(isActive ? '' : loc);
                            setOpenDropdown(null);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, isActive && styles.dropdownItemTextActive]}>
                            {loc}
                          </Text>
                          {isActive && <Ionicons name="checkmark" size={16} color="#FF5A1F" />}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            )}

            {openDropdown === 'month' && (
              <View style={styles.dropdownPanel}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled showsVerticalScrollIndicator>
                  {MONTHS.map((month, idx) => {
                    const isActive = selectedMonth === idx;
                    return (
                      <TouchableOpacity
                        key={month}
                        style={[styles.dropdownItem, isActive && styles.dropdownItemActive]}
                        onPress={() => {
                          setSelectedMonth(isActive ? null : idx);
                          setOpenDropdown(null);
                        }}
                      >
                        <Text style={[styles.dropdownItemText, isActive && styles.dropdownItemTextActive]}>
                          {month}
                        </Text>
                        {isActive && <Ionicons name="checkmark" size={16} color="#FF5A1F" />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </>
        }
        renderItem={() => renderContent()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF9F7',
  },
  titleWrap: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 1,
    textAlign: 'center',
  },
  screenCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  dropdownRowScroll: {
    marginBottom: 8,
    flexGrow: 0,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 14,
  },
  dropdownBtnActive: {
    borderColor: '#FF5A1F',
    backgroundColor: '#FFF3EE',
  },
  dropdownBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  dropdownBtnTextActive: {
    color: '#FF5A1F',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 14,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  dropdownPanel: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    paddingVertical: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  dropdownScroll: {
    maxHeight: 250,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  dropdownItemActive: {
    backgroundColor: '#FFF3EE',
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  dropdownItemTextActive: {
    color: '#FF5A1F',
    fontWeight: '700',
  },
  dropdownEmpty: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 14,
  },
  clearLink: {
    fontSize: 12,
    color: '#FF5A1F',
    fontWeight: '700',
  },
  showAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF5A1F',
    borderRadius: 100,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#FF5A1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  showAllBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
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
  eventCategoryRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 60,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  eventCategoryBadge: {
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
  eventFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  eventPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF3EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eventPointsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF5A1F',
  },
  eventFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  eventPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FF5A1F',
  },
  eventDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: '#FF5A1F',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  eventDetailText: {
    fontSize: 11,
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
