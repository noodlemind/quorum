import { useCallback, useEffect, useState } from "react";

import type { RoomSnapshot } from "@quorum/protocol";

import { getRoomSnapshot } from "../api/room-client";

interface RoomSnapshotState {
  error: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
  snapshot: RoomSnapshot | null;
}

export function useRoomSnapshot(
  baseUrl: string,
  roomId: string,
): RoomSnapshotState {
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const nextSnapshot = await getRoomSnapshot(baseUrl, roomId);
      setSnapshot(nextSnapshot);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load room");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, roomId]);

  useEffect(() => {
    const controller = new AbortController();
    let nextPoll: number | undefined;

    async function load() {
      try {
        const nextSnapshot = await getRoomSnapshot(
          baseUrl,
          roomId,
          controller.signal,
        );
        setSnapshot(nextSnapshot);
        setError(null);
      } catch (caught) {
        if (controller.signal.aborted) return;
        setError(caught instanceof Error ? caught.message : "Unable to load room");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
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

  return { error, loading, refresh, snapshot };
}
