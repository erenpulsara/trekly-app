'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
const TOKEN_KEY = 'trekly_user_token';
const USER_KEY = 'trekly_user_info';

export interface WebUser {
  id: string;
  name: string;
  surname: string;
  email: string;
  total_points: number;
}

interface LoginResponse extends WebUser {
  access_token: string;
}

export class UserApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'UserApiError';
  }
}

export function getUserToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): WebUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WebUser;
  } catch {
    return null;
  }
}

function storeSession(data: LoginResponse) {
  localStorage.setItem(TOKEN_KEY, data.access_token);
  const user: WebUser = {
    id: data.id,
    name: data.name,
    surname: data.surname,
    email: data.email,
    total_points: data.total_points,
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function clearUserSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.message ?? `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}

export async function userLogin(email: string, password: string): Promise<WebUser> {
  const res = await fetch(`${API_URL}/auth/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new UserApiError(res.status, await parseErrorMessage(res));
  const data = (await res.json()) as LoginResponse;
  return storeSession(data);
}

export async function userRegister(
  name: string,
  surname: string,
  email: string,
  password: string,
  phone?: string,
): Promise<WebUser> {
  const res = await fetch(`${API_URL}/auth/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, surname, email, password, phone }),
  });
  if (!res.ok) throw new UserApiError(res.status, await parseErrorMessage(res));
  const data = (await res.json()) as LoginResponse;
  return storeSession(data);
}

export async function fetchMe(): Promise<WebUser | null> {
  const token = getUserToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as WebUser;
    // Keep the cached copy fresh
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    return data;
  } catch {
    return null;
  }
}
