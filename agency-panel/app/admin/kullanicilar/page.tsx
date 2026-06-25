"use client";

import { useEffect, useState, useMemo } from "react";
import { adminGetUsers, adminBanUser, adminActivateUser, AdminUser, ApiError } from "@/lib/api";
import Button from "@/components/Button";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "banned">("all");
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setUsers(await adminGetUsers());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  async function toggleBan(user: AdminUser) {
    setActionId(user.id);
    try {
      if (user.is_banned) {
        await adminActivateUser(user.id);
      } else {
        await adminBanUser(user.id);
      }
      setUsers((prev) =>
        prev.map((u) => u.id === user.id ? { ...u, is_banned: !u.is_banned } : u)
      );
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "İşlem başarısız");
    } finally {
      setActionId(null);
    }
  }

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.surname.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchFilter =
        filter === "all" ||
        (filter === "banned" && u.is_banned) ||
        (filter === "active" && !u.is_banned);
      return matchSearch && matchFilter;
    });
  }, [users, search, filter]);

  const FILTERS = [
    { key: "all", label: "Tümü" },
    { key: "active", label: "Aktif" },
    { key: "banned", label: "Banlı" },
  ] as const;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kullanıcılar</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} kayıtlı kullanıcı</p>
        </div>
        <Button variant="secondary" size="sm" onClick={load} loading={loading}>
          Yenile
        </Button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="İsim veya e-posta ara..."
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

      {loading && users.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Kullanıcı bulunamadı</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 font-medium text-gray-600">Ad Soyad</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">E-posta</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Telefon</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Puan</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Durum</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Kayıt</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {user.name} {user.surname}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-gray-600">{user.phone ?? "—"}</td>
                  <td className="px-6 py-4 text-gray-600">{user.total_points ?? 0}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.is_banned ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
                    }`}>
                      {user.is_banned ? "Banlı" : "Aktif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(user.created_at).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant={user.is_banned ? "secondary" : "danger"}
                      size="sm"
                      loading={actionId === user.id}
                      onClick={() => toggleBan(user)}
                    >
                      {user.is_banned ? "Aktifleştir" : "Banla"}
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
