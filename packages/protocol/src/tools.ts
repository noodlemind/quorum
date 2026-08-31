export const TOOL_NAMES = {
  describeCohort: "describe_cohort",
  proposeCountQuestion: "propose_count_question",
  getQuorumStatus: "get_quorum_status",
  answerApprovedCount: "answer_dizziness_after_dose_change_once",
} as const;

export interface TextToolResult {
  content: Array<{
    type: "text";
    text: string;
  }>;
}

export function textToolResult(value: unknown): TextToolResult {
  return {
    content: [
      {
        type: "text",
        text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
}
