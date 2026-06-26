"use client";

import { useEffect, useState } from "react";
import { adminGetSettings, adminUpdateSettings, PlatformSettings, ApiError } from "@/lib/api";
import Button from "@/components/Button";

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
          checked ? "bg-brand-orange" : "bg-gray-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export default function AdminAyarlarPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setSettings(await adminGetSettings());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ayarlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  function set<K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) {
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev);
    setSaved(false);
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await adminUpdateSettings({
        site_name: settings.site_name,
        support_email: settings.support_email,
        maintenance_mode: settings.maintenance_mode,
        new_registrations: settings.new_registrations,
        email_verification: settings.email_verification,
        auto_approve_agencies: settings.auto_approve_agencies,
        commission_rate: settings.commission_rate,
        min_booking_hours: settings.min_booking_hours,
      });
      setSettings(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-16 text-gray-400 text-sm">Yükleniyor...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">{error ?? "Ayarlar yüklenemedi"}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform genel yapılandırması</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-green-600 font-medium">Kaydedildi</span>
          )}
          <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
            Kaydet
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genel */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Genel Bilgiler</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Adı</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => set("site_name", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destek E-postası</label>
              <input
                type="email"
                value={settings.support_email}
                onChange={(e) => set("support_email", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Komisyon Oranı (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.commission_rate}
                onChange={(e) => set("commission_rate", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Rezervasyon Süresi (saat)
              </label>
              <input
                type="number"
                min="1"
                value={settings.min_booking_hours}
                onChange={(e) => set("min_booking_hours", Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
              />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-2">Platform Özellikleri</h2>
          <Toggle
            label="Bakım Modu"
            description="Etkinleştirildiğinde site bakım sayfası gösterir"
            checked={settings.maintenance_mode}
            onChange={(v) => set("maintenance_mode", v)}
          />
          <Toggle
            label="Yeni Kayıtlar"
            description="Kullanıcı ve acenta kaydını etkinleştirir/devre dışı bırakır"
            checked={settings.new_registrations}
            onChange={(v) => set("new_registrations", v)}
          />
          <Toggle
            label="E-posta Doğrulama"
            description="Kullanıcıların e-postalarını doğrulamasını zorunlu kılar"
            checked={settings.email_verification}
            onChange={(v) => set("email_verification", v)}
          />
          <Toggle
            label="Acentaları Otomatik Onayla"
            description="Kapalıysa acentalar manuel inceleme bekler"
            checked={settings.auto_approve_agencies}
            onChange={(v) => set("auto_approve_agencies", v)}
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-red-700 mb-1">Tehlikeli Bölge</h2>
        <p className="text-sm text-red-500 mb-4">Bu işlemler geri alınamaz. Dikkatli olunuz.</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => alert("Bu özellik henüz aktif değil.")}
            className="px-4 py-2 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
          >
            Tüm Önbelleği Temizle
          </button>
          <button
            onClick={() => alert("Bu özellik henüz aktif değil.")}
            className="px-4 py-2 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
          >
            Demo Veriyi Sıfırla
          </button>
        </div>
      </div>
    </div>
  );
}
