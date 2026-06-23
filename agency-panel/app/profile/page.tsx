"use client";

import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import Badge from "@/components/Badge";
import { getAgency } from "@/lib/auth";
import { useLang } from "@/lib/LangContext";
import type { Agency } from "@/lib/types";
import Image from "next/image";

export default function ProfilePage() {
  const [agency] = useState<Agency | null>(() => getAgency());
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, lang } = useLang();
  const tx = t.profile;

  const initials = agency?.name
    ?.split(" ").map((w) => w.charAt(0)).join("").toUpperCase().slice(0, 2) ?? "AG";

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
            <div>
              <h1 className="text-xl font-display font-bold text-text-primary">{tx.title}</h1>
              <p className="text-xs font-body text-text-muted hidden sm:block">{tx.sub}</p>
            </div>
          </header>

          <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm font-body text-red-600">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="bg-white rounded-2xl shadow-card p-8 flex flex-col gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-gray-100 animate-shimmer flex-shrink-0" />
                  <div className="flex flex-col gap-3 flex-1">
                    <div className="h-6 w-40 bg-gray-100 animate-shimmer rounded" />
                    <div className="h-4 w-32 bg-gray-100 animate-shimmer rounded" />
                  </div>
                </div>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="h-3 w-20 bg-gray-100 animate-shimmer rounded" />
                    <div className="h-5 w-60 bg-gray-100 animate-shimmer rounded" />
                  </div>
                ))}
              </div>
            ) : agency ? (
              <div className="flex flex-col gap-5 animate-slide-up">
                <div className="bg-white rounded-2xl shadow-card p-8">
                  <div className="flex items-start gap-6">
                    {agency.logo_url ? (
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100">
                        <Image src={agency.logo_url} alt={agency.name} fill className="object-cover" sizes="80px" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-orange/80 to-brand-orange flex items-center justify-center flex-shrink-0 shadow-orange">
                        <span className="text-2xl font-display font-bold text-white">{initials}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-2xl font-display font-bold text-text-primary">{agency.name}</h2>
                        <Badge variant="completed" showDot>{tx.active}</Badge>
                      </div>
                      <p className="mt-1 text-sm font-body text-text-muted">{tx.agencyAccount}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-card divide-y divide-gray-50">
                  <InfoRow label={tx.email} value={agency.email} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>} />
                  <InfoRow label={tx.phone} value={agency.phone ?? tx.notSpecified} empty={!agency.phone} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>} />
                  <InfoRow label={tx.memberSince} value={new Date(agency.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'tr-TR', { year: "numeric", month: "long", day: "numeric" })} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>} />
                </div>

                {agency.description && (
                  <div className="bg-white rounded-2xl shadow-card p-6">
                    <p className="text-xs font-bold font-body text-text-muted uppercase tracking-widest mb-3">{tx.about}</p>
                    <p className="text-sm font-body text-text-secondary leading-relaxed">{agency.description}</p>
                  </div>
                )}

                <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-2xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p className="text-sm font-body text-text-secondary">
                    {tx.editNote}{" "}
                    <span className="font-semibold text-brand-orange">{tx.editNoteLink}</span>
                    {tx.editNoteEnd}
                  </p>
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

function InfoRow({ label, value, icon, empty = false }: { label: string; value: string; icon: React.ReactNode; empty?: boolean }) {
  return (
    <div className="px-6 py-4 flex items-center gap-4">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-text-muted">{icon}</div>
      <div>
        <p className="text-xs font-bold font-body text-text-muted uppercase tracking-wide">{label}</p>
        <p className={`text-sm font-body mt-0.5 ${empty ? "text-text-muted italic" : "text-text-primary font-medium"}`}>{value}</p>
      </div>
    </div>
  );
}
