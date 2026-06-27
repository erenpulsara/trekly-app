"use client";

import { useState, useRef } from "react";
import { uploadMedia } from "@/lib/api";

interface PhotoUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

export default function PhotoUploader({
  value,
  onChange,
  maxFiles = 10,
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remaining = maxFiles - value.length;
    const toUpload = fileArray.slice(0, remaining);
    if (toUpload.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      const uploadedUrls = await Promise.all(toUpload.map(uploadMedia));
      onChange([...value, ...uploadedUrls]);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Yükleme başarısız. Tekrar deneyin."
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const removePhoto = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const setCover = (index: number) => {
    if (index === 0) return;
    const newUrls = [...value];
    const [photo] = newUrls.splice(index, 1);
    newUrls.unshift(photo);
    onChange(newUrls);
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold font-body text-text-primary">
        Fotoğraflar
      </label>

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer
          transition-all duration-200
          ${dragOver ? "border-brand-orange bg-brand-orange/5" : "border-gray-200 hover:border-brand-orange/50 hover:bg-gray-50/50"}
          ${uploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin w-8 h-8 text-brand-orange" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm font-body text-text-secondary">Fotoğraflar yükleniyor...</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold font-body text-text-primary">
                Fotoğrafları buraya sürükleyin veya{" "}
                <span className="text-brand-orange">göz atın</span>
              </p>
              <p className="text-xs font-body text-text-muted mt-1">
                PNG, JPG, WEBP — maks. 10 MB · {value.length}/{maxFiles} yüklendi
              </p>
            </div>
          </>
        )}
      </div>

      {uploadError && (
        <p className="text-xs text-red-500 font-body">{uploadError}</p>
      )}

      {/* Preview grid */}
      {value.length > 0 && (
        <>
          <p style={{ fontSize: '0.72rem', color: '#9CA3AF', margin: '0 0 2px 2px' }}>
            İlk fotoğraf kapak olarak kullanılır. Sırasını değiştirmek için "Kapak Yap"a tıklayın.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {value.map((url, i) => (
              <div
                key={url}
                className="relative aspect-square rounded-xl overflow-hidden group animate-fade-in"
                style={{ outline: i === 0 ? '2px solid #FF5533' : 'none' }}
              >
                <img
                  src={url}
                  alt={`Photo ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Kapak badge */}
                {i === 0 && (
                  <div style={{
                    position: 'absolute', top: '6px', left: '6px', zIndex: 2,
                    background: '#FF5533', color: 'white',
                    borderRadius: '6px', padding: '2px 8px',
                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}>
                    ★ Kapak
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex flex-col items-center justify-center gap-2">
                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{
                      background: 'rgba(239,68,68,0.9)', border: 'none', borderRadius: '8px',
                      color: 'white', padding: '5px 10px', cursor: 'pointer',
                      fontSize: '0.72rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}
                  >
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Sil
                  </button>

                  {/* Set cover button */}
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setCover(i); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{
                        background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px',
                        color: '#FF5533', padding: '5px 10px', cursor: 'pointer',
                        fontSize: '0.72rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: '4px',
                      }}
                    >
                      <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      Kapak Yap
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
