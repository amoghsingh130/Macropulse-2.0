import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown } from 'lucide-react';

const SECTIONS = [
  {
    title: 'ETF Proxy Framework',
    content: `MacroPulse uses nine liquid ETFs as "market thermometers" rather than hard-to-obtain economic data series. Each ETF provides a continuously-priced, liquid signal for a distinct asset class: SPY/QQQ for equity growth expectations, TLT/IEF for interest-rate duration, HYG/LQD for credit risk appetite, UUP for the USD, DBC for broad commodities, and TIP for inflation breakevens.`,
  },
  {
    title: 'Feature Engineering',
    content: `From raw price series, we compute 21-day (short-term momentum) and 63-day (medium-term trend) rolling returns, 21-day realised volatility, and cross-asset ratios — most importantly the HYG/LQD ratio (credit risk appetite proxy) and the TIP/IEF ratio (inflation breakeven proxy). A cross-asset spread (SPY vs TLT) captures the growth/safety rotation.`,
  },
  {
    title: 'Gaussian Mixture Model Clustering',
    content: `Features are standardised and fed into a 4-component Gaussian Mixture Model (GMM) with full covariance. GMM is preferred over k-means because it provides probabilistic cluster assignments — the posterior probabilities become the confidence score. We use 10 random initialisations and fix the random seed for reproducibility.`,
  },
  {
    title: 'Regime Labelling',
    content: `Cluster centroids are scored against four canonical macro archetypes using a hand-crafted scoring function: Risk-On (equity/credit outperformance), Risk-Off (flight to safety, high vol), Inflation Shock (commodity and breakeven surge), Dollar Stress (UUP outperformance). Each cluster is mapped to its highest-scoring archetype via greedy assignment.`,
  },
  {
    title: 'Asset Allocation Policy',
    content: `Allocation recommendations are rule-based overlays on top of the regime classification — not the output of an optimiser. They reflect standard institutional tilts: equities + HY credit in Risk-On, Treasuries + IG in Risk-Off, real assets + TIPS in Inflation Shock, and domestic USD bonds in Dollar Stress. Always consider your own mandate and constraints.`,
  },
  {
    title: 'Limitations & Disclaimers',
    content: `This tool is for research and educational purposes only. Regime classification is backward-looking; past regime patterns do not guarantee future transitions. The model is re-estimated on each compute call and may produce different cluster-to-regime mappings across different date windows. Not financial advice.`,
  },
];

export default function MethodologySection() {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="mt-8 rounded-2xl border border-slate-700/50 bg-slate-800/30 overflow-hidden"
    >
      {/* Toggle header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-slate-700/50">
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>
          <span className="font-medium text-slate-300">Methodology</span>
          <span className="text-xs text-slate-600 hidden sm:inline">
            ETF proxy framework · GMM clustering · Regime labelling
          </span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-slate-700/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {SECTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(activeIdx === i ? null : i)}
                    className="text-left rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-200">{s.title}</p>
                      <motion.div animate={{ rotate: activeIdx === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      </motion.div>
                    </div>
                    <AnimatePresence>
                      {activeIdx === i && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="text-xs text-slate-400 leading-relaxed mt-2 overflow-hidden"
                        >
                          {s.content}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}