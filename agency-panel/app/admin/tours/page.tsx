"use client";

import { useEffect, useState, useMemo } from "react";
import { adminGetTours, adminDeleteTour, adminUpdateTourStatus, AdminTour, ApiError } from "@/lib/api";
import Button from "@/components/Button";

const LANDING_URL = process.env.NEXT_PUBLIC_LANDING_URL ?? "https://treklyapp.com";

const DIFFICULTY_LABELS: Record<string, string> = {
  easy:    "Kolay",
  medium:  "Orta",
  hard:    "Zor",
  extreme: "Ekstrem",
};

const STATUS_CONFIG = {
  published: { label: "Yayında",        badge: "bg-green-50 text-green-700"  },
  draft:     { label: "Taslak",         badge: "bg-gray-100 text-gray-600"   },
  rejected:  { label: "Geri Gönderildi", badge: "bg-red-50 text-red-600"    },
} as const;

export default function AdminToursPage() {
  const [tours, setTours]           = useState<AdminTour[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "rejected">("all");

  // Reject modal state
  const [rejectModal, setRejectModal] = useState<{ open: boolean; tour: AdminTour | null }>({ open: false, tour: null });
  const [rejectNote, setRejectNote]   = useState("");
  const [rejecting, setRejecting]     = useState(false);

  useEffect(() => { load(); }, []);

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

  async function handleStatusChange(tour: AdminTour, newStatus: "published" | "draft") {
    setUpdatingId(tour.id);
    try {
      await adminUpdateTourStatus(tour.id, newStatus);
      setTours((prev) => prev.map((t) => t.id === tour.id ? { ...t, status: newStatus, admin_note: null } : t));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Güncellenemedi");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleRejectSubmit() {
    if (!rejectModal.tour || !rejectNote.trim()) return;
    setRejecting(true);
    try {
      await adminUpdateTourStatus(rejectModal.tour.id, "rejected", rejectNote.trim());
      setTours((prev) => prev.map((t) =>
        t.id === rejectModal.tour!.id ? { ...t, status: "rejected", admin_note: rejectNote.trim() } : t
      ));
      setRejectModal({ open: false, tour: null });
      setRejectNote("");
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Gönderilemedi");
    } finally {
      setRejecting(false);
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

  const filtered = useMemo(() => {
    return tours.filter((t) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.location_name.toLowerCase().includes(q) ||
        (t.agency?.name ?? "").toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tours, search, statusFilter]);

  const FILTERS = [
    { key: "all",       label: "Tümü"              },
    { key: "published", label: "Yayında"            },
    { key: "draft",     label: "Taslak"             },
    { key: "rejected",  label: "Geri Gönderilmiş"  },
  ] as const;

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

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Tur adı, konum veya acenta ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
        />
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                statusFilter === f.key
                  ? "bg-brand-orange text-white border-brand-orange"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-sm text-red-600">{error}</div>
      )}

      {loading && tours.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Tur bulunamadı</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 font-medium text-gray-600">Tur Adı</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Acenta</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Konum</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Kategori</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Zorluk</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Fiyat</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Durum</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Tarih</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((tour) => {
                const cfg = STATUS_CONFIG[tour.status] ?? STATUS_CONFIG.draft;
                const isUpdating = updatingId === tour.id;
                return (
                  <tr key={tour.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 max-w-[180px] truncate">{tour.name}</p>
                        {tour.status === "rejected" && tour.admin_note && (
                          <p className="text-xs text-red-500 mt-0.5 max-w-[180px] truncate" title={tour.admin_note}>
                            Not: {tour.admin_note}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{tour.agency?.name ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-600">{tour.location_name}</td>
                    <td className="px-6 py-4 text-gray-500">{tour.category ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-600">{DIFFICULTY_LABELS[tour.difficulty] ?? tour.difficulty}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {tour.price ? `₺${Number(tour.price).toLocaleString("tr-TR")}` : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(tour.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        {/* View on site */}
                        <a
                          href={`${LANDING_URL}/tours/${tour.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          Görüntüle
                        </a>

                        {/* Publish / Unpublish */}
                        {tour.status !== "published" ? (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(tour, "published")}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-green-200 text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
                          >
                            {isUpdating ? "…" : "Yayına Al"}
                          </button>
                        ) : (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(tour, "draft")}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                          >
                            {isUpdating ? "…" : "Yayından Kaldır"}
                          </button>
                        )}

                        {/* Send back */}
                        <button
                          onClick={() => { setRejectModal({ open: true, tour }); setRejectNote(tour.admin_note ?? ""); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-orange-200 text-orange-600 hover:bg-orange-50 transition-colors"
                        >
                          Geri Gönder
                        </button>

                        {/* Delete */}
                        <Button
                          variant="danger"
                          size="sm"
                          loading={deletingId === tour.id}
                          onClick={() => handleDelete(tour.id, tour.name)}
                        >
                          Sil
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
            {filtered.length} / {tours.length} tur
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Turu Acentaya Geri Gönder</h2>
            <p className="text-sm text-gray-500 mb-4">
              <span className="font-medium text-gray-700">{rejectModal.tour?.name}</span> turu acentaya geri gönderilecek.
              Acenta bu notu görecek ve turu düzeltecek.
            </p>
            <textarea
              rows={4}
              placeholder="Düzeltilmesi gereken hataları veya eksikleri yazın..."
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
            />
            <div className="flex gap-3 mt-4 justify-end">
              <button
                onClick={() => { setRejectModal({ open: false, tour: null }); setRejectNote(""); }}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <Button
                variant="primary"
                size="sm"
                loading={rejecting}
                onClick={handleRejectSubmit}
              >
                Geri Gönder
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
