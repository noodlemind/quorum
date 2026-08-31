import { describe, expect, it } from "vitest";

import { DEMO_QUESTION_ID, createDemoContract } from "@quorum/protocol";

import { evaluateCountQuestion } from "./evaluate";
import { PARTICIPANT_JOURNALS } from "./journals";

describe("evaluateCountQuestion", () => {
  it("evaluates the four synthetic journals deterministically", () => {
    const contract = createDemoContract({
      questionId: DEMO_QUESTION_ID,
      expiresAt: "2026-09-01T00:00:00.000Z",
    });

    expect(
      PARTICIPANT_JOURNALS.map((journal) =>
        evaluateCountQuestion(journal, contract),
      ),
    ).toEqual([1, 0, 0, 1]);
  });
});
