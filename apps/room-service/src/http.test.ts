import { describe, expect, it } from "vitest";

import { parseRoomRoute } from "./http";

describe("parseRoomRoute", () => {
  it("parses a room action", () => {
    expect(parseRoomRoute("/rooms/demo/status")).toEqual({
      roomId: "demo",
      action: "status",
    });
  });

  it("rejects unrelated routes", () => {
    expect(parseRoomRoute("/health")).toBeNull();
    expect(parseRoomRoute("/rooms/demo")).toBeNull();
  });
});
