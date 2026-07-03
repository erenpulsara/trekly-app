import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../navigation/AppNavigator';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { blogService } from '../../services/api';
import { BlogPost } from '../../types';
import { formatDate } from '../../utils/formatting';

type Props = {
  navigation: StackNavigationProp<MainStackParamList, 'BlogDetail'>;
  route: RouteProp<MainStackParamList, 'BlogDetail'>;
};

export function BlogDetailScreen({ navigation, route }: Props) {
  const { slug } = route.params;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPost = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await blogService.getBySlug(slug);
      setPost(data);
    } catch {
      setError('Blog yazısı yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  if (isLoading) return <LoadingSpinner />;
  if (!post) return <ErrorMessage message={error ?? 'Yazı bulunamadı.'} onRetry={loadPost} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Blog</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() =>
            Share.share({ message: `${post.title} — Trekly Blog: https://www.treklyapp.com/blog/${post.slug}` })
          }
        >
          <Ionicons name="share-outline" size={20} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {post.cover_image ? (
          <Image source={{ uri: post.cover_image }} style={styles.cover} resizeMode="cover" />
        ) : null}

        <Text style={styles.title}>{post.title}</Text>

        <View style={styles.meta}>
          <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
          <Text style={styles.metaText}>
            {formatDate(post.published_at ?? post.created_at)}
          </Text>
        </View>

        <Text style={styles.body}>{post.content}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF9F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  cover: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 32,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  metaText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  body: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 25,
  },
});
