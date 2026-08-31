import { describe, expect, it } from "vitest";

import {
  DEMO_QUESTION_ID,
  createDemoContract,
  createDraftRoomSnapshot,
} from "./room";

describe("room protocol", () => {
  it("creates a draft without an answer capability", () => {
    const room = createDraftRoomSnapshot("demo", "2026-08-31T00:00:00.000Z");

    expect(room.state).toBe("Draft");
    expect(room.answerToolAvailable).toBe(false);
    expect(room.contract).toBeNull();
  });

  it("creates the constrained demo contract", () => {
    const contract = createDemoContract({
      questionId: DEMO_QUESTION_ID,
      expiresAt: "2026-09-01T00:00:00.000Z",
    });

    expect(contract.aggregate).toBe("count");
    expect(contract.maxUses).toBe(1);
    expect(contract.requiredConsents).toBe(3);
  });
});
