'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin-api';
import { Building2, Map, CalendarCheck, FileText, TrendingUp, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.stats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = stats ? [
    { label: 'Toplam Acenta',       value: stats.agencies,    icon: Building2,     color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Toplam Tur',          value: stats.tours,       icon: Map,           color: 'text-blue-500',   bg: 'bg-blue-50' },
    { label: 'Toplam Rezervasyon',  value: stats.bookings,    icon: CalendarCheck, color: 'text-green-500',  bg: 'bg-green-50' },
    { label: 'Blog Yazısı',         value: stats.blogPosts,   icon: FileText,      color: 'text-orange-500', bg: 'bg-orange-50' },
  ] : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">Trekly yönetim paneline hoş geldiniz</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={20} className={color} />
              </div>
              <p className="text-3xl font-black text-gray-900">{value ?? '—'}</p>
              <p className="text-sm text-gray-500 font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {stats?.pendingBookings > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock size={20} className="text-yellow-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{stats.pendingBookings} bekleyen rezervasyon</p>
            <p className="text-xs text-gray-500 mt-0.5">Onay bekleyen rezervasyonları inceleyin</p>
          </div>
          <a href="/admin/rezervasyonlar" className="ml-auto text-sm font-semibold text-[#FF5533] hover:underline whitespace-nowrap">
            Görüntüle →
          </a>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickLink href="/admin/blog"        label="Blog Yönetimi"        desc="Yazı oluştur, düzenle, yayınla"   icon={FileText}      color="bg-orange-50 text-orange-500" />
        <QuickLink href="/admin/kategoriler" label="Kategori Yönetimi"    desc="Kategori ekle, ikon ata"           icon={TrendingUp}    color="bg-blue-50 text-blue-500" />
        <QuickLink href="/admin/turlar"      label="Tüm Turlar"           desc="Tüm acentaların turlarını gör"     icon={Map}           color="bg-green-50 text-green-500" />
        <QuickLink href="/admin/acentalar"   label="Acenta Yönetimi"      desc="Acentaları listele ve yönet"       icon={Building2}     color="bg-purple-50 text-purple-500" />
      </div>
    </div>
  );
}

function QuickLink({ href, label, desc, icon: Icon, color }: any) {
  return (
    <a href={href} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:border-[#FF5533]/30 transition group">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color.split(' ')[0]}`}>
        <Icon size={22} className={color.split(' ')[1]} />
      </div>
      <div>
        <p className="font-bold text-gray-900 text-sm group-hover:text-[#FF5533] transition">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <span className="ml-auto text-gray-300 group-hover:text-[#FF5533] transition text-lg">→</span>
    </a>
  );
}
