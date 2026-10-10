import { describe, expect, it } from "vitest";
import { createCardCatalog } from "../cards";
import { isValidSet } from "./is-valid-set";

const catalog = createCardCatalog;

describe("isValidSet", () => {
  it("accepts a valid SET (all same number, mixed other attrs)", () => {
    const c = catalog();
    const a = c.get("1-diamond-solid-red")!;
    const b = c.get("1-squiggle-striped-green")!;
    const d = c.get("1-oval-open-purple")!;
    expect(isValidSet(a, b, d)).toBe(true);
  });

  it("rejects when one attribute fails the rule", () => {
    const c = catalog();
    const a = c.get("1-diamond-solid-red")!;
    const b = c.get("2-diamond-solid-red")!;
    const d = c.get("3-diamond-solid-red")!;
    expect(isValidSet(a, b, d)).toBe(true);

    const x = c.get("1-diamond-solid-red")!;
    const y = c.get("1-diamond-solid-green")!;
    const z = c.get("2-diamond-solid-purple")!;
    expect(isValidSet(x, y, z)).toBe(false);
  });
});
