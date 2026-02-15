import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Lightbulb } from 'lucide-react';

export default function ExplanationCard({ explanation, isLoading }) {
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
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-indigo-500/20">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Market Analysis</h3>
          <p className="text-xs text-slate-500">Plain-English explanation</p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
        <p className="pl-4 text-slate-300 leading-relaxed">
          {explanation}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Lightbulb className="w-4 h-4" />
          <span>Analysis based on rolling 20-day returns, volatility, and cross-asset correlations</span>
        </div>
      </div>
    </motion.div>
  );
}