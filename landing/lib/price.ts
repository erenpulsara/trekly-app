export type Currency = 'TRY' | 'USD' | 'EUR';

const SYMBOL: Record<Currency, string> = { TRY: '₺', USD: '$', EUR: '€' };

/** Tur fiyatını, tur üzerinde seçili para birimine göre biçimlendirir.
 *  `currency` verilmezse (eski kayıtlar) TRY varsayılır. */
export function formatPrice(price: number, currency?: Currency | null): string {
  const cur = currency ?? 'TRY';
  const sym = SYMBOL[cur];
  if (cur === 'TRY') return `${sym}${price.toLocaleString('tr-TR')}`;
  return `${sym}${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
