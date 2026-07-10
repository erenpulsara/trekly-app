import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tour } from '../../types';
import { DifficultyBadge } from '../common/DifficultyBadge';
import { formatShortDate } from '../../utils/formatting';
import { REWARDS_ENABLED } from '../../config/features';
import { useLanguage } from '../../context/LanguageContext';

const { width } = Dimensions.get('window');

interface FeaturedTourCardProps {
  tour: Tour;
  onPress: () => void;
  onBook: () => void;
}

export function FeaturedTourCard({ tour, onPress, onBook }: FeaturedTourCardProps) {
  const { lang } = useLanguage();
  const startStr = tour.start_date ?? tour.dates?.[0]?.date ?? null;
  const endStr = tour.end_date ?? tour.dates?.[1]?.date ?? null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={[styles.imageContainer, { backgroundColor: '#1a3a2a' }]}>
        {tour.photo_urls?.[0] ? (
          <Image
            source={{ uri: tour.photo_urls[0] }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : null}
        <View style={styles.overlay} />
        <View style={styles.topBadges}>
          <DifficultyBadge difficulty={tour.difficulty} />
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={13} color="#FFD700" />
            <Text style={styles.ratingText}>4.9</Text>
          </View>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{tour.name}</Text>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.infoText}>{tour.location_name}</Text>
        </View>
        {(startStr || endStr) && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.infoText}>
              {startStr ? formatShortDate(startStr, lang) : ''}
              {startStr && endStr ? ' – ' : ''}
              {endStr ? formatShortDate(endStr, lang) : ''}
            </Text>
          </View>
        )}
        <View style={styles.footer}>
          {REWARDS_ENABLED && (
            <View style={styles.pointsBadge}>
              <Ionicons name="star-outline" size={14} color="#FF5A1F" />
              <Text style={styles.pointsText}>{tour.points} XP</Text>
            </View>
          )}
          <TouchableOpacity style={styles.bookButton} onPress={onBook} activeOpacity={0.85}>
            <Text style={styles.bookButtonText}>Maceraya Katıl</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    height: 200,
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  topBadges: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF3EE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF5A1F',
  },
  bookButton: {
    backgroundColor: '#FF5A1F',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
