export interface RoomRoute {
  action: string;
  roomId: string;
}

export function parseRoomRoute(pathname: string): RoomRoute | null {
  const match = /^\/rooms\/([^/]+)\/([^/]+)$/.exec(pathname);
  if (!match?.[1] || !match[2]) return null;

  try {
    return {
      roomId: decodeURIComponent(match[1]),
      action: match[2],
    };
  } catch {
    return null;
  }
}

export function jsonResponse(value: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(value), { ...init, headers });
}

export function errorResponse(status: number, code: string, message: string) {
  return jsonResponse({ error: { code, message } }, { status });
}

export function withCors(response: Response, origin: string | null) {
  const headers = new Headers(response.headers);
  if (origin) headers.set("access-control-allow-origin", origin);
  headers.set("vary", "origin");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
