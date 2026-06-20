// src/components/trains/ScenarioControls.jsx
import FieldControl from './FieldControl.jsx';
import './trains.css';

export default function ScenarioControls({ problem, draft, setDraft }) {
  const solveFor = problem.params.solveFor?.field;
  const ed = problem.editable || {
    speedA: solveFor !== 'speedA',
    speedB: solveFor !== 'speedB' && draft.entityB && (draft.entityB.kind === 'train' || draft.entityB.speedKmph > 0),
    lengthA: solveFor !== 'lengthA',
    lengthB: solveFor !== 'lengthB' && draft.entityB?.kind === 'train',
    direction: draft.sameDirection !== undefined,
    afterMeetHoursA: true,
    afterMeetHoursB: true,
    referenceSpeedBKmph: true,
  };

  if (problem.methodId === 'crossingEvent') {
    return (
      <div className="trains-controls-grid">
        {ed.speedA && (
          <FieldControl
            label={`${draft.entityA.label} speed`}
            value={draft.entityA.speedKmph}
            min={1} max={180} step={1} unit="km/hr"
            onChange={(v) => setDraft((d) => ({ ...d, entityA: { ...d.entityA, speedKmph: v } }))}
          />
        )}
        {ed.speedB && (
          <FieldControl
            label={`${draft.entityB.label} speed`}
            value={draft.entityB.speedKmph}
            min={0} max={180} step={1} unit="km/hr"
            onChange={(v) => setDraft((d) => ({ ...d, entityB: { ...d.entityB, speedKmph: v } }))}
          />
        )}
        {ed.lengthA && (
          <FieldControl
            label={`${draft.entityA.label} length`}
            value={draft.entityA.length}
            min={10} max={2000} step={5} unit="m"
            onChange={(v) => setDraft((d) => ({ ...d, entityA: { ...d.entityA, length: v } }))}
          />
        )}
        {ed.lengthB && (
          <FieldControl
            label={`${draft.entityB.label} length`}
            value={draft.entityB.length}
            min={0} max={2000} step={5} unit="m"
            onChange={(v) => setDraft((d) => ({ ...d, entityB: { ...d.entityB, length: v } }))}
          />
        )}
        {ed.direction && (
          <div className="trains-direction-toggle">
            <span>Direction</span>
            <div className="trains-toggle-group">
              <button
                type="button"
                className={`trains-toggle-btn ${draft.sameDirection ? 'is-active' : ''}`}
                onClick={() => setDraft((d) => ({ ...d, sameDirection: true }))}
              >
                Same direction
              </button>
              <button
                type="button"
                className={`trains-toggle-btn ${!draft.sameDirection ? 'is-active' : ''}`}
                onClick={() => setDraft((d) => ({ ...d, sameDirection: false }))}
              >
                Opposite directions
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // meetAndContinue
  return (
    <div className="trains-controls-grid">
      {ed.afterMeetHoursA && (
        <FieldControl
          label={`${draft.trainA.label} time after meeting`}
          value={draft.afterMeetHoursA}
          min={1} max={40} step={0.5} unit="hr"
          onChange={(v) => setDraft((d) => ({ ...d, afterMeetHoursA: v }))}
        />
      )}
      {ed.afterMeetHoursB && (
        <FieldControl
          label={`${draft.trainB.label} time after meeting`}
          value={draft.afterMeetHoursB}
          min={1} max={40} step={0.5} unit="hr"
          onChange={(v) => setDraft((d) => ({ ...d, afterMeetHoursB: v }))}
        />
      )}
      {ed.referenceSpeedBKmph && (
        <FieldControl
          label={`${draft.trainB.label} reference speed (visualization scale only)`}
          value={draft.referenceSpeedBKmph}
          min={10} max={150} step={5} unit="km/hr"
          onChange={(v) => setDraft((d) => ({ ...d, referenceSpeedBKmph: v }))}
        />
      )}
    </div>
  );
}
