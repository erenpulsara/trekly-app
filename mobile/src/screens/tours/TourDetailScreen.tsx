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
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/AppNavigator';
import { DifficultyBadge } from '../../components/common/DifficultyBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { toursService } from '../../services/api';
import { Tour } from '../../types';
import { formatDate, formatDistance, formatAltitude } from '../../utils/formatting';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.42;

type Props = {
  navigation: StackNavigationProp<MainStackParamList, 'TourDetail'>;
  route: RouteProp<MainStackParamList, 'TourDetail'>;
};

type DetailTab = 'info' | 'program' | 'notes' | 'gallery';


export function TourDetailScreen({ navigation, route }: Props) {
  const { tourId } = route.params;
  const { isGuest, exitGuest } = useAuth();
  const [tour, setTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('info');
  const [isLiked, setIsLiked] = useState(false);
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);

  const bgColor = '#1a3a2a';

  const loadTour = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await toursService.getById(tourId);
      setTour(data);
      if (data.dates?.[0]) setSelectedDateId(data.dates[0].id);
    } catch {
      setError('Tur bilgileri yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, [tourId]);

  useEffect(() => {
    loadTour();
  }, [loadTour]);

  if (isLoading) return <LoadingSpinner />;
  if (!tour) return <ErrorMessage message={error ?? 'Tur bulunamadı.'} onRetry={loadTour} />;

  const selectedDate = tour.dates.find((d) => d.id === selectedDateId);

  const tabs: Array<{ key: DetailTab; label: string }> = [
    { key: 'info', label: 'Etkinlik Bilgileri' },
    { key: 'program', label: 'Program' },
    { key: 'notes', label: 'Notlar' },
    { key: 'gallery', label: 'Galeri' },
  ];

  function renderTabContent() {
    if (!tour) return null;
    switch (activeTab) {
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
                  <Image
                    key={i}
                    source={{ uri: url }}
                    style={styles.galleryItem}
                    resizeMode="cover"
                  />
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
            <Image source={{ uri: tour.photo_urls[0] }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : null}
          <View style={styles.heroOverlay} />

          {/* Floating header */}
          <SafeAreaView style={styles.heroHeader}>
            <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.heroRightBtns}>
              <TouchableOpacity style={styles.heroBtn} onPress={() => setIsLiked((l) => !l)}>
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

          {/* Info grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCell}>
              <Ionicons name="calendar-outline" size={20} color="#FF5A1F" />
              <Text style={styles.infoCellLabel}>Tarih</Text>
              <Text style={styles.infoCellValue}>
                {tour.dates?.[0] ? formatDate(tour.dates[0].date) : 'Belirsiz'}
              </Text>
            </View>
            <View style={styles.infoCell}>
              <Ionicons name="bar-chart-outline" size={20} color="#FF5A1F" />
              <Text style={styles.infoCellLabel}>Zorluk</Text>
              <Text style={styles.infoCellValue}>
                {tour.difficulty === 'easy' ? 'Kolay' :
                 tour.difficulty === 'medium' ? 'Orta' :
                 tour.difficulty === 'hard' ? 'Zor' : 'Ekstrem'}
              </Text>
            </View>
            <View style={styles.infoCell}>
              <Ionicons name="people-outline" size={20} color="#FF5A1F" />
              <Text style={styles.infoCellLabel}>Kapasite</Text>
              <Text style={styles.infoCellValue}>{tour.max_participants} Kişi</Text>
            </View>
            <View style={styles.infoCell}>
              <Ionicons name="time-outline" size={20} color="#FF5A1F" />
              <Text style={styles.infoCellLabel}>Mesafe</Text>
              <Text style={styles.infoCellValue}>{formatDistance(tour.distance_km)}</Text>
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
                style={[styles.tabChip, activeTab === tab.key && styles.tabChipActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabChipText, activeTab === tab.key && styles.tabChipTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {renderTabContent()}
        </View>
      </ScrollView>

      {/* Bottom sticky bar */}
      <View style={styles.stickyBar}>
        <View style={styles.stickyPoints}>
          <Ionicons name="star" size={16} color="#FF5A1F" />
          <Text style={styles.stickyPointsValue}>{tour.points} XP</Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => {
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
            {isGuest ? 'Rezervasyon için giriş yap' : 'Rezervasyon Yap'}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
    paddingTop: Platform.OS === 'android' ? 40 : 0,
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
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
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
