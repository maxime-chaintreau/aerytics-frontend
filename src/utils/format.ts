const LOCALE = "fr-FR";

const percentFormat = new Intl.NumberFormat(LOCALE, { style: "percent", maximumFractionDigits: 0 });
const decimalFormats = new Map<number, Intl.NumberFormat>();
const relativeFormat = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto", style: "short" });
const shortDateFormat = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short", timeZone: "UTC" });
const monthFormat = new Intl.DateTimeFormat(LOCALE, { month: "long", year: "numeric", timeZone: "UTC" });
const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium", timeStyle: "short" });
const integerFormat = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const compactFormat = new Intl.NumberFormat(LOCALE, { notation: "compact", maximumFractionDigits: 1 });

/** 0.54 -> "54 %" */
export function formatPercent(ratio: number): string {
  return percentFormat.format(ratio);
}

/** 27341 -> "27 341" */
export function formatInteger(value: number): string {
  return integerFormat.format(value);
}

/** 3.4 -> "3,4" */
export function formatDecimal(value: number, digits = 1): string {
  let format = decimalFormats.get(digits);
  if (!format) {
    format = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits });
    decimalFormats.set(digits, format);
  }
  return format.format(value);
}

/** 21 -> "+21", -18 -> "−18" (real minus sign) */
export function formatSigned(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `−${Math.abs(value)}`;
  return "0";
}

/** 58340 -> "58,3 k" */
export function formatCompact(value: number): string {
  return compactFormat.format(value);
}

/** 1864 -> "31:04" */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/** ISO date -> "il y a 25 min", "hier"... */
export function formatRelativeTime(isoDate: string, now: number = Date.now()): string {
  const seconds = (new Date(isoDate).getTime() - now) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relativeFormat.format(Math.round(seconds / size), unit);
  }
  return relativeFormat.format(0, "minute");
}

/** "2026-11-12" -> "12 nov."*/
export function formatShortDate(isoDate: string): string {
  return shortDateFormat.format(new Date(isoDate));
}

/** "2026-11-01" -> "novembre 2026" */
export function formatMonth(isoDate: string): string {
  return monthFormat.format(new Date(isoDate));
}

/** "2026-11-19T13:32:00Z" -> "19 nov. 2026, 14:32" */
export function formatDateTime(isoDate: string): string {
  return dateTimeFormat.format(new Date(isoDate));
}

/** 1 -> "1er", 2 -> "2e" (French ordinals) */
export const formatOrdinal = (value: number) => (value === 1 ? "1er" : `${value}e`);
