export type Lang = 'tr' | 'en';

export function getLangClient(): Lang {
  if (typeof document === 'undefined') return 'tr';
  const m = document.cookie.match(/(?:^|;\s*)lang=([^;]*)/);
  return m?.[1] === 'en' ? 'en' : 'tr';
}

export function setLangCookie(lang: Lang): void {
  document.cookie = `lang=${lang};path=/;max-age=${60 * 60 * 24 * 365}`;
}

export const T = {
  tr: {
    nav: {
      becomeAgency: 'Acenta Ol',
      tours: 'Turlar',
      about: 'Hakkımızda',
    },
    hero: {
      title1: "Türkiye'nin",
      title2: "Doğa ve Su Sporları",
      title3: "Ekosistemi",
      subtitle:
        "Türkiye'nin en seçkin doğa ve su sporları turları, akredite profesyonel eğitmenlerle tek platformda.",
      exploreTours: 'Maceraya Ortak Ol',
      becomeAgency: 'Ekosisteme Katıl',
    },
    tours: {
      eyebrow: 'Tüm Turlar',
      heading: "Türkiye'deki Popüler Turlar",
      all: 'Tümü',
      easy: 'Kolay',
      medium: 'Orta',
      hard: 'Zor',
      extreme: 'Ekstrem',
      found: (n: number) => `${n} tur bulundu`,
      empty: 'Bu filtre için tur bulunamadı.',
      seeAllLink: 'Tüm turları gör →',
      seeAllBtn: (n: number) => `Tüm ${n} Turu Gör`,
      datePending: 'Tarih bekleniyor',
      slots: (n: number) => `${n} kontenjan`,
      locale: 'tr-TR',
      searchDate: 'Tarih',
      searchLocation: 'Lokasyon',
      searchCategory: 'Kategori',
      searchBtn: 'Macera Bul',
      allCategories: 'Tümü',
      upcomingTitle: 'Yaklaşan Etkinlikler',
      seeAll: 'Tüm Etkinlikleri Gör',
      free: 'Ücretsiz',
      perPerson: 'kişi başı',
      detailBtn: 'Detayları Gör →',
      altitude: 'İrtifa',
      distance: 'Mesafe',
      quota: 'Kontenjan',
      price: 'Fiyat',
      dateRange: 'Tarih',
      location: 'Lokasyon',
    },
    diff: { easy: 'Kolay', medium: 'Orta', hard: 'Zor', extreme: 'Ekstrem' },
    principles: {
      title: 'İlkelerimiz',
      items: [
        { icon: 'curated', title: 'Seçilmiş Deneyimler', desc: 'Sadece ticari kaygı güden değil, doğaya saygı duyan, profesyonel ve etik değerleri olan kulüplerle çalışıyoruz.' },
        { icon: 'compass', title: 'Algoritmadan Uzak', desc: 'Size "popüler olanı" değil, ihtiyacınız olanı sunuyoruz. Kondisyonunuza, ruh halinize ve ilginize en uygun macerayı saniyeler içinde, gürültüsüzce bulun.' },
        { icon: 'shield', title: 'Organize ve Güvenli', desc: "Dağınık ve güven vermeyen bilgi kirliliğini ortadan kaldırıyoruz. Türkiye'nin tüm doğa disiplinleri, herkes için erişilebilir ve şeffaf bir vitrinde." },
      ],
    },
    footer: {
      privacy: 'Gizlilik',
      terms: 'Koşullar',
      about: 'Hakkımızda',
      agency: 'Acenta Paneli →',
      instagram: 'Instagram',
      youtube: 'YouTube',
      appStore: 'App Store',
      googlePlay: 'Google Play',
    },
  },
  en: {
    nav: {
      becomeAgency: 'Become an Agency',
      tours: 'Tours',
      about: 'About',
    },
    hero: {
      title1: "Turkiye's",
      title2: "Nature & Water Sports",
      title3: "Ecosystem",
      subtitle:
        "Turkiye's finest nature and water sports tours with accredited professional instructors, all in one platform.",
      exploreTours: 'Explore Tours',
      becomeAgency: 'Become an Agency',
    },
    tours: {
      eyebrow: 'All Tours',
      heading: 'Popular Tours in Turkey',
      all: 'All',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      extreme: 'Extreme',
      found: (n: number) => `${n} tours found`,
      empty: 'No tours found for this filter.',
      seeAllLink: 'See all tours →',
      seeAllBtn: (n: number) => `See all ${n} Tours`,
      datePending: 'Date pending',
      slots: (n: number) => `${n} spots`,
      locale: 'en-US',
      searchDate: 'Date',
      searchLocation: 'Location',
      searchCategory: 'Category',
      searchBtn: 'Find Adventure',
      allCategories: 'All',
      upcomingTitle: 'Upcoming Events',
      seeAll: 'See All Events',
      free: 'Free',
      perPerson: 'per person',
      detailBtn: 'View Details →',
      altitude: 'Altitude',
      distance: 'Distance',
      quota: 'Capacity',
      price: 'Price',
      dateRange: 'Date',
      location: 'Location',
    },
    diff: { easy: 'Easy', medium: 'Medium', hard: 'Hard', extreme: 'Extreme' },
    principles: {
      title: 'Our Principles',
      items: [
        { icon: 'curated', title: 'Curated Experiences', desc: 'We work only with clubs that respect nature and hold professional and ethical values — not just commercial interests.' },
        { icon: 'compass', title: 'Beyond the Algorithm', desc: 'We show you what you need, not what\'s popular. Find the adventure that fits your fitness, mood and interests in seconds, noise-free.' },
        { icon: 'shield', title: 'Organized & Safe', desc: "We eliminate scattered, unreliable information. All of Turkiye's nature disciplines in one accessible, transparent showcase." },
      ],
    },
    footer: {
      privacy: 'Privacy',
      terms: 'Terms',
      about: 'About',
      agency: 'Agency Panel →',
      instagram: 'Instagram',
      youtube: 'YouTube',
      appStore: 'App Store',
      googlePlay: 'Google Play',
    },
  },
} as const;
