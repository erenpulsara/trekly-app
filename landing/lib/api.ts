import type { Tour } from './types';

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export async function getPublishedTours(params?: {
  difficulty?: string;
  location?: string;
  category?: string;
  start_date?: string;
  search?: string;
}): Promise<Tour[]> {
  try {
    const url = new URL(`${API_URL}/tours`);
    if (params?.difficulty) url.searchParams.set('difficulty', params.difficulty);
    if (params?.location) url.searchParams.set('location', params.location);
    if (params?.category) url.searchParams.set('category', params.category);
    if (params?.start_date) url.searchParams.set('start_date', params.start_date);
    if (params?.search) url.searchParams.set('search', params.search);

    const res = await fetch(url.toString(), { next: { revalidate: 30 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export interface CategoryItem {
  name: string;
  icon_key: string | null;
  icon_svg?: string | null;
  image_url?: string | null;
}

export async function getCategories(): Promise<CategoryItem[]> {
  try {
    const res = await fetch(`${API_URL}/tours/categories`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_URL}/blog`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_URL}/blog/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getTour(id: string): Promise<Tour | null> {
  try {
    const res = await fetch(`${API_URL}/tours/${id}`, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
