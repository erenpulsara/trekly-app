"use client";

import { useEffect, useState } from "react";
import {
  adminGetCategories, adminCreateCategory, adminUpdateCategory,
  adminDeleteCategory, AdminCategory, ApiError,
} from "@/lib/api";
import Button from "@/components/Button";

const STATIC_KEYS = ["trekking","dağcılık","kano","rafting","bisiklet","kamp","dalış","yamaç paraşütü"];

const ICON_OPTIONS = [
  { key: "trekking",       label: "Trekking" },
  { key: "dağcılık",       label: "Dağcılık" },
  { key: "kano",           label: "Kano" },
  { key: "rafting",        label: "Rafting" },
  { key: "bisiklet",       label: "Bisiklet" },
  { key: "kamp",           label: "Kamp" },
  { key: "dalış",          label: "Dalış" },
  { key: "yamaç paraşütü", label: "Paraşüt" },
  { key: "Kültür Turu",    label: "Kültür Turu" },
  { key: "Aile Kampı",     label: "Aile Kampı" },
  { key: "Jeep Safari",    label: "Jeep Safari" },
  { key: "Kayak",          label: "Kayak" },
  { key: "Yoga",           label: "Yoga" },
  { key: "Sertifika",      label: "Sertifika" },
];

export default function AdminKategorilerPage() {
  const [cats, setCats] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try { setCats(await adminGetCategories()); } catch (err) {
      setError(err instanceof ApiError ? err.message : "Yüklenemedi");
    } finally { setLoading(false); }
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await adminCreateCategory({ name: newName.trim(), icon_key: newIcon || undefined });
      setNewName(""); setNewIcon(""); setShowForm(false);
      await load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Eklenemedi");
    } finally { setSaving(false); }
  }

  async function handleIconChange(id: string, icon_key: string) {
    try { await adminUpdateCategory(id, { icon_key }); await load(); } catch {}
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) return;
    setDeletingId(id);
    try { await adminDeleteCategory(id); await load(); } catch (err) {
      alert(err instanceof ApiError ? err.message : "Silinemedi");
    } finally { setDeletingId(null); }
  }

  const dbNames = new Set(cats.map((c) => c.name.toLowerCase()));
  const staticDisplay = STATIC_KEYS.filter((k) => !dbNames.has(k.toLowerCase()));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategoriler</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tur kategorilerini ve ikonları yönetin</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={load} loading={loading}>Yenile</Button>
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>+ Kategori Ekle</Button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-sm text-red-600">{error}</div>}

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Yeni Kategori</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Adı</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="örn: Jeep Safari"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İkon</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                >
                  <option value="">— İkon seç (isteğe bağlı) —</option>
                  {ICON_OPTIONS.map((o) => (
                    <option key={o.key} value={o.key}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-5 border-t border-gray-100">
              <Button variant="secondary" size="md" onClick={() => setShowForm(false)} className="flex-1">İptal</Button>
              <Button variant="primary" size="md" onClick={handleCreate} loading={saving} disabled={!newName.trim()} className="flex-1">Ekle</Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Static categories header */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sabit Kategoriler (silinemez)</span>
        </div>
        {staticDisplay.map((key) => (
          <div key={key} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">
              🔒
            </div>
            <span className="text-sm font-medium text-gray-700 flex-1 capitalize">{key}</span>
            <span className="text-xs text-gray-300">sabit</span>
          </div>
        ))}

        {/* DB categories */}
        {cats.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Eklenen Kategoriler ({cats.length})</span>
          </div>
        )}

        {loading && cats.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">Yükleniyor...</div>
        ) : cats.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">Henüz ek kategori yok. Yukarıdan ekleyebilirsiniz.</div>
        ) : cats.map((cat) => (
          <div key={cat.id} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange text-sm font-bold">
              {cat.name[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-900 flex-1">{cat.name}</span>
            <select
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
              value={cat.icon_key ?? ""}
              onChange={(e) => handleIconChange(cat.id, e.target.value)}
            >
              <option value="">— İkon yok —</option>
              {ICON_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
            <Button
              variant="danger"
              size="sm"
              loading={deletingId === cat.id}
              onClick={() => handleDelete(cat.id, cat.name)}
            >
              Sil
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
