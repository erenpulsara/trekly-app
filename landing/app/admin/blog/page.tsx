'use client';
import { useEffect, useRef, useState } from 'react';
import { adminApi, adminUploadMedia } from '@/lib/admin-api';
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Upload, ImageIcon } from 'lucide-react';


function slugify(s: string) {
  return s.toLowerCase().replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const EMPTY = { id: '', title: '', slug: '', content: '', excerpt: '', cover_image: '', status: 'draft' as 'draft' | 'published' };

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<typeof EMPTY | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await adminUploadMedia(file);
      setForm(f => f ? { ...f, cover_image: url } : f);
    } catch (err: any) {
      alert('Yükleme başarısız: ' + err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { setPosts(await adminApi.blogAll()); } catch {}
    setLoading(false);
  }

  function openNew() { setForm({ ...EMPTY }); }
  function openEdit(p: any) { setForm({ id: p.id, title: p.title, slug: p.slug, content: p.content, excerpt: p.excerpt ?? '', cover_image: p.cover_image ?? '', status: p.status }); }

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      const dto = { title: form.title, slug: form.slug, content: form.content, excerpt: form.excerpt, cover_image: form.cover_image, status: form.status };
      if (form.id) await adminApi.updateBlog(form.id, dto);
      else await adminApi.createBlog(dto);
      setForm(null);
      await load();
    } catch (e: any) { alert('Hata: ' + e.message); }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm('Bu yazıyı silmek istediğinize emin misiniz?')) return;
    setDeleting(id);
    try { await adminApi.deleteBlog(id); await load(); } catch (e: any) { alert('Hata: ' + e.message); }
    setDeleting(null);
  }

  async function toggleStatus(p: any) {
    const next = p.status === 'published' ? 'draft' : 'published';
    try { await adminApi.updateBlog(p.id, { status: next }); await load(); } catch {}
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Blog Yönetimi</h1>
          <p className="text-sm text-gray-400 mt-0.5">{posts.length} yazı</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-[#FF5533] hover:bg-[#E64420] text-white text-sm font-bold px-4 py-2.5 rounded-xl transition">
          <Plus size={16} /> Yeni Yazı
        </button>
      </div>

      {/* Form Modal */}
      {form && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mb-10">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-black text-gray-900">{form.id ? 'Yazıyı Düzenle' : 'Yeni Blog Yazısı'}</h2>
              <button onClick={() => setForm(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Başlık</label>
                <input
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF5533]"
                  value={form.title}
                  onChange={e => setForm(f => f && ({ ...f, title: e.target.value, slug: f.id ? f.slug : slugify(e.target.value) }))}
                  placeholder="Blog yazısı başlığı"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Slug</label>
                <input
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF5533] font-mono"
                  value={form.slug}
                  onChange={e => setForm(f => f && ({ ...f, slug: e.target.value }))}
                  placeholder="blog-yazisi-slug"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Özet</label>
                <input
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF5533]"
                  value={form.excerpt}
                  onChange={e => setForm(f => f && ({ ...f, excerpt: e.target.value }))}
                  placeholder="Kısa açıklama"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Kapak Resmi</label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                {form.cover_image ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200" style={{ height: 180 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.cover_image} alt="Kapak" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center gap-3">
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-1.5 bg-white text-gray-800 text-xs font-bold px-3 py-2 rounded-lg">
                        <Upload size={13} /> Değiştir
                      </button>
                      <button type="button" onClick={() => setForm(f => f ? { ...f, cover_image: '' } : f)}
                        className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-lg">
                        <X size={13} /> Kaldır
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center gap-2 text-gray-400 hover:border-[#FF5533] hover:text-[#FF5533] transition disabled:opacity-50">
                    {uploading ? (
                      <><div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" /><span className="text-xs font-medium">Yükleniyor...</span></>
                    ) : (
                      <><ImageIcon size={28} /><span className="text-xs font-semibold">Fotoğraf seç veya buraya sürükle</span><span className="text-xs">JPG, PNG, WEBP — maks 10 MB</span></>
                    )}
                  </button>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">İçerik</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF5533] resize-none"
                  rows={10}
                  value={form.content}
                  onChange={e => setForm(f => f && ({ ...f, content: e.target.value }))}
                  placeholder="Blog yazısı içeriği..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Durum</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#FF5533]"
                  value={form.status}
                  onChange={e => setForm(f => f && ({ ...f, status: e.target.value as any }))}
                >
                  <option value="draft">Taslak</option>
                  <option value="published">Yayında</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setForm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">İptal</button>
              <button onClick={save} disabled={saving || !form.title || !form.slug || !form.content} className="flex-1 py-2.5 rounded-xl bg-[#FF5533] text-white text-sm font-bold hover:bg-[#E64420] transition disabled:opacity-50">
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Yükleniyor...</div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">Henüz blog yazısı yok</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Başlık</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Durum</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-4">Tarih</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-sm text-gray-900">{p.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{p.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleStatus(p)} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${p.status === 'published' ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {p.status === 'published' ? <><Eye size={11} /> Yayında</> : <><EyeOff size={11} /> Taslak</>}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(p.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-[#FF5533] hover:bg-[#FF5533]/5 rounded-lg transition">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => remove(p.id)} disabled={deleting === p.id} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-40">
                        <Trash2 size={15} />
                      </button>
                    </div>
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
