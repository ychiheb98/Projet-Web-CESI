export function guessColumn(headers: string[], candidates: string[]): string {
  const lower = headers.map((h) => h.toLowerCase());
  for (const candidate of candidates) {
    const idx = lower.findIndex((h) => h === candidate);
    if (idx !== -1) return headers[idx];
  }
  for (const candidate of candidates) {
    const idx = lower.findIndex((h) => h.includes(candidate));
    if (idx !== -1) return headers[idx];
  }
  return headers[0] ?? "";
}

// Strips currency symbols/thousands separators and normalizes "(12.34)" or
// "-12.34" style debit formatting to a positive expense amount.
export function parseAmount(raw: string | undefined): number | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const isParenNegative = /^\(.*\)$/.test(trimmed);
  const cleaned = trimmed.replace(/[(),$€£\s]/g, "");
  const value = Number(cleaned);
  if (Number.isNaN(value) || value === 0) return null;
  return Math.abs(isParenNegative ? -Math.abs(value) : value);
}

// Accepts ISO (YYYY-MM-DD) and common US/EU slash formats, returns YYYY-MM-DD.
export function parseDate(raw: string | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();

  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const slash = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slash) {
    const [, a, b, year] = slash;
    // Assume US MM/DD/YYYY when the first segment could be a valid month.
    const month = Number(a) <= 12 ? a : b;
    const day = Number(a) <= 12 ? b : a;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
  }

  return null;
}
