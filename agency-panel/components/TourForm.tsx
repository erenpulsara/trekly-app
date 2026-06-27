"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Textarea, ProvinceSelect } from "./FormControls";
import Button from "./Button";
import PhotoUploader from "./PhotoUploader";
import DatesManager, { PendingDate } from "./DatesManager";
import { createTour, updateTour, addTourDate, deleteTourDate } from "@/lib/api";
import { useLang } from "@/lib/LangContext";
import type { Difficulty, Tour, TourDate, TourStatus } from "@/lib/types";

interface TourFormProps {
  mode: "create" | "edit";
  tour?: Tour;
}

interface FormValues {
  name: string;
  description: string;
  location_name: string;
  latitude: string;
  longitude: string;
  altitude_meters: string;
  difficulty: Difficulty;
  distance_km: string;
  max_participants: string;
  status: TourStatus;
  photo_urls: string[];
  // Extended fields
  category: string;
  price: string;
  start_date: string;
  end_date: string;
  guide_name: string;
  tursab_no: string;
  contact_phone: string;
  target_location: string;
  meeting_points: string;
  program: string;
  accommodation: string;
  transportation: string;
  important_notes: string;
  tags: string[];
}

interface FormErrors {
  name?: string;
  description?: string;
  location_name?: string;
  max_participants?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function TourForm({ mode, tour }: TourFormProps) {
  const router = useRouter();
  const { t } = useLang();
  const tx = t.tourForm;
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/tours/categories`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: Array<{ name: string; icon_key: string | null } | string>) =>
        setCategories(data.map((d) => (typeof d === "string" ? d : d.name)))
      )
      .catch(() => {});
  }, []);

  const difficultyOptions = [
    { value: "easy", label: t.diff.easy },
    { value: "medium", label: t.diff.medium },
    { value: "hard", label: t.diff.hard },
    { value: "extreme", label: t.diff.extreme },
  ];

  const statusOptions = [
    { value: "draft", label: t.status.draft },
    { value: "published", label: t.status.published },
  ];

  const categoryOptions = [
    { value: "", label: tx.categoryPlaceholder },
    ...categories.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) })),
  ];

  function validate(values: FormValues): FormErrors {
    const errors: FormErrors = {};
    if (!values.name.trim()) errors.name = tx.nameRequired;
    if (!values.description.trim()) errors.description = tx.descRequired;
    if (!values.location_name.trim()) errors.location_name = tx.locationRequired;
    if (!values.max_participants || parseInt(values.max_participants) < 1) errors.max_participants = tx.participantsMin;
    return errors;
  }

  const [values, setValues] = useState<FormValues>({
    name: tour?.name ?? "",
    description: tour?.description ?? "",
    location_name: tour?.location_name ?? "",
    latitude: tour?.latitude?.toString() ?? "",
    longitude: tour?.longitude?.toString() ?? "",
    altitude_meters: tour?.altitude_meters?.toString() ?? "",
    difficulty: tour?.difficulty ?? "easy",
    distance_km: tour?.distance_km?.toString() ?? "",
    max_participants: tour?.max_participants?.toString() ?? "",
    status: tour?.status ?? "published",
    photo_urls: tour?.photo_urls ?? [],
    category: tour?.category ?? "",
    price: tour?.price?.toString() ?? "",
    start_date: tour?.start_date ?? "",
    end_date: tour?.end_date ?? "",
    guide_name: tour?.guide_name ?? "",
    tursab_no: tour?.tursab_no ?? "",
    contact_phone: tour?.contact_phone ?? "",
    target_location: tour?.target_location ?? "",
    meeting_points: tour?.meeting_points ?? "",
    program: tour?.program ?? "",
    accommodation: tour?.accommodation ?? "",
    transportation: tour?.transportation ?? "",
    important_notes: tour?.important_notes ?? "",
    tags: tour?.tags ?? [],
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [existingDates, setExistingDates] = useState<TourDate[]>(tour?.dates ?? []);
  const [pendingDates, setPendingDates] = useState<PendingDate[]>([]);
  const [removingDateId, setRemovingDateId] = useState<string | null>(null);

  const set = (field: keyof FormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRemoveExistingDate = async (dateId: string) => {
    if (!tour) return;
    setRemovingDateId(dateId);
    try {
      await deleteTourDate(tour.id, dateId);
      setExistingDates((prev) => prev.filter((d) => d.id !== dateId));
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : tx.dateRemoveError);
    } finally {
      setRemovingDateId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = validate(values);
    if (Object.keys(formErrors).length > 0) { setErrors(formErrors); return; }

    setLoading(true);
    setSubmitError(null);

    try {
      const payload = {
        name: values.name.trim(),
        description: values.description.trim(),
        location_name: values.location_name.trim(),
        latitude: values.latitude ? parseFloat(values.latitude) : undefined,
        longitude: values.longitude ? parseFloat(values.longitude) : undefined,
        altitude_meters: values.altitude_meters ? parseInt(values.altitude_meters) : undefined,
        difficulty: values.difficulty,
        distance_km: values.distance_km ? parseFloat(values.distance_km) : undefined,
        max_participants: parseInt(values.max_participants),
        photo_urls: values.photo_urls,
        status: values.status,
        category: values.category || undefined,
        price: values.price ? parseFloat(values.price) : undefined,
        start_date: values.start_date || undefined,
        end_date: values.end_date || undefined,
        guide_name: values.guide_name.trim() || undefined,
        tursab_no: values.tursab_no.trim() || undefined,
        contact_phone: values.contact_phone.trim() || undefined,
        target_location: values.target_location.trim() || undefined,
        meeting_points: values.meeting_points.trim() || undefined,
        program: values.program.trim() || undefined,
        accommodation: values.accommodation.trim() || undefined,
        transportation: values.transportation.trim() || undefined,
        important_notes: values.important_notes.trim() || undefined,
        tags: values.tags.length > 0 ? values.tags : undefined,
      };

      let savedTour: Tour;
      if (mode === "create") {
        savedTour = await createTour(payload);
      } else {
        savedTour = await updateTour(tour!.id, payload);
      }

      if (pendingDates.length > 0) {
        await Promise.all(pendingDates.map((d) => addTourDate(savedTour.id, { date: d.date, available_slots: d.available_slots })));
      }

      router.push("/tours");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : tx.submitError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Basic Info */}
      <section className="bg-white rounded-2xl shadow-card p-6 flex flex-col gap-5">
        <h2 className="text-base font-bold font-display text-text-primary border-b border-gray-100 pb-3">{tx.basicInfo}</h2>
        <Input label={tx.tourName} required value={values.name} onChange={set("name")} error={errors.name} placeholder={tx.tourNamePlaceholder} />
        <Textarea label={tx.description} required rows={4} value={values.description} onChange={set("description")} error={errors.description} placeholder={tx.descriptionPlaceholder} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Select label={tx.difficulty} required value={values.difficulty} onChange={set("difficulty")} options={difficultyOptions} />
          <Select label={tx.status} required value={values.status} onChange={set("status")} options={statusOptions} />
        </div>
      </section>

      {/* Location & Specs */}
      <section className="bg-white rounded-2xl shadow-card p-6 flex flex-col gap-5">
        <h2 className="text-base font-bold font-display text-text-primary border-b border-gray-100 pb-3">{tx.locationSpecs}</h2>
        <ProvinceSelect
          label={tx.province}
          required
          value={values.location_name}
          onChange={(val) => {
            setValues((prev) => ({ ...prev, location_name: val }));
            if (errors.location_name) setErrors((prev) => ({ ...prev, location_name: undefined }));
          }}
          error={errors.location_name}
        />

        {/* Etiket */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
            Etiket <span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 400 }}>(isteğe bağlı)</span>
          </label>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '6px',
            padding: '8px 10px', borderRadius: '10px',
            border: '1px solid #E5E7EB', background: 'white',
            minHeight: '42px', alignItems: 'center',
          }}>
            {values.tags.map(tag => (
              <span key={tag} style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: '#FFF4F1', color: '#FF5533',
                border: '1px solid rgba(255,85,51,0.25)',
                borderRadius: '6px', padding: '3px 8px',
                fontSize: '0.78rem', fontWeight: 600,
              }}>
                {tag}
                <button
                  type="button"
                  onClick={() => setValues(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 2px', color: '#FF5533', lineHeight: 1, fontSize: '1rem' }}
                >
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
                  const val = tagInput.trim().replace(/,$/, '');
                  if (val && !values.tags.includes(val)) {
                    setValues(prev => ({ ...prev, tags: [...prev.tags, val] }));
                  }
                  setTagInput('');
                }
              }}
              style={{
                border: 'none', outline: 'none', padding: '4px',
                fontSize: '0.82rem', color: '#374151', background: 'transparent',
                flex: '1 1 120px', minWidth: '120px',
              }}
            />
          </div>
          <p style={{ fontSize: '0.72rem', color: '#9CA3AF', margin: '4px 0 0 2px' }}>
            SEO etiketi (örn: Ramazan Bayramı Turu, Yılbaşı Turu) — Enter ile ekle
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Input label={tx.latitude} type="number" step="any" value={values.latitude} onChange={set("latitude")} placeholder={tx.latPlaceholder} hint={tx.optional} />
          <Input label={tx.longitude} type="number" step="any" value={values.longitude} onChange={set("longitude")} placeholder={tx.lngPlaceholder} hint={tx.optional} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Input label={tx.altitude} type="number" min={0} value={values.altitude_meters} onChange={set("altitude_meters")} placeholder={tx.altitudePlaceholder} hint={tx.optional} />
          <Input label={tx.distance} type="number" min={0.1} step={0.1} value={values.distance_km} onChange={set("distance_km")} placeholder={tx.distancePlaceholder} hint={tx.optional} />
          <Input label={tx.maxParticipants} required type="number" min={1} value={values.max_participants} onChange={set("max_participants")} error={errors.max_participants} placeholder={tx.maxParticipantsPlaceholder} />
        </div>
      </section>

      {/* Tour Details */}
      <section className="bg-white rounded-2xl shadow-card p-6 flex flex-col gap-5">
        <h2 className="text-base font-bold font-display text-text-primary border-b border-gray-100 pb-3">{tx.tourDetails}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Select label={tx.category} value={values.category} onChange={set("category")} options={categoryOptions} />
          <Input label={tx.price} type="number" min={0} step={0.01} value={values.price} onChange={set("price")} placeholder={tx.pricePlaceholder} hint={tx.optional} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input label={tx.startDate} type="date" value={values.start_date} onChange={set("start_date")} hint={tx.optional} />
          <Input label={tx.endDate} type="date" value={values.end_date} onChange={set("end_date")} hint={tx.optional} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input label={tx.guideName} value={values.guide_name} onChange={set("guide_name")} placeholder={tx.guideNamePlaceholder} hint={tx.optional} />
          <Input label={tx.tursabNo} value={values.tursab_no} onChange={set("tursab_no")} placeholder={tx.tursabNoPlaceholder} hint={tx.optional} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input label={tx.contactPhone} value={values.contact_phone} onChange={set("contact_phone")} placeholder={tx.contactPhonePlaceholder} hint={tx.optional} />
          <Input label={tx.targetLocation} value={values.target_location} onChange={set("target_location")} placeholder={tx.targetLocationPlaceholder} hint={tx.optional} />
        </div>
        <Textarea label={tx.meetingPoints} rows={3} value={values.meeting_points} onChange={set("meeting_points")} placeholder={tx.meetingPointsPlaceholder} hint={tx.optional} />
      </section>

      {/* Tour Content */}
      <section className="bg-white rounded-2xl shadow-card p-6 flex flex-col gap-5">
        <h2 className="text-base font-bold font-display text-text-primary border-b border-gray-100 pb-3">{tx.tourContent}</h2>
        <Textarea label={tx.program} rows={5} value={values.program} onChange={set("program")} placeholder={tx.programPlaceholder} hint={tx.optional} />
        <Textarea label={tx.accommodation} rows={3} value={values.accommodation} onChange={set("accommodation")} placeholder={tx.accommodationPlaceholder} hint={tx.optional} />
        <Textarea label={tx.transportation} rows={3} value={values.transportation} onChange={set("transportation")} placeholder={tx.transportationPlaceholder} hint={tx.optional} />
        <Textarea label={tx.importantNotes} rows={3} value={values.important_notes} onChange={set("important_notes")} placeholder={tx.importantNotesPlaceholder} hint={tx.optional} />
      </section>

      {/* Photos */}
      <section className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="text-base font-bold font-display text-text-primary border-b border-gray-100 pb-3 mb-5">{tx.photos}</h2>
        <PhotoUploader value={values.photo_urls} onChange={(urls) => setValues((prev) => ({ ...prev, photo_urls: urls }))} />
      </section>

      {/* Tour Dates */}
      <section className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="text-base font-bold font-display text-text-primary border-b border-gray-100 pb-3 mb-5">{tx.tourDates}</h2>
        <DatesManager
          existingDates={existingDates}
          pendingDates={pendingDates}
          onAddPending={(d) => setPendingDates((prev) => [...prev, d])}
          onRemovePending={(id) => setPendingDates((prev) => prev.filter((d) => d.id !== id))}
          onRemoveExisting={mode === "edit" ? handleRemoveExistingDate : undefined}
          removingDateId={removingDateId}
        />
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
