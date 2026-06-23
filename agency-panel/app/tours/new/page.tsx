"use client";

import { useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import TourForm from "@/components/TourForm";
import { useLang } from "@/lib/LangContext";

export default function NewTourPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLang();
  const tx = t.newTour;

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
            <div>
              <h1 className="text-xl font-display font-bold text-text-primary">{tx.title}</h1>
              <p className="text-xs font-body text-text-muted hidden sm:block">{tx.sub}</p>
            </div>
          </header>

          <main className="flex-1 p-6 max-w-3xl mx-auto w-full animate-slide-up">
            <TourForm mode="create" />
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
