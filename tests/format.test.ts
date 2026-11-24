import { expect, test } from "vitest";
import {
  formatDecimal,
  formatInteger,
  formatCompact,
  formatDuration,
  formatPercent,
  formatRelativeTime,
  formatSigned,
  formatShortDate,
  formatMonth,
  formatDateTime,
  formatOrdinal,
} from "@/utils/format";

// French formatting uses narrow no-break spaces: normalize them to compare.
const plain = (text: string) => text.replace(/[\u202f\u00a0]/g, " ");

test("formatPercent", () => {
  expect(plain(formatPercent(0.54))).toBe("54 %");
  expect(plain(formatPercent(0.536))).toBe("54 %");
});

test("formatDecimal uses a comma and a fixed number of decimals", () => {
  expect(formatDecimal(3.4)).toBe("3,4");
  expect(formatDecimal(7)).toBe("7,0");
  expect(formatDecimal(742, 0)).toBe("742");
});

test("formatSigned", () => {
  expect(formatSigned(21)).toBe("+21");
  expect(formatSigned(-18)).toBe("−18");
  expect(formatSigned(0)).toBe("0");
});

test("formatDuration", () => {
  expect(formatDuration(1864)).toBe("31:04");
  expect(formatDuration(59)).toBe("0:59");
});

test("formatRelativeTime", () => {
  const now = new Date("2026-11-16T12:00:00Z").getTime();
  expect(plain(formatRelativeTime("2026-11-16T11:35:00Z", now))).toBe("il y a 25 min");
  expect(formatRelativeTime("2026-11-15T12:00:00Z", now)).toBe("hier");
});

test("formatShortDate", () => {
  expect(formatShortDate("2026-11-12")).toBe("12 nov.");
});

test("formatMonth", () => {
  expect(formatMonth("2026-11-01")).toBe("novembre 2026");
});

test("formatDateTime: date and time, in the user's time zone", () => {
  // the hour depends on the machine's time zone: only the shape is checked
  expect(formatDateTime("2026-11-19T13:32:00Z")).toMatch(/^\d{1,2} nov\. 2026,? \d{2}:\d{2}$/);
});

test("formatInteger: thousands separator, no decimals", () => {
  expect(formatInteger(27341.6).replace(/\s/g, " ")).toBe("27 342");
});

test("formatCompact: thousands as k", () => {
  expect(formatCompact(58340).replace(/\s/g, " ")).toBe("58,3 k");
});

test("formatOrdinal", () => {
  expect(formatOrdinal(1)).toBe("1er");
  expect(formatOrdinal(2)).toBe("2e");
});
