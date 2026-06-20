// src/components/trains/FieldControl.jsx
import './trains.css';

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export default function FieldControl({ label, value, min, max, step, unit, onChange }) {
  return (
    <div className="trains-field">
      <div className="trains-field-row">
        <span>{label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            className="trains-field-input"
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(clamp(Number(e.target.value) || 0, min, max))}
          />
          <span>{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
