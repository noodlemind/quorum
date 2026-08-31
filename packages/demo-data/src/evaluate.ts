import type { CountQuestionContract } from "@quorum/protocol";

import type { ParticipantJournal } from "./journals";

const HOUR_IN_MILLISECONDS = 60 * 60 * 1_000;

function toTimestamp(value: string): number {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    throw new TypeError(`Invalid ISO timestamp: ${value}`);
  }
  return timestamp;
}

export function evaluateCountQuestion(
  journal: ParticipantJournal,
  contract: CountQuestionContract,
): 0 | 1 {
  const windowMilliseconds = contract.windowHours * HOUR_IN_MILLISECONDS;

  for (const medicationEvent of journal.medicationEvents) {
    const changedAt = toTimestamp(medicationEvent.doseChangedAt);

    for (const symptom of journal.symptoms) {
      if (symptom.name.toLowerCase() !== contract.symptom) continue;

      const elapsed = toTimestamp(symptom.recordedAt) - changedAt;
      if (elapsed >= 0 && elapsed <= windowMilliseconds) return 1;
    }
  }

  return 0;
}
