export interface MedicationEvent {
  doseChangedAt: string;
  medicationLabel: string;
}

export interface SymptomEntry {
  name: string;
  recordedAt: string;
  note: string;
}

export interface ParticipantJournal {
  participantId: string;
  medicationEvents: MedicationEvent[];
  symptoms: SymptomEntry[];
}

export const PARTICIPANT_JOURNALS: ParticipantJournal[] = [
  {
    participantId: "P-01",
    medicationEvents: [
      {
        medicationLabel: "Medication A",
        doseChangedAt: "2026-08-25T08:00:00.000Z",
      },
    ],
    symptoms: [
      {
        name: "dizziness",
        recordedAt: "2026-08-26T07:00:00.000Z",
        note: "Brief dizziness after standing.",
      },
    ],
  },
  {
    participantId: "P-02",
    medicationEvents: [
      {
        medicationLabel: "Medication B",
        doseChangedAt: "2026-08-25T12:00:00.000Z",
      },
    ],
    symptoms: [
      {
        name: "dizziness",
        recordedAt: "2026-08-28T13:00:00.000Z",
        note: "Dizziness recorded outside the approved window.",
      },
    ],
  },
  {
    participantId: "P-03",
    medicationEvents: [
      {
        medicationLabel: "Medication C",
        doseChangedAt: "2026-08-26T09:00:00.000Z",
      },
    ],
    symptoms: [
      {
        name: "nausea",
        recordedAt: "2026-08-26T17:00:00.000Z",
        note: "Mild nausea; no dizziness recorded.",
      },
    ],
  },
  {
    participantId: "P-04",
    medicationEvents: [
      {
        medicationLabel: "Medication D",
        doseChangedAt: "2026-08-25T19:00:00.000Z",
      },
    ],
    symptoms: [
      {
        name: "dizziness",
        recordedAt: "2026-08-27T18:00:00.000Z",
        note: "Dizziness recorded 47 hours after the dose change.",
      },
    ],
  },
];

export function getParticipantJournal(
  participantId: string,
): ParticipantJournal | undefined {
  return PARTICIPANT_JOURNALS.find(
    (journal) => journal.participantId === participantId,
  );
}
