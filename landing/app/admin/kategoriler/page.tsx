'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/admin-api';
import { Plus, Trash2, X, Lock } from 'lucide-react';

const STATIC_KEYS = ['trekking','dağcılık','kano','rafting','bisiklet','kamp','dalış','yamaç paraşütü'];

const ICON_OPTIONS = [
  { key: 'trekking',        label: 'Trekking' },
  { key: 'dağcılık',        label: 'Dağcılık' },
  { key: 'kano',            label: 'Kano' },
  { key: 'rafting',         label: 'Rafting' },
  { key: 'bisiklet',        label: 'Bisiklet' },
  { key: 'kamp',            label: 'Kamp' },
  { key: 'dalış',           label: 'Dalış' },
  { key: 'yamaç paraşütü',  label: 'Paraşüt' },
  { key: 'Kültür Turu',     label: 'Kültür' },
  { key: 'Aile Kampı',      label: 'Aile' },
  { key: 'Jeep Safari',     label: 'Jeep' },
  { key: 'Kayak',           label: 'Kayak' },
  { key: 'Yoga',            label: 'Yoga' },
  { key: 'Sertifika',       label: 'Sertifika' },
];

export default function KategorilerPage() {
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [iconKey, setIconKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setCats(await adminApi.categories()); } catch {}
    setLoading(false);
  }

  async function create() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await adminApi.createCategory({ name: name.trim(), icon_key: iconKey || null });
      setName(''); setIconKey(''); setShowForm(false);
      await load();
    } catch (e: any) { alert('Hata: ' + e.message); }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    setDeleting(id);
    try { await adminApi.deleteCategory(id); await load(); } catch (e: any) { alert('Hata: ' + e.message); }
    setDeleting(null);
  }

  async function changeIcon(id: string, icon_key: string) {
    try { await adminApi.updateCategory(id, { icon_key }); await load(); } catch {}
  }

  // Static cats (always shown, not in DB)
  const dbNames = new Set(cats.map(c => c.name.toLowerCase()));
  const staticDisplay = STATIC_KEYS.filter(k => !dbNames.has(k.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Kategori Yönetimi</h1>
          <p className="text-sm text-gray-400 mt-0.5">Tur kategorilerini ve ikonları yönetin</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#FF5533] hover:bg-[#E64420] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition">
          <Plus size={16} /> Kategori Ekle
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-black text-gray-900">Yeni Kategori</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Kategori Adı</label>
                <input
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF5533]"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="örn: Jeep Safari"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">İkon</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF5533]"
                  value={iconKey}
                  onChange={e => setIconKey(e.target.value)}
                >
                  <option value="">— İkon seç —</option>
                  {ICON_OPTIONS.map(o => (
                    <option key={o.key} value={o.key}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">İptal</button>
              <button onClick={create} disabled={saving || !name.trim()} className="flex-1 py-2.5 rounded-xl bg-[#FF5533] text-white text-sm font-bold hover:bg-[#E64420] transition disabled:opacity-50">
                {saving ? 'Ekleniyor...' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Statik kategoriler */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Sabit Kategoriler (silinemez)</span>
        </div>
        {staticDisplay.map(key => (
          <div key={key} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Lock size={14} className="text-gray-400" />
            </div>
            <span className="text-sm font-semibold text-gray-700 flex-1 capitalize">{key}</span>
            <span className="text-xs text-gray-300 font-mono">sabit</span>
          </div>
        ))}

        {/* DB kategoriler */}
        {cats.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Eklenen Kategoriler</span>
          </div>
        )}
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Yükleniyor...</div>
        ) : cats.map(cat => (
          <div key={cat.id} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-[#FF5533]/10 flex items-center justify-center text-[#FF5533] text-sm font-bold">
              {cat.name[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-gray-700 flex-1">{cat.name}</span>
            <select
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#FF5533]"
              value={cat.icon_key ?? ''}
              onChange={e => changeIcon(cat.id, e.target.value)}
            >
              <option value="">— İkon yok —</option>
              {ICON_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
            <button
              onClick={() => remove(cat.id)}
              disabled={deleting === cat.id}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-40"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}

        {!loading && cats.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">
            Henüz ek kategori yok. Yukarıdan ekleyebilirsiniz.
          </div>
        )}
      </div>
    </div>
  );
}
