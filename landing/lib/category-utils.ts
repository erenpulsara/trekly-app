// A tour's `category` field can hold multiple comma-separated categories
// (e.g. "Trekking, Dağcılık, Kamp"). This splits it into individual names
// for rendering as separate badges instead of one joined blob.
export function splitCategories(category: string | null | undefined): string[] {
  if (!category) return [];
  return category
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
}
