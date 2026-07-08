import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,  Image,
  ScrollView,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/AppNavigator';
import { bookingsService, toursService } from '../../services/api';
import { Booking, Tour } from '../../types';
import { DifficultyBadge } from '../../components/common/DifficultyBadge';
import { formatShortDate } from '../../utils/formatting';
import { REWARDS_ENABLED } from '../../config/features';

type Props = {
  navigation: StackNavigationProp<MainStackParamList, 'BookingSuccess'>;
  route: RouteProp<MainStackParamList, 'BookingSuccess'>;
};

export function BookingSuccessScreen({ navigation, route }: Props) {
  const { bookingId, tourId, isWebBooking, participantCount } = route.params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [tour, setTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    async function load() {
      // Web bookings live in a separate table and the /bookings/:id endpoint
      // requires a user JWT — always use the public tour endpoint instead.
      if (isWebBooking) {
        try {
          setTour(await toursService.getById(tourId));
        } catch {
          setFetchError(true);
        }
        return;
      }
      try {
        setBooking(await bookingsService.getById(bookingId));
      } catch {
        // Fallback: still show the tour card from public data
        try {
          setTour(await toursService.getById(tourId));
        } catch {
          setFetchError(true);
        }
      }
    }
    load().finally(() => setIsLoading(false));
  }, [bookingId, tourId, isWebBooking]);

  const cardTour = booking?.tour ?? tour;
  const cardDate = booking?.tour_date?.date ?? tour?.start_date ?? null;
  const cardCount = booking?.participant_count ?? participantCount ?? 1;

  const reservationCode = `TREKLY-${bookingId.slice(0, 5).toUpperCase()}`;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate('Main')}
        >
          <Ionicons name="close" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => Share.share({
            message: cardTour
              ? `${cardTour.name} turuna kaydoldum! Trekly'de keşfet: https://treklyapp.com`
              : 'Trekly\'de bir tura kaydoldum! https://treklyapp.com',
          })}
        >
          <Ionicons name="share-outline" size={22} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success */}
        <View style={styles.successSection}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={36} color="#FF5A1F" />
          </View>
          <Text style={styles.successTitle}>
            {isWebBooking ? 'Rezervasyonunuz Alındı!' : 'Kayıt işleminiz başarılı!'}
          </Text>
          <Text style={styles.successSubtext}>
            {isWebBooking
              ? 'Rezervasyonunuz acentaya iletildi. Onay için\nsizinle en kısa sürede iletişime geçilecek.'
              : 'Maceranız için her şey hazır. Sizin için harika\nbir deneyim hazırlıyoruz.'}
          </Text>
        </View>

        {/* Reservation code */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>REZERVASYON KODU</Text>
          <Text style={styles.codeValue}>{reservationCode}</Text>
        </View>

        {/* Tour card */}
        {isLoading ? (
          <ActivityIndicator color="#FF5A1F" style={{ marginTop: 24 }} />
        ) : fetchError || !cardTour ? (
          <Text style={styles.fetchErrorText}>Tur detayları yüklenemedi.</Text>
        ) : (
          <View style={styles.tourCard}>
            {cardTour.photo_urls.length > 0 ? (
              <Image
                source={{ uri: cardTour.photo_urls[0] }}
                style={styles.tourImage}
              />
            ) : (
              <View style={[styles.tourImage, styles.tourImagePlaceholder]}>
                <Ionicons name="image-outline" size={40} color="#D1D5DB" />
              </View>
            )}
            <View style={styles.tourInfo}>
              <View style={styles.tourInfoRow}>
                <DifficultyBadge difficulty={cardTour.difficulty} />
                {REWARDS_ENABLED && <Text style={styles.tourPoints}>{cardTour.points} XP</Text>}
              </View>
              <Text style={styles.tourName}>{cardTour.name}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color="#6B7280" />
                <Text style={styles.locationText}>{cardTour.location_name}</Text>
              </View>
              <View style={styles.detailsRow}>
                {cardDate ? (
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <View style={{ marginLeft: 6 }}>
                      <Text style={styles.detailLabel}>Tarih</Text>
                      <Text style={styles.detailValue}>
                        {formatShortDate(cardDate)}
                      </Text>
                    </View>
                  </View>
                ) : null}
                <View style={styles.detailItem}>
                  <Ionicons name="people-outline" size={16} color="#6B7280" />
                  <View style={{ marginLeft: 6 }}>
                    <Text style={styles.detailLabel}>Kişi</Text>
                    <Text style={styles.detailValue}>
                      {cardCount} Yetişkin
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('TourDetail', { tourId })}
        >
          <Text style={styles.primaryBtnText}>Etkinliğe Git →</Text>
        </TouchableOpacity>
        {isWebBooking ? (
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('Main')}
          >
            <Ionicons name="home-outline" size={18} color="#1A1A1A" />
            <Text style={styles.secondaryBtnText}>Ana Sayfaya Dön</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('MyBookings')}
          >
            <Ionicons name="bookmarks-outline" size={18} color="#1A1A1A" />
            <Text style={styles.secondaryBtnText}>Rezervasyonlarım</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF9F7' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  successSection: { alignItems: 'center', paddingVertical: 24 },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF3EE',
    borderWidth: 3,
    borderColor: '#FF5A1F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  successSubtext: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  codeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  codeValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF5A1F',
    letterSpacing: 1,
  },
  tourCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  tourImage: {
    width: '100%',
    height: 160,
  },
  tourImagePlaceholder: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tourInfo: { padding: 16 },
  tourInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tourPoints: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF5A1F',
  },
  tourName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  locationText: { fontSize: 13, color: '#6B7280' },
  detailsRow: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  detailValue: { fontSize: 13, color: '#1A1A1A', fontWeight: '700' },
  footer: {
    padding: 20,
    paddingBottom: 32,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  primaryBtn: {
    backgroundColor: '#FF5A1F',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
  fetchErrorText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginTop: 24 },
});
