"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Textarea } from "./FormControls";
import Button from "./Button";
import PhotoUploader from "./PhotoUploader";
import { createTour, updateTour, addTourDate, deleteTourDate, verifyTursabNo } from "@/lib/api";
import { useLang } from "@/lib/LangContext";
import { TURKISH_PROVINCES } from "@/lib/provinces";
import type { Difficulty, Tour, TourDate, TourStatus } from "@/lib/types";

interface TourFormProps {
  mode: "create" | "edit";
  tour?: Tour;
}

const CURRENCIES: Array<{ value: "TRY" | "USD" | "EUR"; label: string }> = [
  { value: "TRY", label: "₺ TRY" },
  { value: "USD", label: "$ USD" },
  { value: "EUR", label: "€ EUR" },
];

interface FormValues {
  name: string;
  description: string;
  location_name: string;
  difficulty: Difficulty;
  max_participants: string;
  status: TourStatus;
  photo_urls: string[];
  // Extended fields
  categories: string[];
  price: string;
  price_currency: "TRY" | "USD" | "EUR";
  start_date: string;
  end_date: string;
  organizer: string;
  guide_name: string;
  guide_instagram: string;
  tursab_no: string;
  contact_phone: string;
  target_location: string;
  meeting_points: string;
  program: string;
  accommodation: string;
  accommodation_url: string;
  transportation: string;
  important_notes: string;
  tags: string[];
}

