import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Clock } from 'lucide-react';
import { REGIME_LABELS, REGIME_COLORS } from './regimeColors';

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function RegimeAlertSystem({ currentRegime, regimeHistory, setRegimeHistory, showTableOnly = false }) {
  const [alert, setAlert] = useState(null);
  const prevRegimeRef = useRef(null);

  useEffect(() => {
    if (!currentRegime) return;
    if (prevRegimeRef.current && prevRegimeRef.current !== currentRegime) {
      const from = prevRegimeRef.current;
      const to   = currentRegime;
      const entry = { from, to, timestamp: Date.now() };
      setAlert(entry);
      setRegimeHistory(h => [entry, ...h].slice(0, 20));
      const timer = setTimeout(() => setAlert(null), 7000);
      return () => clearTimeout(timer);
    }
    prevRegimeRef.current = currentRegime;
  }, [currentRegime]);

  return (
    <>
      {/* Floating Alert — skip when showTableOnly */}
      {!showTableOnly && <AnimatePresence>
        {alert && (
          <motion.div
            key="alert"
            initial={{ opacity: 0, y: -60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-20 right-6 z-50 max-w-sm w-full"
          >
            <div className="rounded-xl border border-amber-500/40 bg-slate-900 shadow-2xl shadow-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.5, repeat: 5 }}
                  className="p-2 rounded-lg bg-amber-500/20 flex-shrink-0"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-amber-300 text-sm">Regime Shift Detected</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{ color: REGIME_COLORS[alert.from], background: `${REGIME_COLORS[alert.from]}22` }}>
                      {REGIME_LABELS[alert.from]}
                    </span>
                    <span className="text-slate-500 text-xs">→</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{ color: REGIME_COLORS[alert.to], background: `${REGIME_COLORS[alert.to]}22` }}>
                      {REGIME_LABELS[alert.to]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{formatTime(alert.timestamp)}</p>
                </div>
                <button onClick={() => setAlert(null)} className="text-slate-500 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Table */}
      {regimeHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Regime Transition Log</h3>
              <p className="text-xs text-slate-500">Session history of detected regime shifts</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-700/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900/60 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-2.5 text-left">Time</th>
                  <th className="px-4 py-2.5 text-left">From</th>
                  <th className="px-4 py-2.5 text-left">To</th>
                </tr>
              </thead>
              <tbody>
                {regimeHistory.map((item, i) => (
                  <tr key={i} className="border-t border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td className="px-4 py-2.5 text-slate-400 font-mono text-xs">{formatTime(item.timestamp)}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-medium px-2 py-0.5 rounded"
                        style={{ color: REGIME_COLORS[item.from], background: `${REGIME_COLORS[item.from]}22` }}>
                        {REGIME_LABELS[item.from]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-medium px-2 py-0.5 rounded"
                        style={{ color: REGIME_COLORS[item.to], background: `${REGIME_COLORS[item.to]}22` }}>
                        {REGIME_LABELS[item.to]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </>
  );
}