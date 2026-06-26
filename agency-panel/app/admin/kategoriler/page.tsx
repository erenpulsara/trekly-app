"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import {
  adminGetCategories, adminCreateCategory, adminUpdateCategory,
  adminDeleteCategory, adminUploadMedia, AdminCategory, ApiError,
} from "@/lib/api";
import Button from "@/components/Button";

const FALLBACK_PHOTOS: Record<string, string> = {
  'trekking':                  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=75',
  'dağcılık':                  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=75',
  'kano':                      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=75',
  'rafting':                   'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?w=400&q=75',
  'bisiklet':                  'https://images.unsplash.com/photo-1571188654248-7a89213915f7?w=400&q=75',
  'kamp':                      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=75',
  'dalış':                     'https://images.unsplash.com/photo-1682687982502-1529b3b33f85?w=400&q=75',
  'yamaç paraşütü':            'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400&q=75',
  'kültür turları':            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=75',
  'gastronomi / organizasyon': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=75',
  'gastronomi':                'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=75',
  'transfer hizmeti':          'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=75',
  'gemi ve tekne turları':     'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=75',
  'doğa macera turları':       'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=75',
  'deniz macera turları':      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=75',
  'hava macera turları':       'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=75',
  'kış turizm turları':        'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&q=75',
  'wellness spa / sağlık':     'https://images.unsplash.com/photo-1540555700478-4be0bf42b3ef?w=400&q=75',
  'tema / aksiyon turları':    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=75',
};
const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=75';

function getEffectivePhoto(name: string, image_url: string | null | undefined): string {
  if (image_url) return image_url;
  return FALLBACK_PHOTOS[name.toLowerCase()] ?? DEFAULT_PHOTO;
}

