'use client';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('adminToken') ?? '';
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

export const adminApi = {
  login: (email: string, password: string) =>
    req<{ access_token: string }>('POST', '/auth/admin/login', { email, password }),

  stats: () => req<any>('GET', '/admin/stats'),

  // Agencies
  agencies: () => req<any[]>('GET', '/admin/agencies'),
  deleteAgency: (id: string) => req<any>('DELETE', `/admin/agencies/${id}`),

  // Tours
  tours: () => req<any[]>('GET', '/admin/tours'),
  deleteTour: (id: string) => req<any>('DELETE', `/admin/tours/${id}`),

  // Bookings
  bookings: () => req<any[]>('GET', '/admin/bookings'),

  // Blog
  blogAll: () => req<any[]>('GET', '/admin/blog'),
  createBlog: (dto: any) => req<any>('POST', '/admin/blog', dto),
  updateBlog: (id: string, dto: any) => req<any>('PATCH', `/admin/blog/${id}`, dto),
  deleteBlog: (id: string) => req<any>('DELETE', `/admin/blog/${id}`),

  // Categories
  categories: () => req<any[]>('GET', '/admin/categories'),
  createCategory: (dto: any) => req<any>('POST', '/admin/categories', dto),
  updateCategory: (id: string, dto: any) => req<any>('PATCH', `/admin/categories/${id}`, dto),
  deleteCategory: (id: string) => req<any>('DELETE', `/admin/categories/${id}`),
};
