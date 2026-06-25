"use client";

import { useEffect, useState } from "react";
import { adminGetTours, adminDeleteTour, AdminTour, ApiError } from "@/lib/api";
import Button from "@/components/Button";

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Kolay",
  medium: "Orta",
  hard: "Zor",
  extreme: "Ekstrem",
};

const STATUS_LABELS: Record<string, string> = {
  published: "Yayında",
  draft: "Taslak",
};

export default function AdminToursPage() {
  const [tours, setTours] = useState<AdminTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setTours(await adminGetTours());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" turunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;
    setDeletingId(id);
    try {
      await adminDeleteTour(id);
      setTours((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Silinemedi");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Turlar</h1>
          <p className="text-sm text-gray-500 mt-0.5">{tours.length} tur</p>
        </div>
        <Button variant="secondary" size="sm" onClick={load} loading={loading}>
          Yenile
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-sm text-red-600">{error}</div>
      )}

      {loading && tours.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Yükleniyor...</div>
      ) : tours.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Henüz tur yok</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 font-medium text-gray-600">Tur Adı</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Acenta</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Konum</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Zorluk</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Fiyat</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Durum</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Tarih</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tours.map((tour) => (
                <tr key={tour.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 max-w-[200px] truncate">{tour.name}</td>
                  <td className="px-6 py-4 text-gray-600">{tour.agency?.name ?? "—"}</td>
                  <td className="px-6 py-4 text-gray-600">{tour.location_name}</td>
                  <td className="px-6 py-4 text-gray-600">{DIFFICULTY_LABELS[tour.difficulty] ?? tour.difficulty}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {tour.price ? `₺${Number(tour.price).toLocaleString("tr-TR")}` : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      tour.status === "published" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {STATUS_LABELS[tour.status] ?? tour.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(tour.created_at).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="danger"
                      size="sm"
                      loading={deletingId === tour.id}
                      onClick={() => handleDelete(tour.id, tour.name)}
                    >
                      Sil
                    </Button>
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
