import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/AppNavigator';
import { DifficultyBadge } from '../../components/common/DifficultyBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { PhotoLightbox } from '../../components/common/PhotoLightbox';
import { TourCard } from '../../components/common/TourCard';
import { toursService, favoritesService } from '../../services/api';
import { Tour, Difficulty } from '../../types';
import { formatDate, formatDateRange, formatDateWithDay, formatDistance, formatPrice } from '../../utils/formatting';
import { splitCategories } from '../../utils/category';
import { useAuth } from '../../context/AuthContext';

function scoreRelated(current: Tour, candidate: Tour): number {
  let score = 0;
  if (candidate.category && current.category && candidate.category === current.category) score += 4;
  const overlap = (current.tags ?? []).filter((t) => (candidate.tags ?? []).includes(t)).length;
  score += overlap * 2;
  if (candidate.difficulty === current.difficulty) score += 1;
  if (candidate.location_name === current.location_name) score += 1;
  return score;
}

const DIFF_LABEL: Record<Difficulty, string> = {
  easy: 'Kolay',
  easy_medium: 'Kolay-Orta',
  medium: 'Orta',
  medium_hard: 'Orta-Zor',
  hard: 'Zor',
  very_hard: 'Çok Zor',
  extreme: 'Ekstrem',
};

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.42;

type Props = {
  navigation: StackNavigationProp<MainStackParamList, 'TourDetail'>;
  route: RouteProp<MainStackParamList, 'TourDetail'>;
};

type DetailTab = 'info' | 'program' | 'notes' | 'gallery';


