import { expect, test } from "vitest";
import { ddragonImage } from "@/services/staticDataService";

test("image URLs include the patch version", () => {
  expect(ddragonImage.champion("26.20.1", "Ahri.png")).toBe("https://ddragon.leagueoflegends.com/cdn/26.20.1/img/champion/Ahri.png");
  expect(ddragonImage.item("26.20.1", "3100.png")).toBe("https://ddragon.leagueoflegends.com/cdn/26.20.1/img/item/3100.png");
  expect(ddragonImage.profileIcon("26.20.1", 5367)).toBe("https://ddragon.leagueoflegends.com/cdn/26.20.1/img/profileicon/5367.png");
});
