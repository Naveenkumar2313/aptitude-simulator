// src/pages/TrainsSimulator.jsx
import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { trainsProblemBank } from '../engine/index.js';
import ScenarioControls from '../components/trains/ScenarioControls.jsx';
import Player from '../components/trains/Player.jsx';
import '../components/trains/trains.css';

function cloneParams(p) {
  return JSON.parse(JSON.stringify(p));
}

export default function TrainsSimulator() {
  const [activeId, setActiveId] = useState(trainsProblemBank[0].id);
  const problem = trainsProblemBank.find((p) => p.id === activeId);
  const [draft, setDraft] = useState(() => cloneParams(problem.params));

  useEffect(() => {
    setDraft(cloneParams(problem.params));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  return (
    <div className="trains-page">
      <p className="trains-eyebrow">Complexity Universe · Aptitude Engine</p>
      <h2>Problems on Trains -- one engine, every problem</h2>
      <p className="trains-subtitle">
        Adjust any value below and the simulation, log, and worked solution all recompute live.
      </p>

      <div className="trains-tabs">
        {trainsProblemBank.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`trains-tab ${p.id === activeId ? 'is-active' : ''}`}
            onClick={() => setActiveId(p.id)}
          >
            {p.source}
          </button>
        ))}
      </div>

      <div className="trains-card">
        <p className="trains-prompt">
          <ChevronRight size={16} />
          {problem.prompt}
        </p>
      </div>

      <div className="trains-card">
        <p className="trains-card-label">Adjust the scenario</p>
        <ScenarioControls problem={problem} draft={draft} setDraft={setDraft} />
      </div>

      <div className="trains-card">
        <Player problem={problem} draft={draft} />
      </div>
    </div>
  );
}
