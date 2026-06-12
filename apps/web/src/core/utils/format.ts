export function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(dateStr));
}

export function getStockStatus(quantity: number): 'out' | 'low' | 'ok' {
  if (quantity === 0) return 'out';
  if (quantity <= 5) return 'low';
  return 'ok';
}
