// Backend'in /media/:filename ucu artık opsiyonel ?w= parametresini
// destekliyor (yoksa orijinal dosya değişmeden döner). Sadece kendi proxy
// URL'lerimize uygulanır — Unsplash/kategori gibi harici görselleri
// (URL'de "/media/" geçmeyen) olduğu gibi bırakır, dokunmaz.
export function sizedImageUrl(url: string, width: number): string {
  if (!url.includes('/media/')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}w=${width}`;
}
