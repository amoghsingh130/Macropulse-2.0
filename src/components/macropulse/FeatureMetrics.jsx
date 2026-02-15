import React from 'react';
import { motion } from 'framer-motion';
import { Activity, BarChart3, Percent, Zap } from 'lucide-react';

const metricIcons = {
  spy_return: BarChart3,
  volatility: Activity,
  credit_spread: Percent,
  momentum: Zap
};

const metricLabels = {
  spy_return_20d: 'SPY 20D Return',
  qqq_return_20d: 'QQQ 20D Return',
  tlt_return_20d: 'TLT 20D Return',
  hyg_lqd_ratio: 'HYG/LQD Ratio',
  tip_ief_ratio: 'TIP/IEF Ratio',
  uup_return_20d: 'Dollar 20D Return',
  dbc_return_20d: 'Commodities 20D',
  volatility_20d: '20D Volatility'
};

export default function FeatureMetrics({ features, isLoading }) {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-slate-800 rounded-2xl"></div>
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
          const isPositive = value > 0;
          const formattedValue = typeof value === 'number' 
            ? (Math.abs(value) < 1 ? value.toFixed(4) : value.toFixed(2))
            : value;
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.8 + index * 0.05 }}
              className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/50"
            >
              <p className="text-xs text-slate-500 truncate mb-1">
                {metricLabels[key] || key.replace(/_/g, ' ')}
              </p>
              <p className={`text-lg font-semibold ${
                key.includes('return') 
                  ? (isPositive ? 'text-emerald-400' : 'text-red-400')
                  : 'text-white'
              }`}>
                {key.includes('return') && isPositive && '+'}
                {formattedValue}
                {key.includes('return') && '%'}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}