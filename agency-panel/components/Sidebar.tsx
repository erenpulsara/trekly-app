"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { logout, getAgency } from "@/lib/auth";
import { useLang } from "@/lib/LangContext";
import type { Agency } from "@/lib/types";

const navHrefs = [
  {
    href: "/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/tours",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/profile",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
      </svg>
    ),
  },
];

const navLabelKeys = ['dashboard', 'tours', 'profile'] as const;

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [agency, setAgency] = useState<Agency | null>(null);
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    setAgency(getAgency());
  }, []);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-orange flex items-center justify-center shadow-orange">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
            </svg>
          </div>
          <div>
            <span className="font-display font-bold text-white text-lg tracking-tight">Trekly</span>
            <span className="block text-[10px] font-body text-white/40 uppercase tracking-widest -mt-0.5">
              {t.common.agencyPanel}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {navHrefs.map((item, i) => {
          const active = isActive(item.href);
          const labelKey = navLabelKeys[i];
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-body
                transition-all duration-150 group
                ${active ? "bg-brand-orange text-white shadow-orange" : "text-white/60 hover:text-white hover:bg-white/8"}
              `}
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
            >
              <span className={`flex-shrink-0 transition-transform duration-150 ${active ? "" : "group-hover:scale-110"}`}>
                {item.icon}
              </span>
              {t.nav[labelKey]}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
            </Link>
          );
        })}
      </nav>

      {/* Agency info + lang toggle + logout */}
      <div className="px-3 py-4 border-t border-white/10">
        {/* Lang toggle */}
        <div className="flex items-center gap-1 px-3 mb-3">
          <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
            {(['tr', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="px-2.5 py-1 rounded-md text-xs font-bold font-body tracking-wider transition-all duration-150"
                style={{
                  background: lang === l ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: lang === l ? 'white' : 'rgba(255,255,255,0.35)',
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {agency && (
          <div className="px-3 py-2.5 mb-2 rounded-xl">
            <p className="text-sm font-semibold font-body text-white truncate">{agency.name}</p>
            <p className="text-xs font-body text-white/40 truncate">{agency.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold font-body text-white/50 hover:text-white hover:bg-white/8 transition-all duration-150 group"
        >
          <svg className="w-5 h-5 flex-shrink-0 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {t.nav.logout}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[220px] min-h-screen bg-surface-sidebar flex-col flex-shrink-0 animate-slide-in-left">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-fade-in"
            onClick={onMobileClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[220px] bg-surface-sidebar md:hidden animate-slide-in-left">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
