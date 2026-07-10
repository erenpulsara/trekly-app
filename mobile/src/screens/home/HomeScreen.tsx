import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { TreklyLogo } from '../../components/common/TreklyLogo';
import { SearchBar } from '../../components/home/SearchBar';
import { DifficultyBadge } from '../../components/common/DifficultyBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { toursService, CategoryItem } from '../../services/api';
import { Tour } from '../../types';
import { formatShortDate, formatPrice } from '../../utils/formatting';
import { REWARDS_ENABLED } from '../../config/features';
import { splitCategories, sortByStartDate } from '../../utils/category';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { displayCategory, localeUpper } from '../../i18n/categories';
import { MainStackParamList } from '../../navigation/AppNavigator';
import { BottomTabParamList } from '../../navigation/BottomTabNavigator';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Home'>,
  StackNavigationProp<MainStackParamList>
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

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
};
const CATEGORY_DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=75';

function getCategoryPhoto(cat: CategoryItem): string {
  if (cat.image_url) return cat.image_url;
  return CATEGORY_FALLBACK_PHOTOS[cat.name.toLowerCase()] ?? CATEGORY_DEFAULT_PHOTO;
}

// Same rotating hero photos as the web (landing TurlarHero) — served from the live site
const HERO_SLIDES = [
  'https://www.treklyapp.com/hero/IMG_2278.jpg',
  'https://www.treklyapp.com/hero/IMG_2280.jpg',
  'https://www.treklyapp.com/hero/IMG_2282.jpg',
  'https://www.treklyapp.com/hero/IMG_2285.jpg',
  'https://www.treklyapp.com/hero/pexels-hero.jpg',
  'https://www.treklyapp.com/hero/IMG_2281.jpg',
  'https://www.treklyapp.com/hero/IMG_2279.jpg',
];
const HERO_INTERVAL = 5000;
const HERO_FADE_MS = 800;

function HeroCarousel() {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Warm the cache so crossfades don't flash a blank frame
    HERO_SLIDES.forEach((url) => { Image.prefetch(url).catch(() => {}); });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => {
        setPrev(c);
        return (c + 1) % HERO_SLIDES.length;
      });
    }, HERO_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (prev === null) return;
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: HERO_FADE_MS,
      useNativeDriver: true,
    }).start(() => setPrev(null));
  }, [current, prev, fade]);

  return (
    <View style={styles.heroWrap}>
      {prev !== null && (
        <Image
          source={{ uri: HERO_SLIDES[prev] }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      )}
      <Animated.Image
        source={{ uri: HERO_SLIDES[current] }}
        style={[StyleSheet.absoluteFill, { opacity: fade }]}
        resizeMode="cover"
      />
      <View style={[StyleSheet.absoluteFill, styles.heroOverlay]} />

      <Text style={styles.heroTitle} numberOfLines={1} adjustsFontSizeToFit>
        {t.home.heroTitle}
      </Text>

      {/* Dot nav */}
      <View style={styles.heroDots}>
        {HERO_SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.heroDot, i === current && styles.heroDotActive]}
          />
        ))}
      </View>
    </View>
  );
}

