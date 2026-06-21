import React from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import './trains.css';

export default function CauseEffectBanner({ label, fromValue, toValue, unit, fromInputs }) {
  if (fromValue == null || toValue == null || typeof fromValue !== 'number' || typeof toValue !== 'number') {
    return null; // Skip if values aren't numeric (e.g. stalemate "never")
  }

  const diff = toValue - fromValue;
  const pct = fromValue !== 0 ? Math.abs((diff / fromValue) * 100).toFixed(1) : '0.0';

  let Icon = Minus;
  if (diff > 0) Icon = ArrowUp;
  else if (diff < 0) Icon = ArrowDown;

  return (
    <div className="trains-causeeffect">
      <div className="trains-causeeffect-input">
        {fromInputs}
      </div>
      <div className="trains-causeeffect-result">
        <span>{label}: {fromValue}{unit && ` ${unit}`}</span>
        <span className="trains-causeeffect-arrow"><Icon size={14} /></span>
        <span>{toValue}{unit && ` ${unit}`}</span>
        {diff !== 0 && (
          <span className="trains-causeeffect-pct">({pct}%)</span>
        )}
      </div>
    </div>
  );
}
