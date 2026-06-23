"use client";

import React, { useState, useRef, useEffect } from "react";
import { TURKISH_PROVINCES } from "@/lib/provinces";

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold font-body text-text-primary"
        >
          {label}
          {props.required && <span className="text-brand-orange ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={`
          h-10 px-3.5 rounded-xl border font-body text-sm text-text-primary
          bg-white placeholder:text-text-muted
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange
          disabled:bg-gray-50 disabled:text-text-secondary disabled:cursor-not-allowed
          ${error ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-gray-200 hover:border-gray-300"}
          ${className}
        `}
      />
      {hint && !error && (
        <p className="text-xs text-text-muted font-body">{hint}</p>
      )}
      {error && <p className="text-xs text-red-500 font-body">{error}</p>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  error,
  hint,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold font-body text-text-primary"
        >
          {label}
          {props.required && <span className="text-brand-orange ml-1">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        {...props}
        className={`
          px-3.5 py-2.5 rounded-xl border font-body text-sm text-text-primary
          bg-white placeholder:text-text-muted resize-none
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange
          disabled:bg-gray-50 disabled:text-text-secondary disabled:cursor-not-allowed
          ${error ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-gray-200 hover:border-gray-300"}
          ${className}
        `}
      />
      {hint && !error && (
        <p className="text-xs text-text-muted font-body">{hint}</p>
      )}
      {error && <p className="text-xs text-red-500 font-body">{error}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  hint,
  options,
  placeholder,
  className = "",
  id,
  ...props
}: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold font-body text-text-primary"
        >
          {label}
          {props.required && <span className="text-brand-orange ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          {...props}
          className={`
            h-10 w-full pl-3.5 pr-10 rounded-xl border font-body text-sm text-text-primary
            bg-white appearance-none
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange
            disabled:bg-gray-50 disabled:text-text-secondary disabled:cursor-not-allowed
            ${error ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-gray-200 hover:border-gray-300"}
            ${className}
          `}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <svg
            className="w-4 h-4 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {hint && !error && (
        <p className="text-xs text-text-muted font-body">{hint}</p>
      )}
      {error && <p className="text-xs text-red-500 font-body">{error}</p>}
    </div>
  );
}

// ─── ProvinceSelect ───────────────────────────────────────────────────────────

interface ProvinceSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function ProvinceSelect({ label, value, onChange, error, required }: ProvinceSelectProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (!TURKISH_PROVINCES.includes(query as (typeof TURKISH_PROVINCES)[number])) {
          setQuery(value);
        }
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [query, value]);

  const filtered = query.trim()
    ? TURKISH_PROVINCES.filter((p) =>
        p.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr'))
      )
    : TURKISH_PROVINCES;

  function select(province: string) {
    onChange(province);
    setQuery(province);
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-semibold font-body text-text-primary">
          {label}
          {required && <span className="text-brand-orange ml-1">*</span>}
        </label>
      )}
      <div ref={wrapRef} className="relative">
        <div className="relative">
          <input
            type="text"
            placeholder="İl seçin veya arayın…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            className={`
              h-10 w-full pl-3.5 pr-8 rounded-xl border font-body text-sm text-text-primary
              bg-white placeholder:text-text-muted
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange
              ${error ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-gray-200 hover:border-gray-300"}
            `}
          />
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {open && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-text-muted">Sonuç bulunamadı</div>
            ) : filtered.map((p) => (
              <button
                key={p}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); select(p); }}
                className={`
                  w-full text-left px-4 py-2.5 text-sm font-body transition-colors
                  ${value === p
                    ? 'bg-orange-50 text-brand-orange font-semibold'
                    : 'text-text-primary hover:bg-gray-50'}
                `}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-body">{error}</p>}
    </div>
  );
}
