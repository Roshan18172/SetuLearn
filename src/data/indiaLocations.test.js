import INDIA_LOCATIONS, { INDIA_STATES, getCitiesForState } from "./indiaLocations";
import { EXAM_GROUPS, ALL_EXAMS } from "./examsList";

describe("India states & cities data", () => {
  it("lists all 28 states and 8 union territories", () => {
    expect(INDIA_STATES).toHaveLength(36);
    ["Maharashtra", "Uttar Pradesh", "Delhi", "Ladakh", "Puducherry", "Andaman and Nicobar Islands"].forEach((s) =>
      expect(INDIA_STATES).toContain(s)
    );
  });

  it("every state has cities, sorted and without duplicates or blanks", () => {
    INDIA_STATES.forEach((state) => {
      const cities = getCitiesForState(state);
      expect(cities.length).toBeGreaterThan(0);
      expect(new Set(cities).size).toBe(cities.length);
      expect(cities.every((c) => c.trim() === c && c.length > 1)).toBe(true);
      expect([...cities].sort((a, b) => a.localeCompare(b, "en"))).toEqual(cities);
    });
  });

  it("returns the right cities per state and nothing for unknown states", () => {
    expect(getCitiesForState("Karnataka")).toContain("Bengaluru");
    expect(getCitiesForState("Karnataka")).not.toContain("Mumbai");
    expect(getCitiesForState("Maharashtra")).toContain("Pune");
    expect(getCitiesForState("")).toEqual([]);
    expect(getCitiesForState("Atlantis")).toEqual([]);
  });

  it("keeps raw data free of in-state duplicates (they would be silently dropped)", () => {
    Object.entries(INDIA_LOCATIONS).forEach(([state, cities]) => {
      expect({ state, dupes: cities.length - new Set(cities).size }).toEqual({ state, dupes: 0 });
    });
  });
});

describe("exams list", () => {
  it("contains the platform's core exams and stays within the backend's 100-char limit", () => {
    ["JEE Main", "JEE Advanced", "NEET UG", "UPSC Civil Services (CSE)", "SSC CGL", "CUET UG", "BITSAT"].forEach((e) =>
      expect(ALL_EXAMS).toContain(e)
    );
    expect(EXAM_GROUPS.length).toBeGreaterThan(8);
    expect(ALL_EXAMS.every((e) => e.length <= 100)).toBe(true);
  });
});
