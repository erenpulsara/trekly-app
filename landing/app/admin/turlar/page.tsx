'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin-api';
import { Trash2, Search } from 'lucide-react';

const DIFF_LABEL: Record<string, string> = { easy: 'Kolay', medium: 'Orta', hard: 'Zor', extreme: 'Extreme' };
const DIFF_COLOR: Record<string, string> = {
  easy: 'bg-green-50 text-green-700',
  medium: 'bg-orange-50 text-orange-700',
  hard: 'bg-red-50 text-red-700',
  extreme: 'bg-red-100 text-red-900',
};

export default function TurlarAdminPage() {
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setTours(await adminApi.tours()); } catch {}
    setLoading(false);
  }

  async function remove(id: string) {
    if (!confirm('Bu turu silmek istediğinize emin misiniz?')) return;
    setDeleting(id);
    try { await adminApi.deleteTour(id); await load(); } catch (e: any) { alert('Hata: ' + e.message); }
    setDeleting(null);
  }

  const filtered = tours.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.location_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.agency?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Turlar</h1>
          <p className="text-sm text-gray-400 mt-0.5">{tours.length} tur</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF5533] w-56"
            placeholder="Ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Tur bulunamadı</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Tur</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Acenta</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Zorluk</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Durum</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Fiyat</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.location_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700">{t.agency?.name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{t.agency?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${DIFF_COLOR[t.difficulty] ?? 'bg-gray-100 text-gray-600'}`}>
                      {DIFF_LABEL[t.difficulty] ?? t.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${t.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {t.status === 'published' ? 'Yayında' : 'Taslak'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {t.price ? `₺${Number(t.price).toLocaleString('tr-TR')}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => remove(t.id)}
                      disabled={deleting === t.id}
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
