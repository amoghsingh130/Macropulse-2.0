import React from 'react';
import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';

const SEGMENTS = [
  { key: 'crossAssetAgreement',  label: 'Cross-Asset Agreement', color: '#8b5cf6' },
  { key: 'momentumConfirmation', label: 'Momentum Confirmation', color: '#10b981' },
  { key: 'volatilityFilter',     label: 'Volatility Filter',     color: '#f59e0b' },
];

export default function ConfidenceDecomposition({ decomposition, isLoading }) {
  if (isLoading) return <div className="animate-pulse h-32 bg-slate-800 rounded-2xl" />;
  if (!decomposition) return null;

  const { crossAssetAgreement = 70, momentumConfirmation = 60, volatilityFilter = 65 } = decomposition;
  const total = crossAssetAgreement + momentumConfirmation + volatilityFilter;

  const segments = SEGMENTS.map(s => ({
    ...s,
    value: decomposition[s.key] ?? 65,
    pct: Math.round(((decomposition[s.key] ?? 65) / total) * 100),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-violet-500/20">
          <Layers className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Confidence Decomposition</h3>
          <p className="text-xs text-slate-500">Three-component breakdown of the classification score</p>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="flex w-full h-6 rounded-full overflow-hidden gap-0.5 mb-5">
        {segments.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ width: 0 }}
            animate={{ width: `${s.pct}%` }}
            transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }}
            className="h-full rounded-sm"
            style={{ backgroundColor: s.color, minWidth: '4px' }}
            title={`${s.label}: ${s.value}%`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {segments.map(s => (
          <div key={s.key} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-sm text-slate-300">{s.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.value}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: s.color }}
                />
              </div>
              <span className="text-sm font-mono font-bold text-white w-10 text-right">{s.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}