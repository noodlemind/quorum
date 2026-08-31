import { useEffect, useState } from "react";

import {
  DEMO_FIELD_PATHS,
  DEMO_QUESTION_ID,
  TOOL_NAMES,
  proposalInputSchema,
  textToolResult,
  type RoomSnapshot,
} from "@quorum/protocol";

import {
  executeApprovedCount,
  getRoomSnapshot,
  proposeCountQuestion,
} from "../api/room-client";

type RegistrationState = "unavailable" | "registering" | "ready" | "error";

const noInputSchema = {
  type: "object",
  properties: {},
  additionalProperties: false,
} as const;

export function useWebMcpTools(
  baseUrl: string,
  roomId: string,
  snapshot: RoomSnapshot | null,
) {
  const [registrationState, setRegistrationState] =
    useState<RegistrationState>("registering");

  useEffect(() => {
    const modelContext = document.modelContext;
    if (!modelContext) {
      setRegistrationState("unavailable");
      return;
    }

    const registration = new AbortController();
    setRegistrationState("registering");

    const registrations = [
      modelContext.registerTool(
        {
          name: TOOL_NAMES.describeCohort,
          description:
            "Describe the synthetic cohort and the aggregate question Quorum permits. Returns metadata only, never participant records.",
          inputSchema: noInputSchema,
          execute: () =>
            textToolResult({
              eligibleParticipants: 4,
              requiredConsents: 3,
              minimumContributors: 3,
              aggregate: "count",
              allowedQuestionIds: [DEMO_QUESTION_ID],
              allowedFields: DEMO_FIELD_PATHS,
            }),
        },
        { signal: registration.signal },
      ),
      modelContext.registerTool(
        {
          name: TOOL_NAMES.proposeCountQuestion,
          description:
            "Stage the one constrained count question for independent human review. This does not inspect or evaluate participant records.",
          inputSchema: {
            type: "object",
            properties: {
              questionId: {
                type: "string",
                enum: [DEMO_QUESTION_ID],
              },
              expiresAt: {
                type: "string",
                format: "date-time",
              },
            },
            required: ["questionId", "expiresAt"],
            additionalProperties: false,
          },
          execute: async (input) => {
            const proposal = proposalInputSchema.parse(input);
            const nextSnapshot = await proposeCountQuestion(
              baseUrl,
              roomId,
              proposal,
            );
            return textToolResult(nextSnapshot);
          },
        },
        { signal: registration.signal },
      ),
      modelContext.registerTool(
        {
          name: TOOL_NAMES.getQuorumStatus,
          description:
            "Get aggregate room status, consent counts, contract hash, expiry, and answer-tool availability. Returns no identities or individual votes.",
          inputSchema: noInputSchema,
          execute: async () =>
            textToolResult(await getRoomSnapshot(baseUrl, roomId)),
        },
        { signal: registration.signal },
      ),
    ];

    void Promise.all(registrations)
      .then(() => setRegistrationState("ready"))
      .catch(() => {
        if (!registration.signal.aborted) setRegistrationState("error");
      });

    return () => registration.abort();
  }, [baseUrl, roomId]);

  useEffect(() => {
    const modelContext = document.modelContext;
    if (!modelContext || snapshot?.answerToolAvailable !== true) return;

    const registration = new AbortController();

    void modelContext.registerTool(
      {
        name: TOOL_NAMES.answerApprovedCount,
        description: `Answer the approved count once. Bound to question hash ${snapshot.questionHash ?? "unavailable"} and consent version ${snapshot.consentVersion}. Accepts no parameters.`,
        inputSchema: noInputSchema,
        execute: async () =>
          textToolResult(await executeApprovedCount(baseUrl, roomId)),
      },
      { signal: registration.signal },
    );

    return () => registration.abort();
  }, [
    baseUrl,
    roomId,
    snapshot?.answerToolAvailable,
    snapshot?.consentVersion,
    snapshot?.questionHash,
  ]);

  return registrationState;
}
