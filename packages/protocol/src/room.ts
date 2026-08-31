import { z } from "zod";

export const DEMO_QUESTION_ID = "dizziness_after_dose_change_48h" as const;

export const DEMO_FIELD_PATHS = [
  "medicationEvents[].doseChangedAt",
  "symptoms[].name",
  "symptoms[].recordedAt",
] as const;

export const ROOM_STATES = [
  "Draft",
  "Proposed",
  "Collecting",
  "Armed",
  "Revoked",
  "Executing",
  "Consumed",
  "Expired",
] as const;

export const roomStateSchema = z.enum(ROOM_STATES);
export type RoomState = z.infer<typeof roomStateSchema>;

const isoTimestampSchema = z.iso.datetime({ offset: true });

export const proposalInputSchema = z
  .object({
    questionId: z.literal(DEMO_QUESTION_ID),
    expiresAt: isoTimestampSchema,
  })
  .strict();

export type ProposalInput = z.infer<typeof proposalInputSchema>;

export const countQuestionContractSchema = z
  .object({
    questionId: z.literal(DEMO_QUESTION_ID),
    aggregate: z.literal("count"),
    event: z.literal("medication_dose_change"),
    symptom: z.literal("dizziness"),
    windowHours: z.literal(48),
    fields: z.array(z.enum(DEMO_FIELD_PATHS)).length(DEMO_FIELD_PATHS.length),
    requiredConsents: z.literal(3),
    minimumContributors: z.literal(3),
    expiresAt: isoTimestampSchema,
    maxUses: z.literal(1),
  })
  .strict();

export type CountQuestionContract = z.infer<
  typeof countQuestionContractSchema
>;

export const roomSnapshotSchema = z
  .object({
    roomId: z.string().min(1),
    state: roomStateSchema,
    contract: countQuestionContractSchema.nullable(),
    questionHash: z.string().regex(/^[a-f0-9]{64}$/).nullable(),
    requiredConsents: z.number().int().min(1),
    currentConsents: z.number().int().min(0),
    contributingParticipants: z.number().int().min(0),
    consentVersion: z.number().int().min(0),
    expiresAt: isoTimestampSchema.nullable(),
    answerToolAvailable: z.boolean(),
    updatedAt: isoTimestampSchema,
  })
  .strict();

export type RoomSnapshot = z.infer<typeof roomSnapshotSchema>;

export function createDraftRoomSnapshot(
  roomId: string,
  now = new Date().toISOString(),
): RoomSnapshot {
  return roomSnapshotSchema.parse({
    roomId,
    state: "Draft",
    contract: null,
    questionHash: null,
    requiredConsents: 3,
    currentConsents: 0,
    contributingParticipants: 0,
    consentVersion: 0,
    expiresAt: null,
    answerToolAvailable: false,
    updatedAt: now,
  });
}

export function createDemoContract(
  input: ProposalInput,
): CountQuestionContract {
  return countQuestionContractSchema.parse({
    questionId: input.questionId,
    aggregate: "count",
    event: "medication_dose_change",
    symptom: "dizziness",
    windowHours: 48,
    fields: [...DEMO_FIELD_PATHS],
    requiredConsents: 3,
    minimumContributors: 3,
    expiresAt: input.expiresAt,
    maxUses: 1,
  });
}
