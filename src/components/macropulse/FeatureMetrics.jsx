import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

const metricLabels = {
  spy_r21d:      'SPY 21D Return',
  qqq_r21d:      'QQQ 21D Return',
  tlt_r21d:      'TLT 21D Return',
  uup_r21d:      'Dollar 21D Return',
  dbc_r21d:      'Commodities 21D',
  spy_r63d:      'SPY 63D Return',
  spy_vol21d:    '21D Volatility',
  hyg_lqd_ratio: 'HYG/LQD Ratio',
  hyg_lqd_r21d:  'Credit Risk 21D',
  tip_ief_ratio:  'TIP/IEF Ratio',
  tip_ief_r21d:   'Inflation Spread',
  spy_vs_tlt:    'SPY vs TLT',
  qqq_vs_spy:    'QQQ vs SPY',
};

/* Animated number count-up */
function CountUp({ target, decimals = 2, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(null);
  const startRef = useRef(null);
  const duration = 900;

  useEffect(() => {
    const from = 0;
    const to = target;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    startRef.current = null;

    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(parseFloat((from + (to - from) * eased).toFixed(decimals)));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target]);

  const isPos = display >= 0;
  return (
    <span className={suffix === '%' ? (isPos ? 'text-emerald-400' : 'text-red-400') : 'text-white'}>
      {suffix === '%' && isPos && '+'}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function FeatureMetrics({ features, isLoading }) {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-slate-800 rounded-2xl" />
      </div>
    );
  }
  if (!features) return null;

  const displayFeatures = Object.entries(features).slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-cyan-500/20">
          <Activity className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Key Indicators</h3>
          <p className="text-xs text-slate-500">Features used for classification</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {displayFeatures.map(([key, value], index) => {
          const isReturnKey = key.includes('r21d') || key.includes('r63d') || key.includes('vs');
          const decimals = Math.abs(value) < 1 ? 4 : 2;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.8 + index * 0.05 }}
              whileHover={{ y: -2, boxShadow: '0 6px 24px #0002' }}
              className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 transition-shadow"
            >
              <p className="text-xs text-slate-500 truncate mb-1">
                {metricLabels[key] || key.replace(/_/g, ' ')}
              </p>
              <p className="text-lg font-semibold">
                <CountUp
                  target={typeof value === 'number' ? value : 0}
                  decimals={decimals}
                  suffix={isReturnKey ? '%' : ''}
                />
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}