const searchParameters = new URLSearchParams(window.location.search);

export const participantConfig = Object.freeze({
  participantId: searchParameters.get("participant") ?? "P-01",
  roomId: searchParameters.get("room") ?? "demo",
  roomServiceUrl:
    import.meta.env.VITE_ROOM_SERVICE_URL ?? "http://localhost:8787",
});
