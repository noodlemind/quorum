import { describe, expect, it } from "vitest";

import { canonicalJson, sha256Hex } from "./canonical-json";

describe("canonicalJson", () => {
  it("sorts object keys recursively", () => {
    expect(canonicalJson({ z: 1, a: { y: 2, b: 3 } })).toBe(
      '{"a":{"b":3,"y":2},"z":1}',
    );
  });

  it("produces a stable SHA-256 hash", async () => {
    const first = await sha256Hex({ b: 2, a: 1 });
    const second = await sha256Hex({ a: 1, b: 2 });

    expect(first).toHaveLength(64);
    expect(first).toBe(second);
  });
});
