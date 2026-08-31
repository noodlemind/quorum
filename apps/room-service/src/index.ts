import type { Env } from "./env";
import { errorResponse, jsonResponse, parseRoomRoute, withCors } from "./http";

export { RoomDurableObject } from "./room-durable-object";

const DEVELOPMENT_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
] as const;

function allowedOrigins(env: Env) {
  return new Set(
    [
      ...DEVELOPMENT_ORIGINS,
      env.COORDINATOR_ORIGIN,
      env.PARTICIPANT_ORIGIN,
    ].filter((origin): origin is string => Boolean(origin)),
  );
}

export default {
  async fetch(request, env): Promise<Response> {
    const origin = request.headers.get("origin");
    if (origin && !allowedOrigins(env).has(origin)) {
      return errorResponse(403, "ORIGIN_NOT_ALLOWED", "Origin is not allowed.");
    }

    if (request.method === "OPTIONS") {
      return withCors(
        new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-headers": "content-type",
            "access-control-allow-methods": "GET, POST, OPTIONS",
            "access-control-max-age": "86400",
          },
        }),
        origin,
      );
    }

    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return withCors(jsonResponse({ status: "ok" }), origin);
    }

    const route = parseRoomRoute(url.pathname);
    if (!route) {
      return withCors(
        errorResponse(404, "NOT_FOUND", "Unknown service route."),
        origin,
      );
    }

    const room = env.ROOMS.getByName(route.roomId);
    return withCors(await room.fetch(request), origin);
  },
} satisfies ExportedHandler<Env>;
