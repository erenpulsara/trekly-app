import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
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
import { TreklyLogo } from '../../components/common/TreklyLogo';
import { SearchBar } from '../../components/home/SearchBar';
import { FeaturedTourCard } from '../../components/home/FeaturedTourCard';
import { TourCard } from '../../components/common/TourCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { toursService } from '../../services/api';
import { Tour } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { MainStackParamList } from '../../navigation/AppNavigator';
import { BottomTabParamList } from '../../navigation/BottomTabNavigator';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Home'>,
  StackNavigationProp<MainStackParamList>
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

export function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const loadTours = useCallback(async () => {
    setError(null);
    try {
      const data = await toursService.getAll();
      setTours(data ?? []);
    } catch {
      setError('Turlar yüklenirken hata oluştu.');
    }
  }, []);

  useEffect(() => {
    loadTours().finally(() => setIsLoading(false));
  }, [loadTours]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTours();
    setRefreshing(false);
  }, [loadTours]);

  const featuredTour = tours[0];
  const popularTours = tours.slice(1, 5);

  return (
    <SafeAreaView style={styles.safeArea}>
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
          <TreklyLogo size="medium" />
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
            Merhaba, {user?.name ?? 'Kaşif'}
          </Text>
          <Text style={styles.greetingSubtext}>Bugün nereye gitmek istersin?</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onSubmit={() => navigation.navigate('Explore' as never)}
          />
        </View>

        {isLoading ? (
          <LoadingSpinner style={styles.loader} />
        ) : error ? (
          <ErrorMessage message={error} onRetry={loadTours} />
        ) : tours.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="compass-outline" size={56} color="#E5E5E5" />
            <Text style={styles.emptyTitle}>Henüz tur yok</Text>
            <Text style={styles.emptySubtitle}>İçerik yakında eklenecek.</Text>
          </View>
        ) : (
          <>
            {/* Featured section */}
            {featuredTour && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Öne Çıkan Etkinlik</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Explore' as never)}>
                    <Text style={styles.sectionLink}>Tümünü Gör</Text>
                  </TouchableOpacity>
                </View>
                <FeaturedTourCard
                  tour={featuredTour}
                  onPress={() =>
                    navigation.navigate('TourDetail', { tourId: featuredTour.id })
                  }
                  onBook={() => {
                    const firstDateId = featuredTour.dates?.[0]?.id;
                    if (!firstDateId) {
                      navigation.navigate('TourDetail', { tourId: featuredTour.id });
                      return;
                    }
                    navigation.navigate('BookingForm', { tourId: featuredTour.id, tourDateId: firstDateId });
                  }}
                />
              </View>
            )}

            {/* Popular routes */}
            {popularTours.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Popüler Rotalar</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('PopularTours')}>
                    <Text style={styles.sectionLink}>Tümünü Gör</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.popularList}
                >
                  {popularTours.map((tour) => (
                    <TourCard
                      key={tour.id}
                      tour={tour}
                      variant="compact"
                      onPress={() =>
                        navigation.navigate('TourDetail', { tourId: tour.id })
                      }
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* XP Progress Card */}
            {user && (
              <View style={styles.xpCard}>
                <View style={styles.xpCardHeader}>
                  <Ionicons name="trophy-outline" size={20} color="#FF5A1F" />
                  <Text style={styles.xpCardTitle}>Puanlarım</Text>
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
                <Text style={styles.xpSubtext}>Bir sonraki seviyeye ulaşmak için etkinliklere katılın!</Text>
              </View>
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
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
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
  greetingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterContainer: {
    marginBottom: 24,
  },
  loader: {
    height: 200,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  sectionLink: {
    fontSize: 14,
    color: '#FF5A1F',
    fontWeight: '600',
  },
  popularList: {
    paddingHorizontal: 20,
    gap: 12,
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
