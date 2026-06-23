"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import Badge from "@/components/Badge";
import { Select } from "@/components/FormControls";
import { getTourBookings, getTour, updateBookingStatus } from "@/lib/api";
import { useLang } from "@/lib/LangContext";
import type { Booking, BookingStatus, Tour } from "@/lib/types";

function getDisplayName(booking: Booking) {
  return `${booking.name} ${booking.surname}`.trim() || "—";
}

export default function TourBookingsPage() {
  const params = useParams();
  const tourId = params.id as string;
  const { t, lang } = useLang();
  const tx = t.bookings;
  const locale = lang === 'en' ? 'en-US' : 'tr-TR';

  const statusOptions = [
    { value: "pending", label: t.status.pending },
    { value: "confirmed", label: t.status.confirmed },
    { value: "completed", label: t.status.completed },
    { value: "cancelled", label: t.status.cancelled },
  ];

  const [tour, setTour] = useState<Tour | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tourData, bookingsData] = await Promise.all([getTour(tourId), getTourBookings(tourId)]);
      setTour(tourData);
      setBookings(bookingsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : tx.loadError);
    } finally {
      setLoading(false);
    }
  }, [tourId, tx.loadError]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    setUpdatingId(bookingId);
    setUpdateError(null);
    try {
      const updated = await updateBookingStatus(bookingId, { status: newStatus });
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, ...updated } : b)));
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : tx.updateError);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 bg-surface-bg/80 backdrop-blur-md border-b border-gray-200/60 px-6 py-4 flex items-center gap-4">
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setMobileOpen(true)}>
              <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/tours" className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-gray-100 transition-colors flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-display font-bold text-text-primary">{tx.defaultTitle}</h1>
              {tour && (
                <p className="text-xs font-body text-text-muted truncate">
                  {tour.name} · {loading ? "..." : tx.sub(bookings.length)}
                </p>
              )}
            </div>
            <Link href={`/tours/${tourId}`} className="inline-flex items-center gap-2 h-9 px-4 border border-gray-200 text-sm font-semibold font-body text-text-primary rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-150">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {t.editTour.defaultTitle}
            </Link>
          </header>

          <main className="flex-1 p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm font-body text-red-600">{error}</p>
              </div>
            )}
            {updateError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 animate-fade-in">
                <p className="text-sm font-body text-red-600">{updateError}</p>
              </div>
            )}

            {!loading && bookings.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 animate-slide-up">
                {(["pending", "confirmed", "completed", "cancelled"] as BookingStatus[]).map((status) => {
                  const count = bookings.filter((b) => b.status === status).length;
                  return (
                    <div key={status} className="bg-white rounded-xl shadow-card px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold font-body text-text-muted uppercase tracking-wide">{t.status[status]}</p>
                        <p className="text-2xl font-display font-bold text-text-primary mt-0.5">{count}</p>
                      </div>
                      <Badge variant={status} showDot className="self-start mt-0.5">&nbsp;</Badge>
                    </div>
                  );
                })}
              </div>
            )}

            {loading ? (
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="divide-y divide-gray-50">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="px-6 py-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 animate-shimmer flex-shrink-0" />
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="h-4 w-1/3 bg-gray-100 animate-shimmer rounded" />
                        <div className="h-3 w-1/4 bg-gray-100 animate-shimmer rounded" />
                      </div>
                      <div className="h-8 w-32 bg-gray-100 animate-shimmer rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-card p-16 flex flex-col items-center gap-4 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-lg font-display font-bold text-text-primary">{tx.noBookings}</p>
                  <p className="text-sm font-body text-text-muted mt-1">{tx.noBookingsSub}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-card overflow-hidden animate-slide-up">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-6 py-3.5 text-left text-xs font-bold font-body text-text-secondary uppercase tracking-wider">{tx.guest}</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold font-body text-text-secondary uppercase tracking-wider hidden md:table-cell">Contact</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold font-body text-text-secondary uppercase tracking-wider hidden sm:table-cell">{tx.participants}</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold font-body text-text-secondary uppercase tracking-wider hidden lg:table-cell">{tx.date}</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold font-body text-text-secondary uppercase tracking-wider hidden xl:table-cell">Notes</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold font-body text-text-secondary uppercase tracking-wider">{tx.status}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {bookings.map((booking, i) => (
                        <tr key={booking.id} className="hover:bg-surface-bg/60 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms`, animationFillMode: "both" }}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold font-body text-brand-orange">{getDisplayName(booking).charAt(0).toUpperCase()}</span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold font-body text-text-primary">{getDisplayName(booking)}</p>
                                <p className="text-xs font-body text-text-muted md:hidden">{booking.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <p className="text-sm font-body text-text-secondary">{booking.email}</p>
                            <p className="text-xs font-body text-text-muted">{booking.phone}</p>
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                              </svg>
                              <span className="text-sm font-body text-text-primary">{booking.participant_count}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell text-sm font-body text-text-secondary">
                            {new Date(booking.created_at).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="px-6 py-4 hidden xl:table-cell">
                            <p className="text-sm font-body text-text-secondary max-w-xs truncate">{booking.notes ?? "—"}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative w-36">
                              {updatingId === booking.id ? (
                                <div className="flex items-center gap-2 h-10 px-3">
                                  <svg className="animate-spin w-4 h-4 text-brand-orange" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                  </svg>
                                  <span className="text-xs font-body text-text-muted">{t.common.loading}</span>
                                </div>
                              ) : (
                                <Select
                                  value={booking.status}
                                  options={statusOptions}
                                  onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
                                  className="text-xs"
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
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
