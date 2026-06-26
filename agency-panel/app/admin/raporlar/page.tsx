"use client";

import { useEffect, useState } from "react";
import { adminGetReports, AdminReports, ApiError } from "@/lib/api";
import Button from "@/components/Button";

const TR_MONTHS: Record<string, string> = {
  "01": "Oca", "02": "Şub", "03": "Mar", "04": "Nis",
  "05": "May", "06": "Haz", "07": "Tem", "08": "Ağu",
  "09": "Eyl", "10": "Eki", "11": "Kas", "12": "Ara",
};

function BarChart({ data }: { data: { month: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((d) => (
        <div key={d.month} className="flex flex-col items-center flex-1 gap-1">
          <span className="text-xs text-gray-400">{d.value}</span>
          <div
            className="w-full rounded-t-md bg-brand-orange/80 transition-all"
            style={{ height: `${(d.value / max) * 100}%`, minHeight: 4 }}
          />
          <span className="text-xs text-gray-500">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminRaporlarPage() {
  const [reports, setReports] = useState<AdminReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setReports(await adminGetReports());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  const KPI = reports
    ? [
        { label: "Toplam Rezervasyon", value: reports.totalBookings, color: "text-brand-orange" },
        { label: "Toplam Kullanıcı", value: reports.totalUsers, color: "text-blue-600" },
        { label: "Toplam Acenta", value: reports.totalAgencies, color: "text-purple-600" },
        { label: "Toplam Tur", value: reports.totalTours, color: "text-green-600" },
      ]
    : [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform genel istatistikleri</p>
        </div>
        <Button variant="secondary" size="sm" onClick={load} loading={loading}>
          Yenile
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-sm text-red-600">{error}</div>
      )}

      {loading && !reports ? (
        <div className="text-center py-16 text-gray-400 text-sm">Yükleniyor...</div>
      ) : reports ? (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {KPI.map((k) => (
              <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-6">
                <p className="text-sm text-gray-500 mb-1">{k.label}</p>
                <p className={`text-3xl font-bold ${k.color}`}>{k.value.toLocaleString("tr-TR")}</p>
              </div>
            ))}
          </div>

          {/* Monthly Booking Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Aylık Rezervasyon Trendi (Son 12 Ay)</h2>
            {reports.monthlyBookings.length === 0 ? (
              <p className="text-sm text-gray-400">Henüz veri yok</p>
            ) : (
              <BarChart
                data={reports.monthlyBookings.map((m) => ({
                  month: TR_MONTHS[m.month.slice(5, 7)] ?? m.month,
                  value: m.count,
                }))}
              />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Tours */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">En Çok Rezervasyon Alan Turlar</h2>
              {reports.topTours.length === 0 ? (
                <p className="text-sm text-gray-400">Henüz veri yok</p>
              ) : (
                <div className="space-y-3">
                  {reports.topTours.map((t, i) => {
                    const maxB = Number(reports.topTours[0]?.bookings ?? 1) || 1;
                    const pct = (Number(t.bookings) / maxB) * 100;
                    return (
                      <div key={t.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 truncate max-w-[200px]">
                            <span className="text-gray-400 mr-2">#{i + 1}</span>{t.name}
                          </span>
                          <span className="text-gray-500 font-medium">{t.bookings} rezervasyon</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-orange rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Agencies */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">En Fazla Tur Ekleyen Acentalar</h2>
              {reports.topAgencies.length === 0 ? (
                <p className="text-sm text-gray-400">Henüz veri yok</p>
              ) : (
                <div className="space-y-3">
                  {reports.topAgencies.map((a, i) => {
                    const maxT = Number(reports.topAgencies[0]?.tours ?? 1) || 1;
                    const pct = (Number(a.tours) / maxT) * 100;
                    return (
                      <div key={a.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 truncate max-w-[200px]">
                            <span className="text-gray-400 mr-2">#{i + 1}</span>{a.name}
                          </span>
                          <span className="text-gray-500 font-medium">{a.tours} tur</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
