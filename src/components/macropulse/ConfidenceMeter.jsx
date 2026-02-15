import React from 'react';
import { motion } from 'framer-motion';

export default function ConfidenceMeter({ confidence, isLoading }) {
  const getConfidenceColor = (value) => {
    if (value >= 80) return 'from-emerald-500 to-green-400';
    if (value >= 60) return 'from-blue-500 to-cyan-400';
    if (value >= 40) return 'from-yellow-500 to-amber-400';
    return 'from-red-500 to-orange-400';
  };

  const getConfidenceLabel = (value) => {
    if (value >= 80) return 'Very High';
    if (value >= 60) return 'High';
    if (value >= 40) return 'Moderate';
    return 'Low';
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 shadow-xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">
            Confidence
          </p>
          <h3 className="text-2xl font-bold text-white">{confidence}%</h3>
          <p className="text-slate-400 text-sm mt-1">{getConfidenceLabel(confidence)}</p>
        </div>
        
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-700"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={`stroke-current`}
              style={{
                stroke: `url(#gradient-${confidence})`,
                strokeDasharray: circumference,
              }}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id={`gradient-${confidence}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className={confidence >= 60 ? 'text-emerald-500' : 'text-amber-500'} stopColor="currentColor" />
                <stop offset="100%" className={confidence >= 60 ? 'text-cyan-400' : 'text-orange-400'} stopColor="currentColor" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-bold text-white"
            >
              {confidence}
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}