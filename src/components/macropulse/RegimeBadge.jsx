import React from 'react';
import { TrendingUp, TrendingDown, Flame, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { REGIME_STYLE } from './regimeColors';

const ICONS = {
  risk_on:         TrendingUp,
  risk_off:        TrendingDown,
  inflation_shock: Flame,
  dollar_stress:   DollarSign,
};

export default function RegimeBadge({ regime, isLoading }) {
  const style = REGIME_STYLE[regime] || REGIME_STYLE.risk_on;
  const Icon  = ICONS[regime] || TrendingUp;

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <motion.div
      key={regime}
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      whileHover={{ y: -3, boxShadow: `0 16px 40px ${style.hex}30` }}
      className={`relative overflow-hidden rounded-2xl border ${style.border} ${style.bg} p-6 shadow-2xl ${style.glow} transition-shadow`}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-5`} />

      {/* Animated ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className={`absolute -top-20 -right-20 w-40 h-40 rounded-full border ${style.border} opacity-20`}
      />

      <div className="relative z-10 flex items-center gap-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`p-4 rounded-xl bg-gradient-to-br ${style.gradient} shadow-lg`}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>

        <div>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">
            Current Regime
          </p>
          <h2 className={`text-3xl font-bold ${style.text}`}>{style.label}</h2>
          <p className="text-slate-400 text-sm mt-1">{style.subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
}