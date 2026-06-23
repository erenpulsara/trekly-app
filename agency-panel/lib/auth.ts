"use client";

const TOKEN_KEY = "trekly_agency_token";
const AGENCY_KEY = "trekly_agency_data";

import type { Agency } from "./types";

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AGENCY_KEY);
  }
}

export function setAgency(agency: Agency): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(AGENCY_KEY, JSON.stringify(agency));
  }
}

export function getAgency(): Agency | null {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(AGENCY_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Agency;
    } catch {
      return null;
    }
  }
  return null;
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  // Basic JWT expiry check
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      removeToken();
      return false;
    }
    return true;
  } catch {
    return true; // If we can't parse, assume valid
  }
}

export function logout(): void {
  removeToken();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
