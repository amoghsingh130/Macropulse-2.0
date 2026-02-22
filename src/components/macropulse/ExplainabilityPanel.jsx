import React from 'react';
import { motion } from 'framer-motion';
import { Microscope, AlertTriangle, CheckCircle } from 'lucide-react';
import { computeSignals } from './signalEngine';

const SIGNAL_DEFS = [
  {
    key: 'hyg_lqd_ratio',
    label: 'HYG/LQD Credit Spread',
    description: 'High yield vs investment grade. < 0.98 = stress, > 1.02 = benign.',
    thresholdHigh: 1.02,
    thresholdLow: 0.98,
    invert: true, // lower is bad
    zKey: 'hyg_lqd_ratio',
  },
  {
    key: 'spy_r21d',
    label: 'SPY 21-Day Momentum',
    description: 'SPY 21-day rolling return. Proxy for 50DMA trend.',
    thresholdHigh: 1.0,
    thresholdLow: -1.0,
    zKey: 'spy_r21d',
    suffix: '%',
  },
  {
    key: 'uup_r21d',
    label: 'UUP Dollar Momentum',
    description: 'USD momentum. Negative = dollar stress regime signal.',
    thresholdHigh: 0.5,
    thresholdLow: -0.5,
    invert: false,
    zKey: 'uup_r21d',
    suffix: '%',
  },
  {
    key: 'tip_ief_ratio',
    label: 'TIP/IEF Ratio (Inflation)',
    description: 'TIPS vs nominal Treasuries. > 1.01 = inflation expectations rising.',
    thresholdHigh: 1.01,
    thresholdLow: 0.99,
    zKey: 'tip_ief_ratio',
  },
  {
    key: 'spy_r63d',
    label: 'SPY 63-Day Trend (200DMA)',
    description: 'SPY 63-day return. Long-term trend signal.',
    thresholdHigh: 2.0,
    thresholdLow: -2.0,
    zKey: 'spy_r63d',
    suffix: '%',
  },
  {
    key: 'spy_vol21d',
    label: 'Realized Volatility (21D)',
    description: 'Annualized 21-day vol. > 20 = elevated risk-off environment.',
    thresholdHigh: 25,
    thresholdLow: 15,
    invert: true,
    zKey: 'spy_vol21d',
    suffix: '%',
  },
];

function ZScoreBar({ z }) {
  const clamped = Math.max(-3, Math.min(3, z));
  const pct     = ((clamped + 3) / 6) * 100;
  const color   = z > 1 ? '#10b981' : z < -1 ? '#ef4444' : '#f59e0b';
  return (
    <div className="relative w-full h-1.5 bg-slate-700 rounded-full mt-2">
      <div
        className="absolute top-0 left-0 h-1.5 rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
      <div className="absolute top-0 left-1/2 w-px h-1.5 bg-slate-500" />
    </div>
  );
}

export default function ExplainabilityPanel({ features, isLoading }) {
  const signals = React.useMemo(() => features ? computeSignals(features) : null, [features]);

  if (isLoading) return <div className="animate-pulse h-64 bg-slate-800 rounded-2xl" />;
  if (!signals) return null;

  const raw    = signals._raw;
  const zs     = signals._zscores;

  const rawMap = {
    hyg_lqd_ratio: raw.hygLqdRatio,
    spy_r21d:      raw.spyR21d,
    uup_r21d:      raw.uupR21d,
    tip_ief_ratio: raw.tipIefRatio,
    spy_r63d:      raw.spyR63d,
    spy_vol21d:    raw.vol21d,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-blue-500/20">
          <Microscope className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Signal Explainability</h3>
          <p className="text-xs text-slate-500">Which indicators drove the classification — with z-scores</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SIGNAL_DEFS.map((def, idx) => {
          const value = rawMap[def.key] ?? 0;
          const z     = zs[def.zKey] ?? 0;
          const val   = parseFloat(value);
          const isHigh   = val >= def.thresholdHigh;
          const isLow    = val <= def.thresholdLow;
          const crossed  = isHigh || isLow;
          const isAlert  = def.invert ? isLow : isLow;
          const isBull   = def.invert ? isHigh : isHigh;

          const statusColor = crossed
            ? (isBull || isHigh) ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-red-500/40 bg-red-500/5'
            : 'border-slate-700/50 bg-slate-900/30';

          const Icon = isBull || isHigh ? CheckCircle : isLow ? AlertTriangle : null;
          const iconColor = isBull || isHigh ? 'text-emerald-400' : 'text-red-400';

          return (
            <motion.div
              key={def.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-xl border ${statusColor} transition-colors`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className={`w-3.5 h-3.5 ${iconColor} flex-shrink-0`} />}
                    <p className="text-sm font-medium text-white truncate">{def.label}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-tight">{def.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-mono font-bold text-white">
                    {typeof val === 'number' ? val.toFixed(4) : val}
                    {def.suffix && <span className="text-sm text-slate-400">{def.suffix}</span>}
                  </p>
                  <p className="text-xs font-mono text-slate-400">z={z > 0 ? '+' : ''}{z}</p>
                </div>
              </div>
              <ZScoreBar z={z} />
              <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                <span>-3σ</span><span>0</span><span>+3σ</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}