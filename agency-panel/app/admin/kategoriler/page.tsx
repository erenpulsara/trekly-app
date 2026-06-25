"use client";

import { useEffect, useRef, useState } from "react";
import {
  adminGetCategories, adminCreateCategory,
  adminDeleteCategory, adminUpdateCategoryIcon, AdminCategory, ApiError,
} from "@/lib/api";
import { ICON_MAP, resolveIcon } from "@/lib/category-icons";
import Button from "@/components/Button";

const STATIC_KEYS = ["trekking","dağcılık","kano","rafting","bisiklet","kamp","dalış","yamaç paraşütü"];
const BRAND = "#FF5A1F";

function UploadedIcon({ svg, size = 22 }: { svg: string; size?: number }) {
  return (
    <span
      style={{ display: "inline-flex", width: size, height: size, alignItems: "center", justifyContent: "center" }}
      className="[&>svg]:w-full [&>svg]:h-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function SvgUploadButton({
  current,
  onUpload,
  label = "SVG Yükle",
}: {
  current?: string | null;
  onUpload: (svg: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target?.result as string;
      const clean = raw
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/on\w+="[^"]*"/gi, "")
        .replace(/javascript:/gi, "");
      onUpload(clean);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="flex items-center gap-2">
      <input ref={inputRef} type="file" accept=".svg,image/svg+xml" className="hidden" onChange={handleFile} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 border border-dashed border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-500 hover:border-brand-orange hover:text-brand-orange transition-colors w-full"
      >
        {current ? (
          <>
            <UploadedIcon svg={current} size={20} />
            <span className="text-gray-700">İkon yüklendi — değiştir</span>
          </>
        ) : (
          <span>{label}</span>
        )}
      </button>
    </div>
  );
}

export default function AdminKategorilerPage() {
  const [cats, setCats] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIconSvg, setNewIconSvg] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

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
      await adminCreateCategory({
        name: newName.trim(),
        icon_svg: newIconSvg || undefined,
      });
      setNewName(""); setNewIconSvg(""); setShowForm(false);
      await load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Eklenemedi");
    } finally { setSaving(false); }
  }

  async function handleUploadIcon(id: string, svg: string) {
    setUploadingId(id);
    try { await adminUpdateCategoryIcon(id, svg); await load(); } catch {}
    finally { setUploadingId(null); }
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
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Yeni Kategori</h2>
              <button onClick={() => { setShowForm(false); setNewIconSvg(""); }} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Adı</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="örn: Atçılık Turu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İkon (SVG dosyası)</label>
                <SvgUploadButton
                  current={newIconSvg}
                  onUpload={setNewIconSvg}
                  label="SVG dosyası seç"
                />
                {newIconSvg && (
                  <div className="mt-2 flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <UploadedIcon svg={newIconSvg} size={40} />
                    <span className="text-xs text-gray-500">Önizleme</span>
                    <button
                      onClick={() => setNewIconSvg("")}
                      className="ml-auto text-xs text-red-400 hover:text-red-600"
                    >
                      Kaldır
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 px-6 py-5 border-t border-gray-100">
              <Button variant="secondary" size="md" onClick={() => { setShowForm(false); setNewIconSvg(""); }} className="flex-1">İptal</Button>
              <Button variant="primary" size="md" onClick={handleCreate} loading={saving} disabled={!newName.trim()} className="flex-1">Ekle</Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Static */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sabit Kategoriler (silinemez)</span>
        </div>
        {staticDisplay.map((key) => {
          const Icon = ICON_MAP[key];
          return (
            <div key={key} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50">
              <div className="w-9 h-9 rounded-xl bg-brand-orange/10 flex items-center justify-center">
                {Icon ? <Icon color={BRAND} size={20} /> : <span className="text-gray-300 text-xs">🔒</span>}
              </div>
              <span className="text-sm font-medium text-gray-700 flex-1 capitalize">{key}</span>
              <span className="text-xs text-gray-300">sabit</span>
            </div>
          );
        })}

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
        ) : cats.map((cat) => {
          const PaletteIcon = resolveIcon(cat.name, cat.icon_key);
          return (
            <div key={cat.id} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0">
              {/* Icon preview */}
              <div className="w-9 h-9 rounded-xl bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                {cat.icon_svg
                  ? <UploadedIcon svg={cat.icon_svg} size={22} />
                  : PaletteIcon
                    ? <PaletteIcon color={BRAND} size={20} />
                    : <span className="text-gray-400 text-sm font-bold">{cat.name[0]?.toUpperCase()}</span>
                }
              </div>

              <span className="text-sm font-medium text-gray-900 flex-1">{cat.name}</span>

              {/* SVG upload for this category */}
              <div className="flex items-center gap-1">
                <SvgUploadButton
                  current={null}
                  onUpload={(svg) => handleUploadIcon(cat.id, svg)}
                  label={uploadingId === cat.id ? "Yükleniyor..." : cat.icon_svg ? "İkonu değiştir" : "SVG yükle"}
                />
              </div>

              <Button
                variant="danger"
                size="sm"
                loading={deletingId === cat.id}
                onClick={() => handleDelete(cat.id, cat.name)}
              >
                Sil
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
