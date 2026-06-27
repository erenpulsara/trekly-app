"use client";

import { useEffect, useState } from "react";
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
  pending: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  confirmed: "bg-green-500/15 text-green-400 border border-green-500/30",
  completed: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  cancelled: "bg-red-500/15 text-red-400 border border-red-500/30",
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
    if (b._type === "web") {
      if (b.status === "pending") return ["confirmed", "cancelled"];
      if (b.status === "confirmed") return ["cancelled"];
      return [];
    }
    if (b.status === "pending") return ["confirmed", "cancelled"];
    if (b.status === "confirmed") return ["completed", "cancelled"];
    return [];
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-white">Rezervasyonlar</h1>
        <p className="text-sm text-white/50 font-body mt-1">Tüm rezervasyonları yönetin</p>
      </div>

      {/* Stat pills */}
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "confirmed", "completed", "cancelled"] as FilterStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-body transition-all ${
              statusFilter === s
                ? "bg-brand-orange text-white"
                : "bg-white/8 text-white/50 hover:text-white"
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
                ? "bg-white/20 text-white"
                : "bg-white/5 text-white/40 hover:text-white"
            }`}
          >
            {s === "all" ? "Tüm Kaynaklar" : s === "mobile" ? "Mobil Uygulama" : "Web Sitesi"}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center text-red-400 py-10">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-white/30 py-16 font-body">Henüz rezervasyon yok.</div>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="bg-white/5 text-white/40 text-left">
                <th className="px-4 py-3 font-semibold">Misafir</th>
                <th className="px-4 py-3 font-semibold">Tur</th>
                <th className="px-4 py-3 font-semibold">İletişim</th>
                <th className="px-4 py-3 font-semibold text-center">Kişi</th>
                <th className="px-4 py-3 font-semibold">Kaynak</th>
                <th className="px-4 py-3 font-semibold">Durum</th>
                <th className="px-4 py-3 font-semibold">Tarih</th>
                <th className="px-4 py-3 font-semibold">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((b) => {
                const next = getNextStatuses(b);
                const isUpdating = updating === b.id;
                return (
                  <tr key={b.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{getGuestName(b)}</p>
                      {b._type === "mobile" && (b as Booking).notes && (
                        <p className="text-white/30 text-xs truncate max-w-[140px]">{(b as Booking).notes}</p>
                      )}
                      {b._type === "web" && (b as WebBooking).notes && (
                        <p className="text-white/30 text-xs truncate max-w-[140px]">{(b as WebBooking).notes}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white/80 truncate max-w-[160px]">{getTourName(b)}</p>
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      <p>{b.email}</p>
                      <p className="text-white/40">{b.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-center text-white/70">{b.participant_count}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                        b._type === "web"
                          ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                          : "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                      }`}>
                        {b._type === "web" ? "Web" : "Mobil"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${STATUS_COLORS[b.status] ?? ""}`}>
                        {STATUS_LABELS[b.status] ?? b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                      {new Date(b.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3">
                      {next.length > 0 ? (
                        <div className="flex gap-1.5 flex-wrap">
                          {next.map((s) => (
                            <button
                              key={s}
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(b, s)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 ${
                                s === "confirmed"
                                  ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                  : s === "completed"
                                  ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                  : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                              }`}
                            >
                              {isUpdating ? "..." : STATUS_LABELS[s]}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-white/20 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
