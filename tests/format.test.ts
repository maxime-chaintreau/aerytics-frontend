import { expect, test } from "vitest";
import { formatDecimal, formatDuration, formatPercent, formatRelativeTime, formatSigned, formatShortDate, formatMonth } from "@/utils/format";

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
