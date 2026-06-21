import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function LearningMomentCard({ moment, onContinue }) {
  if (!moment) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="trains-card trains-moment-card"
      style={{
        marginTop: '1rem',
        marginBottom: '1rem',
        padding: '1.25rem',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        backgroundColor: 'var(--surface)',
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: '0.25rem' }}>
          Observe
        </div>
        <div style={{ fontSize: '1rem', color: 'var(--text)' }}>
          {moment.observation}
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: '0.25rem' }}>
          Why
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
          {moment.reason}
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem', padding: '0.75rem', backgroundColor: 'var(--bg)', borderRadius: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700, marginRight: '0.5rem' }}>
              Therefore
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 }}>
              {moment.therefore}
            </span>
          </div>
          {moment.relatedFormula && (
            <code style={{ fontSize: '0.8rem', color: 'var(--muted)', fontFamily: 'var(--mono)', padding: '0.25rem 0.5rem', backgroundColor: 'var(--surface)', borderRadius: '4px', border: '1px solid var(--border)' }}>
              {moment.relatedFormula}
            </code>
          )}
        </div>
      </div>

      <button
        type="button"
        className="trains-btn trains-btn-primary"
        onClick={onContinue}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        Continue <ArrowRight size={14} />
      </button>
    </motion.div>
  );
}
