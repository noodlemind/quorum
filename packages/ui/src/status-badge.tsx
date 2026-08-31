import type { RoomState } from "@quorum/protocol";

interface StatusBadgeProps {
  state: RoomState;
}

export function StatusBadge({ state }: StatusBadgeProps) {
  return (
    <span className="q-status" data-state={state.toLowerCase()}>
      <span aria-hidden="true" className="q-status__dot" />
      {state}
    </span>
  );
}
