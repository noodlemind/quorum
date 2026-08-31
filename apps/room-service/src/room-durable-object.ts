import { DurableObject } from "cloudflare:workers";

import {
  createDemoContract,
  createDraftRoomSnapshot,
  proposalInputSchema,
  roomSnapshotSchema,
  sha256Hex,
  type RoomSnapshot,
} from "@quorum/protocol";

import type { Env } from "./env";
import { errorResponse, jsonResponse, parseRoomRoute } from "./http";

const SNAPSHOT_KEY = "room-snapshot";

export class RoomDurableObject extends DurableObject<Env> {
  private async getSnapshot(roomId: string): Promise<RoomSnapshot> {
    const stored = await this.ctx.storage.get<RoomSnapshot>(SNAPSHOT_KEY);
    if (stored) return roomSnapshotSchema.parse(stored);

    const draft = createDraftRoomSnapshot(roomId);
    await this.ctx.storage.put(SNAPSHOT_KEY, draft);
    return draft;
  }

  private async propose(request: Request, roomId: string): Promise<Response> {
    const current = await this.getSnapshot(roomId);
    if (current.state !== "Draft") {
      return errorResponse(
        409,
        "ROOM_NOT_DRAFT",
        "A proposal can only be staged in a draft room.",
      );
    }

    let input: unknown;
    try {
      input = await request.json();
    } catch {
      return errorResponse(400, "INVALID_JSON", "Request body must be JSON.");
    }

    const parsed = proposalInputSchema.safeParse(input);
    if (!parsed.success) {
      return errorResponse(
        400,
        "INVALID_PROPOSAL",
        parsed.error.issues.map((issue) => issue.message).join("; "),
      );
    }

    if (Date.parse(parsed.data.expiresAt) <= Date.now()) {
      return errorResponse(
        400,
        "INVALID_EXPIRY",
        "Proposal expiry must be in the future.",
      );
    }

    const contract = createDemoContract(parsed.data);
    const now = new Date().toISOString();
    const snapshot = roomSnapshotSchema.parse({
      ...current,
      state: "Collecting",
      contract,
      questionHash: await sha256Hex(contract),
      expiresAt: contract.expiresAt,
      updatedAt: now,
    });

    await this.ctx.storage.put(SNAPSHOT_KEY, snapshot);
    await this.ctx.storage.setAlarm(new Date(contract.expiresAt));
    return jsonResponse(snapshot);
  }

  async fetch(request: Request): Promise<Response> {
    const route = parseRoomRoute(new URL(request.url).pathname);
    if (!route) return errorResponse(404, "NOT_FOUND", "Unknown room route.");

    if (request.method === "GET" && route.action === "status") {
      return jsonResponse(await this.getSnapshot(route.roomId));
    }

    if (request.method === "POST" && route.action === "proposal") {
      return this.propose(request, route.roomId);
    }

    if (request.method === "POST" && route.action === "execute") {
      const snapshot = await this.getSnapshot(route.roomId);
      if (snapshot.state !== "Armed") {
        return errorResponse(
          409,
          "ROOM_NOT_ARMED",
          "The approved answer capability is not currently authorized.",
        );
      }

      return errorResponse(
        501,
        "EXECUTION_NOT_IMPLEMENTED",
        "The atomic execution slice has not been implemented yet.",
      );
    }

    return errorResponse(404, "NOT_FOUND", "Unknown room action.");
  }

  async alarm(): Promise<void> {
    const stored = await this.ctx.storage.get<RoomSnapshot>(SNAPSHOT_KEY);
    if (!stored) return;

    const snapshot = roomSnapshotSchema.parse(stored);
    if (snapshot.state === "Consumed" || snapshot.state === "Expired") return;

    await this.ctx.storage.put(
      SNAPSHOT_KEY,
      roomSnapshotSchema.parse({
        ...snapshot,
        state: "Expired",
        answerToolAvailable: false,
        updatedAt: new Date().toISOString(),
      }),
    );
  }
}
