export const coordinatorConfig = Object.freeze({
  roomId: import.meta.env.VITE_ROOM_ID ?? "demo",
  roomServiceUrl:
    import.meta.env.VITE_ROOM_SERVICE_URL ?? "http://localhost:8787",
});
