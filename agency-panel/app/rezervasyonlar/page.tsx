"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import { getAllBookings, getWebBookings, updateBookingStatus, updateWebBookingStatus } from "@/lib/api";
import type { Booking, WebBooking, BookingStatus, WebBookingStatus } from "@/lib/types";

type AnyBooking =
  | (Booking & { _type: "mobile" })
  | (WebBooking & { _type: "web" });

const STATUS_LABELS: Record<string, string> = {
  pending: "Beklemede",
  confirmed: "Onaylandı",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  confirmed: "bg-green-100 text-green-700 border border-green-200",
  completed: "bg-blue-100 text-blue-700 border border-blue-200",
  cancelled: "bg-red-100 text-red-600 border border-red-200",
};

type FilterStatus = "all" | "pending" | "confirmed" | "completed" | "cancelled";
type FilterSource = "all" | "mobile" | "web";

export default function RezerasyonlarPage() {
  const [bookings, setBookings] = useState<AnyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [sourceFilter, setSourceFilter] = useState<FilterSource>("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function load() {
    try {
      setError(null);
      const [mobile, web] = await Promise.all([getAllBookings(), getWebBookings()]);
      const combined: AnyBooking[] = [
        ...mobile.map((b) => ({ ...b, _type: "mobile" as const })),
        ...web.map((b) => ({ ...b, _type: "web" as const })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setBookings(combined);
    } catch {
      setError("Rezervasyonlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleStatusChange(booking: AnyBooking, status: string) {
    setUpdating(booking.id);
    try {
      if (booking._type === "mobile") {
        const updated = await updateBookingStatus(booking.id, { status: status as BookingStatus });
        setBookings((prev) =>
          prev.map((b) => (b.id === booking.id ? { ...updated, _type: "mobile" as const } : b))
        );
      } else {
        const updated = await updateWebBookingStatus(booking.id, { status: status as WebBookingStatus });
        setBookings((prev) =>
          prev.map((b) => (b.id === booking.id ? { ...updated, _type: "web" as const } : b))
        );
      }
    } catch {
      // ignore
    } finally {
      setUpdating(null);
    }
  }

  const filtered = bookings.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (sourceFilter !== "all" && b._type !== sourceFilter) return false;
    return true;
  });

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  function getGuestName(b: AnyBooking) {
    if (b._type === "web") return b.full_name;
    return `${(b as Booking).name} ${(b as Booking).surname}`;
  }

  function getTourName(b: AnyBooking) {
    return b.tour?.name ?? "—";
  }

  function getNextStatuses(b: AnyBooking): string[] {
    // Web and app bookings share the same lifecycle now — "completed"
    // marks attendance and triggers XP crediting on the backend.
    if (b.status === "pending") return ["confirmed", "cancelled"];
    if (b.status === "confirmed") return ["completed", "cancelled"];
    return [];
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-surface-bg/80 backdrop-blur-md border-b border-gray-200/60 px-6 py-4 flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-display font-bold text-text-primary">Rezervasyonlar</h1>
              <p className="text-xs font-body text-text-muted hidden sm:block">Tüm rezervasyonları yönetin</p>
            </div>
          </header>

          <main className="flex-1 p-6 flex flex-col gap-5">
            {/* Status filter pills */}
            <div className="flex flex-wrap gap-2">
              {(["all", "pending", "confirmed", "completed", "cancelled"] as FilterStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-body transition-all ${
                    statusFilter === s
                      ? "bg-brand-orange text-white shadow-orange"
                      : "bg-white border border-gray-200 text-text-secondary hover:border-brand-orange hover:text-brand-orange"
                  }`}
                >
                  {s === "all" ? "Tümü" : STATUS_LABELS[s]} ({counts[s]})
                </button>
              ))}
            </div>

            {/* Source filter */}
            <div className="flex gap-2">
              {(["all", "mobile", "web"] as FilterSource[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSourceFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-body transition-all ${
                    sourceFilter === s
                      ? "bg-text-primary text-white"
                      : "bg-white border border-gray-200 text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {s === "all" ? "Tüm Kaynaklar" : s === "mobile" ? "Mobil Uygulama" : "Web Sitesi"}
                </button>
              ))}
            </div>

            {/* Table */}
            {loading ? (
              <div className="bg-white rounded-2xl shadow-card p-6 flex flex-col gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 animate-shimmer flex-shrink-0" />
                    <div className="flex-1 flex gap-4">
                      <div className="h-4 rounded-lg bg-gray-100 animate-shimmer flex-1" />
                      <div className="h-4 rounded-lg bg-gray-100 animate-shimmer w-24" />
                      <div className="h-4 rounded-lg bg-gray-100 animate-shimmer w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm font-body text-red-600">{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-card p-12 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-sm font-body text-text-muted">Henüz rezervasyon yok.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-5 py-3.5 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Misafir</th>
                        <th className="px-5 py-3.5 text-left text-xs font-bold text-text-secondary uppercase tracking-wider hidden md:table-cell">Tur</th>
                        <th className="px-5 py-3.5 text-left text-xs font-bold text-text-secondary uppercase tracking-wider hidden lg:table-cell">İletişim</th>
                        <th className="px-5 py-3.5 text-center text-xs font-bold text-text-secondary uppercase tracking-wider">Kişi</th>
                        <th className="px-5 py-3.5 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Kaynak</th>
                        <th className="px-5 py-3.5 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Durum</th>
                        <th className="px-5 py-3.5 text-left text-xs font-bold text-text-secondary uppercase tracking-wider hidden sm:table-cell">Tarih</th>
                        <th className="px-5 py-3.5 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filtered.map((b, i) => {
                        const next = getNextStatuses(b);
                        const isUpdating = updating === b.id;
                        return (
                          <tr key={b.id} className="hover:bg-surface-bg/60 transition-colors animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-bold text-brand-orange">{getGuestName(b).charAt(0).toUpperCase()}</span>
                                </div>
                                <div>
                                  <p className="font-semibold text-text-primary">{getGuestName(b)}</p>
                                  <p className="text-xs text-text-muted lg:hidden">{b.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 hidden md:table-cell">
                              <p className="text-text-secondary truncate max-w-[180px]">{getTourName(b)}</p>
                            </td>
                            <td className="px-5 py-4 hidden lg:table-cell">
                              <p className="text-text-secondary">{b.email}</p>
                              <p className="text-xs text-text-muted">{b.phone}</p>
                            </td>
                            <td className="px-5 py-4 text-center text-text-secondary">{b.participant_count}</td>
                            <td className="px-5 py-4">
                              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                                b._type === "web"
                                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                                  : "bg-sky-100 text-sky-700 border border-sky-200"
                              }`}>
                                {b._type === "web" ? "Web" : "Mobil"}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${STATUS_COLORS[b.status] ?? ""}`}>
                                {STATUS_LABELS[b.status] ?? b.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-xs text-text-muted whitespace-nowrap hidden sm:table-cell">
                              {new Date(b.created_at).toLocaleDateString("tr-TR")}
                            </td>
                            <td className="px-5 py-4">
                              {next.length > 0 ? (
                                <div className="flex gap-1.5 flex-wrap">
                                  {next.map((s) => (
                                    <button
                                      key={s}
                                      disabled={isUpdating}
                                      onClick={() => handleStatusChange(b, s)}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 ${
                                        s === "confirmed"
                                          ? "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200"
                                          : s === "completed"
                                          ? "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                                          : "bg-red-50 text-red-500 hover:bg-red-100 border border-red-200"
                                      }`}
                                    >
                                      {isUpdating ? "..." : s === "confirmed" ? "Onayla" : s === "completed" ? "Tamamlandı" : "İptal"}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-text-muted text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
