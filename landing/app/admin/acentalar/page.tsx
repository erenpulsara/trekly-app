'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin-api';
import { Trash2, Search, CheckCircle, XCircle } from 'lucide-react';

export default function AcentalarPage() {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setAgencies(await adminApi.agencies()); } catch {}
    setLoading(false);
  }

  async function remove(id: string, name: string) {
    if (!confirm(`"${name}" acentasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;
    setDeleting(id);
    try { await adminApi.deleteAgency(id); await load(); } catch (e: any) { alert('Hata: ' + e.message); }
    setDeleting(null);
  }

  const filtered = agencies.filter(a => {
    const q = search.toLowerCase();
    return !q || a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Acentalar</h1>
          <p className="text-sm text-gray-400 mt-0.5">{agencies.length} acenta</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF5533] w-56"
            placeholder="İsim veya e-posta..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Acenta bulunamadı</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Acenta</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Durum</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Tur Sayısı</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Kayıt Tarihi</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm flex-shrink-0">
                        {a.name?.[0]?.toUpperCase() ?? 'A'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{a.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {a.email_verified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                        <CheckCircle size={11} /> Doğrulandı
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700">
                        <XCircle size={11} /> Doğrulanmadı
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-700">{a.tour_count ?? 0}</span>
                    <span className="text-xs text-gray-400 ml-1">tur</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(a.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => remove(a.id, a.name)}
                      disabled={deleting === a.id}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-40"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
