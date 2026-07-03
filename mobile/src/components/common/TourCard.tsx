import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tour } from '../../types';
import { DifficultyBadge } from './DifficultyBadge';
import { formatShortDate, formatPoints } from '../../utils/formatting';

const { width } = Dimensions.get('window');

const PLACEHOLDER_COLOR = '#1a3a2a';

interface TourCardProps {
  tour: Tour;
  onPress: () => void;
  variant?: 'full' | 'compact';
  style?: ViewStyle;
}

export function TourCard({ tour, onPress, variant = 'full', style }: TourCardProps) {
  const dateStr = tour.start_date ?? tour.dates?.[0]?.date ?? null;

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={[styles.compactCard, style]} onPress={onPress} activeOpacity={0.85}>
        <View style={[styles.compactImage, { backgroundColor: PLACEHOLDER_COLOR }]}>
          {tour.photo_urls?.[0] ? (
            <Image source={{ uri: tour.photo_urls[0] }} style={StyleSheet.absoluteFill} />
          ) : null}
          <View style={styles.compactRating}>
            <Ionicons name="star" size={10} color="#FFD700" />
            <Text style={styles.compactRatingText}>4.9</Text>
          </View>
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={2}>{tour.name}</Text>
          <View style={styles.compactLocation}>
            <Ionicons name="location-outline" size={11} color="#6B7280" />
            <Text style={styles.compactLocationText} numberOfLines={1}>{tour.location_name}</Text>
          </View>
          <Text style={styles.compactPoints}>{tour.points} XP</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.imageContainer, { backgroundColor: PLACEHOLDER_COLOR }]}>
        {tour.photo_urls?.[0] ? (
          <Image source={{ uri: tour.photo_urls[0] }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : null}
        <View style={styles.imageBadges}>
          <DifficultyBadge difficulty={tour.difficulty} />
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>4.9</Text>
          </View>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{tour.name}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color="#6B7280" />
          <Text style={styles.locationText}>{tour.location_name}</Text>
        </View>
        {dateStr && (
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={13} color="#6B7280" />
            <Text style={styles.dateText}>{formatShortDate(dateStr)}</Text>
            <Text style={styles.pointsBadge}>{formatPoints(tour.points)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    height: 180,
    width: '100%',
  },
  imageBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: 14,
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#6B7280',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  pointsBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF5A1F',
  },
  // Compact variant
  compactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  compactImage: {
    height: 100,
    width: '100%',
  },
  compactRating: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  compactRatingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  compactContent: {
    padding: 10,
    gap: 4,
  },
  compactName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 16,
  },
  compactLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  compactLocationText: {
    fontSize: 10,
    color: '#6B7280',
    flex: 1,
  },
  compactPoints: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF5A1F',
  },
});
