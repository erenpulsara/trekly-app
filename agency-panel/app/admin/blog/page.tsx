"use client";

import { useEffect, useRef, useState } from "react";
import {
  adminGetBlogPosts, adminCreateBlogPost, adminUpdateBlogPost,
  adminDeleteBlogPost, AdminBlogPost, ApiError, uploadMediaAsAdmin,
} from "@/lib/api";
import Button from "@/components/Button";

function slugify(s: string) {
  return s.toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const EMPTY_FORM = {
  id: "", title: "", slug: "", content: "",
  excerpt: "", cover_image: "", status: "draft" as "draft" | "published",
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMediaAsAdmin(file);
      setForm((f) => f ? { ...f, cover_image: url } : f);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Yükleme başarısız");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try { setPosts(await adminGetBlogPosts()); } catch (err) {
      setError(err instanceof ApiError ? err.message : "Yüklenemedi");
    } finally { setLoading(false); }
  }

  function openNew() { setForm({ ...EMPTY_FORM }); }
  function openEdit(p: AdminBlogPost) {
    setForm({ id: p.id, title: p.title, slug: p.slug, content: p.content, excerpt: p.excerpt ?? "", cover_image: p.cover_image ?? "", status: p.status });
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      const dto = { title: form.title, slug: form.slug, content: form.content, excerpt: form.excerpt || undefined, cover_image: form.cover_image || undefined, status: form.status };
      if (form.id) await adminUpdateBlogPost(form.id, dto);
      else await adminCreateBlogPost(dto);
      setForm(null);
      await load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Kaydedilemedi");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`"${title}" yazısını silmek istediğinize emin misiniz?`)) return;
    setDeletingId(id);
    try { await adminDeleteBlogPost(id); await load(); } catch (err) {
      alert(err instanceof ApiError ? err.message : "Silinemedi");
    } finally { setDeletingId(null); }
  }

  async function toggleStatus(p: AdminBlogPost) {
    try {
      await adminUpdateBlogPost(p.id, { status: p.status === "published" ? "draft" : "published" });
      await load();
    } catch {}
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-0.5">{posts.length} yazı</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={load} loading={loading}>Yenile</Button>
          <Button variant="primary" size="sm" onClick={openNew}>+ Yeni Yazı</Button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-sm text-red-600">{error}</div>}

      {/* Modal Form */}
      {form && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mb-10">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{form.id ? "Yazıyı Düzenle" : "Yeni Blog Yazısı"}</h2>
              <button onClick={() => setForm(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
                  value={form.title}
                  onChange={(e) => setForm((f) => f && ({ ...f, title: e.target.value, slug: f.id ? f.slug : slugify(e.target.value) }))}
                  placeholder="Blog yazısı başlığı"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
                  value={form.slug}
                  onChange={(e) => setForm((f) => f && ({ ...f, slug: e.target.value }))}
                  placeholder="blog-yazisi-slug"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Özet</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => f && ({ ...f, excerpt: e.target.value }))}
                  placeholder="Kısa açıklama (isteğe bağlı)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kapak Resmi</label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                {form.cover_image ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200" style={{ height: 180 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.cover_image} alt="Kapak" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-1.5 bg-white text-gray-800 text-xs font-bold px-3 py-2 rounded-lg">
                        ↑ Değiştir
                      </button>
                      <button type="button" onClick={() => setForm((f) => f ? { ...f, cover_image: "" } : f)}
                        className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-lg">
                        × Kaldır
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center gap-2 text-gray-400 hover:border-brand-orange hover:text-brand-orange transition-colors disabled:opacity-50">
                    {uploading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-medium">Yükleniyor...</span>
                      </>
                    ) : (
                      <>
                        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
                        </svg>
                        <span className="text-xs font-semibold">Fotoğraf seç veya buraya sürükle</span>
                        <span className="text-xs">JPG, PNG, WEBP — maks 10 MB</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İçerik</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange resize-none"
                  rows={10}
                  value={form.content}
                  onChange={(e) => setForm((f) => f && ({ ...f, content: e.target.value }))}
                  placeholder="Blog yazısı içeriği..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
                  value={form.status}
                  onChange={(e) => setForm((f) => f && ({ ...f, status: e.target.value as "draft" | "published" }))}
                >
                  <option value="draft">Taslak</option>
                  <option value="published">Yayında</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-5 border-t border-gray-100">
              <Button variant="secondary" size="md" onClick={() => setForm(null)} className="flex-1">İptal</Button>
              <Button
                variant="primary" size="md" onClick={save}
                loading={saving}
                disabled={!form.title || !form.slug || !form.content}
                className="flex-1"
              >
                Kaydet
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading && posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Yükleniyor...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Henüz blog yazısı yok</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 font-medium text-gray-600">Başlık</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Durum</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Tarih</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{p.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{p.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(p)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        p.status === "published"
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {p.status === "published" ? "Yayında" : "Taslak"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(p.created_at).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(p)}>Düzenle</Button>
                      <Button
                        variant="danger" size="sm"
                        loading={deletingId === p.id}
                        onClick={() => handleDelete(p.id, p.title)}
                      >
                        Sil
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
