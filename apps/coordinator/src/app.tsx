import { Card } from "@quorum/ui/card";
import { Metric } from "@quorum/ui/metric";
import { StatusBadge } from "@quorum/ui/status-badge";

import { coordinatorConfig } from "./config";
import { useRoomSnapshot } from "./hooks/use-room-snapshot";
import { useWebMcpTools } from "./webmcp/use-webmcp-tools";

const ALWAYS_AVAILABLE_TOOLS = [
  "describe_cohort",
  "propose_count_question",
  "get_quorum_status",
] as const;

export function App() {
  const { error, loading, refresh, snapshot } = useRoomSnapshot(
    coordinatorConfig.roomServiceUrl,
    coordinatorConfig.roomId,
  );
  const registrationState = useWebMcpTools(
    coordinatorConfig.roomServiceUrl,
    coordinatorConfig.roomId,
    snapshot,
  );

  return (
    <main className="coordinator-shell">
      <header className="hero">
        <div>
          <p className="q-eyebrow">Coordinator · Room {coordinatorConfig.roomId}</p>
          <h1>A tool that exists only while the people agree.</h1>
          <p className="hero__summary">
            The agent may propose. Humans alone authorize. The answer capability
            appears only while collective authority is valid.
          </p>
        </div>
        {snapshot ? <StatusBadge state={snapshot.state} /> : null}
      </header>

      {error ? (
        <div className="notice notice--error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => void refresh()}>
            Retry
          </button>
        </div>
      ) : null}

      <section className="metrics" aria-label="Room summary">
        <Metric
          label="Room state"
          value={loading ? "Connecting…" : (snapshot?.state ?? "Unavailable")}
        />
        <Metric
          label="Live consents"
          value={`${snapshot?.currentConsents ?? 0} / ${snapshot?.requiredConsents ?? 3}`}
        />
        <Metric
          label="Answer tool"
          value={snapshot?.answerToolAvailable ? "Published" : "Absent"}
        />
        <Metric label="WebMCP" value={registrationState} />
      </section>

      <div className="content-grid">
        <Card eyebrow="Approved adapter" title="Synthetic cohort count">
          <blockquote>
            How many consenting participants recorded dizziness within 48 hours
            after a medication dose change?
          </blockquote>
          <dl className="contract-list">
            <div>
              <dt>Question hash</dt>
              <dd>{snapshot?.questionHash ?? "Not proposed"}</dd>
            </div>
            <div>
              <dt>Consent version</dt>
              <dd>{snapshot?.consentVersion ?? 0}</dd>
            </div>
            <div>
              <dt>Expiry</dt>
              <dd>{snapshot?.expiresAt ?? "Not set"}</dd>
            </div>
          </dl>
        </Card>

        <Card eyebrow="Agent surface" title="Published tools">
          <ul className="tool-list">
            {ALWAYS_AVAILABLE_TOOLS.map((tool) => (
              <li key={tool}>
                <code>{tool}</code>
                <span>Always available</span>
              </li>
            ))}
            <li data-available={snapshot?.answerToolAvailable ?? false}>
              <code>answer_dizziness_after_dose_change_once</code>
              <span>
                {snapshot?.answerToolAvailable ? "Armed" : "Requires quorum"}
              </span>
            </li>
          </ul>
        </Card>
      </div>

      <footer>
        Participant records and join credentials never render on this origin.
      </footer>
    </main>
  );
}
