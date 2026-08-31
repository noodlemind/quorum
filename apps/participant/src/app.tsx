import { evaluateCountQuestion, getParticipantJournal } from "@quorum/demo-data";
import { Card } from "@quorum/ui/card";
import { StatusBadge } from "@quorum/ui/status-badge";

import { participantConfig } from "./config";
import { useRoomSnapshot } from "./use-room-snapshot";

export function App() {
  const { error, snapshot } = useRoomSnapshot(
    participantConfig.roomServiceUrl,
    participantConfig.roomId,
  );
  const journal = getParticipantJournal(participantConfig.participantId);
  const localContribution =
    journal && snapshot?.contract
      ? evaluateCountQuestion(journal, snapshot.contract)
      : null;
  const canReview = snapshot?.state === "Collecting";

  if (!journal) {
    return (
      <main className="participant-shell">
        <div className="notice" role="alert">
          Unknown synthetic participant: {participantConfig.participantId}
        </div>
      </main>
    );
  }

  return (
    <main className="participant-shell">
      <header className="participant-header">
        <div>
          <p className="q-eyebrow">
            Private participant session · {journal.participantId}
          </p>
          <h1>Your record stays here.</h1>
          <p>
            Review the exact contract before deciding whether this session may
            contribute a query-bound answer.
          </p>
        </div>
        {snapshot ? <StatusBadge state={snapshot.state} /> : null}
      </header>

      {error ? (
        <div className="notice" role="alert">
          {error}
        </div>
      ) : null}

      <div className="participant-grid">
        <Card eyebrow="Local journal" title="Synthetic entries">
          <div className="journal-section">
            <h3>Medication events</h3>
            {journal.medicationEvents.map((event) => (
              <article key={`${event.medicationLabel}-${event.doseChangedAt}`}>
                <strong>{event.medicationLabel}</strong>
                <span>Dose changed {event.doseChangedAt}</span>
              </article>
            ))}
          </div>
          <div className="journal-section">
            <h3>Symptoms</h3>
            {journal.symptoms.map((symptom) => (
              <article key={`${symptom.name}-${symptom.recordedAt}`}>
                <strong>{symptom.name}</strong>
                <span>{symptom.recordedAt}</span>
                <p>{symptom.note}</p>
              </article>
            ))}
          </div>
        </Card>

        <Card eyebrow="Consent contract" title="Question under review">
          {snapshot?.contract ? (
            <>
              <blockquote>
                How many consenting participants recorded dizziness within 48
                hours after a medication dose change?
              </blockquote>
              <dl className="review-list">
                <div>
                  <dt>Aggregate</dt>
                  <dd>Count only</dd>
                </div>
                <div>
                  <dt>Required</dt>
                  <dd>{snapshot.requiredConsents} consents</dd>
                </div>
                <div>
                  <dt>Uses</dt>
                  <dd>One successful use</dd>
                </div>
                <div>
                  <dt>Expires</dt>
                  <dd>{snapshot.expiresAt}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="empty-state">
              No question has been proposed. This session cannot consent yet.
            </p>
          )}

          <div className="local-result">
            <span>Local evaluation</span>
            <strong>{localContribution === null ? "Not evaluated" : "Ready"}</strong>
            <small>
              The participant-level `0` or `1` is intentionally not displayed.
            </small>
          </div>

          <fieldset className="consent-actions" disabled={!canReview}>
            <legend>Human-only controls</legend>
            <button type="button" className="button button--primary">
              Consent
            </button>
            <button type="button" className="button button--secondary">
              Decline
            </button>
          </fieldset>
          <p className="implementation-note">
            Consent transport is the next implementation slice; these controls
            remain disabled until the room is collecting.
          </p>
        </Card>
      </div>
    </main>
  );
}
