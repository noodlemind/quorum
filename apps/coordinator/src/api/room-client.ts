import {
  roomSnapshotSchema,
  type ProposalInput,
  type RoomSnapshot,
} from "@quorum/protocol";

function roomUrl(baseUrl: string, roomId: string, action: string) {
  return `${baseUrl}/rooms/${encodeURIComponent(roomId)}/${action}`;
}

async function readSnapshot(response: Response): Promise<RoomSnapshot> {
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Room service returned ${response.status}`);
  }

  return roomSnapshotSchema.parse(await response.json());
}

export async function getRoomSnapshot(
  baseUrl: string,
  roomId: string,
  signal?: AbortSignal,
): Promise<RoomSnapshot> {
  const response = await fetch(roomUrl(baseUrl, roomId, "status"), {
    ...(signal ? { signal } : {}),
  });
  return readSnapshot(response);
}

export async function proposeCountQuestion(
  baseUrl: string,
  roomId: string,
  input: ProposalInput,
): Promise<RoomSnapshot> {
  const response = await fetch(roomUrl(baseUrl, roomId, "proposal"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return readSnapshot(response);
}

export async function executeApprovedCount(
  baseUrl: string,
  roomId: string,
): Promise<unknown> {
  const response = await fetch(roomUrl(baseUrl, roomId, "execute"), {
    method: "POST",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Execution failed with ${response.status}`);
  }

  return response.json();
}
