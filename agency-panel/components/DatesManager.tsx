"use client";

import { useState } from "react";
import { Input } from "./FormControls";
import Button from "./Button";
import type { TourDate } from "@/lib/types";

export interface PendingDate {
  id: string; // temp id for local state
  date: string;
  available_slots: number;
}

interface DatesManagerProps {
  existingDates?: TourDate[];
  pendingDates: PendingDate[];
  onAddPending: (date: PendingDate) => void;
  onRemovePending: (id: string) => void;
  onRemoveExisting?: (dateId: string) => void;
  removingDateId?: string | null;
}

export default function DatesManager({
  existingDates = [],
  pendingDates,
  onAddPending,
  onRemovePending,
  onRemoveExisting,
  removingDateId,
}: DatesManagerProps) {
  const [newDate, setNewDate] = useState("");
  const [newSlots, setNewSlots] = useState("");
  const [errors, setErrors] = useState<{ date?: string; slots?: string }>({});

  const handleAdd = () => {
    const errs: { date?: string; slots?: string } = {};
    if (!newDate) errs.date = "Tarih zorunludur";
    if (!newSlots || parseInt(newSlots) < 1)
      errs.slots = "En az 1 yer olmalıdır";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onAddPending({
      id: `pending-${Date.now()}`,
      date: newDate,
      available_slots: parseInt(newSlots),
    });
    setNewDate("");
    setNewSlots("");
    setErrors({});
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold font-body text-text-primary">
        Tur Tarihleri
      </p>

      {/* Existing dates */}
      {existingDates.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold font-body text-text-muted uppercase tracking-wide">
            Kayıtlı Tarihler
          </p>
          {existingDates.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-brand-orange"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold font-body text-text-primary">
                    {new Date(d.date).toLocaleDateString("tr-TR", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs font-body text-text-muted">
                    {d.available_slots} boş yer
                  </p>
                </div>
              </div>
              {onRemoveExisting && (
                <Button
                  variant="ghost"
                  size="sm"
                  loading={removingDateId === d.id}
                  onClick={() => onRemoveExisting(d.id)}
                  className="text-red-400 hover:text-red-500 hover:bg-red-50"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pending dates to be added */}
      {pendingDates.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold font-body text-text-muted uppercase tracking-wide">
            Bekliyor (kaydedilecek)
          </p>
          {pendingDates.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between px-4 py-3 bg-brand-orange/5 rounded-xl border border-brand-orange/20 animate-fade-in"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-brand-orange"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold font-body text-text-primary">
                    {new Date(d.date).toLocaleDateString("tr-TR", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs font-body text-text-muted">
                    {d.available_slots} yer
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemovePending(d.id)}
                className="text-red-400 hover:text-red-500 hover:bg-red-50"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add new date */}
      <div className="p-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
        <p className="text-xs font-bold font-body text-text-secondary uppercase tracking-wide mb-3">
          Tarih Ekle
        </p>
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <Input
              type="date"
              value={newDate}
              min={today}
              onChange={(e) => setNewDate(e.target.value)}
              error={errors.date}
              placeholder="Tarih seçin"
            />
          </div>
          <div className="w-28">
            <Input
              type="number"
              value={newSlots}
              min={1}
              onChange={(e) => setNewSlots(e.target.value)}
              error={errors.slots}
              placeholder="Yer"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={handleAdd}
            className="mt-0 flex-shrink-0"
          >
            Ekle
          </Button>
        </div>
      </div>

      {existingDates.length === 0 && pendingDates.length === 0 && (
        <p className="text-xs font-body text-text-muted text-center py-2">
          Henüz tarih eklenmedi. Yukarıdan tarih ekleyin.
        </p>
      )}
    </div>
  );
}