export function TourDetailScreen({ navigation, route }: Props) {
  const { tourId } = route.params;
  const { user, isGuest, exitGuest } = useAuth();
  const insets = useSafeAreaInsets();
  const [tour, setTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('info');
  const [isLiked, setIsLiked] = useState(false);
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [relatedTours, setRelatedTours] = useState<Tour[]>([]);

  const bgColor = '#1a3a2a';

  const loadTour = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await toursService.getById(tourId);
      setTour(data);
      if (data.dates?.[0]) setSelectedDateId(data.dates[0].id);

      // Related tours ("İlginizi Çekebilir") — same scoring as the web
      toursService.getAll()
        .then((all) => {
          const related = all
            .filter((t) => t.id !== data.id)
            .map((t) => ({ tour: t, score: scoreRelated(data, t) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 4)
            .map((x) => x.tour);
          setRelatedTours(related);
        })
        .catch(() => {});
    } catch {
      setError('Tur bilgileri yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, [tourId]);

  useEffect(() => {
    loadTour();
  }, [loadTour]);

  useEffect(() => {
    if (!user) { setIsLiked(false); return; }
    favoritesService.getIds()
      .then((ids) => setIsLiked(ids.includes(tourId)))
      .catch(() => {});
  }, [tourId, user]);

  async function toggleFavorite() {
    if (isGuest || !user) {
      Alert.alert(
        'Giriş Gerekli',
        'Favorilere eklemek için giriş yapmanız gerekiyor.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Giriş Yap', onPress: exitGuest },
        ]
      );
      return;
    }
    const next = !isLiked;
    setIsLiked(next); // optimistic
    try {
      if (next) await favoritesService.add(tourId);
      else await favoritesService.remove(tourId);
    } catch {
      setIsLiked(!next); // revert on failure
    }
  }

  if (isLoading) return <LoadingSpinner />;
  if (!tour) return <ErrorMessage message={error ?? 'Tur bulunamadı.'} onRetry={loadTour} />;

  const selectedDate = tour.dates.find((d) => d.id === selectedDateId);

  // Only show tabs that actually have content (same as the web)
  const hasProgram = !!(tour.program || tour.accommodation || tour.transportation);
  const hasNotes = !!(tour.important_notes || tour.meeting_points);
  const hasGallery = (tour.photo_urls?.length ?? 0) > 0;

  const tabs: Array<{ key: DetailTab; label: string }> = [
    { key: 'info', label: 'Etkinlik Bilgileri' },
    ...(hasProgram ? [{ key: 'program' as DetailTab, label: 'Program' }] : []),
    ...(hasNotes ? [{ key: 'notes' as DetailTab, label: 'Notlar' }] : []),
    ...(hasGallery ? [{ key: 'gallery' as DetailTab, label: 'Galeri' }] : []),
  ];
  const effectiveTab = tabs.some((t) => t.key === activeTab) ? activeTab : 'info';

  function renderTabContent() {
    if (!tour) return null;
    switch (effectiveTab) {
      case 'info':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.description}>{tour.description}</Text>
            <View style={styles.divider} />
            <View style={styles.locationSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="location-outline" size={18} color="#FF5A1F" />
                <Text style={styles.sectionTitle}>Konum</Text>
              </View>
              <Text style={styles.locationText}>{tour.location_name}</Text>
            </View>
          </View>
        );
      case 'program':
        return (
          <View style={styles.tabContent}>
            {tour.program ? (
              <Text style={styles.description}>{tour.program}</Text>
            ) : (
              <Text style={styles.emptyTabText}>Program henüz eklenmedi.</Text>
            )}
            {tour.accommodation ? (
              <>
                <View style={styles.divider} />
                <View style={styles.sectionHeader}>
                  <Ionicons name="bed-outline" size={18} color="#FF5A1F" />
                  <Text style={styles.sectionTitle}>Konaklama</Text>
                </View>
                <Text style={styles.description}>{tour.accommodation}</Text>
                {tour.accommodation_url ? (
                  <TouchableOpacity
                    style={styles.accommodationBtn}
                    onPress={() => Linking.openURL(tour.accommodation_url as string)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="open-outline" size={15} color="#FF5A1F" />
                    <Text style={styles.accommodationBtnText}>Oteli Görüntüle</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : null}
            {tour.transportation ? (
              <>
                <View style={styles.divider} />
                <View style={styles.sectionHeader}>
                  <Ionicons name="bus-outline" size={18} color="#FF5A1F" />
                  <Text style={styles.sectionTitle}>Ulaşım</Text>
                </View>
                <Text style={styles.description}>{tour.transportation}</Text>
              </>
            ) : null}
          </View>
        );
      case 'notes':
        return (
          <View style={styles.tabContent}>
            {tour.important_notes ? (
              <Text style={styles.description}>{tour.important_notes}</Text>
            ) : (
              <Text style={styles.emptyTabText}>Önemli not bulunmuyor.</Text>
            )}
            {tour.meeting_points ? (
              <>
                <View style={styles.divider} />
                <View style={styles.sectionHeader}>
                  <Ionicons name="flag-outline" size={18} color="#FF5A1F" />
                  <Text style={styles.sectionTitle}>Buluşma Noktaları</Text>
                </View>
                <Text style={styles.description}>{tour.meeting_points}</Text>
              </>
            ) : null}
          </View>
        );
      case 'gallery':
        return (
          <View style={styles.tabContent}>
            {tour.photo_urls && tour.photo_urls.length > 0 ? (
              <View style={styles.galleryGrid}>
                {tour.photo_urls.map((url, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setLightboxIndex(i)}
                    activeOpacity={0.85}
                  >
                    <Image
                      source={{ uri: url }}
                      style={styles.galleryItem}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyTabText}>Henüz fotoğraf eklenmedi.</Text>
            )}
          </View>
        );
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero image */}
        <View style={[styles.hero, { backgroundColor: bgColor }]}>
          {tour.photo_urls?.[0] ? (
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={0.95}
              onPress={() => setLightboxIndex(0)}
            >
              <Image source={{ uri: tour.photo_urls[0] }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            </TouchableOpacity>
          ) : null}
          <View style={styles.heroOverlay} pointerEvents="none" />

          {/* Floating header */}
          <SafeAreaView style={styles.heroHeader} edges={['top']}>
            <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.heroRightBtns}>
              <TouchableOpacity style={styles.heroBtn} onPress={toggleFavorite}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isLiked ? '#FF5A1F' : '#FFFFFF'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={() => Share.share({ message: `${tour.name} — Trekly'de keşfet: https://treklyapp.com` })}
              >
                <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Hero bottom label */}
          <View style={styles.heroBottom}>
            <DifficultyBadge difficulty={tour.difficulty} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.tourName}>{tour.name}</Text>

          {/* Badges row */}
          {(tour.category || tour.location_name) && (
            <View style={styles.badgesRow}>
              {splitCategories(tour.category).map((cat) => (
                <View key={cat} style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{cat}</Text>
                </View>
              ))}
              {tour.location_name ? (
                <View style={styles.locationBadge}>
                  <Ionicons name="location-outline" size={12} color="#0369A1" />
                  <Text style={styles.locationBadgeText}>{tour.location_name}</Text>
                </View>
              ) : null}
            </View>
          )}

          {/* Info grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCell}>
              <Ionicons name="calendar-outline" size={20} color="#FF5A1F" />
              <Text style={styles.infoCellLabel}>Tarih</Text>
              <Text style={styles.infoCellValue}>
                {tour.start_date
                  ? formatDateRange(tour.start_date, tour.end_date)
                  : tour.dates?.[0]
                    ? formatDate(tour.dates[0].date)
                    : 'Belirsiz'}
              </Text>
            </View>
            <View style={styles.infoCell}>
              <Ionicons name="bar-chart-outline" size={20} color="#FF5A1F" />
              <Text style={styles.infoCellLabel}>Zorluk</Text>
              <Text style={styles.infoCellValue}>
                {DIFF_LABEL[tour.difficulty] ?? 'Kolay'}
              </Text>
            </View>
            <View style={styles.infoCell}>
              <Ionicons name="people-outline" size={20} color="#FF5A1F" />
              <Text style={styles.infoCellLabel}>Kapasite</Text>
              <Text style={styles.infoCellValue}>{tour.max_participants} Kişi</Text>
            </View>
            {tour.price != null && Number(tour.price) > 0 ? (
              <View style={styles.infoCell}>
                <Ionicons name="card-outline" size={20} color="#FF5A1F" />
                <Text style={styles.infoCellLabel}>Ücret</Text>
                <Text style={styles.infoCellValue}>
                  {formatPrice(Number(tour.price), tour.price_currency)}
                </Text>
              </View>
            ) : tour.distance_km != null ? (
              <View style={styles.infoCell}>
                <Ionicons name="time-outline" size={20} color="#FF5A1F" />
                <Text style={styles.infoCellLabel}>Mesafe</Text>
                <Text style={styles.infoCellValue}>{formatDistance(tour.distance_km)}</Text>
              </View>
            ) : (
              <View style={styles.infoCell}>
                <Ionicons name="star-outline" size={20} color="#FF5A1F" />
                <Text style={styles.infoCellLabel}>Puan</Text>
                <Text style={styles.infoCellValue}>{tour.points} XP</Text>
              </View>
            )}
          </View>

          {/* TURSAB verified badge */}
          {tour.tursab_no ? (
            <View style={styles.tursabCard}>
              <View style={styles.tursabIcon}>
                <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tursabLabel}>TURSAB ONAYLI ACENTA</Text>
                <Text style={styles.tursabValue}>#{tour.tursab_no}</Text>
              </View>
            </View>
          ) : null}

          {/* Tour details card — mirrors the web's right-side card rows */}
          <View style={styles.organizerCard}>
            {(tour.organizer || tour.agency_name) ? (
              <View style={styles.organizerRow}>
                <Ionicons name="business-outline" size={18} color="#6B7280" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.organizerLabel}>Düzenleyen</Text>
                  <Text style={styles.organizerValue}>{tour.organizer || tour.agency_name}</Text>
                </View>
              </View>
            ) : null}
            {tour.guide_name ? (
              <TouchableOpacity
                style={styles.organizerRow}
                disabled={!tour.guide_instagram}
                onPress={() => tour.guide_instagram && Linking.openURL(tour.guide_instagram)}
                activeOpacity={0.7}
              >
                <Ionicons name="person-outline" size={18} color="#6B7280" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.organizerLabel}>Rehber</Text>
                  <Text style={[styles.organizerValue, tour.guide_instagram ? { color: '#FF5A1F' } : null]}>
                    {tour.guide_name}
                    {tour.guide_instagram ? '  ' : ''}
                    {tour.guide_instagram ? (
                      <Ionicons name="logo-instagram" size={13} color="#FF5A1F" />
                    ) : null}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}
            {tour.start_date ? (
              <View style={styles.organizerRow}>
                <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.organizerLabel}>Başlangıç Tarihi</Text>
                  <Text style={styles.organizerValue}>{formatDateWithDay(tour.start_date)}</Text>
                </View>
              </View>
            ) : null}
            {tour.end_date ? (
              <View style={styles.organizerRow}>
                <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.organizerLabel}>Bitiş Tarihi</Text>
                  <Text style={styles.organizerValue}>{formatDateWithDay(tour.end_date)}</Text>
                </View>
              </View>
            ) : null}
            {tour.meeting_points ? (
              <View style={styles.organizerRow}>
                <Ionicons name="location-outline" size={18} color="#6B7280" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.organizerLabel}>Buluşma Noktası</Text>
                  <Text style={styles.organizerValue}>{tour.meeting_points}</Text>
                </View>
              </View>
            ) : null}
            {tour.target_location ? (
              <View style={styles.organizerRow}>
                <Ionicons name="flag-outline" size={18} color="#6B7280" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.organizerLabel}>Hedef Lokasyon</Text>
                  <Text style={styles.organizerValue}>{tour.target_location}</Text>
                </View>
              </View>
            ) : null}
            {tour.contact_phone ? (
              <TouchableOpacity
                style={styles.organizerRow}
                onPress={() => Linking.openURL(`tel:${tour.contact_phone}`)}
                activeOpacity={0.7}
              >
                <Ionicons name="call-outline" size={18} color="#6B7280" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.organizerLabel}>İrtibat No</Text>
                  <Text style={[styles.organizerValue, { color: '#FF5A1F' }]}>{tour.contact_phone}</Text>
                </View>
              </TouchableOpacity>
            ) : null}

            {/* Kontenjan bar — same as the web card */}
            <View style={styles.organizerRow}>
              <Ionicons name="time-outline" size={18} color="#6B7280" />
              <View style={{ flex: 1 }}>
                <Text style={styles.organizerLabel}>Kontenjan</Text>
                {(() => {
                  const booked = tour.booking_count ?? 0;
                  const remaining = Math.max(0, tour.max_participants - booked);
                  const isFull = remaining === 0;
                  const pct = Math.min(100, (booked / Math.max(1, tour.max_participants)) * 100);
                  return (
                    <>
                      <View style={styles.quotaBarBg}>
                        <View style={[styles.quotaBarFill, { width: `${pct}%` }, isFull && { backgroundColor: '#EF4444' }]} />
                      </View>
                      <Text style={[styles.quotaText, isFull && { color: '#EF4444' }]}>
                        {isFull ? 'Doldu' : `${remaining} yer kaldı`}
                        <Text style={styles.quotaSubText}>  ({booked}/{tour.max_participants})</Text>
                      </Text>
                    </>
                  );
                })()}
              </View>
            </View>
          </View>

          {/* Date selector — always show when dates exist */}
          {tour.dates.length > 0 && (
            <View style={styles.dateSelector}>
              <Text style={styles.dateSelectorLabel}>Tarih Seçin</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateSelectorList}>
                {tour.dates.map((d) => (
                  <TouchableOpacity
                    key={d.id}
                    style={[
                      styles.dateChip,
                      selectedDateId === d.id && styles.dateChipActive,
                    ]}
                    onPress={() => setSelectedDateId(d.id)}
                  >
                    <Text style={[styles.dateChipText, selectedDateId === d.id && styles.dateChipTextActive]}>
                      {formatDate(d.date)}
                    </Text>
                    <Text style={[styles.dateChipSlots, selectedDateId === d.id && styles.dateChipTextActive]}>
                      {d.available_slots} yer
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabChip, effectiveTab === tab.key && styles.tabChipActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabChipText, effectiveTab === tab.key && styles.tabChipTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {renderTabContent()}

          {/* İlginizi Çekebilir */}
          {relatedTours.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedTitle}>İlginizi Çekebilir</Text>
              <Text style={styles.relatedSubtitle}>Benzer turlar ve öneriler</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedList}
              >
                {relatedTours.map((t) => (
                  <TourCard
                    key={t.id}
                    tour={t}
                    variant="compact"
                    onPress={() => navigation.push('TourDetail', { tourId: t.id })}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom sticky bar */}
      <View style={[styles.stickyBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={styles.stickyPoints}>
          <Ionicons name="star" size={16} color="#FF5A1F" />
          <Text style={styles.stickyPointsValue}>{tour.points} XP</Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => {
            const hasDates = tour.dates && tour.dates.length > 0;

            // Tours without a date list use the public web-booking flow (guest-friendly)
            if (!hasDates) {
              navigation.navigate('BookingForm', { tourId: tour.id });
              return;
            }

            if (isGuest) {
              Alert.alert(
                'Giriş Gerekli',
                'Rezervasyon yapmak için giriş yapmanız gerekiyor.',
                [
                  { text: 'İptal', style: 'cancel' },
                  { text: 'Giriş Yap', onPress: exitGuest },
                ]
              );
              return;
            }
            if (!selectedDateId) {
              Alert.alert('Tarih Seçin', 'Rezervasyon için bir tur tarihi seçmelisiniz.');
              return;
            }
            navigation.navigate('BookingForm', { tourId: tour.id, tourDateId: selectedDateId });
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.bookButtonText}>
            {isGuest && tour.dates?.length > 0 ? 'Rezervasyon için giriş yap' : 'Maceraya Katıl'}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Fullscreen photo lightbox */}
      <PhotoLightbox
        photos={tour.photo_urls ?? []}
        initialIndex={lightboxIndex ?? 0}
        visible={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F7',
  },
  hero: {
    height: HERO_HEIGHT,
    width: '100%',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  heroRightBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  heroBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBottom: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  tourName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 32,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: '#FFF4F1',
    borderWidth: 1,
    borderColor: 'rgba(255,85,51,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF5533',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: 'rgba(3,105,161,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  locationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tursabCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  tursabIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tursabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
    letterSpacing: 0.8,
  },
  tursabValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
    marginTop: 1,
  },
  organizerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  organizerLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  organizerValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 1,
  },
  quotaBarBg: {
    height: 5,
    backgroundColor: '#E8E8E8',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 5,
  },
  quotaBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#FF5A1F',
  },
  quotaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF5A1F',
  },
  quotaSubText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  infoCell: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCellLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  infoCellValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  guideAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF5A1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  guideInfo: {
    flex: 1,
  },
  guideName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  guideRole: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  guideInstagram: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF0F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateSelector: {
    marginBottom: 20,
  },
  dateSelectorLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  dateSelectorList: {
    gap: 8,
  },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    alignItems: 'center',
  },
  dateChipActive: {
    borderColor: '#FF5A1F',
    backgroundColor: '#FFF3EE',
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  dateChipSlots: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  dateChipTextActive: {
    color: '#FF5A1F',
  },
  tabsRow: {
    gap: 8,
    paddingBottom: 4,
    marginBottom: 16,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  tabChipActive: {
    backgroundColor: '#FF5A1F',
    borderColor: '#FF5A1F',
  },
  tabChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabChipTextActive: {
    color: '#FFFFFF',
  },
  tabContent: {
    gap: 14,
  },
  emptyTabText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 24,
  },
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  locationSection: {
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  mapPlaceholder: {
    height: 120,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    gap: 8,
    marginTop: 4,
  },
  mapPlaceholderText: {
    fontSize: 13,
    color: '#D1D5DB',
  },
  equipmentSection: {
    gap: 8,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  equipmentText: {
    fontSize: 14,
    color: '#374151',
  },
  programItem: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  programDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF5A1F',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  programDotText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  programContent: {
    flex: 1,
    gap: 4,
  },
  programDay: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  programDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 21,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
  },
  noteIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF3EE',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 21,
    marginTop: 2,
  },
  accommodationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#FFF4F1',
    borderWidth: 1,
    borderColor: 'rgba(255,85,51,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  accommodationBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF5A1F',
  },
  relatedSection: {
    marginTop: 28,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  relatedSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
    marginBottom: 14,
  },
  relatedList: {
    gap: 12,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  galleryItem: {
    width: (width - 48 - 8) / 2,
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  stickyPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF3EE',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  stickyPointsValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FF5A1F',
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#FF5A1F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginLeft: 12,
    shadowColor: '#FF5A1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
