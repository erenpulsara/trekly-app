'use client';

import type { Tour } from './types';
import { getUserToken } from './user-api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function authHeaders(): Record<string, string> {
  const token = getUserToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getFavorites(): Promise<Tour[]> {
  const res = await fetch(`${API_URL}/favorites`, { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function getFavoriteIds(): Promise<string[]> {
  const res = await fetch(`${API_URL}/favorites/ids`, { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function addFavorite(tourId: string): Promise<void> {
  await fetch(`${API_URL}/favorites/${tourId}`, {
    method: 'POST',
    headers: authHeaders(),
  });
}

export async function removeFavorite(tourId: string): Promise<void> {
  await fetch(`${API_URL}/favorites/${tourId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}
