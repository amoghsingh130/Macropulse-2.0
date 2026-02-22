import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, TrendingDown, Activity, ChevronRight } from 'lucide-react';
import { applyShock } from './signalEngine';
import { classifyRegime } from './regimeEngine';
import { REGIME_LABELS, REGIME_COLORS } from './regimeColors';

const SHOCKS = [
  {
    key: 'fed_rate_hike',
    label: 'Fed Rate Hike',
    icon: TrendingDown,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    description: 'Simulates a 50bps surprise hike. TLT -4%, HYG/LQD tightens, USD rallies.',
  },
  {
    key: 'oil_spike',
    label: 'Oil Price Spike',
    icon: Flame,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    description: 'Simulates a +8% DBC shock. TIPS inflation expectations reprice upward.',
  },
  {
    key: 'credit_spread',
    label: 'Credit Spread Widening',
    icon: Activity,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    description: 'HYG/LQD drops 8%, SPY -5%, VIX +10. Classic risk-off signal.',
  },
];

export default function ShockSimulator({ features, currentRegime }) {
  const [selectedShock, setSelectedShock] = useState(null);
  const [result, setResult] = useState(null);

  const simulate = (shockKey) => {
    if (!features) return;
    setSelectedShock(shockKey);
    const shocked = applyShock({ ...features }, shockKey);
    const classification = classifyRegime(shocked);
    setResult({ shockKey, classification });
  };

  const regimeChanged = result && result.classification.regime !== currentRegime;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-red-500/20">
          <Flame className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Shock Simulator</h3>
          <p className="text-xs text-slate-500">Apply macro shocks and see predicted regime impact</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        {SHOCKS.map(shock => {
          const Icon = shock.icon;
          const isSelected = selectedShock === shock.key;
          return (
            <motion.button
              key={shock.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => simulate(shock.key)}
              className={`text-left p-4 rounded-xl border transition-all ${
                isSelected ? `${shock.bg} ${shock.border}` : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${shock.color}`} />
                <span className={`text-sm font-semibold ${isSelected ? shock.color : 'text-white'}`}>
                  {shock.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-tight">{shock.description}</p>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            key={result.shockKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-xl border p-4 flex items-center gap-4 ${
              regimeChanged
                ? 'border-amber-500/40 bg-amber-500/5'
                : 'border-slate-700/50 bg-slate-900/30'
            }`}
          >
            <div className="flex items-center gap-3 flex-1 flex-wrap">
              <div>
                <p className="text-xs text-slate-500 mb-1">Current Regime</p>
                <span className="text-sm font-bold px-2 py-1 rounded"
                  style={{ color: REGIME_COLORS[currentRegime], background: `${REGIME_COLORS[currentRegime]}22` }}>
                  {REGIME_LABELS[currentRegime]}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500 mb-1">Predicted Post-Shock</p>
                <span className="text-sm font-bold px-2 py-1 rounded"
                  style={{
                    color: REGIME_COLORS[result.classification.regime],
                    background: `${REGIME_COLORS[result.classification.regime]}22`
                  }}>
                  {REGIME_LABELS[result.classification.regime]}
                </span>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-slate-500 mb-1">Confidence</p>
                <p className="text-lg font-bold font-mono text-white">{result.classification.confidence}%</p>
              </div>
            </div>
            {regimeChanged && (
              <div className="flex-shrink-0">
                <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 font-semibold">
                  ⚠ Regime Shift
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}