function PhotoUploader({
  value,
  onChange,
  disabled,
}: {
  value: string | null;
  onChange: (url: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true); setError(null);
    try {
      const url = await adminUploadMedia(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Yükleme başarısız");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div
        className="relative rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-brand-orange transition-colors cursor-pointer"
        style={{ height: '120px' }}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        {value ? (
          <>
            <Image src={value} alt="Kategori fotoğrafı" fill style={{ objectFit: 'cover' }} />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-semibold bg-black/40 px-3 py-1.5 rounded-lg">
                {uploading ? 'Yükleniyor...' : 'Değiştir'}
              </span>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-400">
            {uploading ? (
              <span className="text-sm">Yükleniyor...</span>
            ) : (
              <>
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4-4 4 4 4-6 4 6M3 20h18M12 12V4m0 0l-3 3m3-3l3 3"/>
                </svg>
                <span className="text-xs">Fotoğraf yükle veya sürükle</span>
                <span className="text-xs text-gray-300">JPG, PNG, WEBP</span>
              </>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

export default function AdminKategorilerPage() {
  const [cats, setCats] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true); setError(null);
    try { setCats(await adminGetCategories()); } catch (err) {
      setError(err instanceof ApiError ? err.message : "Yüklenemedi");
    } finally { setLoading(false); }
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await adminCreateCategory({
        name: newName.trim(),
        image_url: newImageUrl ?? undefined,
      });
      setNewName(""); setNewImageUrl(null); setShowForm(false);
      await load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Eklenemedi");
    } finally { setSaving(false); }
  }

  async function handleUpdatePhoto(id: string, image_url: string) {
    try {
      await adminUpdateCategory(id, { image_url });
      setCats((prev) => prev.map((c) => c.id === id ? { ...c, image_url } : c));
      setEditingPhotoId(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Güncellenemedi");
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) return;
    setDeletingId(id);
    try { await adminDeleteCategory(id); await load(); } catch (err) {
      alert(err instanceof ApiError ? err.message : "Silinemedi");
    } finally { setDeletingId(null); }
  }

  const STATIC_KEYS = ["trekking","dağcılık","kano","rafting","bisiklet","kamp","dalış","yamaç paraşütü"];
  const dbNames = new Set(cats.map((c) => c.name.toLowerCase()));
  const staticDisplay = STATIC_KEYS.filter((k) => !dbNames.has(k.toLowerCase()));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategoriler</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tur kategorilerini ve fotoğrafları yönetin</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={load} loading={loading}>Yenile</Button>
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>+ Kategori Ekle</Button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-sm text-red-600">{error}</div>}

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Yeni Kategori</h2>
              <button onClick={() => { setShowForm(false); setNewName(""); setNewImageUrl(null); }} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Adı</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="örn: Kültür Turları"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Fotoğrafı</label>
                <PhotoUploader
                  value={newImageUrl}
                  onChange={setNewImageUrl}
                />
                {!newImageUrl && newName.trim() && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    Fotoğraf yüklenmezse otomatik varsayılan kullanılır.
                  </p>
                )}
              </div>
              {/* Preview card */}
              {newName.trim() && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={getEffectivePhoto(newName, newImageUrl)}
                      alt="Önizleme"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-1 left-1.5 text-white text-[9px] font-bold uppercase leading-tight">
                      {newName}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">Önizleme</p>
                    <p className="text-xs text-gray-400 mt-0.5">Sitede bu şekilde görünür</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 px-6 py-5 border-t border-gray-100">
              <Button variant="secondary" size="md" onClick={() => { setShowForm(false); setNewName(""); setNewImageUrl(null); }} className="flex-1">İptal</Button>
              <Button variant="primary" size="md" onClick={handleCreate} loading={saving} disabled={!newName.trim()} className="flex-1">Ekle</Button>
            </div>
          </div>
        </div>
      )}

      {/* Photo edit modal */}
      {editingPhotoId && (() => {
        const cat = cats.find(c => c.id === editingPhotoId);
        if (!cat) return null;
        let pendingUrl = cat.image_url;
        return (
          <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900">Fotoğraf Güncelle</h2>
                <button onClick={() => setEditingPhotoId(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>
              <div className="p-6">
                <p className="text-sm font-medium text-gray-700 mb-3">{cat.name}</p>
                <PhotoUploader
                  value={pendingUrl}
                  onChange={(url) => {
                    pendingUrl = url;
                    handleUpdatePhoto(editingPhotoId, url);
                  }}
                />
              </div>
              <div className="px-6 pb-5">
                <Button variant="secondary" size="sm" onClick={() => setEditingPhotoId(null)} className="w-full">Kapat</Button>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Static categories */}
        {staticDisplay.length > 0 && (
          <>
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sabit Kategoriler (silinemez)</span>
            </div>
            {staticDisplay.map((key) => {
              const photo = getEffectivePhoto(key, null);
              return (
                <div key={key} className="flex items-center gap-4 px-6 py-3 border-b border-gray-50">
                  <div className="relative w-16 h-11 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={photo} alt={key} fill style={{ objectFit: 'cover' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 flex-1 capitalize">{key}</span>
                  <span className="text-xs text-gray-300">sabit</span>
                </div>
              );
            })}
          </>
        )}

        {/* DB categories */}
        {cats.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Eklenen Kategoriler ({cats.length})</span>
          </div>
        )}

        {loading && cats.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">Yükleniyor...</div>
        ) : cats.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">Henüz ek kategori yok.</div>
        ) : cats.map((cat) => {
          const photo = getEffectivePhoto(cat.name, cat.image_url);
          return (
            <div key={cat.id} className="flex items-center gap-4 px-6 py-3 border-b border-gray-50 last:border-0">
              <div className="relative w-16 h-11 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={photo} alt={cat.name} fill style={{ objectFit: 'cover' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {cat.image_url ? 'Özel fotoğraf' : 'Varsayılan fotoğraf'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingPhotoId(cat.id)}
                >
                  Fotoğraf
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  loading={deletingId === cat.id}
                  onClick={() => handleDelete(cat.id, cat.name)}
                >
                  Sil
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
