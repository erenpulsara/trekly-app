"use client";

import { useEffect, useState } from "react";
import {
  adminGetCategories, adminCreateCategory,
  adminDeleteCategory, AdminCategory, ApiError,
} from "@/lib/api";
import { ICON_PALETTE, ICON_MAP, resolveIcon, autoMatchIcon } from "@/lib/category-icons";
import Button from "@/components/Button";

const STATIC_KEYS = ["trekking","dağcılık","kano","rafting","bisiklet","kamp","dalış","yamaç paraşütü"];
const BRAND = "#FF5A1F";
const GRAY  = "#6B7280";

function IconPicker({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (key: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">İkon Seç</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="p-4 grid grid-cols-4 gap-2 max-h-80 overflow-y-auto">
          <button
            onClick={() => { onChange(""); onClose(); }}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors ${
              value === "" ? "border-brand-orange bg-brand-orange/5" : "border-transparent hover:border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="w-6 h-6 flex items-center justify-center text-gray-300 text-xl">—</span>
            <span className="text-[10px] text-gray-500 leading-tight text-center">Otomatik</span>
          </button>
          {ICON_PALETTE.map(({ key, label, Icon }) => {
            const selected = value.toLowerCase() === key.toLowerCase();
            return (
              <button key={key} onClick={() => { onChange(key); onClose(); }}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors ${
                  selected ? "border-brand-orange bg-brand-orange/5" : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Icon color={selected ? BRAND : GRAY} size={24} />
                <span className={`text-[10px] leading-tight text-center ${selected ? "text-brand-orange font-semibold" : "text-gray-500"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AdminKategorilerPage() {
  const [cats, setCats] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIconKey, setNewIconKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pickerFor, setPickerFor] = useState<string | null>(null);

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
      await adminCreateCategory({ name: newName.trim(), icon_key: newIconKey || undefined });
      setNewName(""); setNewIconKey(""); setShowForm(false);
      await load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Eklenemedi");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) return;
    setDeletingId(id);
    try { await adminDeleteCategory(id); await load(); } catch (err) {
      alert(err instanceof ApiError ? err.message : "Silinemedi");
    } finally { setDeletingId(null); }
  }

  // Canlı önizleme: icon_key varsa onu, yoksa isimden otomatik eşle
  const PreviewIcon = newIconKey
    ? (ICON_MAP[newIconKey] ?? null)
    : newName.trim()
      ? autoMatchIcon(newName.trim())
      : null;

  const dbNames = new Set(cats.map((c) => c.name.toLowerCase()));
  const staticDisplay = STATIC_KEYS.filter((k) => !dbNames.has(k.toLowerCase()));

  return (
    <div className="p-8">
      {pickerFor !== null && (
        <IconPicker
          value={pickerFor === "new" ? newIconKey : (cats.find(c => c.id === pickerFor)?.icon_key ?? "")}
          onChange={(key) => {
            if (pickerFor === "new") setNewIconKey(key);
          }}
          onClose={() => setPickerFor(null)}
        />
      )}

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
              <button onClick={() => { setShowForm(false); setNewName(""); setNewIconKey(""); }} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {/* Name input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Adı</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="örn: Atçılık Turu"
                  autoFocus
                />
              </div>

              {/* Live icon preview */}
              {newName.trim() && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                    {PreviewIcon
                      ? <PreviewIcon color={BRAND} size={26} />
                      : <span className="text-gray-400 text-lg font-bold">{newName[0]?.toUpperCase()}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{newName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {newIconKey
                        ? `Elle seçildi: ${ICON_PALETTE.find(p => p.key === newIconKey)?.label ?? newIconKey}`
                        : "Otomatik eşlendi"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPickerFor("new")}
                    className="text-xs text-brand-orange hover:underline flex-shrink-0"
                  >
                    Değiştir
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-3 px-6 py-5 border-t border-gray-100">
              <Button variant="secondary" size="md" onClick={() => { setShowForm(false); setNewName(""); setNewIconKey(""); }} className="flex-1">İptal</Button>
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
          const Icon = resolveIcon(cat.name, cat.icon_key);
          const isAutoMatched = !cat.icon_key;
          return (
            <div key={cat.id} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0">
              <div className="w-9 h-9 rounded-xl bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                <Icon color={BRAND} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isAutoMatched ? "Otomatik eşlendi" : `Seçili: ${ICON_PALETTE.find(p => p.key === cat.icon_key)?.label ?? cat.icon_key}`}
                </p>
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
