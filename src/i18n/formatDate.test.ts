import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatDate } from "./formatDate";

// Node 22 n'a pas `Temporal` : ce double le simule avec `Intl`, comme le ferait un navigateur récent.
function stubTemporal(toLocaleString?: (locale: string, options: Intl.DateTimeFormatOptions) => string) {
  const plainDate = (year: number, month: number, day: number) => ({
    toLocaleString:
      toLocaleString ??
      ((locale: string, options: Intl.DateTimeFormatOptions) =>
        new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(locale, { ...options, timeZone: "UTC" })),
  });
  const temporal = {
    Now: { plainDateISO: vi.fn(() => plainDate(2026, 11, 24)) },
    PlainDate: {
      from: vi.fn((isoDate: string) => {
        const [year, month, day] = isoDate.split("-").map(Number);
        return plainDate(year, month, day);
      }),
    },
  };
  vi.stubGlobal("Temporal", temporal);
  return temporal;
}

describe("formatDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 24, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  describe("without Temporal", () => {
    beforeEach(() => {
      vi.stubGlobal("Temporal", undefined);
    });

    it("formats today in French with a capital on every word", () => {
      expect(formatDate("fr")).toBe("Mardi 24 Novembre 2026");
    });

    it("formats today in English", () => {
      expect(formatDate("en")).toBe("Tuesday, November 24, 2026");
    });

    it("keeps today's local date late in the evening", () => {
      vi.setSystemTime(new Date(2026, 10, 24, 23, 59));

      expect(formatDate("fr")).toBe("Mardi 24 Novembre 2026");
    });

    it("formats a given ISO date", () => {
      expect(formatDate("fr", "2026-12-01")).toBe("Mardi 1 Décembre 2026");
      expect(formatDate("en", "2026-12-01")).toBe("Tuesday, December 1, 2026");
    });

    it.each(["America/Los_Angeles", "Pacific/Auckland"])("does not shift a given ISO date by a day in the %s time zone", (timeZone) => {
      vi.stubEnv("TZ", timeZone);

      expect(new Date(2026, 0, 1).getTimezoneOffset()).not.toBe(0);
      expect(formatDate("fr", "2026-12-01")).toBe("Mardi 1 Décembre 2026");
    });
  });

  describe("with Temporal", () => {
    it("reads today from Temporal and formats it with the long date options", () => {
      const toLocaleString = vi.fn(() => "mardi 24 novembre 2026");
      const temporal = stubTemporal(toLocaleString);
      const dateSpy = vi.spyOn(Date.prototype, "toLocaleDateString");

      expect(formatDate("fr")).toBe("Mardi 24 Novembre 2026");
      expect(temporal.Now.plainDateISO).toHaveBeenCalledOnce();
      expect(toLocaleString).toHaveBeenCalledWith("fr", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      expect(dateSpy).not.toHaveBeenCalled();
    });

    it("parses a given ISO date with Temporal", () => {
      const temporal = stubTemporal();

      expect(formatDate("en", "2026-12-01")).toBe("Tuesday, December 1, 2026");
      expect(temporal.PlainDate.from).toHaveBeenCalledWith("2026-12-01");
      expect(temporal.Now.plainDateISO).not.toHaveBeenCalled();
    });

    it("gives the same text as the Date fallback", () => {
      stubTemporal();
      const withTemporal = [formatDate("fr"), formatDate("en"), formatDate("fr", "2026-08-03")];
      vi.stubGlobal("Temporal", undefined);

      expect([formatDate("fr"), formatDate("en"), formatDate("fr", "2026-08-03")]).toEqual(withTemporal);
    });

    it("capitalises accented months but not the letters glued to a number", () => {
      stubTemporal(() => "lundi 1er août 2026");

      expect(formatDate("fr")).toBe("Lundi 1er Août 2026");
    });

    it.runIf(typeof Temporal !== "undefined")("works with the real Temporal API when the runtime has it", () => {
      vi.unstubAllGlobals();

      expect(formatDate("fr", "2026-11-24")).toBe("Mardi 24 Novembre 2026");
    });
  });
});
