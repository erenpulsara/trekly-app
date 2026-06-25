'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Building2, Map, CalendarCheck,
  FileText, Tag, ShieldCheck, LogOut,
} from 'lucide-react';

const NAV = [
  { href: '/admin',             label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/blog',        label: 'Blog',          icon: FileText },
  { href: '/admin/kategoriler', label: 'Kategoriler',   icon: Tag },
  { href: '/admin/turlar',      label: 'Turlar',        icon: Map },
  { href: '/admin/rezervasyonlar', label: 'Rezervasyonlar', icon: CalendarCheck },
  { href: '/admin/acentalar',   label: 'Acentalar',     icon: Building2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token && pathname !== '/admin/giris') {
      router.replace('/admin/giris');
    } else {
      setReady(true);
    }
  }, [pathname, router]);

  if (pathname === '/admin/giris') return <>{children}</>;
  if (!ready) return null;

  function logout() {
    localStorage.removeItem('adminToken');
    router.push('/admin/giris');
  }

  return (
    <div className="flex h-screen bg-gray-50 font-[Plus_Jakarta_Sans,sans-serif]">
      {/* Sidebar */}
      <aside className="w-60 bg-[#1A1A1A] flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-black text-[#FF5533]">Trekly</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={11} className="text-yellow-400" />
            <span className="text-xs text-yellow-400 font-semibold">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-[#FF5533] text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition"
          >
            <LogOut size={15} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
