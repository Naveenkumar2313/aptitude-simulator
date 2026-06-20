// src/components/trains/ExecutionLog.jsx
import { useEffect, useMemo, useRef } from 'react';
import { Terminal } from 'lucide-react';
import './trains.css';

export default function ExecutionLog({ timeline, t }) {
  const logRef = useRef(null);

  const entries = useMemo(() => {
    const fromSteps = timeline.steps.map((s) => ({ t: s.t, text: `${s.formula} -- ${s.text}` }));
    const fromEvents = timeline.events.map((e) => ({ t: e.t, text: e.label }));
    return [...fromSteps, ...fromEvents].sort((a, b) => a.t - b.t);
  }, [timeline]);

  const visible = entries.filter((e) => e.t <= t + 1e-6);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [visible.length]);

  return (
    <div className="trains-log">
      <div className="trains-log-header">
        <Terminal size={12} /> Execution log
      </div>
      <div ref={logRef} className="trains-log-body">
        {visible.length === 0 && <p className="trains-log-empty">Press play to begin the simulation...</p>}
        {visible.map((e, i) => (
          <p key={i} className="trains-log-entry">
            <span className="trains-log-ts">[t={e.t.toFixed(2)}s]</span>
            {e.text}
          </p>
        ))}
      </div>
    </div>
  );
}
