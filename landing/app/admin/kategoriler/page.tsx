'use client';
import { useEffect, useRef, useState } from 'react';
import { adminApi, adminUploadMedia } from '@/lib/admin-api';
import { Plus, Trash2, X, Image as ImageIcon, Pencil, Check } from 'lucide-react';

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

interface Category {
  id: string;
  name: string;
  icon_key: string | null;
  image_url: string | null;
}

export default function KategorilerPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [iconKey, setIconKey] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rowUploadingId, setRowUploadingId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setCats(await adminApi.categories()); } catch {}
    setLoading(false);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await adminUploadMedia(file);
      setImageUrl(url);
    } catch (err: any) { alert('Görsel yüklenemedi: ' + err.message); }
    setUploading(false);
  }

  async function handleRowFileSelect(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRowUploadingId(id);
    try {
      const url = await adminUploadMedia(file);
      await adminApi.updateCategory(id, { image_url: url });
      await load();
    } catch (err: any) { alert('Görsel yüklenemedi: ' + err.message); }
    setRowUploadingId(null);
  }

  async function create() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await adminApi.createCategory({ name: name.trim(), icon_key: iconKey || null, image_url: imageUrl || null });
      setName(''); setIconKey(''); setImageUrl(''); setShowForm(false);
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

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditingName(cat.name);
  }

  async function saveEdit(id: string) {
    if (!editingName.trim()) return;
    try {
      await adminApi.updateCategory(id, { name: editingName.trim() });
      setEditingId(null);
      await load();
    } catch (e: any) { alert('Hata: ' + e.message); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Kategori Yönetimi</h1>
          <p className="text-sm text-gray-400 mt-0.5">Tur kategorilerini, görselleri ve ikonları yönetin</p>
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
              <button onClick={() => { setShowForm(false); setImageUrl(''); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
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
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Kategori Görseli</label>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                {imageUrl ? (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-32 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#FF5533] hover:text-[#FF5533] transition disabled:opacity-50"
                  >
                    <ImageIcon size={22} />
                    <span className="text-xs font-semibold">{uploading ? 'Yükleniyor...' : 'Görsel Yükle'}</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => { setShowForm(false); setImageUrl(''); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">İptal</button>
              <button onClick={create} disabled={saving || !name.trim()} className="flex-1 py-2.5 rounded-xl bg-[#FF5533] text-white text-sm font-bold hover:bg-[#E64420] transition disabled:opacity-50">
                {saving ? 'Ekleniyor...' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Yükleniyor...</div>
        ) : cats.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">
            Henüz kategori yok. Yukarıdan ekleyebilirsiniz.
          </div>
        ) : cats.map(cat => (
          <div key={cat.id} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0">
            {/* Photo thumbnail — click to upload/replace */}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id={`file-${cat.id}`}
              onChange={(e) => handleRowFileSelect(cat.id, e)}
            />
            <label
              htmlFor={`file-${cat.id}`}
              className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center text-[#FF5533] text-sm font-bold cursor-pointer group flex-shrink-0"
              title="Görseli değiştir"
            >
              {cat.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cat.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="bg-[#FF5533]/10 w-full h-full flex items-center justify-center">{cat.name[0]?.toUpperCase()}</span>
              )}
              <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                {rowUploadingId === cat.id ? (
                  <span className="text-white text-[9px]">...</span>
                ) : (
                  <ImageIcon size={13} className="text-white" />
                )}
              </span>
            </label>

            {/* Name — inline editable */}
            {editingId === cat.id ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  autoFocus
                  className="flex-1 px-3 py-1.5 border border-[#FF5533] rounded-lg text-sm focus:outline-none"
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEdit(cat.id)}
                />
                <button onClick={() => saveEdit(cat.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg">
                  <Check size={15} />
                </button>
                <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => startEdit(cat)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 flex-1 text-left hover:text-[#FF5533] group"
              >
                {cat.name}
                <Pencil size={12} className="opacity-0 group-hover:opacity-60" />
              </button>
            )}

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
      </div>
    </div>
  );
}
