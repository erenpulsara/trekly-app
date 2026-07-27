// Backend'in /media/:filename ucu artık opsiyonel ?w= parametresini
// destekliyor (yoksa orijinal dosya değişmeden döner). Sadece kendi proxy
// URL'lerimize uygulanır — harici/placeholder görselleri (URL'de "/media/"
// geçmeyen) olduğu gibi bırakır, dokunmaz. Web'deki landing/lib/img.ts ile
// aynı mantık.
export function sizedImageUrl(url: string, width: number): string {
  if (!url.includes('/media/')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}w=${width}`;
}
