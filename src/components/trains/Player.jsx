// src/components/trains/Player.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, BookOpen } from 'lucide-react';
import { METHODS } from '../../engine/index.js';
import TrackView from './TrackView.jsx';
import ExecutionLog from './ExecutionLog.jsx';
import LearningMomentCard from './LearningMomentCard.jsx';
import CauseEffectBanner from './CauseEffectBanner.jsx';
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
  const [pausedAtMomentIndex, setPausedAtMomentIndex] = useState(null);
  const [shownMoments, setShownMoments] = useState(new Set());
  const rafRef = useRef(null);
  const lastRef = useRef(null);

  const reset = useCallback(() => {
    setT(0);
    setPlaying(false);
    setPausedAtMomentIndex(null);
    setShownMoments(new Set());
  }, []);

  // Track the most recent "change" so we can show the banner.
  const [changeInfo, setChangeInfo] = useState(null);
  
  // Track the "current" values in a ref so we can diff when they change
  const currentRef = useRef({ problemId: problem.id, draft, answer: timeline.error ? null : timeline.answer });

  useEffect(() => {
    reset();
  }, [problem, draft, reset]);

  useEffect(() => {
    if (timeline.error) return;

    if (currentRef.current.problemId !== problem.id) {
      // Changed problem, reset everything
      currentRef.current = { problemId: problem.id, draft, answer: timeline.answer };
      setChangeInfo(null);
      return;
    }

    const oldDraft = currentRef.current.draft;
    if (JSON.stringify(oldDraft) !== JSON.stringify(draft)) {
      const oldAnswer = currentRef.current.answer;
      
      const msgs = [];
      const d1 = oldDraft, d2 = draft;
      if (d1.entityA?.speedKmph !== d2.entityA?.speedKmph) msgs.push(`Speed: ${d1.entityA.speedKmph} -> ${d2.entityA.speedKmph} km/hr`);
      else if (d1.entityB?.speedKmph !== d2.entityB?.speedKmph) msgs.push(`Speed: ${d1.entityB.speedKmph} -> ${d2.entityB.speedKmph} km/hr`);
      else if (d1.entityA?.length !== d2.entityA?.length) msgs.push(`Length: ${d1.entityA.length} -> ${d2.entityA.length} m`);
      else if (d1.entityB?.length !== d2.entityB?.length) msgs.push(`Length: ${d1.entityB.length} -> ${d2.entityB.length} m`);
      else if (d1.sameDirection !== d2.sameDirection) msgs.push(`Direction: ${d1.sameDirection ? 'Same' : 'Opposite'} -> ${d2.sameDirection ? 'Same' : 'Opposite'}`);
      else if (d1.afterMeetHoursA !== d2.afterMeetHoursA) msgs.push(`Time A: ${d1.afterMeetHoursA} -> ${d2.afterMeetHoursA} h`);
      else if (d1.afterMeetHoursB !== d2.afterMeetHoursB) msgs.push(`Time B: ${d1.afterMeetHoursB} -> ${d2.afterMeetHoursB} h`);
      
      if (msgs.length > 0 && oldAnswer && !timeline.stalemate && oldAnswer.value !== 'never' && timeline.answer.value !== 'never') {
        setChangeInfo({
          fromInputs: msgs.join(', '),
          fromValue: oldAnswer.value,
          toValue: timeline.answer.value,
          label: timeline.answer.label,
          unit: timeline.answer.unit
        });
      }

      currentRef.current = { problemId: problem.id, draft, answer: timeline.answer };
    }
  }, [problem.id, draft, timeline]);

  const sortedMoments = useMemo(() => {
    if (!timeline || timeline.error || !timeline.moments) return [];
    return [...timeline.moments].sort((a, b) => a.t - b.t);
  }, [timeline]);

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
        let next = prev + dt * speedMult * (timeline.duration / 6);
        let pauseIndex = -1;

        for (let i = 0; i < sortedMoments.length; i++) {
          const m = sortedMoments[i];
          if (m.t >= prev && m.t <= next && !shownMoments.has(m.id)) {
            next = m.t;
            pauseIndex = i;
            break;
          }
        }

        if (pauseIndex !== -1) {
          setTimeout(() => {
            setPlaying(false);
            setPausedAtMomentIndex(pauseIndex);
          }, 0);
          return next;
        }

        if (next >= timeline.duration) {
          setTimeout(() => setPlaying(false), 0);
          return timeline.duration;
        }
        rafRef.current = requestAnimationFrame(tick);
        return next;
      });
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, speedMult, timeline, sortedMoments, shownMoments]);

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

      {pausedAtMomentIndex !== null && sortedMoments[pausedAtMomentIndex] && (
        <LearningMomentCard 
          moment={sortedMoments[pausedAtMomentIndex]}
          onContinue={() => {
            const m = sortedMoments[pausedAtMomentIndex];
            setShownMoments(prev => new Set(prev).add(m.id));
            setPausedAtMomentIndex(null);
            setPlaying(true);
          }}
        />
      )}

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
            const newT = Number(e.target.value);
            setT(newT);
            
            const newlyShown = new Set(shownMoments);
            let changed = false;
            for (const m of sortedMoments) {
              if (m.t <= newT && !newlyShown.has(m.id)) {
                newlyShown.add(m.id);
                changed = true;
              }
            }
            if (changed) setShownMoments(newlyShown);
            setPausedAtMomentIndex(null);
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

      {!timeline.stalemate && changeInfo && (
        <CauseEffectBanner
          label={changeInfo.label}
          fromValue={changeInfo.fromValue}
          toValue={changeInfo.toValue}
          unit={changeInfo.unit}
          fromInputs={changeInfo.fromInputs}
        />
      )}

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
