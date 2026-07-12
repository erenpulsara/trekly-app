// Kategori adları için görüntüleme çevirisi (mobil). Kategoriler API'den Türkçe
// gelir; filtreleme/karşılaştırma için ham değer kullanılır, yalnızca EKRANDA
// gösterilen etiket çevrilir. Bilinmeyen kategori olduğu gibi (Türkçe) kalır.
// Web'deki landing/lib/category-i18n.ts ile aynı eşlemeyi kullanır.

import type { Lang } from './translations';

const CATEGORY_EN: Record<string, string> = {
  'trekking': 'Trekking',
  'dağcılık': 'Mountaineering',
  'bisiklet': 'Cycling',
  'kamp': 'Camping',
  'dalış': 'Diving',
  'zirve tırmanışı': 'Summit Climbing',
  'kaya tırmanışı': 'Rock Climbing',
  'yelken': 'Sailing',
  'aile kampı': 'Family Camping',
  'dağcılık eğitimi': 'Mountaineering Training',
  'kayak': 'Skiing',
  'su sporları': 'Water Sports',
  'kültür turları': 'Cultural Tours',
  'gastronomi': 'Gastronomy',
  'gastronomi / organizasyon': 'Gastronomy / Events',
  'transfer hizmeti': 'Transfer Service',
  'gemi ve tekne turları': 'Ship & Boat Tours',
  'doğa macera turları': 'Nature Adventure Tours',
  'deniz macera turları': 'Sea Adventure Tours',
  'hava macera turları': 'Air Adventure Tours',
  'kış turizm turları': 'Winter Tourism Tours',
  'wellness spa / sağlık': 'Wellness Spa / Health',
  'tema / aksiyon turları': 'Theme / Action Tours',
  'doğa yürüyüşü': 'Nature Walk',
  'yürüyüş': 'Hiking',
  'rafting': 'Rafting',
  'kano': 'Canoeing',
  'yamaç paraşütü': 'Paragliding',
  'tırmanış': 'Climbing',
  'foto safari': 'Photo Safari',
  'doğa sporları': 'Nature Sports',
  'macera': 'Adventure',
  'safari': 'Safari',
  'bisiklet turları': 'Cycling Tours',
  'kültür': 'Culture',
  'yoga kampı': 'Yoga Camp',
  'yoga': 'Yoga',
  'atv / safari': 'ATV / Safari',
  'atv': 'ATV',
  'balık avı': 'Fishing',
  'kar yürüyüşü': 'Snowshoeing',
  'snowboard': 'Snowboard',
  'patika koşusu': 'Trail Running',
};

const capitalize = (s: string) => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);

/** Kategori adını ekran için çevirir. TR'de baş harf büyütülür; EN'de bilinen
 *  kategori İngilizceye çevrilir, bilinmeyen ise büyük harfle döner. */
export function displayCategory(name: string, lang: Lang): string {
  const key = name.toLowerCase().trim();
  if (lang === 'en' && CATEGORY_EN[key]) return CATEGORY_EN[key];
  return capitalize(name);
}

/**
 * Android'in native `textTransform: 'uppercase'` dönüşümü cihazın OS diline göre
 * çalışır — cihaz Türkçe ise İngilizce metindeki küçük "i" yanlışlıkla noktalı
 * büyük "İ" olur (örn. "diving" → "DİVİNG" yerine doğrusu "DIVING"). Bu yüzden
 * uppercase gösterilecek her metin, cihaz diline değil UYGULAMANIN seçili diline
 * göre burada JS'de büyütülmeli; `textTransform: 'uppercase'` stili zaten büyük
 * olan metinde etkisiz kalır (idempotent), o yüzden stilleri değiştirmeye gerek yok.
 */
export function localeUpper(text: string, lang: Lang): string {
  return text.toLocaleUpperCase(lang === 'en' ? 'en' : 'tr');
}
