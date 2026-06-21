// src/components/trains/TrackView.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { frontAt, backAt } from '../../engine/index.js';
import './trains.css';

const COLORS = {
  entityA: { fill: '#4338ca', soft: 'rgba(67, 56, 202, 0.14)' },
  entityB: { fill: '#b45309', soft: 'rgba(180, 83, 9, 0.16)' },
  neutral: { fill: '#6b7280', soft: 'rgba(107, 114, 128, 0.16)' },
};

export default function TrackView({ timeline, t }) {
  const W = 760;
  const H = 220;
  const padX = 24;

  const targetBounds = useMemo(() => {
    let eMin = Infinity;
    let eMax = -Infinity;
    for (const e of timeline.entities) {
      const front = frontAt(e, t);
      const back = backAt(e, t);
      eMin = Math.min(eMin, front, back);
      eMax = Math.max(eMax, front, back);
    }
    if (eMin === Infinity) { eMin = 0; eMax = 100; }
    
    if (timeline.stalemate) {
      return { min: timeline.track.min, max: timeline.track.max };
    }

    const span = eMax - eMin;
    const padding = Math.max(span * 0.25, 50);
    return { min: eMin - padding, max: eMax + padding };
  }, [timeline, t]);

  const [view, setView] = useState(targetBounds);
  const viewRef = useRef(view);
  const targetRef = useRef(targetBounds);

  useEffect(() => {
    targetRef.current = targetBounds;
  }, [targetBounds]);

  useEffect(() => {
    viewRef.current = targetBounds;
    setView(targetBounds);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeline.track.min, timeline.track.max]);

  useEffect(() => {
    let raf;
    const tick = () => {
      const current = viewRef.current;
      const target = targetRef.current;
      
      const lerp = (start, end, amt) => start + (end - start) * amt;
      const f = 0.08;
      
      const nextMin = lerp(current.min, target.min, f);
      const nextMax = lerp(current.max, target.max, f);
      
      const diff = Math.abs(nextMin - target.min) + Math.abs(nextMax - target.max);
      
      if (diff > 0.5) {
        viewRef.current = { min: nextMin, max: nextMax };
        setView(viewRef.current);
      } else if (diff > 0 && diff <= 0.5) {
        viewRef.current = target;
        setView(target);
      }
      
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const span = view.max - view.min || 1;
  const scale = (W - padX * 2) / span;
  const toPx = (pos) => padX + (pos - view.min) * scale;
  const laneY = (lane) => (lane === 0 ? 70 : 150);

  let tieWorld = 10;
  let tiePx = tieWorld * scale;
  if (tiePx < 8) tiePx = 25 * scale;
  if (tiePx < 8) tiePx = 50 * scale;
  if (tiePx < 8) tiePx = 100 * scale;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="trains-track-svg" role="img" aria-label="Train simulation track">
      {[0, 1].map((lane) => {
        const y = laneY(lane);
        return (
          <g key={`lane-${lane}`}>
            <line x1={0} y1={y} x2={W} y2={y} stroke="var(--border)" strokeWidth="12" strokeDasharray={`2 ${Math.max(1, tiePx - 2)}`} strokeDashoffset={-toPx(0)} />
            <line x1={0} y1={y - 4} x2={W} y2={y - 4} stroke="var(--border)" strokeWidth="1" />
            <line x1={0} y1={y + 4} x2={W} y2={y + 4} stroke="var(--border)" strokeWidth="1" />
          </g>
        );
      })}

      {timeline.entities.map((e) => {
        const front = frontAt(e, t);
        const back = backAt(e, t);
        const x1 = toPx(Math.min(front, back));
        const x2 = toPx(Math.max(front, back));
        const y = laneY(e.lane);
        const c = COLORS[e.color] ?? COLORS.neutral;
        const w = Math.max(x2 - x1, 4);

        if (e.kind === 'station') {
          return (
            <g key={e.id}>
              <line x1={toPx(front) - 6} y1={y - 24} x2={toPx(front) - 6} y2={y} stroke={c.fill} strokeWidth="1.5" />
              <line x1={toPx(front) + 6} y1={y - 24} x2={toPx(front) + 6} y2={y} stroke={c.fill} strokeWidth="1.5" />
              <rect x={toPx(front) - 12} y={y - 26} width={24} height={3} fill={c.fill} rx="1" />
              <rect x={toPx(front) - 14} y={y - 4} width={28} height={4} fill={c.fill} />
              <text x={toPx(front)} y={y - 32} textAnchor="middle" fontSize="11" fill="var(--text)">{e.label}</text>
            </g>
          );
        }

        if (e.kind === 'point') {
          const lbl = e.label.toLowerCase();
          
          if (lbl.includes('bridge')) {
            let d = '';
            const segs = Math.max(1, Math.floor(w / 24));
            const spacing = w / segs;
            for (let i = 0; i < segs; i++) {
              const sx = x1 + i * spacing;
              const mid = sx + spacing / 2;
              const ex = sx + spacing;
              d += `M ${sx} ${y} L ${mid} ${y - 16} L ${ex} ${y} M ${mid} ${y - 16} L ${mid} ${y} `;
            }

            return (
              <g key={e.id}>
                <path d={d} stroke={c.fill} strokeWidth="1.2" fill="none" opacity="0.7" />
                <rect x={x1} y={y - 16} width={w} height={2} fill={c.fill} />
                <rect x={x1} y={y - 2} width={w} height={4} fill={c.fill} />
                <text x={(x1 + x2) / 2} y={y - 22} textAnchor="middle" fontSize="11" fill="var(--text)">{e.label}</text>
              </g>
            );
          }
          
          if (lbl.includes('pole') || lbl.includes('signal')) {
            const isActive = timeline.events.some(
              (ev) => Math.abs(ev.t - t) < 0.2 && (ev.type === 'crossStart' || ev.type === 'crossEnd') && ev.entityIds.includes(e.id)
            );
            const lightColor = isActive ? 'var(--accent)' : c.soft;
            return (
              <g key={e.id}>
                <line x1={toPx(front)} y1={y} x2={toPx(front)} y2={y - 26} stroke={c.fill} strokeWidth="2" />
                <rect x={toPx(front) - 4} y={y - 28} width={8} height={10} fill={c.fill} rx="2" />
                <circle cx={toPx(front)} cy={y - 23} r="2.5" fill={lightColor} />
                <text x={toPx(front)} y={y - 34} textAnchor="middle" fontSize="11" fill="var(--text)">{e.label}</text>
              </g>
            );
          }
          
          if (lbl.includes('man') || lbl.includes('driver')) {
            return (
              <g key={e.id}>
                <circle cx={toPx(front)} cy={y - 18} r="3" fill={c.fill} />
                <line x1={toPx(front)} y1={y - 15} x2={toPx(front)} y2={y - 6} stroke={c.fill} strokeWidth="1.5" />
                <path d={`M ${toPx(front) - 3} ${y} L ${toPx(front)} ${y - 6} L ${toPx(front) + 3} ${y}`} stroke={c.fill} strokeWidth="1.5" fill="none" />
                <line x1={toPx(front) - 4} y1={y - 11} x2={toPx(front) + 4} y2={y - 11} stroke={c.fill} strokeWidth="1.5" />
                <text x={toPx(front)} y={y - 24} textAnchor="middle" fontSize="11" fill="var(--text)">{e.label}</text>
              </g>
            );
          }

          return (
            <g key={e.id}>
              <circle cx={toPx(front)} cy={y - 4} r="5" fill={c.fill} />
              <text x={toPx(front)} y={y - 14} textAnchor="middle" fontSize="11" fill="var(--text)">{e.label}</text>
            </g>
          );
        }

        const isForward = e.motion.velocity >= 0;
        const cabW = Math.min(18, w * 0.35); 
        const cabX = isForward ? w - cabW : 0;
        const bodyH = 16;
        const cabH = 22;

        return (
          <g key={e.id} transform={`translate(${x1}, ${y - cabH})`}>
            <rect x={0} y={cabH - bodyH} width={w} height={bodyH} rx="2" fill={c.soft} stroke={c.fill} strokeWidth="1.5" />
            <rect x={cabX} y={0} width={cabW} height={cabH} rx="2" fill={c.soft} stroke={c.fill} strokeWidth="1.5" />
            <rect x={cabX + (isForward ? 4 : 3)} y={4} width={cabW - 7} height={6} fill="var(--bg)" rx="1" />
            {w >= 16 && <circle cx={6} cy={cabH} r="3" fill="var(--text)" opacity="0.8" />}
            {w > 30 && <circle cx={w / 2} cy={cabH} r="3" fill="var(--text)" opacity="0.8" />}
            {w >= 16 && <circle cx={w - 6} cy={cabH} r="3" fill="var(--text)" opacity="0.8" />}
            {w < 16 && <circle cx={w / 2} cy={cabH} r="3" fill="var(--text)" opacity="0.8" />}
            <text x={w / 2} y={-6} textAnchor="middle" fontSize="11" fill="var(--text-h)">{e.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
