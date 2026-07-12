// Kategori ve ay adları için görüntüleme çevirisi. Kategoriler veritabanında
// Türkçe saklanır; filtreleme/URL için ham değer kullanılır, yalnızca EKRANDA
// gösterilen etiket çevrilir. Bilinmeyen kategori olduğu gibi (Türkçe) kalır.

import type { Lang } from './i18n';

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

const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function monthNames(lang: Lang): string[] {
  return lang === 'en' ? MONTHS_EN : MONTHS_TR;
}
