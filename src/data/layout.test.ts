import { describe, it, expect } from "vitest";
import { defaultLayout } from "./layout";
import type { Layout, Layer, KeyDef } from "./layout";

describe("defaultLayout", () => {
  it("has at least 4 layers (base, numbers, symbols, navigation)", () => {
    expect(defaultLayout.layers.length).toBeGreaterThanOrEqual(4);
  });

  it("each layer has left and right halves", () => {
    for (const layer of defaultLayout.layers) {
      expect(layer.left).toBeDefined();
      expect(layer.right).toBeDefined();
    }
  });

  it("each half has 4 rows (3 finger rows + 1 thumb row)", () => {
    for (const layer of defaultLayout.layers) {
      expect(layer.left).toHaveLength(4);
      expect(layer.right).toHaveLength(4);
    }
  });

  it("finger rows have 5 keys each", () => {
    for (const layer of defaultLayout.layers) {
      for (let row = 0; row < 3; row++) {
        expect(layer.left[row]).toHaveLength(5);
        expect(layer.right[row]).toHaveLength(5);
      }
    }
  });

  it("thumb rows have 3 keys each", () => {
    for (const layer of defaultLayout.layers) {
      expect(layer.left[3]).toHaveLength(3);
      expect(layer.right[3]).toHaveLength(3);
    }
  });

  it("base layer has no activator", () => {
    const base = defaultLayout.layers[0];
    expect(base.activator).toBeUndefined();
  });

  it("non-base layers have activators", () => {
    for (const layer of defaultLayout.layers.slice(1)) {
      expect(layer.activator).toBeDefined();
    }
  });

  it("base layer keys all have a code property", () => {
    const base = defaultLayout.layers[0];
    const allKeys = [...base.left.flat(), ...base.right.flat()];
    for (const key of allKeys) {
      expect(key.code).toBeDefined();
    }
  });

  it("each non-blank character appears on exactly one layer", () => {
    const seen = new Map<string, string>();
    for (const layer of defaultLayout.layers) {
      const allKeys = [...layer.left.flat(), ...layer.right.flat()];
      for (const key of allKeys) {
        if (key.blank) continue;
        const label = key.label;
        if (seen.has(label) && seen.get(label) !== layer.name) {
          throw new Error(
            `"${label}" appears on both "${seen.get(label)}" and "${layer.name}"`
          );
        }
        seen.set(label, layer.name);
      }
    }
  });
});
