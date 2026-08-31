import { useEffect, useState } from "react";

import { roomSnapshotSchema, type RoomSnapshot } from "@quorum/protocol";

export function useRoomSnapshot(baseUrl: string, roomId: string) {
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let nextPoll: number | undefined;

    async function load() {
      try {
        const response = await fetch(
          `${baseUrl}/rooms/${encodeURIComponent(roomId)}/status`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error(`Room service returned ${response.status}`);
        setSnapshot(roomSnapshotSchema.parse(await response.json()));
        setError(null);
      } catch (caught) {
        if (controller.signal.aborted) return;
        setError(caught instanceof Error ? caught.message : "Unable to load room");
      } finally {
        if (!controller.signal.aborted) {
          nextPoll = window.setTimeout(() => void load(), 2_000);
        }
      }
    }

    void load();

    return () => {
      controller.abort();
      if (nextPoll !== undefined) window.clearTimeout(nextPoll);
    };
  }, [baseUrl, roomId]);

  return { error, snapshot };
}
