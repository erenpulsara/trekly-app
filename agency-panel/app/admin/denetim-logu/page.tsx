"use client";

import { useState, useMemo } from "react";

type LogLevel = "info" | "warning" | "error" | "success";

interface AuditLog {
  id: string;
  level: LogLevel;
  action: string;
  detail: string;
  user: string;
  timestamp: string;
}

const DEMO_LOGS: AuditLog[] = [
  { id: "1",  level: "success", action: "Kullanıcı Girişi",       detail: "admin@trekly.com başarıyla giriş yaptı",              user: "admin@trekly.com",        timestamp: "2026-06-25T09:12:00Z" },
  { id: "2",  level: "info",    action: "Tur Oluşturuldu",        detail: 'Doğu Karadeniz Turu eklendi',                          user: "acenta@example.com",      timestamp: "2026-06-25T08:47:00Z" },
  { id: "3",  level: "warning", action: "Kullanıcı Banlı",        detail: "kullanici123@gmail.com hesabı banlı olarak işaretlendi", user: "admin@trekly.com",       timestamp: "2026-06-24T17:30:00Z" },
  { id: "4",  level: "error",   action: "Başarısız Giriş",        detail: "3 başarısız deneme — IP: 91.93.12.44",                 user: "unknown",                 timestamp: "2026-06-24T15:05:00Z" },
  { id: "5",  level: "info",    action: "Blog Yazısı Yayınlandı", detail: '"Türkiye\'nin En İyi 10 Trekking Rotası" yayına alındı', user: "admin@trekly.com",       timestamp: "2026-06-24T13:22:00Z" },
  { id: "6",  level: "success", action: "Acenta Onaylandı",       detail: "Doğa Turları Ltd. şirketi onaylandı",                  user: "admin@trekly.com",        timestamp: "2026-06-23T11:00:00Z" },
  { id: "7",  level: "info",    action: "Rezervasyon Güncellendi","detail": "REZ-00234 onaylandı",                                 user: "acenta@example.com",      timestamp: "2026-06-23T10:15:00Z" },
  { id: "8",  level: "warning", action: "Kategori Silindi",       detail: '"Kış Sporları" kategorisi kaldırıldı',                 user: "admin@trekly.com",        timestamp: "2026-06-22T16:40:00Z" },
  { id: "9",  level: "success", action: "Şifre Sıfırlandı",      detail: "user@mail.com şifresini başarıyla sıfırladı",          user: "user@mail.com",           timestamp: "2026-06-22T09:05:00Z" },
  { id: "10", level: "info",    action: "Tur Güncellendi",        detail: '"Likya Yolu" turu güncellendi',                        user: "acenta2@example.com",     timestamp: "2026-06-21T14:30:00Z" },
  { id: "11", level: "error",   action: "Ödeme Hatası",           detail: "REZ-00198 işleminde ödeme gateaway hatası",            user: "system",                  timestamp: "2026-06-21T12:00:00Z" },
  { id: "12", level: "info",    action: "Kullanıcı Kaydı",        detail: "yeni@kullanici.com sisteme kayıt oldu",                user: "yeni@kullanici.com",      timestamp: "2026-06-20T18:55:00Z" },
];

const LEVEL_CONFIG: Record<LogLevel, { label: string; badge: string; dot: string }> = {
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
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<"all" | LogLevel>("all");

  const filtered = useMemo(() => {
    return DEMO_LOGS.filter((log) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        log.action.toLowerCase().includes(q) ||
        log.detail.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q);
      const matchLevel = level === "all" || log.level === level;
      return matchSearch && matchLevel;
    });
  }, [search, level]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Denetim Logu</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform etkinlik kaydı (demo verisi)</p>
        </div>
      </div>

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

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Kayıt bulunamadı</div>
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
                    <td className="px-6 py-4 text-gray-600 max-w-[300px] truncate">{log.detail}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{log.user}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(log.timestamp).toLocaleString("tr-TR")}
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
