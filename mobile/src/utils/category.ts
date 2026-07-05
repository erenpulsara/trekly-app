// A tour's `category` field can hold multiple comma-separated categories
// (e.g. "Trekking, Dağcılık, Kamp"). This splits it into individual names
// for rendering as separate badges instead of one joined blob — mirrors
// the same fix applied on the web (landing/lib/category-utils.ts).
export function splitCategories(category: string | null | undefined): string[] {
  if (!category) return [];
  return category
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
}

interface DateSortable {
  start_date?: string | null;
  dates?: Array<{ date: string }>;
}

// Soonest start date first, undated tours last — mirrors the web's
// "Yaklaşan Etkinlikler" ordering (start_date_asc).
export function sortByStartDate<T extends DateSortable>(tours: T[]): T[] {
  return [...tours].sort((a, b) => {
    const as = a.start_date ?? a.dates?.[0]?.date ?? null;
    const bs = b.start_date ?? b.dates?.[0]?.date ?? null;
    if (!as) return 1;
    if (!bs) return -1;
    return as.localeCompare(bs);
  });
}
