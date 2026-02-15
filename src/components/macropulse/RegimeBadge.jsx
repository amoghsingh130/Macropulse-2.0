import React from 'react';
import { TrendingUp, TrendingDown, Flame, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const regimeConfig = {
  risk_on: {
    label: 'Risk-On',
    subtitle: 'Growth Expansion',
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    icon: TrendingUp,
    glow: 'shadow-emerald-500/20'
  },
  risk_off: {
    label: 'Risk-Off',
    subtitle: 'Growth Scare',
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
    icon: TrendingDown,
    glow: 'shadow-red-500/20'
  },
  inflation_shock: {
    label: 'Inflation Shock',
    subtitle: 'Price Pressure',
    color: 'from-orange-500 to-amber-600',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
    icon: Flame,
    glow: 'shadow-orange-500/20'
  },
  dollar_stress: {
    label: 'Dollar Stress',
    subtitle: 'Currency Pressure',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    icon: DollarSign,
    glow: 'shadow-blue-500/20'
  }
};

export default function RegimeBadge({ regime, isLoading }) {
  const config = regimeConfig[regime] || regimeConfig.risk_on;
  const Icon = config.icon;

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl border ${config.borderColor} ${config.bgColor} p-6 shadow-2xl ${config.glow}`}
    >
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-5`} />
      
      {/* Animated ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className={`absolute -top-20 -right-20 w-40 h-40 rounded-full border ${config.borderColor} opacity-20`}
      />
      
      <div className="relative z-10 flex items-center gap-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`p-4 rounded-xl bg-gradient-to-br ${config.color} shadow-lg`}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>
        
        <div>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">
            Current Regime
          </p>
          <h2 className={`text-3xl font-bold ${config.textColor}`}>
            {config.label}
          </h2>
          <p className="text-slate-400 text-sm mt-1">{config.subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
}