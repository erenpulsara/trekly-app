"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import TourForm from "@/components/TourForm";
import { getTour } from "@/lib/api";
import { useLang } from "@/lib/LangContext";
import type { Tour } from "@/lib/types";

export default function EditTourPage() {
  const params = useParams();
  const id = params.id as string;
  const { t } = useLang();
  const tx = t.editTour;

  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    getTour(id)
      .then(setTour)
      .catch((err) => setError(err instanceof Error ? err.message : tx.loadError))
      .finally(() => setLoading(false));
  }, [id, tx.loadError]);

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
              <h1 className="text-xl font-display font-bold text-text-primary truncate">
                {loading ? tx.loading : tour?.name ?? tx.defaultTitle}
              </h1>
              <p className="text-xs font-body text-text-muted hidden sm:block">{tx.sub}</p>
            </div>
            {tour && (
              <Link href={`/tours/${id}/bookings`}>
                <button className="inline-flex items-center gap-2 h-9 px-4 border border-gray-200 text-sm font-semibold font-body text-text-primary rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-150">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {t.bookings.defaultTitle}
                </button>
              </Link>
            )}
          </header>

          <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
            {loading ? (
              <div className="flex flex-col gap-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-card p-6 flex flex-col gap-4">
                    <div className="h-5 w-40 bg-gray-100 animate-shimmer rounded" />
                    <div className="h-10 bg-gray-100 animate-shimmer rounded-xl" />
                    <div className="h-10 bg-gray-100 animate-shimmer rounded-xl" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm font-body text-red-600">{error}</p>
              </div>
            ) : tour ? (
              <div className="animate-slide-up">
                <TourForm mode="edit" tour={tour} />
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
