"use client";

import { useEffect, useState, useMemo } from "react";
import { adminGetAgencies, adminDeleteAgency, adminVerifyAgency, adminSuspendAgency, AdminAgency, ApiError } from "@/lib/api";
import Button from "@/components/Button";

export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = useState<AdminAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "pending">("all");

  useEffect(() => { load(); }, []);

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

  async function handleVerify(id: string, name: string) {
    if (!confirm(`"${name}" acentasını onaylamak istediğinize emin misiniz?`)) return;
    setVerifyingId(id);
    try {
      await adminVerifyAgency(id);
      setAgencies((prev) => prev.map((a) => a.id === id ? { ...a, email_verified: true } : a));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Onaylanamadı");
    } finally {
      setVerifyingId(null);
    }
  }

  async function handleSuspend(id: string, name: string, currentlySuspended: boolean) {
    const action = currentlySuspended ? "askıyı kaldır" : "askıya al";
    if (!confirm(`"${name}" acentasını ${action}mak istediğinize emin misiniz?`)) return;
    setSuspendingId(id);
    try {
      await adminSuspendAgency(id, !currentlySuspended);
      setAgencies((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_suspended: !currentlySuspended } : a))
      );
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "İşlem başarısız");
    } finally {
      setSuspendingId(null);
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

  const filtered = useMemo(() => {
    return agencies.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q);
      const matchFilter =
        filter === "all" ||
        (filter === "verified" && a.email_verified) ||
        (filter === "pending" && !a.email_verified);
      return matchSearch && matchFilter;
    });
  }, [agencies, search, filter]);

  const FILTERS = [
    { key: "all",      label: "Tümü"       },
    { key: "verified", label: "Doğrulanmış" },
    { key: "pending",  label: "Bekliyor"    },
  ] as const;

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

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Ad veya e-posta ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
        />
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                filter === f.key
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

      {loading && agencies.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Acenta bulunamadı</div>
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
              {filtered.map((agency) => (
                <tr key={agency.id} className={`hover:bg-gray-50/50 transition-colors ${agency.is_suspended ? "opacity-60" : ""}`}>
                  <td className="px-6 py-4 font-medium text-gray-900">{agency.name}</td>
                  <td className="px-6 py-4 text-gray-600">{agency.email}</td>
                  <td className="px-6 py-4 text-gray-600">{agency.phone ?? "—"}</td>
                  <td className="px-6 py-4 text-gray-600">{agency.tour_count}</td>
                  <td className="px-6 py-4">
                    {agency.is_suspended ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                        Askıda
                      </span>
                    ) : agency.email_verified ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        Doğrulanmış
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
                        Bekliyor
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(agency.created_at).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {!agency.email_verified && (
                        <Button
                          variant="primary"
                          size="sm"
                          loading={verifyingId === agency.id}
                          onClick={() => handleVerify(agency.id, agency.name)}
                        >
                          Doğrula
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={suspendingId === agency.id}
                        onClick={() => handleSuspend(agency.id, agency.name, agency.is_suspended ?? false)}
                      >
                        {agency.is_suspended ? "Askıyı Kaldır" : "Askıya Al"}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deletingId === agency.id}
                        onClick={() => handleDelete(agency.id, agency.name)}
                      >
                        Sil
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
            {filtered.length} / {agencies.length} acenta
          </div>
        </div>
      )}
    </div>
  );
}
