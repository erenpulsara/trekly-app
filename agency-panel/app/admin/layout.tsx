"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated, adminLogout } from "@/lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setReady(true);
      return;
    }
    if (!isAdminAuthenticated()) {
      router.replace("/admin/login");
    } else {
      setReady(true);
    }
  }, [pathname, router]);

  if (!ready) return null;

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100">
          <span className="text-lg font-bold text-gray-900">
            Trekly <span className="text-brand-orange">Admin</span>
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <NavLink href="/admin/agencies" current={pathname}>Acentalar</NavLink>
          <NavLink href="/admin/tours" current={pathname}>Turlar</NavLink>
        </nav>
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={adminLogout}
            className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function NavLink({ href, current, children }: { href: string; current: string; children: React.ReactNode }) {
  const active = current === href;
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-brand-orange/10 text-brand-orange"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {children}
    </Link>
  );
}
