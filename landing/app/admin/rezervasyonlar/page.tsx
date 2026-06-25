'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin-api';
import { Search } from 'lucide-react';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Bekliyor', confirmed: 'Onaylı', completed: 'Tamamlandı', cancelled: 'İptal',
};
const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  confirmed: 'bg-green-50 text-green-700',
  completed: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-red-50 text-red-700',
};

export default function ReZervasyonlarPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    adminApi.bookings()
      .then(setBookings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.name?.toLowerCase().includes(q) || b.surname?.toLowerCase().includes(q) ||
      b.email?.toLowerCase().includes(q) || b.tour?.name?.toLowerCase().includes(q);
    const matchStatus = !filterStatus || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Rezervasyonlar</h1>
          <p className="text-sm text-gray-400 mt-0.5">{bookings.length} rezervasyon</p>
        </div>
        <div className="flex gap-3">
          <select
            className="border border-gray-200 rounded-xl text-sm px-3 py-2.5 focus:outline-none focus:border-[#FF5533]"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Tüm Durumlar</option>
            <option value="pending">Bekliyor</option>
            <option value="confirmed">Onaylı</option>
            <option value="completed">Tamamlandı</option>
            <option value="cancelled">İptal</option>
          </select>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF5533] w-52"
              placeholder="İsim, e-posta, tur..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Rezervasyon bulunamadı</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Kişi</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Tur</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Katılımcı</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Durum</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-sm text-gray-900">{b.name} {b.surname}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{b.email}</p>
                    <p className="text-xs text-gray-400">{b.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700 font-medium">{b.tour?.name ?? '—'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{b.tour?.location_name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-semibold">
                    {b.participant_count} kişi
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABEL[b.status] ?? b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(b.created_at).toLocaleDateString('tr-TR')}
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