interface FormErrors {
  name?: string;
  description?: string;
  location_name?: string;
  max_participants?: string;
  categories?: string;
  price?: string;
  start_date?: string;
  end_date?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function TourForm({ mode, tour }: TourFormProps) {
  const router = useRouter();
  const { t } = useLang();
  const tx = t.tourForm;
  const DEFAULT_CATEGORIES = [
    "Trekking", "Dağcılık", "Kano", "Rafting",
    "Bisiklet", "Kamp", "Dalış", "Yamaç Paraşütü",
  ];
  const [availableCategories, setAvailableCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [tursabVerifying, setTursabVerifying] = useState(false);
  const [tursabStatus, setTursabStatus] = useState<'verified' | 'not_found' | 'error' | null>(null);
  const [tursabAgencyName, setTursabAgencyName] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/tours/categories`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: Array<{ name: string; icon_key: string | null } | string>) => {
        const fetched = data.map((d) => (typeof d === "string" ? d : d.name));
        if (fetched.length > 0) setAvailableCategories(fetched);
      })
      .catch(() => {});
  }, []);

  const difficultyOptions = [
    { value: "easy",        label: t.diff.easy },
    { value: "easy_medium", label: t.diff.easy_medium },
    { value: "medium",      label: t.diff.medium },
    { value: "medium_hard", label: t.diff.medium_hard },
    { value: "hard",        label: t.diff.hard },
    { value: "very_hard",   label: t.diff.very_hard },
    { value: "extreme",     label: t.diff.extreme },
  ];

  const statusOptions = [
    { value: "draft",     label: t.status.draft },
    { value: "published", label: t.status.published },
  ];

  function validate(v: FormValues): FormErrors {
    const errors: FormErrors = {};
    if (!v.name.trim())                               errors.name            = tx.nameRequired;
    if (!v.description.trim())                        errors.description     = tx.descRequired;
    if (!v.location_name.trim())                      errors.location_name   = tx.locationRequired;
    if (!v.max_participants || parseInt(v.max_participants) < 1) errors.max_participants = tx.participantsMin;
    if (v.categories.length === 0)                    errors.categories      = tx.categoryRequired;
    if (!v.price || parseFloat(v.price) <= 0)         errors.price           = tx.priceRequired;
    if (!v.start_date)                                errors.start_date      = tx.startDateRequired;
    if (!v.end_date)                                  errors.end_date        = tx.endDateRequired;
    return errors;
  }

  const [values, setValues] = useState<FormValues>({
    name:              tour?.name ?? "",
    description:       tour?.description ?? "",
    location_name:     tour?.location_name ?? "",
    difficulty:        tour?.difficulty ?? "easy",
    max_participants:  tour?.max_participants?.toString() ?? "",
    status:            tour?.status ?? "published",
    photo_urls:        tour?.photo_urls ?? [],
    categories:        tour?.category ? tour.category.split(", ").filter(Boolean) : [],
    price:             tour?.price?.toString() ?? "",
    price_currency:    (tour?.price_currency as "TRY" | "USD" | "EUR") ?? "TRY",
    start_date:        tour?.start_date ?? "",
    end_date:          tour?.end_date ?? "",
    organizer:         tour?.organizer ?? "",
    guide_name:        tour?.guide_name ?? "",
    guide_instagram:   tour?.guide_instagram ?? "",
    tursab_no:         tour?.tursab_no ?? "",
    contact_phone:     tour?.contact_phone ?? "",
    target_location:   tour?.target_location ?? "",
    meeting_points:    tour?.meeting_points ?? "",
    program:           tour?.program ?? "",
    accommodation:     tour?.accommodation ?? "",
    accommodation_url: tour?.accommodation_url ?? "",
    transportation:    tour?.transportation ?? "",
    important_notes:   tour?.important_notes ?? "",
    tags:              tour?.tags ?? [],
  });

  // ── Location multi-tag state ─────────────────────────────────
  const [locationInput,      setLocationInput]      = useState('');
  const [locationSuggestions,setLocationSuggestions]= useState<string[]>([]);
  const [showLocDrop,        setShowLocDrop]        = useState(false);
  const [locationList,       setLocationList]       = useState<string[]>(
    tour?.location_name ? tour.location_name.split(", ").filter(Boolean) : []
  );

  // ── Category multi-select state ──────────────────────────────
  const [categoryOtherInput, setCategoryOtherInput] = useState('');
  const [showCategoryOther,  setShowCategoryOther]  = useState(false);

  // ── Tags state ───────────────────────────────────────────────
  const [tagInput, setTagInput] = useState('');

  // ── Multi-date state (edit mode) ─────────────────────────────
  const [dates,        setDates]        = useState<TourDate[]>(tour?.dates ?? []);
  const [newDateValue, setNewDateValue] = useState('');
  const [newDateSlots, setNewDateSlots] = useState('');
  const [dateLoading,  setDateLoading]  = useState(false);

  const [errors,      setErrors]      = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading,     setLoading]     = useState(false);

  const set = (field: keyof FormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof FormErrors]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ── TURSAB verification ──────────────────────────────────────
  async function handleTursabVerify() {
    const no = values.tursab_no.trim();
    if (!no) return;
    setTursabVerifying(true);
    setTursabStatus(null);
    setTursabAgencyName(null);
    try {
      const result = await verifyTursabNo(no);
      if (result.error === 'connection_failed') {
        setTursabStatus('error');
      } else if (result.verified) {
        setTursabStatus('verified');
        setTursabAgencyName(result.agencyName ?? null);
      } else {
        setTursabStatus('not_found');
      }
    } catch {
      setTursabStatus('error');
    } finally {
      setTursabVerifying(false);
    }
  }

  // ── Location helpers ─────────────────────────────────────────
  function addLocation(val: string) {
    const trimmed = val.trim();
    if (!trimmed || locationList.includes(trimmed)) { setLocationInput(''); return; }
    const next = [...locationList, trimmed];
    setLocationList(next);
    setValues(prev => ({ ...prev, location_name: next.join(', ') }));
    if (errors.location_name) setErrors(prev => ({ ...prev, location_name: undefined }));
    setLocationInput('');
    setShowLocDrop(false);
  }
  function removeLocation(val: string) {
    const next = locationList.filter(l => l !== val);
    setLocationList(next);
    setValues(prev => ({ ...prev, location_name: next.join(', ') }));
  }

  // ── Category helpers ─────────────────────────────────────────
  function toggleCategory(cat: string) {
    setValues(prev => {
      const has = prev.categories.includes(cat);
      const next = has ? prev.categories.filter(c => c !== cat) : [...prev.categories, cat];
      if (next.length > 0 && errors.categories) setErrors(e => ({ ...e, categories: undefined }));
      return { ...prev, categories: next };
    });
  }
  function addCustomCategory() {
    const val = categoryOtherInput.trim();
    if (val && !values.categories.includes(val)) {
      setValues(prev => ({ ...prev, categories: [...prev.categories, val] }));
      if (errors.categories) setErrors(e => ({ ...e, categories: undefined }));
    }
    setCategoryOtherInput('');
    setShowCategoryOther(false);
  }

  // ── Date helpers ─────────────────────────────────────────────
  async function handleAddDate() {
    if (!newDateValue || !tour?.id) return;
    setDateLoading(true);
    try {
      const added = await addTourDate(tour.id, {
        date: newDateValue,
        available_slots: parseInt(newDateSlots) || tour.max_participants,
      }) as TourDate;
      setDates(prev => [...prev, added]);
      setNewDateValue('');
      setNewDateSlots('');
    } finally {
      setDateLoading(false);
    }
  }
  async function handleRemoveDate(dateId: string) {
    if (!tour?.id) return;
    setDateLoading(true);
    try {
      await deleteTourDate(tour.id, dateId);
      setDates(prev => prev.filter(d => d.id !== dateId));
    } finally {
      setDateLoading(false);
    }
  }

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = validate(values);
    if (Object.keys(formErrors).length > 0) { setErrors(formErrors); return; }
    setLoading(true);
    setSubmitError(null);
    try {
      const payload = {
        name:              values.name.trim(),
        description:       values.description.trim(),
        location_name:     values.location_name.trim(),
        difficulty:        values.difficulty,
        max_participants:  parseInt(values.max_participants),
        photo_urls:        values.photo_urls,
        status:            values.status,
        category:          values.categories.join(', '),
        price:             parseFloat(values.price),
        price_currency:    values.price_currency,
        start_date:        values.start_date,
        end_date:          values.end_date,
        organizer:         values.organizer.trim() || undefined,
        guide_name:        values.guide_name.trim() || undefined,
        guide_instagram:   values.guide_instagram.trim() || undefined,
        tursab_no:         values.tursab_no.trim() || undefined,
        contact_phone:     values.contact_phone.trim() || undefined,
        target_location:   values.target_location.trim() || undefined,
        meeting_points:    values.meeting_points.trim() || undefined,
        program:           values.program.trim() || undefined,
        accommodation:     values.accommodation.trim() || undefined,
        accommodation_url: values.accommodation_url.trim() || undefined,
        transportation:    values.transportation.trim() || undefined,
        important_notes:   values.important_notes.trim() || undefined,
        tags:              values.tags.length > 0 ? values.tags : undefined,
      };
      if (mode === "create") {
        await createTour(payload);
      } else {
        await updateTour(tour!.id, payload);
      }
      router.push("/tours");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : tx.submitError);
    } finally {
      setLoading(false);
    }
  };

  // ── Style helpers ────────────────────────────────────────────
  const tagContainerStyle: React.CSSProperties = {
    display: 'flex', flexWrap: 'wrap', gap: '6px',
    padding: '8px 10px', borderRadius: '10px',
    border: '1px solid #E5E7EB', background: 'white',
    minHeight: '42px', alignItems: 'center',
  };
  const inlineInputStyle: React.CSSProperties = {
    border: 'none', outline: 'none', padding: '4px',
    fontSize: '0.82rem', color: '#374151', background: 'transparent',
    flex: '1 1 120px', minWidth: '120px',
  };
  const chipStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    background: active ? '#FF5533' : '#F3F4F6',
    color: active ? 'white' : '#374151',
    border: active ? 'none' : '1px solid #E5E7EB',
    borderRadius: '8px', padding: '5px 12px',
    fontSize: '0.78rem', fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.15s',
  });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">

      {/* ── Basic Info ── */}
      <section className="bg-white rounded-2xl shadow-card p-6 flex flex-col gap-5">
        <h2 className="text-base font-bold font-display text-text-primary border-b border-gray-100 pb-3">{tx.basicInfo}</h2>
        <Input label={tx.tourName} required value={values.name} onChange={set("name")} error={errors.name} placeholder={tx.tourNamePlaceholder} />
        <Textarea label={tx.description} required rows={4} value={values.description} onChange={set("description")} error={errors.description} placeholder={tx.descriptionPlaceholder} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Select label={tx.difficulty} required value={values.difficulty} onChange={set("difficulty")} options={difficultyOptions} />
          <Select label={tx.status} required value={values.status} onChange={set("status")} options={statusOptions} />
        </div>
      </section>

      {/* ── Location & Specs ── */}
      <section className="bg-white rounded-2xl shadow-card p-6 flex flex-col gap-5">
        <h2 className="text-base font-bold font-display text-text-primary border-b border-gray-100 pb-3">{tx.locationSpecs}</h2>

        {/* Multi-location tag input */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
            {tx.province} <span style={{ color: '#FF5533' }}>*</span>
          </label>
          <div
            style={{ ...tagContainerStyle, borderColor: errors.location_name ? '#F87171' : '#E5E7EB', cursor: 'text' }}
            onClick={() => document.getElementById('loc-input')?.focus()}
          >
            {locationList.map(loc => (
              <span key={loc} style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: '#EEF2FF', color: '#4F46E5',
                border: '1px solid rgba(79,70,229,0.25)',
                borderRadius: '6px', padding: '3px 8px',
                fontSize: '0.78rem', fontWeight: 600,
              }}>
                {loc}
                <button type="button" onClick={() => removeLocation(loc)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 2px', color: '#4F46E5', lineHeight: 1, fontSize: '1rem' }}>
                  ×
                </button>
              </span>
            ))}
            <div style={{ position: 'relative', flex: '1 1 150px', minWidth: '150px' }}>
              <input
                id="loc-input"
                type="text"
                value={locationInput}
                placeholder={locationList.length === 0 ? 'Şehir veya ülke yazın (yurt dışı dahil), Enter ile ekle...' : ''}
                onChange={(e) => {
                  setLocationInput(e.target.value);
                  const raw = e.target.value.trim();
                  const q = raw.toLocaleLowerCase('tr');
                  if (q.length >= 1) {
                    const matches = TURKISH_PROVINCES.filter(p => p.toLocaleLowerCase('tr').includes(q)).slice(0, 8);
                    // Yazılan metin il listesiyle birebir eşleşmiyorsa (ör. yurt dışı bir
                    // lokasyon), yine de "ekle" seçeneği göster — il listesi sadece bir
                    // öneri/kolaylık, girişi kısıtlamıyor.
                    const exactMatch = TURKISH_PROVINCES.some(p => p.toLocaleLowerCase('tr') === q);
                    setLocationSuggestions(exactMatch || !raw ? matches : [...matches, raw]);
                    setShowLocDrop(true);
                  } else {
                    setLocationSuggestions([]);
                    setShowLocDrop(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter')  { e.preventDefault(); addLocation(locationInput); }
                  if (e.key === 'Escape') { setShowLocDrop(false); }
                }}
                onBlur={() => setTimeout(() => setShowLocDrop(false), 150)}
                style={inlineInputStyle}
              />
              {showLocDrop && locationSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, background: 'white',
                  border: '1px solid #E5E7EB', borderRadius: '10px', zIndex: 50,
                  maxHeight: '180px', overflowY: 'auto', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                }}>
                  {locationSuggestions.map(p => {
                    const isKnownProvince = TURKISH_PROVINCES.includes(p as (typeof TURKISH_PROVINCES)[number]);
                    return (
                      <button key={p} type="button"
                        onMouseDown={(e) => { e.preventDefault(); addLocation(p); }}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '8px 12px', fontSize: '0.82rem',
                          color: isKnownProvince ? '#374151' : '#FF5533',
                          fontWeight: isKnownProvince ? 400 : 600,
                          background: 'none', border: 'none', cursor: 'pointer',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                      >
                        {isKnownProvince ? p : `+ Ekle: "${p}"`}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          {errors.location_name && <p style={{ fontSize: '0.72rem', color: '#EF4444', margin: '4px 0 0 2px' }}>{errors.location_name}</p>}
          <p style={{ fontSize: '0.72rem', color: '#9CA3AF', margin: '4px 0 0 2px' }}>Birden çok şehir veya yurtdışı lokasyonu girebilirsiniz.</p>
        </div>

        {/* SEO Tags */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
            Etiket <span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 400 }}>(isteğe bağlı)</span>
          </label>
          <div style={tagContainerStyle}>
            {values.tags.map(tag => (
              <span key={tag} style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: '#FFF4F1', color: '#FF5533',
                border: '1px solid rgba(255,85,51,0.25)',
                borderRadius: '6px', padding: '3px 8px',
                fontSize: '0.78rem', fontWeight: 600,
              }}>
                {tag}
                <button type="button"
                  onClick={() => setValues(prev => ({ ...prev, tags: prev.tags.filter(tg => tg !== tag) }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 2px', color: '#FF5533', lineHeight: 1, fontSize: '1rem' }}>
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              placeholder={values.tags.length === 0 ? 'Etiket yaz, Enter ile ekle...' : ''}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  const v = tagInput.trim().replace(/,$/, '');
                  if (v && !values.tags.includes(v)) setValues(prev => ({ ...prev, tags: [...prev.tags, v] }));
                  setTagInput('');
                }
              }}
              style={inlineInputStyle}
            />
          </div>
          <p style={{ fontSize: '0.72rem', color: '#9CA3AF', margin: '4px 0 0 2px' }}>
            SEO etiketi (örn: Ramazan Bayramı Turu, Yılbaşı Turu) — Enter ile ekle
          </p>
        </div>

        <Input label={tx.maxParticipants} required type="number" min={1} value={values.max_participants} onChange={set("max_participants")} error={errors.max_participants} placeholder={tx.maxParticipantsPlaceholder} />
      </section>

      {/* ── Tour Details ── */}
      <section className="bg-white rounded-2xl shadow-card p-6 flex flex-col gap-5">
        <h2 className="text-base font-bold font-display text-text-primary border-b border-gray-100 pb-3">{tx.tourDetails}</h2>

        {/* Category multi-select */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
            {tx.category} <span style={{ color: '#FF5533' }}>*</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            {availableCategories.map(cat => (
              <button key={cat} type="button" onClick={() => toggleCategory(cat)} style={chipStyle(values.categories.includes(cat))}>
                {values.categories.includes(cat) && '✓ '}
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
            <button type="button" onClick={() => setShowCategoryOther(v => !v)} style={chipStyle(showCategoryOther)}>
              + {tx.categoryOther}
            </button>
          </div>
          {showCategoryOther && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <input
                type="text"
                value={categoryOtherInput}
                onChange={(e) => setCategoryOtherInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCategory())}
                placeholder="Kategori adı..."
                autoFocus
                style={{ height: '36px', padding: '0 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.82rem', outline: 'none', flex: 1, maxWidth: '220px' }}
              />
              <button type="button" onClick={addCustomCategory}
                style={{ height: '36px', padding: '0 14px', borderRadius: '8px', background: '#FF5533', color: 'white', border: 'none', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                Ekle
              </button>
            </div>
          )}
          {values.categories.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
              {values.categories.map(cat => (
                <span key={cat} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  background: '#FFF4F1', color: '#FF5533',
                  border: '1px solid rgba(255,85,51,0.25)',
                  borderRadius: '6px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700,
                }}>
                  {cat}
                  <button type="button" onClick={() => toggleCategory(cat)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF5533', lineHeight: 1, fontSize: '1rem' }}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {errors.categories && <p style={{ fontSize: '0.72rem', color: '#EF4444', margin: '6px 0 0 2px' }}>{errors.categories}</p>}
        </div>

        {/* Price + Currency */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          <Input
            label={`${tx.price} *`}
            type="number" min={0} step={0.01}
            value={values.price}
            onChange={set("price")}
            placeholder={tx.pricePlaceholder}
            error={errors.price}
          />
          <Select label={tx.currency} value={values.price_currency} onChange={set("price_currency")} options={CURRENCIES} />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input label={`${tx.startDate} *`} type="date" value={values.start_date} onChange={set("start_date")} error={errors.start_date} />
          <Input label={`${tx.endDate} *`}   type="date" value={values.end_date}   onChange={set("end_date")}   error={errors.end_date} />
        </div>

        {/* Tur Tarihleri */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>{tx.tourDates}</label>
          <p style={{ fontSize: '0.72rem', color: '#9CA3AF', margin: '0 0 10px' }}>{tx.tourDatesHint}</p>
          {mode === 'create' ? (
            <p style={{ fontSize: '0.78rem', color: '#6B7280', background: '#F9FAFB', padding: '10px 14px', borderRadius: '10px', margin: 0 }}>
              {tx.tourDatesCreateHint}
            </p>
          ) : (
            <>
              {dates.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                  {dates.map(d => (
                    <div key={d.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 14px', borderRadius: '10px', background: '#F9FAFB', border: '1px solid #E5E7EB',
                    }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                        {new Date(d.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        <span style={{ marginLeft: '12px', fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 400 }}>
                          {d.available_slots} kontenjan
                        </span>
                      </span>
                      <button type="button" onClick={() => handleRemoveDate(d.id)} disabled={dateLoading}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '0.75rem', fontWeight: 600, padding: '4px 8px' }}>
                        Kaldır
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Tarih</label>
                  <input type="date" value={newDateValue} onChange={(e) => setNewDateValue(e.target.value)}
                    style={{ height: '36px', padding: '0 10px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.82rem', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>{tx.availableSlots}</label>
                  <input type="number" min={1} value={newDateSlots} onChange={(e) => setNewDateSlots(e.target.value)}
                    placeholder={values.max_participants || '20'}
                    style={{ height: '36px', padding: '0 10px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.82rem', outline: 'none', width: '100px' }} />
                </div>
                <button type="button" onClick={handleAddDate} disabled={!newDateValue || dateLoading}
                  style={{
                    height: '36px', padding: '0 16px', borderRadius: '8px',
                    background: newDateValue && !dateLoading ? '#FF5533' : '#E5E7EB',
                    color: newDateValue && !dateLoading ? 'white' : '#9CA3AF',
                    border: 'none', fontSize: '0.82rem', fontWeight: 600,
                    cursor: newDateValue && !dateLoading ? 'pointer' : 'default',
                  }}>
                  + {tx.addDate}
                </button>
              </div>
            </>
          )}
        </div>

        <Input label="Düzenleyen" value={values.organizer} onChange={set("organizer")} placeholder="örn. Trekly Outdoor, Ali Yılmaz" hint={tx.optional} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input label={tx.guideName} value={values.guide_name} onChange={set("guide_name")} placeholder={tx.guideNamePlaceholder} hint={tx.optional} />
          <Input label="Rehber Instagram URL" value={values.guide_instagram} onChange={set("guide_instagram")} placeholder="https://instagram.com/rehber" hint={tx.optional} />
          {/* TURSAB No + verify button */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold font-body text-text-primary">{tx.tursabNo}</label>
            <div className="flex gap-2">
              <input
                value={values.tursab_no}
                onChange={(e) => {
                  setValues((prev) => ({ ...prev, tursab_no: e.target.value }));
                  setTursabStatus(null);
                }}
                placeholder={tx.tursabNoPlaceholder}
                className="h-10 px-3.5 rounded-xl border border-gray-200 hover:border-gray-300 font-body text-sm text-text-primary bg-white placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all duration-150 flex-1 min-w-0"
              />
              <button
                type="button"
                onClick={handleTursabVerify}
                disabled={!values.tursab_no.trim() || tursabVerifying}
                className="h-10 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              >
                {tursabVerifying ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : 'Doğrula'}
              </button>
            </div>
            {tursabStatus === 'verified' && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs font-semibold">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                TURSAB Onaylı{tursabAgencyName ? `: ${tursabAgencyName}` : ''}
              </div>
            )}
            {tursabStatus === 'not_found' && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs font-semibold">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Bu belge numarası TURSAB sisteminde bulunamadı.
              </div>
            )}
            {tursabStatus === 'error' && (
              <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs font-semibold">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
                TURSAB sistemi şu an erişilemiyor. Daha sonra tekrar deneyin.
              </div>
            )}
            <p className="text-xs text-text-muted font-body">{tx.optional}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input label={tx.contactPhone} value={values.contact_phone} onChange={set("contact_phone")} placeholder={tx.contactPhonePlaceholder} hint={tx.optional} />
          <Input label={tx.targetLocation} value={values.target_location} onChange={set("target_location")} placeholder={tx.targetLocationPlaceholder} hint={tx.optional} />
        </div>
        <Textarea label={tx.meetingPoints} rows={3} value={values.meeting_points} onChange={set("meeting_points")} placeholder={tx.meetingPointsPlaceholder} hint={tx.optional} />
      </section>

      {/* ── Tour Content ── */}
      <section className="bg-white rounded-2xl shadow-card p-6 flex flex-col gap-5">
        <h2 className="text-base font-bold font-display text-text-primary border-b border-gray-100 pb-3">{tx.tourContent}</h2>
        <Textarea label={tx.program} rows={5} value={values.program} onChange={set("program")} placeholder={tx.programPlaceholder} hint={tx.optional} />
        <Textarea label={tx.accommodation} rows={3} value={values.accommodation} onChange={set("accommodation")} placeholder={tx.accommodationPlaceholder} hint={tx.optional} />
        <Input label={tx.accommodationUrl} value={values.accommodation_url} onChange={set("accommodation_url")} placeholder={tx.accommodationUrlPlaceholder} hint={tx.optional} />
        <Textarea label={tx.transportation} rows={3} value={values.transportation} onChange={set("transportation")} placeholder={tx.transportationPlaceholder} hint={tx.optional} />
        <Textarea label={tx.importantNotes} rows={3} value={values.important_notes} onChange={set("important_notes")} placeholder={tx.importantNotesPlaceholder} hint={tx.optional} />
      </section>

      {/* ── Photos ── */}
      <section className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="text-base font-bold font-display text-text-primary border-b border-gray-100 pb-3 mb-5">{tx.photos}</h2>
        <PhotoUploader value={values.photo_urls} onChange={(urls) => setValues((prev) => ({ ...prev, photo_urls: urls }))} />
      </section>

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm font-body text-red-600">{submitError}</p>
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="secondary" onClick={() => router.push("/tours")} disabled={loading}>
          {tx.cancel}
        </Button>
        <Button type="submit" loading={loading}>
          {mode === "create" ? tx.create : tx.saveChanges}
        </Button>
      </div>
    </form>
  );
}
