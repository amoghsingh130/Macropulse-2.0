import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Scale, Zap } from 'lucide-react';

const MODES = [
  {
    key: 'conservative',
    label: 'Conservative',
    icon: Shield,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/40',
    activeBg: 'bg-blue-500/20',
    desc: '0.5× equity, 1.3× bonds',
  },
  {
    key: 'balanced',
    label: 'Balanced',
    icon: Scale,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/40',
    activeBg: 'bg-violet-500/20',
    desc: '1× across all assets',
  },
  {
    key: 'aggressive',
    label: 'Aggressive',
    icon: Zap,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    activeBg: 'bg-amber-500/20',
    desc: '1.5× equity, 0.6× bonds',
  },
];

export default function InvestorModeSelector({ value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {MODES.map(m => {
        const Icon = m.icon;
        const isActive = value === m.key;
        return (
          <motion.button
            key={m.key}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(m.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
              isActive
                ? `${m.activeBg} ${m.border} ${m.color}`
                : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{m.label}</span>
            {isActive && <span className="text-xs opacity-70">· {m.desc}</span>}
          </motion.button>
        );
      })}
    </div>
  );
}