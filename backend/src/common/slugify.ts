// Tur adından URL-dostu slug üretir. Türkçe karakterleri ASCII karşılıklarına
// çevirir (ş→s, ı→i, ğ→g, ç→c, ö→o, ü→u), küçük harfe indirir, alfanümerik
// olmayan her şeyi tireye dönüştürür. Örn: "Hakkari Cilo Buzulları" → "hakkari-cilo-buzullari".

const TR_MAP: Record<string, string> = {
  ç: 'c', Ç: 'c',
  ğ: 'g', Ğ: 'g',
  ı: 'i', İ: 'i',
  ö: 'o', Ö: 'o',
  ş: 's', Ş: 's',
  ü: 'u', Ü: 'u',
  I: 'i',
};

export function slugify(input: string): string {
  const mapped = (input || '').replace(/[çÇğĞıİöÖşŞüÜI]/g, (c) => TR_MAP[c] ?? c);
  const slug = mapped
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')     // alfanümerik olmayan her şeyi tireye çevir
    .replace(/^-+|-+$/g, '')         // baştaki/sondaki tireleri kırp
    .slice(0, 80)
    .replace(/-+$/g, '');            // kırpma sonrası kalan sondaki tireyi temizle
  return slug || 'tur';
}
