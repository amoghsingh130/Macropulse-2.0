import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Sliders } from 'lucide-react';
import { getAllocation } from './allocationEngine';

const TYPE_COLORS = { equity: '#8b5cf6', bond: '#10b981', alternative: '#f59e0b' };

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-white font-bold">{d.asset}</p>
      <p className="text-slate-400">{d.weight}%</p>
    </div>
  );
};

export default function AllocationWeights({ regime, riskTolerance, isLoading }) {
  const alloc = React.useMemo(() => getAllocation(regime, riskTolerance), [regime, riskTolerance]);

  if (isLoading) return <div className="animate-pulse h-64 bg-slate-800 rounded-2xl" />;
  if (!alloc?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 shadow-xl"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-emerald-500/20">
          <Sliders className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Adjusted Allocation</h3>
          <p className="text-xs text-slate-500 capitalize">Risk profile: {riskTolerance} · Regime-driven weights</p>
        </div>
      </div>

      <div className="flex gap-6 items-center">
        <div className="w-36 h-36 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={alloc} dataKey="weight" nameKey="asset" cx="50%" cy="50%"
                innerRadius={38} outerRadius={58} strokeWidth={0}>
                {alloc.map((entry, i) => (
                  <Cell key={i} fill={TYPE_COLORS[entry.type] || '#64748b'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2">
          {alloc.map((item, i) => (
            <motion.div
              key={item.asset}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3"
            >
              <span className="text-sm font-mono font-bold text-white w-12">{item.asset}</span>
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.weight}%` }}
                  transition={{ duration: 0.7, delay: i * 0.06 }}
                  className="h-2 rounded-full"
                  style={{ backgroundColor: TYPE_COLORS[item.type] }}
                />
              </div>
              <span className="text-sm font-mono text-slate-300 w-10 text-right">{item.weight}%</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mt-4 pt-4 border-t border-slate-700/30">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-slate-400 capitalize">{type}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}