// Web-style upcoming event card: photo + category badges, title,
// location / date range / price rows, "Detayları Gör" button.
function UpcomingTourCard({ tour, onPress }: { tour: Tour; onPress: () => void }) {
  const { t, lang } = useLanguage();
  const startStr = tour.start_date ?? tour.dates?.[0]?.date ?? null;
  const endStr = tour.end_date ?? null;
  const cats = splitCategories(tour.category);
  const hasPrice = tour.price != null && Number(tour.price) > 0;

  return (
    <TouchableOpacity style={styles.upCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.upCardImage}>
        {tour.photo_urls?.[0] ? (
          <Image source={{ uri: tour.photo_urls[0] }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : null}
        {cats.length > 0 && (
          <View style={styles.upCardBadges}>
            {cats.map((cat) => (
              <View key={cat} style={styles.upCardCatBadge}>
                <Text style={styles.upCardCatText}>{localeUpper(displayCategory(cat, lang), lang)}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.upCardDiffBadge}>
          <DifficultyBadge difficulty={tour.difficulty} />
        </View>
      </View>

      <View style={styles.upCardBody}>
        <Text style={styles.upCardTitle} numberOfLines={2}>{tour.name}</Text>
        <View style={styles.upCardDivider} />

        <View style={styles.upCardInfoRow}>
          <Ionicons name="location-outline" size={14} color="#9CA3AF" />
          <View style={{ flex: 1 }}>
            <Text style={styles.upCardInfoLabel}>{t.home.locationLabel}</Text>
            <Text style={styles.upCardInfoValue} numberOfLines={1}>{tour.location_name}</Text>
          </View>
        </View>

        {startStr && (
          <View style={styles.upCardInfoRow}>
            <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
            <View style={{ flex: 1 }}>
              <Text style={styles.upCardInfoLabel}>{t.home.dateLabel}</Text>
              <Text style={styles.upCardInfoValue}>
                {formatShortDate(startStr, lang)}
                {endStr ? ` – ${formatShortDate(endStr, lang)}` : ''}
              </Text>
            </View>
          </View>
        )}

        {hasPrice && (
          <View style={styles.upCardInfoRow}>
            <Ionicons name="card-outline" size={14} color="#9CA3AF" />
            <View style={{ flex: 1 }}>
              <Text style={styles.upCardInfoLabel}>{t.home.priceLabel}</Text>
              <Text style={[styles.upCardInfoValue, { color: '#FF5A1F' }]}>
                {formatPrice(Number(tour.price), tour.price_currency)}
              </Text>
            </View>
          </View>
        )}

        {REWARDS_ENABLED && tour.points > 0 && (
          <View style={styles.upCardInfoRow}>
            <Ionicons name="star-outline" size={14} color="#9CA3AF" />
            <View style={{ flex: 1 }}>
              <Text style={styles.upCardInfoLabel}>{t.home.earnXP}</Text>
              <Text style={[styles.upCardInfoValue, { color: '#FF5A1F' }]}>
                {tour.points} XP
              </Text>
            </View>
          </View>
        )}

        <View style={styles.upCardDivider} />
        <View style={styles.upCardFooter}>
          <View style={styles.upCardDetailBtn}>
            <Text style={styles.upCardDetailText}>{t.home.details}</Text>
            <Ionicons name="arrow-forward" size={13} color="#FF5A1F" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [tours, setTours] = useState<Tour[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [toursData, categoriesData] = await Promise.all([
        toursService.getAll(),
        toursService.getCategories().catch(() => [] as CategoryItem[]),
      ]);
      setTours(sortByStartDate(toursData ?? []));
      setCategories(categoriesData.filter((c) => c?.name));
    } catch {
      setError(t.home.loadError);
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

  const upcomingTours = tours.slice(0, 6);
  const hasMore = tours.length > 6;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF5A1F" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TreklyLogo size="medium" showIcon />
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => navigation.navigate('Profile' as never)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            {t.home.greeting}, {user?.name ?? t.home.explorer}
          </Text>
        </View>

        {/* Rotating hero photos — same as the web homepage */}
        <HeroCarousel />

        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onSubmit={() => navigation.navigate('Explore')}
            placeholder={t.home.searchPh}
          />
        </View>

        {isLoading ? (
          <LoadingSpinner style={styles.loader} />
        ) : error ? (
          <ErrorMessage message={error} onRetry={loadData} />
        ) : (
          <>
            {/* Category photo cards — admin-managed, same as web */}
            {categories.length > 0 && (
              <View style={styles.section}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryList}
                >
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.name}
                      style={styles.categoryCard}
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate('Explore', { category: cat.name })}
                    >
                      <Image
                        source={{ uri: getCategoryPhoto(cat) }}
                        style={StyleSheet.absoluteFill}
                        resizeMode="cover"
                      />
                      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />
                      <Text
                        style={styles.categoryCardLabel}
                        numberOfLines={2}
                        adjustsFontSizeToFit
                        minimumFontScale={0.75}
                      >
                        {localeUpper(displayCategory(cat.name, lang), lang)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {tours.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="compass-outline" size={56} color="#E5E5E5" />
                <Text style={styles.emptyTitle}>{t.home.emptyTitle}</Text>
                <Text style={styles.emptySubtitle}>{t.home.emptySub}</Text>
              </View>
            ) : (
              <>
                {/* Yaklaşan Etkinlikler — centered uppercase, soonest first */}
                <View style={styles.section}>
                  <View style={styles.sectionTitleWrap}>
                    <Text style={styles.sectionTitle}>{t.home.upcoming}</Text>
                  </View>

                  <View style={styles.upList}>
                    {upcomingTours.map((tour) => (
                      <UpcomingTourCard
                        key={tour.id}
                        tour={tour}
                        onPress={() => navigation.navigate('TourDetail', { tourId: tour.id })}
                      />
                    ))}
                  </View>

                  {hasMore && (
                    <TouchableOpacity
                      style={styles.allBtn}
                      activeOpacity={0.85}
                      onPress={() => navigation.navigate('Explore')}
                    >
                      <Text style={styles.allBtnText}>{t.home.seeAll}</Text>
                      <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* XP Progress Card */}
                {REWARDS_ENABLED && user && (
                  <View style={styles.xpCard}>
                    <View style={styles.xpCardHeader}>
                      <Ionicons name="trophy-outline" size={20} color="#FF5A1F" />
                      <Text style={styles.xpCardTitle}>{t.home.myPoints}</Text>
                      <Text style={styles.xpValue}>{user.total_points} XP</Text>
                    </View>
                    <View style={styles.xpBarBg}>
                      <View
                        style={[
                          styles.xpBarFill,
                          { width: `${Math.min((user.total_points % 500) / 5, 100)}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.xpSubtext}>{t.home.xpHint}</Text>
                  </View>
                )}
              </>
            )}
          </>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF9F7',
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  avatarContainer: {
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF5A1F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF3EE',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  greeting: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  heroWrap: {
    height: 200,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1a3a2a',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  heroOverlay: {
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'italic',
    textAlign: 'center',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  heroDots: {
    position: 'absolute',
    top: 12,
    right: 16,
    flexDirection: 'row',
    gap: 5,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  heroDotActive: {
    width: 18,
    backgroundColor: '#FF5533',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  loader: {
    height: 200,
  },
  section: {
    marginBottom: 28,
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
    marginRight: 10,
  },
  categoryCardLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    paddingHorizontal: 8,
    paddingBottom: 7,
    lineHeight: 14,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  sectionTitleWrap: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 1,
    textAlign: 'center',
    lineHeight: 26,
  },
  sectionCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  upList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  upCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  upCardImage: {
    height: 190,
    width: '100%',
    backgroundColor: '#2D4A3A',
  },
  upCardBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 70,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  upCardCatBadge: {
    backgroundColor: '#FF5533',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
  },
  upCardCatText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  upCardDiffBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  upCardBody: {
    padding: 16,
    gap: 10,
  },
  upCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 22,
  },
  upCardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  upCardInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  upCardInfoLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#B8B8B8',
    letterSpacing: 0.6,
  },
  upCardInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 1,
  },
  upCardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  upCardDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderColor: '#FF5A1F',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  upCardDetailText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF5A1F',
  },
  allBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF5A1F',
    borderRadius: 100,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#FF5A1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  allBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  xpCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  xpCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  xpCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  xpValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF5A1F',
  },
  xpBarBg: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#FF5A1F',
    borderRadius: 3,
  },
  xpSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  bottomPad: {
    height: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
