import type { RoomDurableObject } from "./room-durable-object";

export interface Env {
  COORDINATOR_ORIGIN?: string;
  PARTICIPANT_ORIGIN?: string;
  ROOMS: DurableObjectNamespace<RoomDurableObject>;
}
