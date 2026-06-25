"use client";

import { useEffect, useState } from "react";
import { adminGetAgencies, adminDeleteAgency, AdminAgency, ApiError } from "@/lib/api";
import Button from "@/components/Button";

export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = useState<AdminAgency[]>([]);
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
      setAgencies(await adminGetAgencies());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" acentasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;
    setDeletingId(id);
    try {
      await adminDeleteAgency(id);
      setAgencies((prev) => prev.filter((a) => a.id !== id));
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
          <h1 className="text-2xl font-bold text-gray-900">Acentalar</h1>
          <p className="text-sm text-gray-500 mt-0.5">{agencies.length} acenta</p>
        </div>
        <Button variant="secondary" size="sm" onClick={load} loading={loading}>
          Yenile
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-sm text-red-600">{error}</div>
      )}

      {loading && agencies.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Yükleniyor...</div>
      ) : agencies.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Henüz acenta yok</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 font-medium text-gray-600">Acenta</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">E-posta</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Telefon</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Tur</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Durum</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Kayıt</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {agencies.map((agency) => (
                <tr key={agency.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{agency.name}</td>
                  <td className="px-6 py-4 text-gray-600">{agency.email}</td>
                  <td className="px-6 py-4 text-gray-600">{agency.phone ?? "—"}</td>
                  <td className="px-6 py-4 text-gray-600">{agency.tour_count}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      agency.email_verified ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                    }`}>
                      {agency.email_verified ? "Doğrulanmış" : "Bekliyor"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(agency.created_at).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="danger"
                      size="sm"
                      loading={deletingId === agency.id}
                      onClick={() => handleDelete(agency.id, agency.name)}
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
