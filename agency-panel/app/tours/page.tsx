"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { getMyTours, deleteTour } from "@/lib/api";
import { useLang } from "@/lib/LangContext";
import type { Difficulty, Tour, TourStatus } from "@/lib/types";

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
}

export default function ToursPage() {
  const router = useRouter();
  const { t, lang } = useLang();
  const tx = t.tours;
  const locale = lang === 'en' ? 'en-US' : 'tr-TR';

  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; tour: Tour | null }>({ open: false, tour: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { loadTours(); }, []);

  const loadTours = () => {
    setLoading(true);
    getMyTours()
      .then(setTours)
      .catch((err) => setError(err instanceof Error ? err.message : tx.loadError))
      .finally(() => setLoading(false));
  };

  const handleDelete = async () => {
    if (!deleteModal.tour) return;
    setDeleting(true);
    try {
      await deleteTour(deleteModal.tour.id);
      setTours((prev) => prev.filter((t) => t.id !== deleteModal.tour!.id));
      setDeleteModal({ open: false, tour: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : tx.deleteError);
      setDeleteModal({ open: false, tour: null });
    } finally {
      setDeleting(false);
    }
  };

  const nextDate = (tour: Tour) => {
    const upcoming = tour.dates
      .filter((d) => new Date(d.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcoming[0] ? formatDate(upcoming[0].date, locale) : null;
  };

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
                <p className="text-xs font-body text-text-muted hidden sm:block">
                  {loading ? t.common.loading : tx.total(tours.length)}
                </p>
              </div>
            </div>
            <Link href="/tours/new">
              <Button icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>}>
                {tx.newTour}
              </Button>
            </Link>
          </header>

          <main className="flex-1 p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm font-body text-red-600">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="divide-y divide-gray-50">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-6 py-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 animate-shimmer flex-shrink-0" />
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="h-4 w-1/3 bg-gray-100 animate-shimmer rounded" />
                        <div className="h-3 w-1/4 bg-gray-100 animate-shimmer rounded" />
                      </div>
                      <div className="h-6 w-20 bg-gray-100 animate-shimmer rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            ) : tours.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-card p-16 flex flex-col items-center gap-4 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-lg font-display font-bold text-text-primary">{tx.noTours}</p>
                  <p className="text-sm font-body text-text-muted mt-1">{tx.noToursSub}</p>
                </div>
                <Link href="/tours/new"><Button>{tx.createFirst}</Button></Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-card overflow-hidden animate-slide-up">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-6 py-3.5 text-left text-xs font-bold font-body text-text-secondary uppercase tracking-wider">{tx.tour}</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold font-body text-text-secondary uppercase tracking-wider hidden lg:table-cell">{tx.difficulty}</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold font-body text-text-secondary uppercase tracking-wider hidden md:table-cell">{tx.status}</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold font-body text-text-secondary uppercase tracking-wider hidden xl:table-cell">{tx.dates}</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold font-body text-text-secondary uppercase tracking-wider hidden xl:table-cell">{tx.points}</th>
                        <th className="px-6 py-3.5 text-right text-xs font-bold font-body text-text-secondary uppercase tracking-wider">{tx.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {tours.map((tour, i) => (
                        <tr key={tour.id} className="hover:bg-surface-bg/60 transition-colors animate-fade-in" style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {tour.photo_urls[0] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={tour.photo_urls[0]} alt={tour.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold font-body text-text-primary">{tour.name}</p>
                                <p className="text-xs font-body text-text-muted">{tour.location_name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <Badge variant={tour.difficulty as Difficulty}>{t.diff[tour.difficulty as Difficulty] ?? tour.difficulty}</Badge>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <div className="flex flex-col gap-1">
                              <Badge variant={tour.status as TourStatus} showDot>{t.status[tour.status as TourStatus] ?? tour.status}</Badge>
                              {tour.status === 'rejected' && tour.admin_note && (
                                <p className="text-xs text-red-500 max-w-[200px]" title={tour.admin_note}>
                                  ⚠ {tour.admin_note}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden xl:table-cell">
                            <div>
                              <p className="text-sm font-body text-text-primary">{tx.dateCount(tour.dates.length)}</p>
                              {nextDate(tour) && <p className="text-xs font-body text-text-muted">{tx.nextDate} {nextDate(tour)}</p>}
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden xl:table-cell">
                            <div className="flex items-center gap-1.5">
                              <div className="w-4 h-4 rounded-full bg-brand-orange/20 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-brand-orange">P</span>
                              </div>
                              <span className="text-sm font-semibold font-body text-text-primary">{tour.points}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => router.push(`/tours/${tour.id}/bookings`)} className="p-2 rounded-lg text-text-muted hover:text-brand-orange hover:bg-brand-orange/10 transition-all duration-150" title={tx.viewBookings}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                              </button>
                              <button onClick={() => router.push(`/tours/${tour.id}`)} className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-gray-100 transition-all duration-150" title={tx.editTour}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                              </button>
                              <button onClick={() => setDeleteModal({ open: true, tour })} className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-all duration-150" title={tx.deleteTour}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                              </button>
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

      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, tour: null })}
        title={tx.deleteTitle}
        description={deleteModal.tour ? tx.deleteConfirm(deleteModal.tour.name) : ''}
        confirmLabel={tx.deleteBtn}
        confirmVariant="danger"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </AuthGuard>
  );
}
