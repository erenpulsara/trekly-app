"use client";

import { useEffect, useState } from "react";
import { adminGetBookings, AdminBooking, ApiError } from "@/lib/api";
import Button from "@/components/Button";

const STATUS_LABELS: Record<string, string> = {
  pending: "Bekliyor",
  confirmed: "Onaylandı",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-green-50 text-green-700",
  completed: "bg-blue-50 text-blue-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setBookings(await adminGetBookings());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rezervasyonlar</h1>
          <p className="text-sm text-gray-500 mt-0.5">{bookings.length} rezervasyon</p>
        </div>
        <Button variant="secondary" size="sm" onClick={load} loading={loading}>
          Yenile
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-sm text-red-600">{error}</div>
      )}

      {loading && bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Yükleniyor...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Henüz rezervasyon yok</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 font-medium text-gray-600">Kişi</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">İletişim</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Tur</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Acenta</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Tarih</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Kişi Sayısı</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Durum</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Kayıt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{booking.name} {booking.surname}</div>
                    {booking.notes && (
                      <div className="text-xs text-gray-400 mt-0.5 max-w-[160px] truncate" title={booking.notes}>
                        {booking.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-600">{booking.email}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{booking.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-[160px] truncate">
                    {booking.tour?.name ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {booking.agency?.name ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {booking.tour_date?.date
                      ? new Date(booking.tour_date.date).toLocaleDateString("tr-TR")
                      : "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-center">
                    {booking.participant_count}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[booking.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABELS[booking.status] ?? booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(booking.created_at).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
