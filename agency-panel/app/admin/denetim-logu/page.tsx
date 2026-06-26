"use client";

import { useEffect, useState, useMemo } from "react";
import { adminGetAuditLogs, AuditLog, AuditLogLevel, ApiError } from "@/lib/api";
import Button from "@/components/Button";

const LEVEL_CONFIG: Record<AuditLogLevel, { label: string; badge: string; dot: string }> = {
  info:    { label: "Bilgi",   badge: "bg-blue-50 text-blue-700",    dot: "bg-blue-500"   },
  success: { label: "Başarı",  badge: "bg-green-50 text-green-700",  dot: "bg-green-500"  },
  warning: { label: "Uyarı",   badge: "bg-yellow-50 text-yellow-700",dot: "bg-yellow-500" },
  error:   { label: "Hata",    badge: "bg-red-50 text-red-600",      dot: "bg-red-500"    },
};

const FILTERS = [
  { key: "all",     label: "Tümü"   },
  { key: "info",    label: "Bilgi"  },
  { key: "success", label: "Başarı" },
  { key: "warning", label: "Uyarı"  },
  { key: "error",   label: "Hata"   },
] as const;

export default function AdminDenetimLoguPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<"all" | AuditLogLevel>("all");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setLogs(await adminGetAuditLogs());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        log.action.toLowerCase().includes(q) ||
        (log.detail ?? "").toLowerCase().includes(q) ||
        (log.user ?? "").toLowerCase().includes(q);
      const matchLevel = level === "all" || log.level === level;
      return matchSearch && matchLevel;
    });
  }, [logs, search, level]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Denetim Logu</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform etkinlik kaydı</p>
        </div>
        <Button variant="secondary" size="sm" onClick={load} loading={loading}>
          Yenile
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-sm text-red-600">{error}</div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Eylem, detay veya kullanıcı ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
        />
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setLevel(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                level === f.key
                  ? "bg-brand-orange text-white border-brand-orange"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading && logs.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          {logs.length === 0 ? "Henüz kayıt yok. Admin işlemleri burada görünecek." : "Kayıt bulunamadı"}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 font-medium text-gray-600">Seviye</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Eylem</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Detay</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Kullanıcı</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Zaman</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((log) => {
                const cfg = LEVEL_CONFIG[log.level];
                return (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{log.action}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-[300px] truncate">{log.detail ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{log.user ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(log.created_at).toLocaleString("tr-TR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
            {filtered.length} kayıt gösteriliyor
          </div>
        </div>
      )}
    </div>
  );
}
