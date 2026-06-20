// src/components/trains/Player.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, BookOpen } from 'lucide-react';
import { METHODS } from '../../engine/index.js';
import TrackView from './TrackView.jsx';
import ExecutionLog from './ExecutionLog.jsx';
import './trains.css';

function currentStep(steps, t) {
  let active = steps[0];
  for (const s of steps) if (s.t <= t + 1e-6) active = s;
  return active;
}

export default function Player({ problem, draft }) {
  const fn = METHODS[problem.methodId];

  const timeline = useMemo(() => {
    try {
      return fn(draft);
    } catch (err) {
      return { error: err.message };
    }
  }, [fn, draft]);

  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedMult, setSpeedMult] = useState(1);
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  const reset = useCallback(() => {
    setT(0);
    setPlaying(false);
  }, []);

  useEffect(() => {
    reset();
  }, [problem, draft, reset]);

  useEffect(() => {
    if (!playing || timeline.error) {
      lastRef.current = null;
      return;
    }
    const tick = (now) => {
      if (lastRef.current == null) lastRef.current = now;
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      setT((prev) => {
        const next = prev + dt * speedMult * (timeline.duration / 6);
        if (next >= timeline.duration) {
          setPlaying(false);
          return timeline.duration;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, speedMult, timeline]);

  if (timeline.error) {
    return (
      <div className="trains-warning">
        <AlertTriangle size={16} /> {timeline.error}
      </div>
    );
  }

  const step = currentStep(timeline.steps, t);
  const progress = (t / timeline.duration) * 100;

  return (
    <div>
      <div className="trains-track-wrap">
        <TrackView timeline={timeline} t={t} />
      </div>

      {timeline.stalemate && (
        <div className="trains-warning">
          <AlertTriangle size={16} /> Equal speed, same direction -- they never cross. Try changing a speed control above.
        </div>
      )}

      <div className="trains-transport">
        <button
          type="button"
          className="trains-btn trains-btn-primary"
          onClick={() => setPlaying((p) => !p)}
          disabled={timeline.stalemate}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" className="trains-btn trains-btn-secondary" onClick={reset}>
          <RotateCcw size={14} /> Reset
        </button>
        <input
          type="range"
          className="trains-scrubber"
          min={0}
          max={timeline.duration}
          step={timeline.duration / 500}
          value={t}
          onChange={(e) => {
            setPlaying(false);
            setT(Number(e.target.value));
          }}
        />
        <select
          className="trains-speed-select"
          value={speedMult}
          onChange={(e) => setSpeedMult(Number(e.target.value))}
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
        </select>
      </div>

      <div className="trains-progress">
        <div className="trains-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="trains-narration">
        <p className="trains-narration-label">Live narration -- {step?.formula}</p>
        <p className="trains-narration-text">{step?.text}</p>
      </div>

      <ExecutionLog timeline={timeline} t={t} />

      <div className="trains-answer">
        <span className="trains-answer-label">{timeline.answer.label}</span>
        <span className="trains-answer-value">
          {timeline.answer.value}
          <span className="trains-answer-unit">{timeline.answer.unit}</span>
        </span>
      </div>

      <div className="trains-explanation">
        <p className="trains-explanation-label">
          <BookOpen size={12} /> Step-by-step solution
        </p>
        <ol className="trains-explanation-list">
          {timeline.explanation.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
