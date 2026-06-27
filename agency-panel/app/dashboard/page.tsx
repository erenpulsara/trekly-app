"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import Badge from "@/components/Badge";
import { getDashboardStats, updateBookingStatus } from "@/lib/api";
import { useLang } from "@/lib/LangContext";
import type { DashboardStats, BookingStatus } from "@/lib/types";

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
}

function getDisplayName(booking: DashboardStats["recent_bookings"][0]) {
  return `${booking.name} ${booking.surname}`.trim() || "—";
}

export default function DashboardPage() {
  const { t, lang } = useLang();
  const tx = t.dashboard;
  const locale = lang === 'en' ? 'en-US' : 'tr-TR';

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleQuickStatus(bookingId: string, status: BookingStatus) {
    setUpdatingId(bookingId);
    try {
      const updated = await updateBookingStatus(bookingId, { status });
      setStats((prev) =>
        prev
          ? {
              ...prev,
              recent_bookings: prev.recent_bookings.map((b) =>
                b.id === bookingId ? { ...b, status: updated.status } : b
              ),
            }
          : prev
      );
    } finally {
      setUpdatingId(null);
    }
  }

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : tx.statsError))
      .finally(() => setLoading(false));
  }, [tx.statsError]);

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 bg-surface-bg/80 backdrop-blur-md border-b border-gray-200/60 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setMobileOpen(true)}>
                <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-display font-bold text-text-primary">{tx.title}</h1>
                <p className="text-xs font-body text-text-muted hidden sm:block">{tx.sub}</p>
              </div>
            </div>
            <Link href="/tours/new" className="inline-flex items-center gap-2 h-9 px-4 bg-brand-orange text-white text-sm font-semibold font-body rounded-xl shadow-orange hover:bg-brand-orange-dark transition-all duration-150 active:scale-95">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {tx.newTour}
            </Link>
          </header>

          <main className="flex-1 p-6 flex flex-col gap-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm font-body text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <StatCard label={tx.totalTours} value={loading ? "—" : stats?.total_tours ?? 0} delay={0} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>} />
              <StatCard label={tx.totalBookings} value={loading ? "—" : stats?.total_bookings ?? 0} delay={80} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>} />
              <StatCard label={tx.thisMonth} value={loading ? "—" : (stats?.recent_bookings?.filter((b) => { const d = new Date(b.created_at); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length ?? 0)} delay={160} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>} />
            </div>

            <div className="animate-slide-up" style={{ animationDelay: "240ms", animationFillMode: "both" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-bold text-text-primary">{tx.recentBookings}</h2>
                <Link href="/rezervasyonlar" className="text-sm font-semibold font-body text-brand-orange hover:text-brand-orange-dark transition-colors">
                  Tümünü Gör
                </Link>
              </div>

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
              ) : !stats?.recent_bookings?.length ? (
                <div className="bg-white rounded-2xl shadow-card p-12 flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-sm font-body text-text-muted">{tx.noBookings}</p>
                  <Link href="/tours/new" className="text-sm font-semibold font-body text-brand-orange hover:text-brand-orange-dark">
                    {tx.createFirst}
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="px-6 py-3.5 text-left text-xs font-bold font-body text-text-secondary uppercase tracking-wider">{tx.guest}</th>
                          <th className="px-6 py-3.5 text-left text-xs font-bold font-body text-text-secondary uppercase tracking-wider hidden sm:table-cell">{tx.participants}</th>
                          <th className="px-6 py-3.5 text-left text-xs font-bold font-body text-text-secondary uppercase tracking-wider hidden md:table-cell">{tx.date}</th>
                          <th className="px-6 py-3.5 text-left text-xs font-bold font-body text-text-secondary uppercase tracking-wider">{tx.status}</th>
                          <th className="px-6 py-3.5 text-left text-xs font-bold font-body text-text-secondary uppercase tracking-wider">İşlem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {stats.recent_bookings.map((booking, i) => (
                          <tr key={booking.id} className="hover:bg-surface-bg/60 transition-colors animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-bold font-body text-brand-orange">{getDisplayName(booking).charAt(0).toUpperCase()}</span>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold font-body text-text-primary">{getDisplayName(booking)}</p>
                                  <p className="text-xs font-body text-text-muted">{booking.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-body text-text-secondary hidden sm:table-cell">{booking.participant_count} {tx.people}</td>
                            <td className="px-6 py-4 text-sm font-body text-text-secondary hidden md:table-cell">{formatDate(booking.created_at, locale)}</td>
                            <td className="px-6 py-4">
                              <Badge variant={booking.status as BookingStatus} showDot>
                                {t.status[booking.status as BookingStatus] ?? booking.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              {booking.status === "pending" && (
                                <div className="flex gap-1.5">
                                  <button
                                    disabled={updatingId === booking.id}
                                    onClick={() => handleQuickStatus(booking.id, "confirmed")}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-40 transition-colors"
                                  >
                                    {updatingId === booking.id ? "..." : "Onayla"}
                                  </button>
                                  <button
                                    disabled={updatingId === booking.id}
                                    onClick={() => handleQuickStatus(booking.id, "cancelled")}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-40 transition-colors"
                                  >
                                    {updatingId === booking.id ? "..." : "İptal"}
                                  </button>
                                </div>
                              )}
                              {booking.status === "confirmed" && (
                                <button
                                  disabled={updatingId === booking.id}
                                  onClick={() => handleQuickStatus(booking.id, "completed")}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-40 transition-colors"
                                >
                                  {updatingId === booking.id ? "..." : "Tamamlandı"}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
