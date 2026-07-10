import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { blogService } from '../../services/api';
import { BlogPost } from '../../types';
import { formatDate } from '../../utils/formatting';
import { useLanguage } from '../../context/LanguageContext';
import { MainStackParamList } from '../../navigation/AppNavigator';
import { BottomTabParamList } from '../../navigation/BottomTabNavigator';

type BlogNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Blog'>,
  StackNavigationProp<MainStackParamList>
>;

type Props = { navigation: BlogNavProp };

function BlogCard({ post, onPress }: { post: BlogPost; onPress: () => void }) {
  const { lang } = useLanguage();
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.cardImage}>
        {post.cover_image ? (
          <Image source={{ uri: post.cover_image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={styles.cardImageFallback}>
            <Ionicons name="newspaper-outline" size={36} color="#D1D5DB" />
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{post.title}</Text>
        {post.excerpt ? (
          <Text style={styles.cardExcerpt} numberOfLines={2}>{post.excerpt}</Text>
        ) : null}
        <View style={styles.cardMeta}>
          <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
          <Text style={styles.cardDate}>
            {formatDate(post.published_at ?? post.created_at, lang)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function BlogScreen({ navigation }: Props) {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = useCallback(async () => {
    setError(null);
    try {
      const data = await blogService.getAll();
      setPosts(data ?? []);
    } catch {
      setError(t.blogScreen.loadError);
    }
  }, []);

  useEffect(() => {
    loadPosts().finally(() => setIsLoading(false));
  }, [loadPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }, [loadPosts]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.blogScreen.title}</Text>
        <Text style={styles.headerSubtitle}>{t.blogScreen.subtitle}</Text>
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={loadPosts} />
      ) : posts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="newspaper-outline" size={48} color="#E5E5E5" />
          <Text style={styles.emptyText}>{t.blogScreen.empty}</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BlogCard
              post={item}
              onPress={() => navigation.navigate('BlogDetail', { slug: item.slug })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF5A1F" />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF9F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 14,
  },
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
  cardImage: {
    height: 160,
    width: '100%',
    backgroundColor: '#F3F4F6',
  },
  cardImageFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 14,
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 22,
  },
  cardExcerpt: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  cardDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
});
