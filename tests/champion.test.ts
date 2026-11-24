import { describe, expect, test } from "vitest";
import type { ChampionsByKey } from "@/types/staticData";
import { championBySlug, championSearchIndex, normalizeChampionName, searchChampions, closestChampions, editDistance } from "@/utils/champion";

const champions = {
  103: { key: 103, id: "Ahri", name: "Ahri", title: "", tags: ["Mage", "Assassin"], image: "Ahri.png" },
  62: { key: 62, id: "MonkeyKing", name: "Wukong", title: "", tags: ["Fighter"], image: "MonkeyKing.png" },
} as ChampionsByKey;

test("slug = Data Dragon id, any case", () => {
  expect(championBySlug(champions, "monkeyking")?.name).toBe("Wukong");
  expect(championBySlug(champions, "Ahri")?.key).toBe(103);
  expect(championBySlug(champions, "wukong")).toBeUndefined();
});

describe("search", () => {
  const roster = {
    145: { key: 145, id: "Kaisa", name: "Kai'Sa", title: "", tags: [], image: "Kaisa.png" },
    421: { key: 421, id: "RekSai", name: "Rêk'Sai", title: "", tags: [], image: "RekSai.png" },
    103: { key: 103, id: "Ahri", name: "Ahri", title: "", tags: [], image: "Ahri.png" },
    81: { key: 81, id: "Ezreal", name: "Ezreal", title: "", tags: [], image: "Ezreal.png" },
    266: { key: 266, id: "Aatrox", name: "Aatrox", title: "", tags: [], image: "Aatrox.png" },
  } satisfies ChampionsByKey;
  const index = championSearchIndex(roster);
  const names = (query: string) => searchChampions(index, query).map((champion) => champion.name);

  test("names are compared the way people type them", () => {
    expect(normalizeChampionName("Kai'Sa")).toBe("kaisa");
    expect(normalizeChampionName("Rêk'Sai")).toBe("reksai");
    expect(normalizeChampionName("Nunu & Willump")).toBe("nunuwillump");
  });

  test("prefix matches first, then the names containing the query", () => {
    expect(names("kais")).toEqual(["Kai'Sa"]);
    expect(names("rek")).toEqual(["Rêk'Sai"]);
    expect(names("a")).toEqual(["Aatrox", "Ahri", "Ezreal", "Kai'Sa", "Rêk'Sai"]);
    expect(names("#")).toEqual([]);
  });
});

describe("did you mean", () => {
  const roster = {
    222: { key: 222, id: "Jinx", name: "Jinx", title: "", tags: [], image: "Jinx.png" },
    62: { key: 62, id: "MonkeyKing", name: "Wukong", title: "", tags: [], image: "MonkeyKing.png" },
    103: { key: 103, id: "Ahri", name: "Ahri", title: "", tags: [], image: "Ahri.png" },
    145: { key: 145, id: "Kaisa", name: "Kai'Sa", title: "", tags: [], image: "Kaisa.png" },
  } as ChampionsByKey;
  const index = championSearchIndex(roster);
  const names = (query: string) => closestChampions(index, query).map((champion) => champion.name);

  test("edit distance", () => {
    expect(editDistance("jnx", "jinx")).toBe(1);
    expect(editDistance("kaisa", "kaisa")).toBe(0);
    expect(editDistance("", "ahri")).toBe(4);
  });

  test("search matches, display name and slug", () => {
    expect(names("ahr")).toEqual(["Ahri"]);
    expect(names("wukong")).toEqual(["Wukong"]);
    expect(names("monkey")).toEqual(["Wukong"]);
  });

  test("typos", () => {
    expect(names("jnx")).toEqual(["Jinx"]);
    expect(names("kaiza")).toEqual(["Kai'Sa"]);
  });

  test("nothing close", () => {
    expect(names("zzzzzz")).toEqual([]);
    expect(names("")).toEqual([]);
  });
});
