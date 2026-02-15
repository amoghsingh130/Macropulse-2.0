import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronRight } from 'lucide-react';

export default function TriggersCard({ triggers, isLoading }) {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-40 bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-amber-500/20">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="font-semibold text-amber-400">Regime Change Triggers</h3>
          <p className="text-xs text-slate-500">What would change this call</p>
        </div>
      </div>

      <div className="space-y-3">
        {triggers.map((trigger, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
            className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
          >
            <ChevronRight className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-slate-300">{trigger}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}