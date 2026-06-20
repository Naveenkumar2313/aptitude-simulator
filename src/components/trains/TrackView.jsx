// src/components/trains/TrackView.jsx
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
  const { min, max } = timeline.track;
  const span = max - min || 1;
  const scale = (W - padX * 2) / span;
  const toPx = (pos) => padX + (pos - min) * scale;
  const laneY = (lane) => (lane === 0 ? 70 : 150);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="trains-track-svg"
      role="img"
      aria-label="Train simulation track"
    >
      <line x1={padX} y1={laneY(0)} x2={W - padX} y2={laneY(0)} stroke="var(--border)" strokeWidth="2" strokeDasharray="2 6" />
      <line x1={padX} y1={laneY(1)} x2={W - padX} y2={laneY(1)} stroke="var(--border)" strokeWidth="2" strokeDasharray="2 6" />

      {timeline.entities.map((e) => {
        const front = frontAt(e, t);
        const back = backAt(e, t);
        const x1 = toPx(Math.min(front, back));
        const x2 = toPx(Math.max(front, back));
        const y = laneY(e.lane);
        const c = COLORS[e.color] ?? COLORS.neutral;

        if (e.kind === 'station') {
          return (
            <g key={e.id}>
              <line x1={toPx(front)} y1={y - 26} x2={toPx(front)} y2={y + 26} stroke={c.fill} strokeWidth="2" />
              <text x={toPx(front)} y={y - 32} textAnchor="middle" fontSize="11" fill="var(--text)">{e.label}</text>
            </g>
          );
        }
        if (e.kind === 'point') {
          return (
            <g key={e.id}>
              <circle cx={toPx(front)} cy={y} r="6" fill={c.fill} />
              <text x={toPx(front)} y={y - 14} textAnchor="middle" fontSize="11" fill="var(--text)">{e.label}</text>
            </g>
          );
        }
        const w = Math.max(x2 - x1, 6);
        return (
          <g key={e.id}>
            <rect x={x1} y={y - 14} width={w} height={28} rx={6} fill={c.soft} stroke={c.fill} strokeWidth="1.5" />
            <text x={(x1 + x2) / 2} y={y - 20} textAnchor="middle" fontSize="11" fill="var(--text-h)">{e.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
